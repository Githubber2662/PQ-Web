import express from 'express';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { addUploadedLevel, featuredLevels, levelById, levels } from './data/levels.ts';

const app = express();
const port = Number(process.env.PORT ?? 8080);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'pq-web-api', version: '1.1.0' });
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

app.post('/api/levels/upload', (req, res) => {
  const record = req.body;

  if (!record || typeof record !== 'object') {
    res.status(400).json({ error: 'Invalid level payload' });
    return;
  }

  const cleanRecord = {
    id: String(record.id ?? `custom-${Date.now()}`),
    name: String(record.name ?? 'Custom level'),
    author: String(record.author ?? 'Local uploader'),
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

app.use(express.static(path.join(__dirname, '../dist')));

app.get('*', (_req, res) => {
  const indexPath = path.join(__dirname, '../dist/index.html');
  res.sendFile(indexPath);
});

app.listen(port, () => {
  console.log(`PQ-Web API listening on http://localhost:${port}`);
});
