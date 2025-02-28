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
  mobType?: string | null;
  maxMobs?: number;
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

export interface SpawnPoint extends GameObject {
  mobType: MobType | null;
  radius: number;
  maxMobs: number;
  respawnTime: number;
}

export type MapObject = GameObject | Building | Mob | Coin | SpawnPoint;

export type Direction = 'up' | 'down' | 'left' | 'right';

export interface CollisionObject {
  x: number;
  y: number;
  width: number;
  height: number;
  id?: string;
}

export type ItemType = 'weapon' | 'armor' | 'consumable';
export type ItemSlot = 'weapon' | 'head' | 'body' | 'legs' | 'none';
export type WeaponType = 'sword' | 'axe' | 'bow';
export type ArmorType = 'helmet' | 'chestplate' | 'leggings';

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  slot: ItemSlot;
  subtype?: WeaponType | ArmorType;
  damage?: number;
  defense?: number;
  value: number;
  description: string;
}

export interface PlayerState {
  x: number;
  y: number;
  direction: Direction;
  health: number;
  maxHealth: number;
  money: number;
  inventory: Item[];
  equipped: {
    weapon: Item | null;
    head: Item | null;
    body: Item | null;
    legs: Item | null;
  };
  damage: number;
  defense: number;
}

// Map Builder Types
export type EditorMode = 'select' | 'add' | 'delete' | 'move';
export type ObjectType = 'building' | 'path' | 'tree' | 'mob' | 'coin' | 'spawnpoint';
export type BuildingType = 'house' | 'shop';

export interface Shop {
  id: string;
  name: string;
  inventory: Item[];
  buyMultiplier: number; // Price multiplier when player buys (e.g., 1.5 means 50% markup)
  sellMultiplier: number; // Price multiplier when player sells (e.g., 0.5 means half price)
}
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
  mobType?: MobType | null;
  radius?: number;
  maxMobs?: number;
  respawnTime?: number;
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