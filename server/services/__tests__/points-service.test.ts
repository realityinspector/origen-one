import { pointsService } from '../points-service';

// Mock the db pool to avoid hitting real database
jest.mock('../../db', () => {
  const balances: Record<string, number> = {};
  const ledger: any[] = [];

  return {
    pool: {
      connect: async () => ({
        query: async (sql: string, params: any[]) => {
          if (sql.startsWith('BEGIN')) return;
          if (sql.startsWith('COMMIT')) return;
          if (sql.startsWith('ROLLBACK')) return;
          if (sql.includes('INSERT INTO points_ledger')) {
            ledger.push({ learner_id: params[0], amount: params[1] });
            return { rows: [{ id: 'ledger1' }] };
          }
          if (sql.includes('INSERT INTO learner_points')) {
            const learnerId = params[0].toString();
            const amt = Number(params[1]);
            balances[learnerId] = (balances[learnerId] || 0) + amt;
            return { rows: [{ current_balance: balances[learnerId] }] };
          }
          if (sql.startsWith('SELECT current_balance')) {
            const learnerId = params[0].toString();
            return { rows: balances[learnerId] ? [{ current_balance: balances[learnerId] }] : [] };
          }
          if (sql.startsWith('SELECT * FROM points_ledger')) {
            const learnerId = params[0].toString();
            return { rows: ledger.filter(l => l.learner_id.toString() === learnerId) };
          }
          return { rows: [] };
        },
        release: () => {},
      }),
      query: async (sql: string, params: any[]) => {
        // Reuse logic from connect.query for convenience
        const client = await (await (jest.requireActual('../../db') as any).pool.connect());
        return client.query(sql, params);
      }
    }
  };
});

describe('PointsService', () => {
  test('awards points and updates balance', async () => {
    const { newBalance } = await pointsService.awardPoints({
      learnerId: 1,
      amount: 50,
      sourceType: 'QUIZ_CORRECT',
      description: 'Test award',
    });
    expect(newBalance).toBe(50);

    const balance = await pointsService.getBalance(1);
    expect(balance).toBe(50);
  });

  test('history contains ledger entry', async () => {
    const history = await pointsService.getHistory(1);
    expect(history.length).toBeGreaterThan(0);
    expect(history[0].amount).toBeDefined();
  });
});
