import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { query } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function runMigrations() {
  await query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      name VARCHAR(255) PRIMARY KEY,
      applied_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  const migrationsDir = path.resolve(__dirname, '../../server/migrations');
  const prodMigrationsDir = path.resolve(__dirname, '../server/migrations');
  const dir = fs.existsSync(migrationsDir) ? migrationsDir : prodMigrationsDir;

  const files = fs.readdirSync(dir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  const { rows: applied } = await query('SELECT name FROM _migrations');
  const appliedSet = new Set(applied.map(r => r.name));

  for (const file of files) {
    if (appliedSet.has(file)) continue;

    const sql = fs.readFileSync(path.join(dir, file), 'utf-8');
    console.log(`[migrate] applying ${file}...`);
    await query(sql);
    await query('INSERT INTO _migrations (name) VALUES ($1)', [file]);
    console.log(`[migrate] applied ${file}`);
  }
}
