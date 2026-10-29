# PQ-Web

A clean-room TypeScript + Vue project for a PlatinumQuest-inspired web app with a Marbleland-style level browser and a playable marble platformer demo.

## Features

- Level browser front end inspired by Marbleland
- Search, filters, featured cards, and level detail panel
- Downloadable level JSON mock API
- Community upload flow for custom level JSON files
- Mobile-friendly UI and responsive dashboard
- Playable mini marble platformer demo in-browser
- Multi-level progression, checkpoints, and HUD metrics
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

This is intentionally a clean-room implementation: it follows the general architecture and feel of Marble Blast / PlatinumQuest + Marbleland, but does not copy the original codebases or engine logic.
