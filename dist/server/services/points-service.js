"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pointsService = void 0;
const db_1 = require("../db");
class PointsService {
    async awardPoints(opts) {
        if (opts.amount <= 0)
            throw new Error("Amount must be positive");
        // Start transaction
        const client = await db_1.pool.connect();
        try {
            await client.query("BEGIN");
            // Insert ledger entry
            const insertLedgerSQL = `
        INSERT INTO points_ledger (learner_id, amount, source_type, source_id, description)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id`;
            await client.query(insertLedgerSQL, [
                opts.learnerId,
                opts.amount,
                opts.sourceType,
                opts.sourceId || null,
                opts.description,
            ]);
            // Upsert learner_points row and update balances
            const upsertSQL = `
        INSERT INTO learner_points (learner_id, current_balance, total_earned, total_redeemed)
        VALUES ($1, $2, $2, 0)
        ON CONFLICT (learner_id)
        DO UPDATE SET 
          current_balance = learner_points.current_balance + EXCLUDED.current_balance,
          total_earned = learner_points.total_earned + EXCLUDED.current_balance,
          last_updated = NOW()
        RETURNING current_balance`;
            const { rows } = await client.query(upsertSQL, [opts.learnerId, opts.amount]);
            await client.query("COMMIT");
            return { newBalance: rows[0].current_balance };
        }
        catch (err) {
            await client.query("ROLLBACK");
            throw err;
        }
        finally {
            client.release();
        }
    }
    async getBalance(learnerId) {
        const sql = `SELECT current_balance FROM learner_points WHERE learner_id = $1`;
        const { rows } = await db_1.pool.query(sql, [learnerId]);
        return rows.length ? Number(rows[0].current_balance) : 0;
    }
    async getHistory(learnerId, limit = 50) {
        const sql = `SELECT * FROM points_ledger WHERE learner_id = $1 ORDER BY created_at DESC LIMIT $2`;
        const { rows } = await db_1.pool.query(sql, [learnerId, limit]);
        return rows;
    }
}
exports.pointsService = new PointsService();
//# sourceMappingURL=points-service.js.map