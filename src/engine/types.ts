export type Vec2 = {
  x: number;
  y: number;
};

export type PlatformType = 'platform' | 'goal' | 'hazard' | 'boost';

export type Platform = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  type: PlatformType;
};

export type LevelDef = {
  id: string;
  name: string;
  author: string;
  gravity: number;
  spawn: Vec2;
  platforms: Platform[];
  music: string;
  timeLimit: number;
};

export type InputState = {
  left: boolean;
  right: boolean;
  jump: boolean;
  restart: boolean;
};

export type BallState = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  onGround: boolean;
};

export type GameState = {
  level: LevelDef;
  ball: BallState;
  input: InputState;
  completed: boolean;
  timeLeft: number;
};
