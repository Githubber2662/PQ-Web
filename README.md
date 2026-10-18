# PQ-Web

A TypeScript + Vite starter for a pure JavaScript/TypeScript PlatinumQuest-inspired web game.

This is a scaffold, not a full asset-perfect port. The project is intentionally structured to support:

- a custom physics engine
- localStorage-based level editor
- replay recordings and automatic saves
- jukebox and audio settings persistence
- Marbleland integration hooks for leaderboard submission and metadata
- future expansion toward Gold, Ultra, Platinum, Fubar, and PlatinumQuest level packs

## Getting started

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
```

## Current features

- playable marble test level with canvas rendering
- keyboard controls (`A/D` or arrow keys, `W`/`Up`/`Space`), `R` restart
- localStorage-based level editor
- simple replay recorder with saved replay list
- jukebox placeholder and volume persistence
- Marbleland integration stub module in `src/marbleland`

## Planned work

- migrate the TorqueScript-level logic into a dedicated level descriptor format
- port a larger subset of level object types and puzzles
- implement deterministic replay playback
- add leaderboard integration once Marbleland API details are available
- support Gold/Ultra/Platinum/Fubar/PlatinumQuest level packs

## Notes on the original codebase

This project is intentionally independent from the upstream TorqueScript code. `*.cs` files in the original repo are TorqueScript, not C#. The goal is a fresh TypeScript implementation inspired by the game design and feel without copying the original code verbatim.

## Repo intent

This repository is for a browser-based pure JS/TS port of the game concept and style, with future support for local saved editor content and Marbleland integration.

## License

BSD-2-Clause

---

This project was bootstrapped as the first playable scaffold and is designed to grow into a larger game port.
