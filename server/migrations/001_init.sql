CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS card_progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  card_id VARCHAR(100) NOT NULL,
  seen INTEGER DEFAULT 0,
  repetitions INTEGER DEFAULT 0,
  ease REAL DEFAULT 2.5,
  interval_days REAL DEFAULT 0,
  due_at TIMESTAMPTZ NOT NULL,
  last_reviewed_at TIMESTAMPTZ NOT NULL,
  known BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, card_id)
);

CREATE INDEX IF NOT EXISTS idx_progress_user ON card_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_due ON card_progress(user_id, due_at);
