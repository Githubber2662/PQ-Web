import type { LevelDef } from '../engine/types';

export const sampleLevels: LevelDef[] = [
  {
    id: 'demo-run',
    name: 'Demo Run',
    author: 'PQ-Web',
    gravity: 1200,
    spawn: { x: 180, y: 180 },
    music: 'theme-01',
    timeLimit: 120,
    platforms: [
      { id: 'ground', x: 0, y: 520, w: 900, h: 60, type: 'platform' },
      { id: 'platform-1', x: 180, y: 430, w: 130, h: 18, type: 'platform' },
      { id: 'platform-2', x: 350, y: 360, w: 130, h: 18, type: 'platform' },
      { id: 'platform-3', x: 520, y: 290, w: 140, h: 18, type: 'platform' },
      { id: 'goal', x: 760, y: 250, w: 40, h: 40, type: 'goal' }
    ]
  }
];

export function getInitialLevel(): LevelDef {
  return sampleLevels[0];
}
