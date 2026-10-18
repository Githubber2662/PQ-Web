export type LevelDef = {
  id: string;
  name: string;
  author: string;
  gravity: number;
  spawn: { x: number; y: number };
  platforms: Array<{
    id: string;
    x: number;
    y: number;
    w: number;
    h: number;
    type: 'platform' | 'goal' | 'hazard' | 'boost';
  }>;
  music: string;
  timeLimit: number;
};

export const levelCatalog: LevelDef[] = [
  {
    id: 'goldteaser',
    name: 'Gold Teaser',
    author: 'PQ-Web',
    gravity: 1200,
    spawn: { x: 120, y: 180 },
    music: 'theme-01',
    timeLimit: 90,
    platforms: [
      { id: 'ground', x: 0, y: 520, w: 960, h: 60, type: 'platform' },
      { id: 'step-1', x: 180, y: 432, w: 120, h: 18, type: 'platform' },
      { id: 'step-2', x: 350, y: 360, w: 120, h: 18, type: 'platform' },
      { id: 'step-3', x: 520, y: 298, w: 120, h: 18, type: 'platform' },
      { id: 'goal', x: 760, y: 250, w: 36, h: 36, type: 'goal' }
    ]
  },
  {
    id: 'ultra-loop',
    name: 'Ultra Loop',
    author: 'PQ-Web',
    gravity: 1200,
    spawn: { x: 100, y: 100 },
    music: 'theme-02',
    timeLimit: 120,
    platforms: [
      { id: 'ground', x: 0, y: 520, w: 960, h: 60, type: 'platform' },
      { id: 'ledge-left', x: 80, y: 410, w: 220, h: 18, type: 'platform' },
      { id: 'ledge-mid', x: 360, y: 330, w: 220, h: 18, type: 'platform' },
      { id: 'ledge-right', x: 620, y: 250, w: 220, h: 18, type: 'platform' },
      { id: 'hazard-1', x: 300, y: 470, w: 140, h: 18, type: 'hazard' },
      { id: 'goal', x: 820, y: 210, w: 36, h: 36, type: 'goal' }
    ]
  },
  {
    id: 'platinum-run',
    name: 'Platinum Run',
    author: 'PQ-Web',
    gravity: 1250,
    spawn: { x: 110, y: 440 },
    music: 'theme-03',
    timeLimit: 110,
    platforms: [
      { id: 'ground', x: 0, y: 520, w: 960, h: 60, type: 'platform' },
      { id: 'plat-1', x: 120, y: 370, w: 150, h: 18, type: 'platform' },
      { id: 'plat-2', x: 320, y: 320, w: 180, h: 18, type: 'platform' },
      { id: 'plat-3', x: 540, y: 260, w: 160, h: 18, type: 'platform' },
      { id: 'boost-1', x: 660, y: 220, w: 90, h: 18, type: 'boost' },
      { id: 'goal', x: 820, y: 180, w: 36, h: 36, type: 'goal' }
    ]
  },
  {
    id: 'fubar-dash',
    name: 'Fubar Dash',
    author: 'PQ-Web',
    gravity: 1300,
    spawn: { x: 90, y: 150 },
    music: 'theme-01',
    timeLimit: 100,
    platforms: [
      { id: 'ground', x: 0, y: 520, w: 960, h: 60, type: 'platform' },
      { id: 'rise-1', x: 110, y: 430, w: 100, h: 18, type: 'platform' },
      { id: 'rise-2', x: 250, y: 360, w: 100, h: 18, type: 'platform' },
      { id: 'rise-3', x: 390, y: 290, w: 100, h: 18, type: 'platform' },
      { id: 'hazard-1', x: 520, y: 470, w: 140, h: 18, type: 'hazard' },
      { id: 'rise-4', x: 700, y: 240, w: 120, h: 18, type: 'platform' },
      { id: 'goal', x: 840, y: 180, w: 36, h: 36, type: 'goal' }
    ]
  },
  {
    id: 'platinumquest-lab',
    name: 'PlatinumQuest Lab',
    author: 'PQ-Web',
    gravity: 1350,
    spawn: { x: 150, y: 180 },
    music: 'theme-02',
    timeLimit: 150,
    platforms: [
      { id: 'ground', x: 0, y: 520, w: 960, h: 60, type: 'platform' },
      { id: 'lab-1', x: 160, y: 410, w: 116, h: 18, type: 'platform' },
      { id: 'lab-2', x: 300, y: 350, w: 120, h: 18, type: 'platform' },
      { id: 'lab-3', x: 500, y: 290, w: 120, h: 18, type: 'platform' },
      { id: 'lab-4', x: 670, y: 230, w: 120, h: 18, type: 'platform' },
      { id: 'goal', x: 825, y: 160, w: 36, h: 36, type: 'goal' }
    ]
  }
];

export function getInitialLevel(): LevelDef {
  return levelCatalog[0];
}

export function getLevelById(id: string): LevelDef | undefined {
  return levelCatalog.find((level) => level.id === id) ?? levelCatalog[0];
}
