import './style.css';
import { getLevelById, levelCatalog } from './data/levels';
import { createInitialState, renderGame, stepGame } from './engine/game';
import { createJukebox } from './ui/jukebox';
import { createReplayManager } from './engine/replay';
import { createMarblelandAdapter } from './marbleland';

const app = document.querySelector('#app');
if (!app) {
  throw new Error('Root element #app not found');
}

app.innerHTML = `
  <div class="app-shell">
    <section class="game-panel">
      <canvas id="game-canvas" width="960" height="540"></canvas>
    </section>
    <aside class="sidebar">
      <div class="panel">
        <h2>PQ-Web</h2>
        <div class="controls">
          <button type="button" id="restart-button">Restart</button>
          <button type="button" id="toggle-loop">Pause</button>
        </div>
        <label>
          Level
          <select id="level-select"></select>
        </label>
      </div>
      <div id="editor-root"></div>
      <div id="jukebox-root"></div>
      <div class="panel">
        <h3>Leaderboards</h3>
        <ul id="leaderboard-list" class="replay-list"></ul>
      </div>
      <div class="panel">
        <h3>Replays</h3>
        <ul id="replay-list" class="replay-list"></ul>
      </div>
    </aside>
  </div>
`;

const canvas = document.querySelector('#game-canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d');
if (!ctx) {
  throw new Error('Unable to create 2D context');
}

const levelSelect = document.querySelector('#level-select') as HTMLSelectElement;
for (const level of levelCatalog) {
  const option = document.createElement('option');
  option.value = level.id;
  option.textContent = level.name;
  levelSelect.appendChild(option);
}

const marbleland = createMarblelandAdapter();
void marbleland.connect();

const replayManager = createReplayManager();
const input = {
  left: false,
  right: false,
  jump: false,
  restart: false
};

const renderLeaderboard = (levelId: string) => {
  const list = document.querySelector('#leaderboard-list') as HTMLUListElement;
  list.innerHTML = '';
  const entries = marbleland.listScores(levelId).slice(0, 5);
  if (entries.length === 0) {
    list.innerHTML = '<li><span>No scores yet</span></li>';
    return;
  }
  for (const entry of entries) {
    const item = document.createElement('li');
    item.innerHTML = `<span>${entry.user.name}</span><span class="meta">${entry.score} / ${entry.time.toFixed(1)}s</span>`;
    list.appendChild(item);
  }
};

const renderReplays = () => {
  const list = document.querySelector('#replay-list') as HTMLUListElement;
  list.innerHTML = '';
  for (const replay of replayManager.readAllReplays().slice(-5).reverse()) {
    const item = document.createElement('li');
    item.innerHTML = `<span>${replay.levelId}</span><span class="meta">${new Date(replay.createdAt).toLocaleTimeString()}</span>`;
    list.appendChild(item);
  }
};

let curLevel = getLevelById(levelCatalog[0].id) ?? levelCatalog[0];
let state = createInitialState(curLevel);
let currentReplay = replayManager.start(curLevel.id);
let paused = false;
let submittedForCurrentRun = false;

const applyLevel = (levelId: string) => {
  const nextLevel = getLevelById(levelId) ?? levelCatalog[0];
  curLevel = nextLevel;
  state = createInitialState(nextLevel);
  currentReplay = replayManager.start(nextLevel.id);
  submittedForCurrentRun = false;
  levelSelect.value = nextLevel.id;
  renderLeaderboard(nextLevel.id);
};

levelSelect.addEventListener('change', (event) => {
  const nextId = (event.target as HTMLSelectElement).value;
  applyLevel(nextId);
});

window.addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase();
  if (event.key === 'ArrowLeft' || key === 'a') input.left = true;
  if (event.key === 'ArrowRight' || key === 'd') input.right = true;
  if (event.key === 'ArrowUp' || event.key === ' ' || key === 'w') input.jump = true;
  if (key === 'r') input.restart = true;
});

window.addEventListener('keyup', (event) => {
  const key = event.key.toLowerCase();
  if (event.key === 'ArrowLeft' || key === 'a') input.left = false;
  if (event.key === 'ArrowRight' || key === 'd') input.right = false;
  if (event.key === 'ArrowUp' || event.key === ' ' || key === 'w') input.jump = false;
  if (key === 'r') input.restart = false;
});

const restartButton = document.querySelector('#restart-button') as HTMLButtonElement;
restartButton.addEventListener('click', () => {
  input.restart = true;
  setTimeout(() => {
    input.restart = false;
  }, 80);
});

const toggleLoop = document.querySelector('#toggle-loop') as HTMLButtonElement;
toggleLoop.addEventListener('click', () => {
  paused = !paused;
  toggleLoop.textContent = paused ? 'Resume' : 'Pause';
});

const onLevelSaved = (levelData: { id: string; name: string; author: string; gravity: number; spawnX: number; spawnY: number; music: string; timeLimit: number }) => {
  const nextLevel = getLevelById(levelData.id) ?? {
    id: levelData.id,
    name: levelData.name,
    author: levelData.author,
    gravity: levelData.gravity,
    spawn: { x: levelData.spawnX, y: levelData.spawnY },
    music: levelData.music,
    timeLimit: levelData.timeLimit,
    platforms: state.level.platforms
  };
  applyLevel(nextLevel.id);
};

const editorRoot = document.querySelector('#editor-root') as HTMLElement;
createJukebox(document.querySelector('#jukebox-root') as HTMLElement);

const editor = (await import('./editor/editor')).createLevelEditor;
editor(editorRoot, { onLoad: onLevelSaved });

let lastTime = performance.now();

const tick = (time: number) => {
  const dt = (time - lastTime) / 1000;
  lastTime = time;

  if (!paused) {
    stepGame(state, input, dt);
    currentReplay.push({
      t: time,
      left: input.left,
      right: input.right,
      jump: input.jump,
      restart: input.restart
    });

    if (state.completed && !submittedForCurrentRun) {
      submittedForCurrentRun = true;
      void marbleland.submitScore({
        levelId: state.level.id,
        time: state.timeLeft,
        user: { id: 'guest-user', name: 'Guest' }
      }).then(() => renderLeaderboard(state.level.id));
    }
  }

  renderGame(ctx, state);
  requestAnimationFrame(tick);
};

renderLeaderboard(curLevel.id);
renderReplays();
requestAnimationFrame(tick);

window.addEventListener('beforeunload', () => {
  currentReplay.stop();
});
