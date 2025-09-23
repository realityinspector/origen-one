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
declare class ActivityService {
    getAll(): Promise<Activity[]>;
    getById(id: number): Promise<Activity | null>;
    /**
     * Allocate tokens across multiple activities; returns array of created awards
     */
    allocateTokens(learnerId: string, allocations: {
        activityId: number;
        tokens: number;
    }[]): Promise<Award[]>;
    markCashedIn(awardId: string, learnerId: string): Promise<void>;
    toggleShare(awardId: string, parentUserId: string, active: boolean, title?: string, description?: string): Promise<any>;
    getShareByHash(parentUsername: string, hash: string): Promise<any>;
}
export declare const activityService: ActivityService;
export {};
