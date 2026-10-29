import { Level } from "./Level";

export class LevelLoader {
  async loadLevel(path: string): Promise<Level> {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Failed to load level: ${path}`);
    }

    return (await response.json()) as Level;
  }
}
