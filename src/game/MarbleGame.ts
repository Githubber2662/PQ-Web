export type DemoState = {
  timer: number;
  collectedGems: number;
  totalGems: number;
  status: string;
  checkpoint: number;
  levelIndex: number;
};

type Platform = { x: number; y: number; w: number; h: number };
type Hazard = { x: number; y: number; w: number; h: number };
type Gem = { x: number; y: number; r: number; collected: boolean };

type LevelDefinition = {
  name: string;
  start: { x: number; y: number };
  checkpoint?: { x: number; y: number };
  goal: { x: number; y: number; w: number; h: number };
  platforms: Platform[];
  hazards: Hazard[];
  gems: { x: number; y: number }[];
};

const LEVELS: LevelDefinition[] = [
  {
    name: 'Marble Bridge',
    start: { x: 70, y: 280 },
    checkpoint: { x: 420, y: 240 },
    goal: { x: 770, y: 298, w: 28, h: 18 },
    platforms: [
      { x: 0, y: 350, w: 200, h: 70 },
      { x: 240, y: 300, w: 120, h: 20 },
      { x: 380, y: 270, w: 110, h: 18 },
      { x: 560, y: 230, w: 110, h: 18 },
      { x: 640, y: 180, w: 90, h: 18 }
    ],
    hazards: [
      { x: 330, y: 350, w: 40, h: 12 },
      { x: 490, y: 350, w: 32, h: 12 },
      { x: 640, y: 350, w: 58, h: 12 }
    ],
    gems: [
      { x: 260, y: 260 },
      { x: 430, y: 230 },
      { x: 720, y: 150 }
    ]
  },
  {
    name: 'Silver Cascade',
    start: { x: 80, y: 300 },
    checkpoint: { x: 470, y: 220 },
    goal: { x: 820, y: 250, w: 30, h: 18 },
    platforms: [
      { x: 0, y: 350, w: 140, h: 70 },
      { x: 180, y: 315, w: 120, h: 20 },
      { x: 340, y: 265, w: 120, h: 20 },
      { x: 520, y: 220, w: 110, h: 18 },
      { x: 680, y: 170, w: 110, h: 18 }
    ],
    hazards: [
      { x: 146, y: 350, w: 22, h: 12 },
      { x: 295, y: 350, w: 32, h: 12 },
      { x: 618, y: 350, w: 36, h: 12 }
    ],
    gems: [
      { x: 210, y: 270 },
      { x: 540, y: 180 },
      { x: 730, y: 130 }
    ]
  },
  {
    name: 'Glass Ember',
    start: { x: 70, y: 300 },
    checkpoint: { x: 430, y: 200 },
    goal: { x: 845, y: 160, w: 32, h: 18 },
    platforms: [
      { x: 0, y: 350, w: 150, h: 70 },
      { x: 200, y: 310, w: 110, h: 20 },
      { x: 350, y: 260, w: 90, h: 18 },
      { x: 500, y: 210, w: 100, h: 18 },
      { x: 650, y: 160, w: 110, h: 18 }
    ],
    hazards: [
      { x: 155, y: 350, w: 40, h: 12 },
      { x: 315, y: 350, w: 30, h: 12 },
      { x: 448, y: 350, w: 48, h: 12 }
    ],
    gems: [
      { x: 240, y: 270 },
      { x: 390, y: 220 },
      { x: 710, y: 120 }
    ]
  }
];

export function mountMarbleDemo(canvas: HTMLCanvasElement, options?: { onState?: (state: DemoState) => void }) {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');

  const world = { width: 900, height: 420, floorY: 350 };
  const pressed: Record<string, boolean> = { left: false, right: false, jump: false };
  const state = {
    timer: 0,
    running: true,
    levelIndex: 0,
    checkpointIndex: 0,
    status: 'Ready',
    collectedGems: 0,
    totalGems: 0,
    lives: 3,
    won: false
  };

  let currentLevel = LEVELS[0];
  const marble = { x: 70, y: 280, r: 16, vx: 0, vy: 0, grounded: false };
  let gems: Gem[] = [];

  const emitState = () => {
    options?.onState?.({
      timer: state.timer,
      collectedGems: state.collectedGems,
      totalGems: state.totalGems,
      status: state.status,
      checkpoint: state.checkpointIndex,
      levelIndex: state.levelIndex
    });
  };

  const toGemList = (source: { x: number; y: number }[]) =>
    source.map((pos) => ({ x: pos.x, y: pos.y, r: 10, collected: false }));

  const buildLevel = (index: number) => {
    state.levelIndex = index;
    currentLevel = LEVELS[index % LEVELS.length];
    state.totalGems = currentLevel.gems.length;
    state.collectedGems = 0;
    state.status = index === 0 ? 'Ready' : `Level ${index + 1}`;
    gems = toGemList(currentLevel.gems);
    marble.x = currentLevel.start.x;
    marble.y = currentLevel.start.y;
    marble.vx = 0;
    marble.vy = 0;
    marble.grounded = false;
    state.checkpointIndex = 0;
    emitState();
  };

  const resetCurrentLevel = () => {
    const base = currentLevel.start;
    marble.x = base.x;
    marble.y = base.y;
    marble.vx = 0;
    marble.vy = 0;
    marble.grounded = false;
    gems = toGemList(currentLevel.gems);
    state.collectedGems = 0;
    state.status = `Level ${state.levelIndex + 1}`;
    emitState();
  };

  const advanceLevel = () => {
    const nextIndex = state.levelIndex + 1;
    if (nextIndex < LEVELS.length) {
      state.levelIndex = nextIndex;
      buildLevel(nextIndex);
      state.status = `Level ${nextIndex + 1}`;
      emitState();
    } else {
      state.status = 'Complete!';
      state.running = false;
      emitState();
    }
  };

  const handleKey = (key: string, value: boolean) => {
    if (key === 'a' || key === 'arrowleft') pressed.left = value;
    if (key === 'd' || key === 'arrowright') pressed.right = value;
    if (key === 'w' || key === 'arrowup' || key === ' ') pressed.jump = value;
  };

  const onKeyDown = (event: KeyboardEvent) => {
    const key = event.key.toLowerCase();
    if (key === ' ') event.preventDefault();
    handleKey(key, true);
  };

  const onKeyUp = (event: KeyboardEvent) => {
    handleKey(event.key.toLowerCase(), false);
  };

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(300, Math.floor(rect.width * dpr));
    canvas.height = Math.max(240, Math.floor(rect.height * dpr));
  };

  const intersectsRect = (a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; r: number }) => {
    const closestX = Math.max(a.x, Math.min(b.x, a.x + a.w));
    const closestY = Math.max(a.y, Math.min(b.y, a.y + a.h));
    const dx = b.x - closestX;
    const dy = b.y - closestY;
    return (dx * dx + dy * dy) < b.r * b.r;
  };

  const update = (dt: number) => {
    if (!state.running) return;

    const move = (pressed.right ? 1 : 0) - (pressed.left ? 1 : 0);
    const accel = 500;
    const maxSpeed = 220;

    marble.vx += move * accel * dt;
    if (move === 0) marble.vx *= 0.82;
    marble.vx = Math.max(-maxSpeed, Math.min(maxSpeed, marble.vx));

    if (pressed.jump && marble.grounded) {
      marble.vy = -420;
      marble.grounded = false;
    }

    marble.vy += 950 * dt;
    marble.x += marble.vx * dt;
    marble.y += marble.vy * dt;

    marble.grounded = false;

    for (const platform of currentLevel.platforms) {
      const nextBottom = marble.y + marble.vy * dt + marble.r;
      const prevBottom = marble.y - marble.r;
      const overlaps =
        marble.x + marble.r > platform.x &&
        marble.x - marble.r < platform.x + platform.w &&
        marble.y + marble.r > platform.y &&
        marble.y - marble.r < platform.y + platform.h;

      if (overlaps && marble.vy >= 0 && prevBottom <= platform.y + 12 && nextBottom >= platform.y) {
        marble.y = platform.y - marble.r;
        marble.vy = 0;
        marble.grounded = true;
      }
    }

    if (marble.x - marble.r < 0) {
      marble.x = marble.r;
      marble.vx *= -0.2;
    }

    if (marble.x + marble.r > world.width) {
      marble.x = world.width - marble.r;
      marble.vx *= -0.2;
    }

    if (marble.y > world.height + 100) {
      state.status = 'Respawn';
      resetCurrentLevel();
      return;
    }

    if (currentLevel.checkpoint && marble.x > currentLevel.checkpoint.x) {
      state.checkpointIndex = 1;
      state.status = 'Checkpoint reached';
    }

    for (const gem of gems) {
      if (!gem.collected) {
        const dx = marble.x - gem.x;
        const dy = marble.y - gem.y;
        if (Math.hypot(dx, dy) < marble.r + gem.r + 6) {
          gem.collected = true;
          state.collectedGems += 1;
          state.status = 'Gem collected';
        }
      }
    }

    for (const hazard of currentLevel.hazards) {
      if (intersectsRect(hazard, marble)) {
        state.status = 'Hazard hit';
        resetCurrentLevel();
        return;
      }
    }

    const goalReached =
      marble.x + marble.r > currentLevel.goal.x &&
      marble.x - marble.r < currentLevel.goal.x + currentLevel.goal.w &&
      marble.y + marble.r > currentLevel.goal.y &&
      marble.y - marble.r < currentLevel.goal.y + currentLevel.goal.h;

    if (goalReached) {
      if (state.collectedGems >= state.totalGems) {
        state.status = 'Goal reached';
        advanceLevel();
        return;
      }
      state.status = 'Collect all gems';
    }

    state.timer += dt;
    emitState();
  };

  const drawBackground = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#8fd6ff');
    gradient.addColorStop(0.55, '#d9f1ff');
    gradient.addColorStop(1, '#dfeec8');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#9bd58f';
    ctx.fillRect(0, world.floorY + 22, canvas.width, canvas.height - world.floorY);
  };

  const drawPlatforms = () => {
    for (const platform of currentLevel.platforms) {
      ctx.fillStyle = '#4f7b4d';
      ctx.fillRect(platform.x, platform.y, platform.w, platform.h);
    }
  };

  const drawHazards = () => {
    for (const hazard of currentLevel.hazards) {
      ctx.fillStyle = '#f76a6a';
      ctx.fillRect(hazard.x, hazard.y, hazard.w, hazard.h);
    }
  };

  const drawGems = () => {
    for (const gem of gems) {
      if (gem.collected) continue;
      ctx.fillStyle = '#ffd55a';
      ctx.beginPath();
      ctx.moveTo(gem.x, gem.y - gem.r);
      ctx.lineTo(gem.x + gem.r, gem.y);
      ctx.lineTo(gem.x, gem.y + gem.r);
      ctx.lineTo(gem.x - gem.r, gem.y);
      ctx.closePath();
      ctx.fill();
    }
  };

  const drawGoal = () => {
    ctx.fillStyle = state.won ? '#abffde' : '#8ae7ff';
    ctx.fillRect(currentLevel.goal.x, currentLevel.goal.y, currentLevel.goal.w, currentLevel.goal.h);
    ctx.strokeStyle = '#125d7a';
    ctx.strokeRect(currentLevel.goal.x, currentLevel.goal.y, currentLevel.goal.w, currentLevel.goal.h);
  };

  const drawMarble = () => {
    ctx.beginPath();
    ctx.arc(marble.x, marble.y, marble.r, 0, Math.PI * 2);
    ctx.fillStyle = '#f4d360';
    ctx.fill();
    ctx.closePath();
  };

  const drawHUD = () => {
    ctx.fillStyle = 'rgba(12, 19, 29, 0.64)';
    ctx.fillRect(14, 14, 240, 64);

    ctx.fillStyle = '#edf7ff';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText(`Level ${state.levelIndex + 1}: ${currentLevel.name}`, 26, 38);
    ctx.fillText(`Gems ${state.collectedGems}/${state.totalGems}  •  ${state.status}`, 26, 60);
  };

  const render = () => {
    drawBackground();
    drawPlatforms();
    drawHazards();
    drawGems();
    drawGoal();
    drawMarble();
    drawHUD();
  };

  const loop = (now: number) => {
    if (!loop.last) loop.last = now;
    const dt = Math.min((now - loop.last) / 1000, 0.033);
    loop.last = now;
    update(dt);
    render();
    loop.raf = requestAnimationFrame(loop);
  };

  loop.last = performance.now();
  loop.raf = 0;

  resize();
  buildLevel(0);
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  window.addEventListener('resize', resize);
  loop.raf = requestAnimationFrame(loop);

  return {
    setRunning(value: boolean) {
      state.running = value;
      state.status = value ? `Level ${state.levelIndex + 1}` : 'Paused';
      emitState();
    },
    reset() {
      state.running = true;
      state.timer = 0;
      buildLevel(state.levelIndex);
      state.status = `Level ${state.levelIndex + 1}`;
      emitState();
    },
    destroy() {
      cancelAnimationFrame(loop.raf);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('resize', resize);
    }
  };
}
