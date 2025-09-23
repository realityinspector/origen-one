"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activityService = void 0;
const db_1 = require("../db");
const points_service_1 = require("./points-service");
const utils_1 = require("../utils");
class ActivityService {
    async getAll() {
        const { rows } = await db_1.pool.query("SELECT * FROM activities WHERE active = TRUE ORDER BY cost ASC, name ASC");
        return rows;
    }
    async getById(id) {
        const { rows } = await db_1.pool.query("SELECT * FROM activities WHERE id = $1", [id]);
        return rows[0] || null;
    }
    /**
     * Allocate tokens across multiple activities; returns array of created awards
     */
    async allocateTokens(learnerId, allocations) {
        // filter zero tokens
        allocations = allocations.filter(a => a.tokens > 0);
        if (!allocations.length)
            return [];
        // total tokens needed
        const totalTokens = allocations.reduce((sum, a) => sum + a.tokens, 0);
        // check balance
        const currentBalance = await points_service_1.pointsService.getBalance(learnerId);
        if (currentBalance < totalTokens) {
            throw new Error("INSUFFICIENT_TOKENS");
        }
        const client = await db_1.pool.connect();
        try {
            await client.query("BEGIN");
            const awards = [];
            for (const alloc of allocations) {
                const { rows } = await client.query(`INSERT INTO awards (learner_id, activity_id, tokens_spent)
           VALUES ($1, $2, $3) RETURNING *`, [learnerId, alloc.activityId, alloc.tokens]);
                awards.push(rows[0]);
            }
            // deduct tokens using points service negative amount
            await points_service_1.pointsService.awardPoints({
                learnerId,
                amount: -totalTokens,
                sourceType: "REDEMPTION",
                description: "Tokens spent on activities"
            });
            await client.query("COMMIT");
            return awards;
        }
        catch (err) {
            await client.query("ROLLBACK");
            throw err;
        }
        finally {
            client.release();
        }
    }
    async markCashedIn(awardId, learnerId) {
        await db_1.pool.query(`UPDATE awards SET status = 'CASHED_IN', cashed_in_at = NOW() WHERE id = $1 AND learner_id = $2`, [awardId, learnerId]);
    }
    async toggleShare(awardId, parentUserId, active, title, description) {
        // check if share row exists
        const { rows } = await db_1.pool.query(`SELECT * FROM award_shares WHERE award_id = $1`, [awardId]);
        if (rows.length) {
            await db_1.pool.query(`UPDATE award_shares SET is_active = $1, title = COALESCE($2,title), description = COALESCE($3,description) WHERE award_id = $4`, [active, title, description, awardId]);
            return rows[0].share_hash;
        }
        const hash = (0, utils_1.generateRandomHash)(24);
        await db_1.pool.query(`INSERT INTO award_shares (award_id, parent_user_id, share_hash, title, description) VALUES ($1,$2,$3,$4,$5)`, [awardId, parentUserId, hash, title || "A Learner You Know Earned a Reward", description || "This learner completed a challenge and earned a reward!"]);
        return hash;
    }
    async getShareByHash(parentUsername, hash) {
        const sql = `SELECT a.*, s.title, s.description FROM award_shares s
                 JOIN awards a ON a.id = s.award_id
                 JOIN users u ON u.id = s.parent_user_id
                 WHERE u.username = $1 AND s.share_hash = $2 AND s.is_active = TRUE`;
        const { rows } = await db_1.pool.query(sql, [parentUsername, hash]);
        return rows[0] || null;
    }
}
exports.activityService = new ActivityService();
//# sourceMappingURL=activity-service.js.map