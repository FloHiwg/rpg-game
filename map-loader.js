// Map Loader
class MapLoader {
    constructor() {
        this.mapData = null;
        this.collisionObjects = [];
    }

    async loadMap(mapFile = 'map.json') {
        try {
            const response = await fetch(mapFile);
            if (!response.ok) {
                throw new Error(`Failed to load map: ${response.status} ${response.statusText}`);
            }
            
            this.mapData = await response.json();
            this.renderMap();
            return this.mapData;
        } catch (error) {
            console.error('Error loading map:', error);
            return null;
        }
    }

    renderMap() {
        if (!this.mapData) return;

        const mapElement = document.getElementById('game-map');
        
        // Clear any existing objects before rendering
        // Keep only the player element
        const playerElement = document.getElementById('player');
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
                    height: obj.height
                });
            }
        });
        
        console.log(`Rendered map with ${this.collisionObjects.length} collision objects`);
    }

    createMapObject(obj, mapElement) {
        const element = document.createElement('div');
        element.className = `map-object ${obj.type}`;
        
        // Set the position and dimensions
        element.style.left = `${obj.x}px`;
        element.style.top = `${obj.y}px`;
        element.style.width = `${obj.width}px`;
        element.style.height = `${obj.height}px`;
        
        // Additional attributes based on object type
        switch (obj.type) {
            case 'building':
                element.classList.add('with-roof');
                if (obj.color) element.style.backgroundColor = obj.color;
                if (obj.borderColor) element.style.borderColor = obj.borderColor;
                
                // Create roof with custom color if specified
                if (obj.roofColor) {
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
        }
        
        mapElement.appendChild(element);
    }

    getCollisionObjects() {
        return this.collisionObjects;
    }

    getStartPosition() {
        return this.mapData ? this.mapData.startPosition : { x: 0, y: 0 };
    }

    getMapDimensions() {
        return this.mapData ? 
            { width: this.mapData.mapWidth, height: this.mapData.mapHeight } : 
            { width: 0, height: 0 };
    }
}

// Create global instance for use in game.js
window.mapLoader = new MapLoader();