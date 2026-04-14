import { Router } from 'express';
import { query, getPool } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

interface CardProgressRow {
  card_id: string;
  seen: number;
  repetitions: number;
  ease: number;
  interval_days: number;
  due_at: string;
  last_reviewed_at: string;
  known: boolean;
}

router.get('/', async (req, res) => {
  try {
    const userId = req.user!.userId;
    const result = await query(
      'SELECT card_id, seen, repetitions, ease, interval_days, due_at, last_reviewed_at, known FROM card_progress WHERE user_id = $1',
      [userId]
    );

    const progress: Record<string, unknown> = {};
    for (const row of result.rows as CardProgressRow[]) {
      progress[row.card_id] = {
        cardId: row.card_id,
        seen: row.seen,
        repetitions: row.repetitions,
        ease: row.ease,
        intervalDays: row.interval_days,
        dueAt: row.due_at,
        lastReviewedAt: row.last_reviewed_at,
        known: row.known,
      };
    }

    res.json(progress);
  } catch (err) {
    console.error('[progress/get]', err);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

router.put('/', async (req, res) => {
  try {
    const userId = req.user!.userId;
    const progressMap = req.body as Record<string, {
      cardId: string;
      seen: number;
      repetitions: number;
      ease: number;
      intervalDays: number;
      dueAt: string;
      lastReviewedAt: string;
      known: boolean;
    }>;

    const entries = Object.values(progressMap);
    if (entries.length === 0) {
      res.json({ ok: true });
      return;
    }

    const client = await getPool().connect();
    try {
      await client.query('BEGIN');

      for (const entry of entries) {
        await client.query(
          `INSERT INTO card_progress (user_id, card_id, seen, repetitions, ease, interval_days, due_at, last_reviewed_at, known, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
           ON CONFLICT (user_id, card_id)
           DO UPDATE SET seen = $3, repetitions = $4, ease = $5, interval_days = $6, due_at = $7, last_reviewed_at = $8, known = $9, updated_at = NOW()`,
          [userId, entry.cardId, entry.seen, entry.repetitions, entry.ease, entry.intervalDays, entry.dueAt, entry.lastReviewedAt, entry.known]
        );
      }

      await client.query('COMMIT');
      res.json({ ok: true });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('[progress/put]', err);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

router.delete('/', async (req, res) => {
  try {
    const userId = req.user!.userId;
    await query('DELETE FROM card_progress WHERE user_id = $1', [userId]);
    res.json({ ok: true });
  } catch (err) {
    console.error('[progress/delete]', err);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

export default router;
