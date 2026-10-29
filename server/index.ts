import express from 'express';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import crypto from 'node:crypto';

import {
  addUploadedLevel,
  featuredLevels,
  levelById,
  levels,
  defaultLevels,
  type LevelRecord,
  type UserRecord,
  type SaveState
} from './data/levels.ts';

const app = express();
const port = Number(process.env.PORT ?? 8080);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const USERS: UserRecord[] = [];
const SESSIONS = new Map<string, { userId: string; expiresAt: number }>();

const createToken = () => crypto.randomBytes(32).toString('hex');
const authMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) {
    res.status(401).json({ error: 'Missing auth token' });
    return;
  }

  const session = SESSIONS.get(token);
  if (!session || session.expiresAt < Date.now()) {
    res.status(401).json({ error: 'Session expired' });
    return;
  }

  (req as any).user = USERS.find((user) => user.id === session.userId) ?? null;
  next();
};

app.use(express.json({ limit: '10mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'pq-web-api', version: '1.2.0' });
});

app.post('/api/auth/signup', (req, res) => {
  const { username, password } = req.body ?? {};
  if (!username || !password || String(username).trim().length < 3 || String(password).length < 4) {
    res.status(400).json({ error: 'Username and password are required.' });
    return;
  }

  if (USERS.some((user) => user.username.toLowerCase() === String(username).toLowerCase())) {
    res.status(409).json({ error: 'Username already exists.' });
    return;
  }

  const user: UserRecord = {
    id: crypto.randomUUID(),
    username: String(username).trim(),
    passwordHash: crypto.createHash('sha256').update(String(password)).digest('hex'),
    createdAt: new Date().toISOString(),
    avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(String(username))}`
  };

  USERS.push(user);
  const token = createToken();
  SESSIONS.set(token, { userId: user.id, expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 7 });

  res.status(201).json({ token, user: { id: user.id, username: user.username, avatar: user.avatar } });
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body ?? {};
  const user = USERS.find((entry) => entry.username.toLowerCase() === String(username ?? '').toLowerCase());
  const hash = crypto.createHash('sha256').update(String(password ?? '')).digest('hex');

  if (!user || user.passwordHash !== hash) {
    res.status(401).json({ error: 'Invalid credentials.' });
    return;
  }

  const token = createToken();
  SESSIONS.set(token, { userId: user.id, expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 7 });

  res.json({ token, user: { id: user.id, username: user.username, avatar: user.avatar } });
});

app.get('/api/me', authMiddleware, (req, res) => {
  const user = (req as any).user as UserRecord;
  res.json({ user: { id: user.id, username: user.username, avatar: user.avatar } });
});

app.get('/api/levels', (req, res) => {
  const q = String(req.query.q ?? '').trim().toLowerCase();
  const tag = String(req.query.tag ?? '').trim().toLowerCase();
  const difficulty = String(req.query.difficulty ?? '').trim().toLowerCase();

  let result = [...levels];

  if (q) {
    result = result.filter((level) =>
      level.name.toLowerCase().includes(q) ||
      level.author.toLowerCase().includes(q) ||
      level.description.toLowerCase().includes(q) ||
      level.tags.some((tagName) => tagName.toLowerCase().includes(q))
    );
  }

  if (tag) {
    result = result.filter((level) => level.tags.some((tagName) => tagName.toLowerCase() === tag));
  }

  if (difficulty) {
    result = result.filter((level) => level.difficulty.toLowerCase() === difficulty);
  }

  res.json({ items: result, total: result.length });
});

app.get('/api/levels/featured', (_req, res) => {
  res.json({ items: featuredLevels() });
});

app.get('/api/levels/:id', (req, res) => {
  const level = levelById(req.params.id);
  if (!level) {
    res.status(404).json({ error: 'Level not found' });
    return;
  }

  res.json(level);
});

app.get('/api/levels/:id/download', (req, res) => {
  const level = levelById(req.params.id);
  if (!level) {
    res.status(404).json({ error: 'Level not found' });
    return;
  }

  res.setHeader('Content-Disposition', `attachment; filename="${level.id}.json"`);
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(level, null, 2));
});

app.post('/api/levels/upload', authMiddleware, (req, res) => {
  const record = req.body ?? {};

  if (!record || typeof record !== 'object') {
    res.status(400).json({ error: 'Invalid level payload' });
    return;
  }

  const cleanRecord: LevelRecord = {
    id: String(record.id ?? `custom-${Date.now()}`),
    name: String(record.name ?? 'Custom level'),
    author: String(record.author ?? (req as any).user.username),
    description: String(record.description ?? 'Uploaded custom mission'),
    tags: Array.isArray(record.tags) ? record.tags.map(String) : ['custom'],
    difficulty: ['easy', 'normal', 'hard', 'expert'].includes(String(record.difficulty))
      ? String(record.difficulty)
      : 'normal',
    time: Number(record.time ?? 45),
    gems: Number(record.gems ?? 3),
    size: String(record.size ?? 'Custom'),
    featured: Boolean(record.featured),
    thumbnail: String(record.thumbnail ?? 'custom'),
    createdAt: String(record.createdAt ?? new Date().toISOString().slice(0, 10))
  };

  const item = addUploadedLevel(cleanRecord);
  res.status(201).json(item);
});

app.get('/api/mission-packs', (_req, res) => {
  res.json({
    items: [
      {
        id: 'starter-pack',
        name: 'Starter Mission Pack',
        author: 'PQ-Web',
        description: 'A curated early set of beginner and intermediate levels.',
        tags: ['starter', 'beginner'],
        totalLevels: defaultLevels.length,
        featured: true,
        cover: 'starter'
      },
      {
        id: 'precision-pack',
        name: 'Precision Mission Pack',
        author: 'Qube',
        description: 'Tighter routes, harder timing, and more deliberate score chasing.',
        tags: ['precision', 'hard'],
        totalLevels: 4,
        featured: false,
        cover: 'precision'
      }
    ]
  });
});

app.get('/api/saves/me', authMiddleware, (req, res) => {
  const user = (req as any).user as UserRecord;
  const saves = (globalThis as any).__PQ_SAVE_STATE__ ?? {};
  const userSave = saves[user.id] ?? {
    unlockedLevels: ['marble-bridge'],
    bestTimes: {},
    completedLevels: [],
    medalCounts: { gold: 0, silver: 0, bronze: 0 }
  };
  res.json({ saves: userSave });
});

app.post('/api/saves/me', authMiddleware, (req, res) => {
  const user = (req as any).user as UserRecord;
  const payload = req.body ?? {};
  const saves = ((globalThis as any).__PQ_SAVE_STATE__ ??= {});
  const current = saves[user.id] ?? {
    unlockedLevels: ['marble-bridge'],
    bestTimes: {},
    completedLevels: [],
    medalCounts: { gold: 0, silver: 0, bronze: 0 }
  };

  saves[user.id] = {
    ...current,
    ...payload,
    unlockedLevels: Array.isArray(payload.unlockedLevels) ? payload.unlockedLevels : current.unlockedLevels,
    bestTimes: payload.bestTimes ?? current.bestTimes,
    completedLevels: Array.isArray(payload.completedLevels) ? payload.completedLevels : current.completedLevels,
    medalCounts: payload.medalCounts ?? current.medalCounts
  };

  res.json({ saves: saves[user.id] });
});

app.use(express.static(path.join(__dirname, '../dist')));

app.get('*', (_req, res) => {
  const indexPath = path.join(__dirname, '../dist/index.html');
  res.sendFile(indexPath);
});

app.listen(port, () => {
  console.log(`PQ-Web API listening on http://localhost:${port}`);
});
