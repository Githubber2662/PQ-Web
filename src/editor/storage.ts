import type { GameState, InputState, LevelDef } from './types';
import { resetBall, tickPhysics } from './physics';

export function createInitialState(level: LevelDef): GameState {
  return {
    level,
    ball: resetBall(level),
    input: {
      left: false,
      right: false,
      jump: false,
      restart: false
    },
    completed: false,
    timeLeft: level.timeLimit
  };
}

export function renderGame(ctx: CanvasRenderingContext2D, state: GameState): void {
  const { level, ball } = state;

  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  const gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
  gradient.addColorStop(0, '#0b1020');
  gradient.addColorStop(1, '#1d3557');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  ctx.fillStyle = '#92c5ff';
  ctx.fillRect(level.spawn.x - 10, level.spawn.y - 10, 20, 20);

  for (const platform of level.platforms) {
    if (platform.type === 'goal') {
      ctx.fillStyle = '#fde68a';
    } else if (platform.type === 'hazard') {
      ctx.fillStyle = '#ef4444';
    } else if (platform.type === 'boost') {
      ctx.fillStyle = '#34d399';
    } else {
      ctx.fillStyle = '#94a3b8';
    }
    ctx.fillRect(platform.x, platform.y, platform.w, platform.h);
  }

  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = '#f8fafc';
  ctx.fill();

  ctx.fillStyle = '#e2e8f0';
  ctx.font = '20px sans-serif';
  ctx.fillText(`Time: ${Math.max(0, Math.ceil(state.timeLeft))}s`, 16, 30);
  ctx.fillText(`Goal: ${state.completed ? 'Complete' : 'In progress'}`, 16, 56);
}

export function stepGame(state: GameState, input: InputState, dt: number): void {
  state.input = input;
  tickPhysics(state, input, dt);

  if (input.restart) {
    const reset = createInitialState(state.level);
    state.ball = reset.ball;
    state.completed = reset.completed;
    state.timeLeft = reset.timeLeft;
  }
}
