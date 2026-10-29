export interface LevelEntity {
  type: "block";
  position: { x: number; y: number; z: number };
  size: { x: number; y: number; z: number };
  color?: number;
}

export interface GemDef {
  position: { x: number; y: number; z: number };
}

export interface HazardDef {
  x: number;
  y: number;
  z: number;
  radius: number;
}

export interface Level {
  id: string;
  name: string;
  size: { x: number; z: number };
  spawn: { x: number; y: number; z: number };
  goalPosition: { x: number; y: number; z: number };
  entities: LevelEntity[];
  gems: GemDef[];
  hazards: HazardDef[];
}
