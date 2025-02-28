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