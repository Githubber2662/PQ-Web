export type LocalLevel = {
  id: string;
  name: string;
  author: string;
  gravity: number;
  spawnX: number;
  spawnY: number;
  music: string;
  timeLimit: number;
};

const STORAGE_KEY = 'pq-web-levels-v1';

export function loadAllSavedLevels(): LocalLevel[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as LocalLevel[]) : [];
  } catch (error) {
    console.warn('Unable to read saved levels', error);
    return [];
  }
}

export function saveLevel(level: LocalLevel): void {
  const existing = loadAllSavedLevels();
  const next = [...existing.filter((item) => item.id !== level.id), level];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function deleteLevel(id: string): void {
  const next = loadAllSavedLevels().filter((level) => level.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}
