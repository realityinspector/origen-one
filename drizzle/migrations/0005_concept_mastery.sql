-- Migration: Concept Mastery Tracking
-- Purpose: Track learner mastery of individual concepts for adaptive learning
-- Date: 2025-01-XX

CREATE TABLE IF NOT EXISTS concept_mastery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  learner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  concept_name TEXT NOT NULL,
  subject TEXT NOT NULL,
  correct_count INTEGER DEFAULT 0,
  total_count INTEGER DEFAULT 0,
  mastery_level DECIMAL(3,2) DEFAULT 0.00,  -- 0.00 to 1.00 (percentage as decimal)
  last_tested TIMESTAMP DEFAULT NOW(),
  needs_reinforcement BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),

  -- Unique constraint: one mastery record per learner per concept
  UNIQUE (learner_id, concept_name, subject),

  -- Indexes for efficient queries
  INDEX idx_learner_mastery (learner_id, subject),
  INDEX idx_needs_reinforcement (learner_id, needs_reinforcement),
  INDEX idx_mastery_level (learner_id, mastery_level)
);

-- Add comment to table
COMMENT ON TABLE concept_mastery IS 'Tracks learner mastery levels for individual concepts';

-- Add column comments
COMMENT ON COLUMN concept_mastery.mastery_level IS 'Percentage (0.00-1.00) of correct answers for this concept';
COMMENT ON COLUMN concept_mastery.needs_reinforcement IS 'TRUE if mastery < 0.70, indicating need for review';
COMMENT ON COLUMN concept_mastery.correct_count IS 'Number of times learner answered correctly for this concept';
COMMENT ON COLUMN concept_mastery.total_count IS 'Total number of times learner was tested on this concept';
