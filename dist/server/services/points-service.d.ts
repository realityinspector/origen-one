export type PointsSource = "QUIZ_CORRECT" | "LESSON_COMPLETE" | "ACHIEVEMENT" | "REDEMPTION" | "ADMIN_ADJUST";
export interface AwardPointsOptions {
    learnerId: number | string;
    amount: number;
    sourceType: PointsSource;
    sourceId?: string;
    description: string;
}
declare class PointsService {
    awardPoints(opts: AwardPointsOptions): Promise<{
        newBalance: number;
    }>;
    getBalance(learnerId: number | string): Promise<number>;
    getHistory(learnerId: number | string, limit?: number): Promise<any[]>;
}
export declare const pointsService: PointsService;
export {};
