export type Difficulty = 'easy' | 'normal' | 'hard' | 'expert';

export type LevelRecord = {
  id: string;
  name: string;
  author: string;
  description: string;
  tags: string[];
  difficulty: Difficulty;
  time: number;
  gems: number;
  size: string;
  featured?: boolean;
  thumbnail?: string;
  createdAt: string;
};

export const levels: LevelRecord[] = [
  {
    id: 'marble-bridge',
    name: 'Marble Bridge',
    author: 'Platinum Team',
    description: 'A polished opening course that teaches the basics of controlled rolling, landing, and collecting gems.',
    tags: ['classic', 'training', 'beginner'],
    difficulty: 'easy',
    time: 28,
    gems: 5,
    size: 'Medium',
    featured: true,
    thumbnail: 'bridge',
    createdAt: '2025-01-15'
  },
  {
    id: 'silver-cascade',
    name: 'Silver Cascade',
    author: 'QuantumMarble',
    description: 'A flowing route across multiple tiers with momentum-based obstacle loops and timing pads.',
    tags: ['speedrun', 'momentum'],
    difficulty: 'normal',
    time: 39,
    gems: 8,
    size: 'Large',
    thumbnail: 'cascade',
    createdAt: '2025-02-03'
  },
  {
    id: 'glass-ember',
    name: 'Glass Ember',
    author: 'AsterRim',
    description: 'High-precision platforming with narrow ledges, rotating hazards, and quick transitions.',
    tags: ['precision', 'hard'],
    difficulty: 'hard',
    time: 52,
    gems: 10,
    size: 'Large',
    thumbnail: 'ember',
    createdAt: '2025-03-02'
  },
  {
    id: 'zenith-run',
    name: 'Zenith Run',
    author: 'Northstar',
    description: 'A dramatic climb ending in an exposed finish pad, with layered boost and drop sections.',
    tags: ['climb', 'boost'],
    difficulty: 'expert',
    time: 61,
    gems: 12,
    size: 'Large',
    thumbnail: 'zenith',
    createdAt: '2025-04-10'
  },
  {
    id: 'moon-void',
    name: 'Moon Void',
    author: 'Cobalt72',
    description: 'Low-light arena layout with wide gaps, hazard rings, and fast angular transitions.',
    tags: ['arena', 'night'],
    difficulty: 'normal',
    time: 44,
    gems: 7,
    size: 'Medium',
    thumbnail: 'void',
    createdAt: '2025-05-18'
  },
  {
    id: 'sunset-drift',
    name: 'Sunset Drift',
    author: 'Luma',
    description: 'A graceful course shaped around alternate routes, optional chains, and compact jumps.',
    tags: ['route', 'scenic'],
    difficulty: 'easy',
    time: 33,
    gems: 6,
    size: 'Medium',
    thumbnail: 'sunset',
    createdAt: '2025-06-04'
  }
];

export const featuredLevels = levels.filter((level) => level.featured).slice(0, 3);

export const levelById = (id: string) => levels.find((level) => level.id === id) ?? null;
