# PQ-Web

A clean-room TypeScript + Vue project for a PlatinumQuest-inspired web app with a Marbleland-style level browser and a mini playable marble platformer demo.

## Features

- Level browser front end inspired by Marbleland
- Search, filters, featured cards, and level detail panel
- Downloadable level JSON mock API
- Mobile-friendly UI
- Playable mini marble platformer demo in-browser
- Pure JS/TS stack with Vite + Vue + Express

## Running locally

```bash
npm install
npm run dev
```

The app starts the Vite front end on port 3000 and the API on port 8080.

## Production build

```bash
npm run build
npm start
```

## Notes

This is intentionally a clean-room implementation: it takes the shape of Marbleland’s level-sharing concepts and the feel of Marble Blast / PlatinumQuest gameplay, but does not copy the original codebase or engine.
