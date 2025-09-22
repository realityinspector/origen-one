CREATE TABLE IF NOT EXISTS questions_history (
  id SERIAL PRIMARY KEY,
  learner_id VARCHAR(64) NOT NULL,
  topic TEXT NOT NULL,
  question_hash CHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (learner_id, topic, question_hash)
);
