import { MapData, MapObject, CollisionObject, Position, Dimensions } from '../types/game-types';

export class MapLoader {
  private mapData: MapData | null = null;
  private collisionObjects: CollisionObject[] = [];
  
  public setMapData(mapData: MapData): void {
    this.mapData = mapData;
  }

  constructor() {}

  public async loadMap(mapFile: string = '/map.json'): Promise<MapData | null> {
    try {
      // Fetch map data from the JSON file
      const response = await fetch(mapFile);
      if (!response.ok) {
        throw new Error(`Failed to load map: ${response.status} ${response.statusText}`);
      }
      
      this.mapData = await response.json() as MapData;
      console.log("Map data loaded from file:", this.mapData);
      this.renderMap();
      return this.mapData;
    } catch (error) {
      console.error('Error loading map:', error);
      return null;
    }
  }

  public renderMap(): void {
    if (!this.mapData) return;

    const mapElement = document.getElementById('game-map');
    if (!mapElement) {
      console.error('Game map element not found');
      return;
    }
    
    // Clear any existing objects before rendering
    // Keep only the player element
    const playerElement = document.getElementById('player');
    if (!playerElement) {
      console.error('Player element not found');
      return;
    }
    
    mapElement.innerHTML = '';
    mapElement.appendChild(playerElement);
    
    // Set map dimensions and background
    mapElement.style.width = `${this.mapData.mapWidth}px`;
    mapElement.style.height = `${this.mapData.mapHeight}px`;
    mapElement.style.backgroundColor = this.mapData.background;
    mapElement.style.backgroundSize = `${this.mapData.tileSize}px ${this.mapData.tileSize}px`;
    
    // Clear collision objects
    this.collisionObjects = [];
    
    // Render all objects
    this.mapData.objects.forEach(obj => {
      this.createMapObject(obj, mapElement);
      
      // Add to collision objects if it has collision
      if (obj.collision) {
        this.collisionObjects.push({
          x: obj.x,
          y: obj.y,
          width: obj.width,
          height: obj.height,
          id: obj.id
        });
      }
    });
    
    console.log(`Rendered map with ${this.collisionObjects.length} collision objects`);
  }

  private createMapObject(obj: MapObject, mapElement: HTMLElement): void {
    const element = document.createElement('div');
    element.className = `map-object ${obj.type}`;
    
    // Set the position and dimensions
    element.style.left = `${obj.x}px`;
    element.style.top = `${obj.y}px`;
    element.style.width = `${obj.width}px`;
    element.style.height = `${obj.height}px`;
    
    // Store object data for easy access
    if (obj.id) {
      element.id = obj.id;
    }
    
    // Additional attributes based on object type
    switch (obj.type) {
      case 'building':
        element.classList.add('with-roof');
        if (obj.color) element.style.backgroundColor = obj.color;
        if (obj.borderColor) element.style.borderColor = obj.borderColor;
        
        // Create roof with custom color if specified
        if ('roofColor' in obj && obj.roofColor) {
          element.style.setProperty('--roof-color', obj.roofColor);
          const style = document.createElement('style');
          style.textContent = `.map-object.building[style*="--roof-color: ${obj.roofColor}"]::before { background-color: ${obj.roofColor}; }`;
          document.head.appendChild(style);
        }
        
        // Add subtype if available
        if (obj.subtype) {
          element.classList.add(obj.subtype);
          
          // Add interaction hint for shops
          if (obj.subtype === 'shop') {
            // Add a small hint element above the shop
            const hint = document.createElement('div');
            hint.className = 'interaction-hint';
            hint.textContent = 'Press E to shop';
            hint.style.position = 'absolute';
            hint.style.bottom = `${obj.height + 15}px`;
            hint.style.left = '50%';
            hint.style.transform = 'translateX(-50%)';
            hint.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            hint.style.color = 'white';
            hint.style.padding = '3px 8px';
            hint.style.borderRadius = '3px';
            hint.style.fontSize = '12px';
            hint.style.whiteSpace = 'nowrap';
            hint.style.zIndex = '5';
            element.appendChild(hint);
          }
        }
        break;
        
      case 'path':
        if (obj.color) element.style.backgroundColor = obj.color;
        break;
        
      case 'grass':
        if (obj.color) element.style.backgroundColor = obj.color;
        break;
        
      case 'mob':
        // Add subtype for specific animal appearance
        if (obj.subtype) {
          element.classList.add(obj.subtype);
        }
        
        // Store mob data as attributes
        if ('health' in obj) {
          element.dataset.health = obj.health.toString();
          element.dataset.maxHealth = obj.maxHealth.toString();
          element.dataset.damage = obj.damage.toString();
          element.dataset.speed = obj.speed.toString();
          
          // Store money value for when mob is killed
          if (obj.money) {
            element.dataset.money = obj.money.toString();
          }
          
          // Set the health bar
          element.style.setProperty('--health-percent', `${(obj.health / obj.maxHealth) * 100}%`);
          element.style.setProperty('--health-color', '#27AE60');
          
          // Create health bar element as a pseudo-element using transform
          element.style.setProperty('--health-scale', (obj.health / obj.maxHealth).toString());
          
          // Show mob type as text
          if (obj.subtype) {
            element.textContent = obj.subtype.charAt(0).toUpperCase();
          }
        }
        break;
        
      case 'coin':
        // Create a coin element
        element.classList.add('coin');
        // Store the value of the coin
        if ('value' in obj) {
          element.dataset.value = obj.value.toString();
        }
        break;
        
      case 'spawnpoint':
        // Create a spawn point element
        element.classList.add('spawnpoint');
        
        // Store spawn point data
        if ('mobType' in obj) {
          element.dataset.mobType = obj.mobType ? obj.mobType.toString() : 'random';
        } else {
          element.dataset.mobType = 'random';
        }
        
        if ('radius' in obj) {
          element.dataset.radius = obj.radius.toString();
          
          // Add a visual indication of radius
          const radiusIndicator = document.createElement('div');
          radiusIndicator.className = 'radius-indicator';
          radiusIndicator.style.width = `${obj.radius * 2}px`;
          radiusIndicator.style.height = `${obj.radius * 2}px`;
          radiusIndicator.style.borderRadius = '50%';
          radiusIndicator.style.position = 'absolute';
          radiusIndicator.style.left = `${obj.width / 2 - obj.radius}px`;
          radiusIndicator.style.top = `${obj.height / 2 - obj.radius}px`;
          radiusIndicator.style.backgroundColor = 'rgba(255, 165, 0, 0.1)';
          radiusIndicator.style.border = '1px dashed orange';
          radiusIndicator.style.zIndex = '-1';
          element.appendChild(radiusIndicator);
        }
        
        if ('maxMobs' in obj) {
          element.dataset.maxMobs = obj.maxMobs?.toString();
        }
        
        if ('respawnTime' in obj) {
          element.dataset.respawnTime = obj.respawnTime.toString();
        }
        
        // Add spawn point icon
        element.innerHTML += `<div class="spawn-icon"></div>`;
        
        // Add label for spawn point
        const label = document.createElement('div');
        label.className = 'spawn-label';
        if (obj.mobType) {
          label.textContent = `${obj.mobType} (max: ${obj.maxMobs})`;
        } else {
          label.textContent = `Random (max: ${obj.maxMobs})`;
        }
        label.style.position = 'absolute';
        label.style.bottom = `${obj.height + 5}px`;
        label.style.left = '50%';
        label.style.transform = 'translateX(-50%)';
        label.style.whiteSpace = 'nowrap';
        label.style.color = 'white';
        label.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        label.style.padding = '2px 5px';
        label.style.borderRadius = '3px';
        label.style.fontSize = '12px';
        element.appendChild(label);
        break;
    }
    
    mapElement.appendChild(element);
  }

  public getCollisionObjects(): CollisionObject[] {
    return this.collisionObjects;
  }

  public getStartPosition(): Position {
    if (!this.mapData) {
      console.warn("Map data not loaded, using default position");
      return { x: 750, y: 750 };
    }
    
    if (!this.mapData.startPosition) {
      console.warn("No start position in map data, using center of map");
      return { 
        x: this.mapData.mapWidth / 2, 
        y: this.mapData.mapHeight / 2 
      };
    }
    
    console.log("Using start position from map:", this.mapData.startPosition);
    return this.mapData.startPosition;
  }

  public getMapDimensions(): Dimensions {
    return this.mapData ? 
      { width: this.mapData.mapWidth, height: this.mapData.mapHeight } : 
      { width: 0, height: 0 };
  }
  
  public getMapData(): MapData | null {
    return this.mapData;
  }
}