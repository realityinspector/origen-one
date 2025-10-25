-- Migration: Quiz Answer Tracking
-- Purpose: Store individual quiz answers for analytics and reinforcement learning
-- Date: 2025-01-XX

CREATE TABLE IF NOT EXISTS quiz_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  learner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  question_index INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  question_hash CHAR(64) NOT NULL,  -- SHA-256 hash of question text for deduplication
  user_answer INTEGER NOT NULL,      -- Index of selected answer (0-3)
  correct_answer INTEGER NOT NULL,   -- Index of correct answer (0-3)
  is_correct BOOLEAN NOT NULL,
  concept_tags TEXT[],               -- Array of concepts tested (e.g., ['addition', 'counting'])
  answered_at TIMESTAMP DEFAULT NOW(),

  -- Indexes for efficient queries
  INDEX idx_learner_answers (learner_id, answered_at DESC),
  INDEX idx_lesson_answers (lesson_id),
  INDEX idx_question_hash (question_hash),
  INDEX idx_concept_tags (concept_tags)
);

-- Add comment to table
COMMENT ON TABLE quiz_answers IS 'Stores individual quiz answer records for analytics and adaptive learning';

-- Add column comments
COMMENT ON COLUMN quiz_answers.question_hash IS 'SHA-256 hash of question text used for deduplication';
COMMENT ON COLUMN quiz_answers.concept_tags IS 'Array of concept keywords for mastery tracking';
COMMENT ON COLUMN quiz_answers.user_answer IS 'Index (0-3) of option selected by learner';
COMMENT ON COLUMN quiz_answers.correct_answer IS 'Index (0-3) of the correct option';
