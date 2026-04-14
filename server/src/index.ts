import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runMigrations } from './migrate.js';
import authRoutes from './routes/auth.js';
import progressRoutes from './routes/progress.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = parseInt(process.env.PORT || '3001', 10);
const isProduction = process.env.NODE_ENV === 'production';

const app = express();

app.use(cors());
app.use(express.json({ limit: '2mb' }));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/progress', progressRoutes);

// Production: serve Vite build as static files
if (isProduction) {
  const distPath = path.resolve(__dirname, '../dist');
  app.use(express.static(distPath));

  // Also serve public/data for cards.generated.json
  const publicPath = path.resolve(__dirname, '../public');
  app.use(express.static(publicPath));

  // SPA fallback
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

async function start() {
  try {
    await runMigrations();
    console.log('[server] migrations complete');
  } catch (err) {
    console.error('[server] migration failed:', err);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`[server] listening on http://localhost:${PORT}`);
  });
}

start();
