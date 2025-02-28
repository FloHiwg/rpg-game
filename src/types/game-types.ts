export interface Position {
  x: number;
  y: number;
}

export interface Dimensions {
  width: number;
  height: number;
}

export interface MapData {
  mapWidth: number;
  mapHeight: number;
  tileSize: number;
  background: string;
  startPosition: Position;
  objects: MapObject[];
}

export interface GameObject {
  id?: string;
  type: string;
  subtype?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  collision: boolean;
  color?: string;
  borderColor?: string;
}

export interface Building extends GameObject {
  roofColor?: string;
}

export interface Mob extends GameObject {
  health: number;
  maxHealth: number;
  damage: number;
  speed: number;
  money: number;
  id: string;
}

export interface Coin extends GameObject {
  value: number;
}

export type MapObject = GameObject | Building | Mob | Coin;

export type Direction = 'up' | 'down' | 'left' | 'right';

export interface CollisionObject {
  x: number;
  y: number;
  width: number;
  height: number;
  id?: string;
}

export interface PlayerState {
  x: number;
  y: number;
  direction: Direction;
  health: number;
  maxHealth: number;
  money: number;
}

// Map Builder Types
export type EditorMode = 'select' | 'add' | 'delete' | 'move';
export type ObjectType = 'building' | 'path' | 'tree' | 'mob' | 'coin';
export type BuildingType = 'house' | 'shop';
export type MobType = 'rabbit' | 'fox' | 'boar' | 'wolf' | 'deer';

export interface ObjectTemplate {
  type: ObjectType;
  subtype?: BuildingType | MobType;
  width: number;
  height: number;
  collision: boolean;
  color?: string;
  borderColor?: string;
  roofColor?: string;
  health?: number;
  maxHealth?: number;
  damage?: number;
  speed?: number;
  money?: number;
  value?: number;
}

export interface MapSettings {
  mapWidth: number;
  mapHeight: number;
  tileSize: number;
  background: string;
}

export interface EditorState {
  mode: EditorMode;
  selectedObjectType: ObjectType;
  selectedSubtype?: BuildingType | MobType;
  selectedObject: MapObject | null;
  grid: boolean;
  snapToGrid: boolean;
  gridSize: number;
  templates: Record<string, ObjectTemplate>;
  clipboard: MapObject | null;
}