import express from 'express';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { levels, levelById, featuredLevels } from './data/levels.ts';

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

  res.json({ items: result, hasMore: false, total: result.length });
});

app.get('/api/levels/featured', (_req, res) => {
  res.json({ items: featuredLevels });
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

  const filename = `${level.id}.json`;
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(level, null, 2));
});

app.use(express.static(path.join(__dirname, '../dist')));

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(port, () => {
  console.log(`PQ-Web API listening on http://localhost:${port}`);
});
