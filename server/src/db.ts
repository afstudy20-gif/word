import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://vocablab:vocablab@localhost:5432/vocablab',
});

export function query(text: string, params?: unknown[]) {
  return pool.query(text, params);
}

export function getPool() {
  return pool;
}
