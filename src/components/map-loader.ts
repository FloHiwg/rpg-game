import { MapData, MapObject, CollisionObject, Position, Dimensions } from '../types/game-types';

export class MapLoader {
  private mapData: MapData | null = null;
  private collisionObjects: CollisionObject[] = [];
  
  public setMapData(mapData: MapData): void {
    this.mapData = mapData;
  }

  constructor() {}

  public async loadMap(mapFile: string = 'map.json'): Promise<MapData | null> {
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
}