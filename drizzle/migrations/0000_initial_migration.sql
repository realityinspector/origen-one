DO $$ BEGIN
  CREATE TYPE "user_role" AS ENUM ('ADMIN', 'PARENT', 'LEARNER');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "lesson_status" AS ENUM ('QUEUED', 'ACTIVE', 'DONE');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "users" (
  "id" SERIAL PRIMARY KEY,
  "email" TEXT NOT NULL UNIQUE,
  "username" TEXT NOT NULL UNIQUE,
  "name" TEXT NOT NULL,
  "role" user_role NOT NULL,
  "password" TEXT NOT NULL,
  "parent_id" INTEGER REFERENCES "users"("id") ON DELETE CASCADE,
  "created_at" TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "learner_profiles" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "grade_level" INTEGER NOT NULL,
  "graph" JSONB,
  "created_at" TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "lessons" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "learner_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "module_id" TEXT NOT NULL,
  "status" lesson_status NOT NULL DEFAULT 'QUEUED',
  "spec" JSONB,
  "score" INTEGER,
  "created_at" TIMESTAMP DEFAULT now(),
  "completed_at" TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "achievements" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "learner_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "type" TEXT NOT NULL,
  "payload" JSONB,
  "awarded_at" TIMESTAMP DEFAULT now()
);
