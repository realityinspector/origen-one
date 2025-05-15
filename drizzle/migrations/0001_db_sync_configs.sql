DO $$ BEGIN
  CREATE TYPE "sync_status" AS ENUM ('IDLE', 'IN_PROGRESS', 'FAILED', 'COMPLETED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "db_sync_configs" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "parent_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "target_db_url" TEXT NOT NULL,
  "last_sync_at" TIMESTAMP,
  "sync_status" sync_status NOT NULL DEFAULT 'IDLE',
  "continuous_sync" BOOLEAN NOT NULL DEFAULT false,
  "error_message" TEXT,
  "created_at" TIMESTAMP DEFAULT now(),
  "updated_at" TIMESTAMP DEFAULT now()
);