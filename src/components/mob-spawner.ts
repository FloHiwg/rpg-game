import { MapObject, Mob, MobType, Position } from '../types/game-types';

export interface SpawnPoint {
  id: string;
  position: Position;
  mobType: MobType | null; // If null, random mob will be spawned
  radius: number; // Spawn radius around position
  maxMobs: number; // Maximum number of mobs to spawn
  respawnTime: number; // Time in milliseconds between respawns
  lastSpawnTime: number; // Last time a mob was spawned
  active: boolean; // Whether this spawn point is active
  spawnedMobs: string[]; // IDs of mobs spawned from this point
}

export class MobSpawner {
  private spawnPoints: SpawnPoint[] = [];
  private map: HTMLElement | null = null;
  private nextMobId: number = 1;
  private mobTemplates: Record<MobType, Partial<Mob>> = {
    rabbit: {
      type: 'mob',
      subtype: 'rabbit',
      width: 30,
      height: 30,
      collision: true,
      health: 10,
      maxHealth: 10,
      damage: 0,
      speed: 1,
      money: 5
    },
    fox: {
      type: 'mob',
      subtype: 'fox',
      width: 35,
      height: 35,
      collision: true,
      health: 20,
      maxHealth: 20,
      damage: 2,
      speed: 2,
      money: 10
    },
    boar: {
      type: 'mob',
      subtype: 'boar',
      width: 45,
      height: 45,
      collision: true,
      health: 40,
      maxHealth: 40,
      damage: 5,
      speed: 1.5,
      money: 25
    },
    wolf: {
      type: 'mob',
      subtype: 'wolf',
      width: 40,
      height: 40,
      collision: true,
      health: 30,
      maxHealth: 30,
      damage: 4,
      speed: 3,
      money: 20
    },
    deer: {
      type: 'mob',
      subtype: 'deer',
      width: 40,
      height: 45,
      collision: true,
      health: 25,
      maxHealth: 25,
      damage: 0,
      speed: 4,
      money: 15
    }
  };

  constructor() {}

  public init(map: HTMLElement): void {
    this.map = map;
    this.startSpawning();
  }

  public addSpawnPoint(spawnPoint: Omit<SpawnPoint, 'lastSpawnTime' | 'spawnedMobs'>): void {
    this.spawnPoints.push({
      ...spawnPoint,
      lastSpawnTime: 0,
      spawnedMobs: []
    });
  }

  public removeSpawnPoint(id: string): void {
    const index = this.spawnPoints.findIndex(sp => sp.id === id);
    if (index !== -1) {
      this.spawnPoints.splice(index, 1);
    }
  }

  public startSpawning(): void {
    // Run the spawn loop every second
    setInterval(() => this.update(), 1000);
  }

  private update(): void {
    if (!this.map) return;

    const now = Date.now();

    // Check each spawn point
    this.spawnPoints.forEach(spawnPoint => {
      if (!spawnPoint.active) return;

      // Check if it's time to spawn a new mob
      if (now - spawnPoint.lastSpawnTime >= spawnPoint.respawnTime) {
        // Count active mobs from this spawn point
        const activeMobs = this.countActiveMobs(spawnPoint);
        
        // If there's room for more mobs, spawn one
        if (activeMobs < spawnPoint.maxMobs) {
          this.spawnMob(spawnPoint);
          spawnPoint.lastSpawnTime = now;
        }
      }
    });
  }

  private countActiveMobs(spawnPoint: SpawnPoint): number {
    let count = 0;
    
    // Check each mob ID for this spawn point
    spawnPoint.spawnedMobs.forEach(mobId => {
      const mobElement = document.getElementById(mobId);
      // Only count mobs that exist and are not dead
      if (mobElement && !mobElement.classList.contains('dead')) {
        count++;
      }
    });
    
    // Clean up the list of spawned mobs (remove dead ones)
    spawnPoint.spawnedMobs = spawnPoint.spawnedMobs.filter(mobId => {
      const mobElement = document.getElementById(mobId);
      return mobElement && !mobElement.classList.contains('dead');
    });
    
    return count;
  }

  private spawnMob(spawnPoint: SpawnPoint): void {
    if (!this.map) return;

    // Determine mob type (specific or random)
    const mobType = spawnPoint.mobType || this.getRandomMobType();
    
    // Get mob template
    const template = this.mobTemplates[mobType];
    
    // Calculate random position within spawn radius
    const angle = Math.random() * Math.PI * 2; // Random angle
    const distance = Math.random() * spawnPoint.radius; // Random distance within radius
    const x = spawnPoint.position.x + Math.cos(angle) * distance;
    const y = spawnPoint.position.y + Math.sin(angle) * distance;
    
    // Create a unique ID for the mob
    const mobId = `spawned-mob-${this.nextMobId++}`;
    
    // Create mob object
    const mob: Mob = {
      ...template as Mob,
      id: mobId,
      x: x,
      y: y,
      subtype: mobType
    };
    
    // Create and add the mob element to the map
    this.createMobElement(mob);
    
    // Add to spawn point's list of spawned mobs
    spawnPoint.spawnedMobs.push(mobId);
  }

  private getRandomMobType(): MobType {
    const mobTypes: MobType[] = ['rabbit', 'fox', 'boar', 'wolf', 'deer'];
    const randomIndex = Math.floor(Math.random() * mobTypes.length);
    return mobTypes[randomIndex];
  }

  private createMobElement(mob: Mob): void {
    if (!this.map) return;

    // Create mob element
    const element = document.createElement('div');
    element.className = `map-object mob ${mob.subtype}`;
    element.id = mob.id;
    
    // Set position and size
    element.style.left = `${mob.x}px`;
    element.style.top = `${mob.y}px`;
    element.style.width = `${mob.width}px`;
    element.style.height = `${mob.height}px`;
    
    // Store mob data in dataset
    element.dataset.health = mob.health.toString();
    element.dataset.maxHealth = mob.maxHealth.toString();
    element.dataset.damage = mob.damage.toString();
    element.dataset.speed = mob.speed.toString();
    element.dataset.money = mob.money.toString();
    
    // Set initial health bar
    element.style.setProperty('--health-scale', '1');
    
    // Add mob type as text
    element.textContent = mob.subtype.charAt(0).toUpperCase();
    
    // Add to map
    this.map.appendChild(element);
  }

  public clearAllMobs(): void {
    // Clear all spawned mobs
    this.spawnPoints.forEach(spawnPoint => {
      spawnPoint.spawnedMobs.forEach(mobId => {
        const mobElement = document.getElementById(mobId);
        if (mobElement) {
          mobElement.remove();
        }
      });
      spawnPoint.spawnedMobs = [];
    });
  }
}