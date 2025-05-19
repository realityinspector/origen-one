import { DbSyncConfig } from '../shared/schema';
/**
 * Synchronize a parent's data to an external database
 * This performs a one-way replication of the parent's data to the target database
 */
export declare function synchronizeToExternalDatabase(parentId: string, syncConfig: DbSyncConfig): Promise<void>;
