import type { BallState, GameState, InputState, LevelDef, Platform } from './types';

const MAX_FALL_SPEED = 1500;

function intersectsCircleRect(ball: BallState, rect: Platform): boolean {
  const closestX = Math.max(rect.x, Math.min(ball.x, rect.x + rect.w));
  const closestY = Math.max(rect.y, Math.min(ball.y, rect.y + rect.h));
  const dx = ball.x - closestX;
  const dy = ball.y - closestY;
  return dx * dx + dy * dy <= ball.radius * ball.radius;
}

function resolveHorizontalCollision(ball: BallState, platform: Platform): void {
  if (ball.vx > 0) {
    ball.x = platform.x - ball.radius;
  } else if (ball.vx < 0) {
    ball.x = platform.x + platform.w + ball.radius;
  }
  ball.vx = 0;
}

function resolveVerticalCollision(ball: BallState, platform: Platform): void {
  if (ball.vy > 0) {
    ball.y = platform.y - ball.radius;
    ball.onGround = true;
  } else if (ball.vy < 0) {
    ball.y = platform.y + platform.h + ball.radius;
  }
  ball.vy = 0;
}

export function resetBall(level: LevelDef): BallState {
  return {
    x: level.spawn.x,
    y: level.spawn.y,
    vx: 0,
    vy: 0,
    radius: 16,
    onGround: false
  };
}

export function tickPhysics(state: GameState, input: InputState, dt: number): void {
  const { ball, level } = state;
  const moveSpeed = 390;
  const jumpVelocity = -640;

  if (input.left) {
    ball.vx -= moveSpeed * dt;
  }
  if (input.right) {
    ball.vx += moveSpeed * dt;
  }
  if (!input.left && !input.right) {
    ball.vx *= 0.82;
  }

  if (input.jump && ball.onGround) {
    ball.vy = jumpVelocity;
    ball.onGround = false;
  }

  ball.vy += level.gravity * dt;
  ball.vy = Math.min(ball.vy, MAX_FALL_SPEED);

  ball.x += ball.vx * dt;
  for (const platform of level.platforms) {
    if (platform.type === 'hazard') {
      continue;
    }
    if (intersectsCircleRect(ball, platform)) {
      resolveHorizontalCollision(ball, platform);
      break;
    }
  }

  ball.y += ball.vy * dt;
  ball.onGround = false;

  for (const platform of level.platforms) {
    if (platform.type === 'hazard') {
      continue;
    }
    if (intersectsCircleRect(ball, platform)) {
      resolveVerticalCollision(ball, platform);
      break;
    }
  }

  const goal = level.platforms.find((platform) => platform.type === 'goal');
  if (goal && intersectsCircleRect(ball, goal)) {
    state.completed = true;
  }

  if (ball.y > 760) {
    ball.x = level.spawn.x;
    ball.y = level.spawn.y;
    ball.vx = 0;
    ball.vy = 0;
    ball.onGround = false;
  }

  state.timeLeft = Math.max(0, state.timeLeft - dt);
}
