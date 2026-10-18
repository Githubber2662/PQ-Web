const STORAGE_KEY = 'pq-web-replays-v1';

export type ReplayFrame = {
  t: number;
  left: boolean;
  right: boolean;
  jump: boolean;
  restart: boolean;
};

export type ReplayRecord = {
  id: string;
  levelId: string;
  createdAt: number;
  frames: ReplayFrame[];
};

export function createReplayManager() {
  const frames: ReplayFrame[] = [];

  const start = (levelId: string) => {
    frames.length = 0;
    return {
      push: (frame: ReplayFrame) => frames.push(frame),
      stop: () => {
        const record: ReplayRecord = {
          id: `replay-${Date.now()}`,
          levelId,
          createdAt: Date.now(),
          frames: [...frames]
        };
        const existing = readAllReplays();
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...existing, record]));
        return record;
      }
    };
  };

  const readAllReplays = (): ReplayRecord[] => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as ReplayRecord[]) : [];
    } catch {
      return [];
    }
  };

  return {
    start,
    readAllReplays
  };
}
