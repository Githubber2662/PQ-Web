# PQ-Web — PlatinumQuest (Port)

This branch contains an initial TypeScript + Vite scaffold and a small Marbleland adapter to start the port of PlatinumQuest into pure JS/TS with Marbleland integration.

What I will push in feat/pq-port-marbleland

- TypeScript + Vite scaffold (package.json, tsconfig, index.html)
- Minimal app entry (src/main.ts) with a stub Marbleland adapter (src/marbleland-adapter.ts)
- A tiny demo level (src/levels/demo-level-01.json)
- Supabase schema file (supabase/schema.sql)
- CI workflow scaffold (.github/workflows/ci.yml)
- README and assets instructions

Next steps I'll take (already planned):
- Add the PQ gameplay core port (TorqueScript -> TypeScript), port level formats, and implement the level editor that saves to localStorage.
- Implement deterministic replay recording and automatic replay saving.
- Implement the jukebox (WebAudio) and leaderboards backed by Supabase (you requested option B).
- Wire Marbleland API and @Vanilagy/MarblelandBackups as level sources.
- Add tests, ESLint/Prettier, and GitHub Actions to build and deploy to GitHub Pages when merged to main.

What I need from you now

1. Supabase project: the project URL and service role key (or instructions) so I can implement leaderboard server endpoints and secure replay uploads. I will store keys in GitHub Actions secrets — NEVER commit them to the repo.
2. PlatinumQuest assets archive (art, sounds, levels, music). Upload a ZIP to the repo release or provide a path I can pull from. Large assets should use Git LFS or an external CDN. See assets/README.md for instructions.
3. Marbleland API details or confirmation that public read access is sufficient. If an API token is required, provide it via secure channel.

If you want me to proceed now, I will begin porting the PG/TorqueScript files from The-New-Platinum-Team/PlatinumQuest-Dev into TypeScript and implement the level editor + replays next.
