const gameState = { running: true, timer: 0, won: false };

export function mountMarbleDemo(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');

  const dpr = window.devicePixelRatio || 1;
  const world = {
    width: 900,
    height: 420,
    floorY: 340,
    allowedMove: 120,
    goal: { x: 760, y: 298, w: 28, h: 18 }
  };

  const marble = {
    x: 70,
    y: 280,
    r: 16,
    vx: 0,
    vy: 0,
    grounded: false
  };

  const platforms = [
    { x: 0, y: 350, w: 200, h: 70 },
    { x: 230, y: 305, w: 120, h: 20 },
    { x: 380, y: 270, w: 110, h: 18 },
    { x: 560, y: 230, w: 110, h: 18 },
    { x: 640, y: 180, w: 80, h: 18 }
  ];

  const hazards = [
    { x: 330, y: 350, w: 40, h: 12 },
    { x: 490, y: 350, w: 32, h: 12 },
    { x: 640, y: 350, w: 58, h: 12 }
  ];

  const gems = [
    { x: 260, y: 260, r: 10, collected: false },
    { x: 430, y: 230, r: 10, collected: false },
    { x: 720, y: 150, r: 10, collected: false }
  ];

  const pressed: Record<string, boolean> = {
    left: false,
    right: false,
    jump: false
  };

  const handleKey = (key: string, value: boolean) => {
    if (key === 'a' || key === 'arrowleft') pressed.left = value;
    if (key === 'd' || key === 'arrowright') pressed.right = value;
    if (key === 'w' || key === 'arrowup' || key === ' ') pressed.jump = value;
  };

  const onKeyDown = (event: KeyboardEvent) => {
    const key = event.key.toLowerCase();
    handleKey(key, true);
  };

  const onKeyUp = (event: KeyboardEvent) => {
    const key = event.key.toLowerCase();
    handleKey(key, false);
  };

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.max(300, rect.width * dpr);
    canvas.height = Math.max(200, rect.height * dpr);
  };

  const resetLevel = () => {
    marble.x = 70;
    marble.y = 280;
    marble.vx = 0;
    marble.vy = 0;
    marble.grounded = false;
    gems.forEach((gem) => (gem.collected = false));
    gameState.timer = 0;
    gameState.won = false;
  };

  const update = (dt: number) => {
    if (!gameState.running) return;

    const move = (pressed.right ? 1 : 0) - (pressed.left ? 1 : 0);
    const accel = 400;
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

    const groundedBefore = marble.grounded;
    marble.grounded = false;

    for (const platform of platforms) {
      const prevBottom = marble.y - marble.r;
      const nextBottom = marble.y + marble.vy * dt - marble.r;
      const overlapping =
        marble.x + marble.r > platform.x &&
        marble.x - marble.r < platform.x + platform.w &&
        marble.y + marble.r >= platform.y &&
        marble.y + marble.r <= platform.y + 18;

      if (
        overlapping &&
        marble.vy >= 0 &&
        prevBottom <= platform.y + 18 &&
        nextBottom >= platform.y
      ) {
        marble.y = platform.y - marble.r;
        marble.vy = 0;
        marble.grounded = true;
      }
    }

    if (!marble.grounded && groundedBefore) {
      marble.grounded = false;
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
      resetLevel();
    }

    for (const gem of gems) {
      if (!gem.collected) {
        const dx = marble.x - gem.x;
        const dy = marble.y - gem.y;
        if (Math.hypot(dx, dy) < marble.r + gem.r + 6) {
          gem.collected = true;
        }
      }
    }

    const goalHit =
      marble.x + marble.r > world.goal.x &&
      marble.x - marble.r < world.goal.x + world.goal.w &&
      marble.y + marble.r > world.goal.y &&
      marble.y - marble.r < world.goal.y + world.goal.h;

    if (goalHit && gems.every((gem) => gem.collected)) {
      gameState.won = true;
      gameState.running = false;
    }

    for (const hazard of hazards) {
      const hit =
        marble.x + marble.r > hazard.x &&
        marble.x - marble.r < hazard.x + hazard.w &&
        marble.y + marble.r > hazard.y &&
        marble.y - marble.r < hazard.y + hazard.h;
      if (hit) {
        resetLevel();
      }
    }

    gameState.timer += dt;
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
    ctx.fillRect(0, world.floorY + 20, canvas.width, canvas.height - world.floorY + 20);
  };

  const drawPlatforms = () => {
    for (const platform of platforms) {
      ctx.fillStyle = '#4f7b4d';
      ctx.fillRect(platform.x, platform.y, platform.w, platform.h);
    }
  };

  const drawHazards = () => {
    for (const hazard of hazards) {
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
    ctx.fillStyle = gameState.won ? '#9ef0dd' : '#8ae7ff';
    ctx.fillRect(world.goal.x, world.goal.y, world.goal.w, world.goal.h);
    ctx.strokeStyle = '#12627a';
    ctx.strokeRect(world.goal.x, world.goal.y, world.goal.w, world.goal.h);
  };

  const drawMarble = () => {
    ctx.beginPath();
    ctx.arc(marble.x, marble.y, marble.r, 0, Math.PI * 2);
    ctx.fillStyle = '#f4d360';
    ctx.fill();
    ctx.closePath();
  };

  const drawHUD = () => {
    const remaining = gems.filter((gem) => !gem.collected).length;
    ctx.fillStyle = 'rgba(10, 19, 29, 0.6)';
    ctx.fillRect(16, 14, 170, 54);
    ctx.fillStyle = '#edf7ff';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText(`Gems: ${remaining} / ${gems.length}`, 26, 38);
    ctx.fillText(`Status: ${gameState.won ? 'Goal!' : gameState.running ? 'Playing' : 'Paused'}`, 26, 58);
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

  let last = performance.now();
  let rafId = 0;

  const loop = (now: number) => {
    const dt = Math.min((now - last) / 1000, 0.033);
    last = now;
    update(dt);
    render();
    rafId = requestAnimationFrame(loop);
  };

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  resize();
  resetLevel();
  rafId = requestAnimationFrame(loop);

  return {
    setRunning(value: boolean) {
      gameState.running = value;
    },
    reset() {
      resetLevel();
      gameState.running = true;
    },
    destroy() {
      cancelAnimationFrame(rafId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    }
  };
}
