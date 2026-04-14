import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../db.js';
import { signToken, requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body as { username?: string; password?: string };

    if (!username || username.length < 3 || username.length > 50) {
      res.status(400).json({ error: 'Kullanıcı adı 3-50 karakter olmalı' });
      return;
    }
    if (!password || password.length < 6) {
      res.status(400).json({ error: 'Şifre en az 6 karakter olmalı' });
      return;
    }

    const existing = await query('SELECT id FROM users WHERE username = $1', [username]);
    if (existing.rows.length > 0) {
      res.status(409).json({ error: 'Bu kullanıcı adı zaten alınmış' });
      return;
    }

    const hash = await bcrypt.hash(password, 10);
    const result = await query(
      'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id',
      [username, hash]
    );

    const token = signToken({ userId: result.rows[0].id, username });
    res.status(201).json({ token, username });
  } catch (err) {
    console.error('[auth/register]', err);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body as { username?: string; password?: string };

    if (!username || !password) {
      res.status(400).json({ error: 'Kullanıcı adı ve şifre gerekli' });
      return;
    }

    const result = await query('SELECT id, password_hash FROM users WHERE username = $1', [username]);
    if (result.rows.length === 0) {
      res.status(401).json({ error: 'Kullanıcı adı veya şifre hatalı' });
      return;
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      res.status(401).json({ error: 'Kullanıcı adı veya şifre hatalı' });
      return;
    }

    const token = signToken({ userId: user.id, username });
    res.json({ token, username });
  } catch (err) {
    console.error('[auth/login]', err);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ userId: req.user!.userId, username: req.user!.username });
});

export default router;
