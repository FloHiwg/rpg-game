// Map Loader
class MapLoader {
    constructor() {
        this.mapData = null;
        this.collisionObjects = [];
    }

    async loadMap(mapFile = 'map.json') {
        try {
            // Use a direct object instead of fetching for this demo
            // This avoids any CORS issues when running locally
            this.mapData = {
                "mapWidth": 1500,
                "mapHeight": 1500,
                "tileSize": 50,
                "background": "#7caa2d",
                "startPosition": {
                    "x": 750,
                    "y": 750
                },
                "objects": [
                    {
                        "type": "building",
                        "subtype": "house",
                        "x": 300,
                        "y": 500,
                        "width": 100,
                        "height": 80,
                        "collision": true,
                        "color": "#8B4513",
                        "borderColor": "#5D2906",
                        "roofColor": "#A52A2A"
                    },
                    {
                        "type": "building",
                        "subtype": "house",
                        "x": 1000,
                        "y": 800,
                        "width": 120,
                        "height": 90,
                        "collision": true,
                        "color": "#8B4513",
                        "borderColor": "#5D2906",
                        "roofColor": "#A52A2A"
                    },
                    {
                        "type": "building",
                        "subtype": "shop",
                        "x": 600,
                        "y": 400,
                        "width": 140,
                        "height": 100,
                        "collision": true,
                        "color": "#6A5ACD",
                        "borderColor": "#483D8B",
                        "roofColor": "#9370DB"
                    },
                    {
                        "type": "path",
                        "x": 750,
                        "y": 750,
                        "width": 500,
                        "height": 50,
                        "collision": false,
                        "color": "#D2B48C"
                    },
                    {
                        "type": "tree",
                        "x": 200,
                        "y": 200,
                        "width": 60,
                        "height": 60,
                        "collision": true
                    }
                ]
            };
            
            console.log("Map data loaded:", this.mapData);
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

    getMapDimensions() {
        return this.mapData ? 
            { width: this.mapData.mapWidth, height: this.mapData.mapHeight } : 
            { width: 0, height: 0 };
    }
}

// Create global instance for use in game.js
window.mapLoader = new MapLoader();