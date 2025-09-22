import { pool } from "../db";
import { pointsService } from "./points-service";
import { generateRandomHash } from "../utils";

export interface Activity {
  id: number;
  name: string;
  description: string;
  cost: number;
  active: boolean;
}

export interface Award {
  id: string;
  learnerId: string;
  activityId: number;
  tokensSpent: number;
  status: "UNREDEEMED" | "CASHED_IN";
  createdAt: Date;
  cashedInAt: Date | null;
}

class ActivityService {
  async getAll(): Promise<Activity[]> {
    const { rows } = await pool.query("SELECT * FROM activities WHERE active = TRUE ORDER BY cost ASC, name ASC");
    return rows;
  }

  async getById(id: number): Promise<Activity | null> {
    const { rows } = await pool.query("SELECT * FROM activities WHERE id = $1", [id]);
    return rows[0] || null;
  }

  /**
   * Allocate tokens across multiple activities; returns array of created awards
   */
  async allocateTokens(learnerId: string, allocations: { activityId: number; tokens: number }[]): Promise<Award[]> {
    // filter zero tokens
    allocations = allocations.filter(a => a.tokens > 0);
    if (!allocations.length) return [];

    // total tokens needed
    const totalTokens = allocations.reduce((sum, a) => sum + a.tokens, 0);

    // check balance
    const currentBalance = await pointsService.getBalance(learnerId);
    if (currentBalance < totalTokens) {
      throw new Error("INSUFFICIENT_TOKENS");
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const awards: Award[] = [];
      for (const alloc of allocations) {
        const { rows } = await client.query(
          `INSERT INTO awards (learner_id, activity_id, tokens_spent)
           VALUES ($1, $2, $3) RETURNING *`,
          [learnerId, alloc.activityId, alloc.tokens]
        );
        awards.push(rows[0]);
      }

      // deduct tokens using points service negative amount
      await pointsService.awardPoints({
        learnerId,
        amount: -totalTokens,
        sourceType: "REDEMPTION",
        description: "Tokens spent on activities"
      });

      await client.query("COMMIT");
      return awards;
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }

  async markCashedIn(awardId: string, learnerId: string): Promise<void> {
    await pool.query(
      `UPDATE awards SET status = 'CASHED_IN', cashed_in_at = NOW() WHERE id = $1 AND learner_id = $2`,
      [awardId, learnerId]
    );
  }

  async toggleShare(awardId: string, parentUserId: string, active: boolean, title?: string, description?: string) {
    // check if share row exists
    const { rows } = await pool.query(`SELECT * FROM award_shares WHERE award_id = $1`, [awardId]);
    if (rows.length) {
      await pool.query(
        `UPDATE award_shares SET is_active = $1, title = COALESCE($2,title), description = COALESCE($3,description) WHERE award_id = $4`,
        [active, title, description, awardId]
      );
      return rows[0].share_hash;
    }
    const hash = generateRandomHash(24);
    await pool.query(
      `INSERT INTO award_shares (award_id, parent_user_id, share_hash, title, description) VALUES ($1,$2,$3,$4,$5)`,
      [awardId, parentUserId, hash, title || "A Learner You Know Earned a Reward", description || "This learner completed a challenge and earned a reward!"]
    );
    return hash;
  }

  async getShareByHash(parentUsername: string, hash: string) {
    const sql = `SELECT a.*, s.title, s.description FROM award_shares s
                 JOIN awards a ON a.id = s.award_id
                 JOIN users u ON u.id = s.parent_user_id
                 WHERE u.username = $1 AND s.share_hash = $2 AND s.is_active = TRUE`;
    const { rows } = await pool.query(sql, [parentUsername, hash]);
    return rows[0] || null;
  }
}

export const activityService = new ActivityService();
