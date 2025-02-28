import {
  MapData,
  MapObject,
  EditorState,
  EditorMode,
  ObjectType,
  BuildingType,
  MobType,
  Position,
  ObjectTemplate,
  MapSettings
} from '../types/game-types';

export class MapBuilder {
  private mapData: MapData;
  private editorState: EditorState;
  private mapElement: HTMLElement | null = null;
  private editorContainer: HTMLElement | null = null;
  private toolbarElement: HTMLElement | null = null;
  private propertiesPanelElement: HTMLElement | null = null;
  private gridOverlay: HTMLElement | null = null;
  private dragStartPosition: Position | null = null;
  private lastMousePosition: Position = { x: 0, y: 0 };
  private objectIdCounter = 1;
  private isDragging = false;
  private isResizing = false;
  private resizeHandle = '';

  constructor() {
    // Initialize with default map data
    this.mapData = {
      mapWidth: 1500,
      mapHeight: 1500,
      tileSize: 50,
      background: '#7caa2d',
      startPosition: { x: 750, y: 750 },
      objects: []
    };

    // Initialize editor state
    this.editorState = {
      mode: 'select',
      selectedObjectType: 'building',
      selectedSubtype: 'house',
      selectedObject: null,
      grid: true,
      snapToGrid: true,
      gridSize: 50,
      templates: this.getDefaultTemplates(),
      clipboard: null
    };
  }

  private getDefaultTemplates(): Record<string, ObjectTemplate> {
    return {
      'building-house': {
        type: 'building',
        subtype: 'house',
        width: 100,
        height: 80,
        collision: true,
        color: '#8B4513',
        borderColor: '#5D2906',
        roofColor: '#A52A2A'
      },
      'building-shop': {
        type: 'building',
        subtype: 'shop',
        width: 140,
        height: 100,
        collision: true,
        color: '#6A5ACD',
        borderColor: '#483D8B',
        roofColor: '#9370DB'
      },
      'path': {
        type: 'path',
        width: 100,
        height: 50,
        collision: false,
        color: '#D2B48C'
      },
      'tree': {
        type: 'tree',
        width: 60,
        height: 60,
        collision: true
      },
      'mob-rabbit': {
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
      'mob-fox': {
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
      'mob-boar': {
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
      'mob-wolf': {
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
      'mob-deer': {
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
      },
      'coin': {
        type: 'coin',
        width: 15,
        height: 15,
        collision: false,
        value: 10
      }
    };
  }

  public init(containerId: string): void {
    // Get or create editor container
    this.editorContainer = document.getElementById(containerId);
    if (!this.editorContainer) {
      console.error(`Container element with ID ${containerId} not found`);
      return;
    }

    // Create editor components
    this.createEditorInterface();
    
    // Create empty map
    this.createMap();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Draw grid
    this.updateGrid();
    
    // Initial render
    this.renderMap();
  }

  private createEditorInterface(): void {
    if (!this.editorContainer) return;
    
    // Create toolbar
    this.toolbarElement = document.createElement('div');
    this.toolbarElement.className = 'map-builder-toolbar';
    this.toolbarElement.innerHTML = `
      <div class="toolbar-section">
        <h3>File</h3>
        <button id="btn-new-map">New Map</button>
        <button id="btn-load-map">Load Map</button>
        <button id="btn-save-map">Save Map</button>
      </div>
      <div class="toolbar-section">
        <h3>Mode</h3>
        <button id="btn-select-mode" class="mode-button active">Select</button>
        <button id="btn-add-mode" class="mode-button">Add</button>
        <button id="btn-delete-mode" class="mode-button">Delete</button>
        <button id="btn-move-mode" class="mode-button">Move</button>
      </div>
      <div class="toolbar-section">
        <h3>Objects</h3>
        <select id="object-type-select">
          <option value="building">Building</option>
          <option value="path">Path</option>
          <option value="tree">Tree</option>
          <option value="mob">Mob</option>
          <option value="coin">Coin</option>
        </select>
        
        <div id="subtype-container" class="subtype-container">
          <select id="building-subtype-select" class="subtype-select">
            <option value="house">House</option>
            <option value="shop">Shop</option>
          </select>
          
          <select id="mob-subtype-select" class="subtype-select" style="display: none;">
            <option value="rabbit">Rabbit</option>
            <option value="fox">Fox</option>
            <option value="boar">Boar</option>
            <option value="wolf">Wolf</option>
            <option value="deer">Deer</option>
          </select>
        </div>
      </div>
      <div class="toolbar-section">
        <h3>Grid</h3>
        <label>
          <input type="checkbox" id="grid-toggle" checked> Show Grid
        </label>
        <label>
          <input type="checkbox" id="snap-to-grid" checked> Snap to Grid
        </label>
        <label>
          Grid Size:
          <input type="number" id="grid-size" value="50" min="10" max="100">
        </label>
      </div>
      <div class="toolbar-section">
        <h3>Map Settings</h3>
        <label>
          Width:
          <input type="number" id="map-width" value="1500" min="500" max="5000">
        </label>
        <label>
          Height:
          <input type="number" id="map-height" value="1500" min="500" max="5000">
        </label>
        <label>
          Background:
          <input type="color" id="map-background" value="#7caa2d">
        </label>
      </div>
    `;
    
    // Create properties panel (for editing selected objects)
    this.propertiesPanelElement = document.createElement('div');
    this.propertiesPanelElement.className = 'map-builder-properties';
    this.propertiesPanelElement.innerHTML = '<h3>Properties</h3><div id="properties-content">No object selected</div>';
    
    // Create map container
    const mapContainer = document.createElement('div');
    mapContainer.className = 'map-builder-map-container';
    
    // Create map element
    const mapElement = document.createElement('div');
    mapElement.id = 'map-builder-map';
    mapElement.className = 'map-builder-map';
    
    // Create grid overlay
    this.gridOverlay = document.createElement('div');
    this.gridOverlay.className = 'map-builder-grid';
    
    // Assemble the components
    mapContainer.appendChild(mapElement);
    mapContainer.appendChild(this.gridOverlay);
    
    this.editorContainer.innerHTML = '';
    this.editorContainer.appendChild(this.toolbarElement);
    this.editorContainer.appendChild(mapContainer);
    this.editorContainer.appendChild(this.propertiesPanelElement);
    
    // Add CSS
    this.addStyles();
  }

  private addStyles(): void {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .map-builder-container {
        display: flex;
        flex-direction: column;
        height: 100vh;
        overflow: hidden;
        font-family: Arial, sans-serif;
      }
      
      .map-builder-toolbar {
        display: flex;
        gap: 20px;
        padding: 10px;
        background: #2c3e50;
        color: white;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        z-index: 100;
        overflow-x: auto;
      }
      
      .toolbar-section {
        display: flex;
        flex-direction: column;
        gap: 5px;
        min-width: 120px;
      }
      
      .toolbar-section h3 {
        margin: 0 0 5px 0;
        font-size: 14px;
      }
      
      .toolbar-section button, 
      .toolbar-section select, 
      .toolbar-section input {
        padding: 5px;
        border-radius: 3px;
        border: 1px solid #34495e;
      }
      
      .mode-button.active {
        background: #3498db;
        color: white;
      }
      
      .map-builder-map-container {
        flex: 1;
        position: relative;
        overflow: auto;
        background: #333;
      }
      
      .map-builder-map {
        position: relative;
        transform-origin: 0 0;
      }
      
      .map-builder-grid {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 5;
      }
      
      .map-builder-properties {
        width: 300px;
        padding: 10px;
        background: #2c3e50;
        color: white;
        box-shadow: -2px 0 5px rgba(0,0,0,0.2);
        overflow-y: auto;
      }
      
      .map-object {
        position: absolute;
        cursor: move;
      }
      
      .map-object.selected {
        outline: 2px dashed #3498db;
        z-index: 10;
      }
      
      .resize-handle {
        position: absolute;
        width: 8px;
        height: 8px;
        background: #3498db;
        border: 1px solid white;
        z-index: 15;
      }
      
      .resize-handle.nw { top: -4px; left: -4px; cursor: nwse-resize; }
      .resize-handle.ne { top: -4px; right: -4px; cursor: nesw-resize; }
      .resize-handle.sw { bottom: -4px; left: -4px; cursor: nesw-resize; }
      .resize-handle.se { bottom: -4px; right: -4px; cursor: nwse-resize; }
      
      .properties-group {
        margin-bottom: 10px;
        padding: 5px;
        border: 1px solid #34495e;
        border-radius: 3px;
      }
      
      .properties-group h4 {
        margin: 0 0 5px 0;
        font-size: 13px;
      }
      
      .property-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 5px;
      }
      
      .property-row label {
        flex: 1;
      }
      
      .property-row input, 
      .property-row select {
        flex: 2;
        padding: 3px;
        border-radius: 3px;
        border: 1px solid #34495e;
      }
    `;
    document.head.appendChild(styleElement);
  }

  private createMap(): void {
    this.mapElement = document.getElementById('map-builder-map');
    if (!this.mapElement) return;
    
    // Set map dimensions
    this.mapElement.style.width = `${this.mapData.mapWidth}px`;
    this.mapElement.style.height = `${this.mapData.mapHeight}px`;
    this.mapElement.style.backgroundColor = this.mapData.background;
    
    // Add player start position indicator
    const startPosition = document.createElement('div');
    startPosition.id = 'player-start-position';
    startPosition.className = 'player-start-position';
    startPosition.style.position = 'absolute';
    startPosition.style.width = '30px';
    startPosition.style.height = '30px';
    startPosition.style.backgroundColor = 'rgba(52, 152, 219, 0.7)';
    startPosition.style.border = '2px solid #2980b9';
    startPosition.style.borderRadius = '50%';
    startPosition.style.zIndex = '10';
    startPosition.style.transform = 'translate(-50%, -50%)';
    startPosition.style.left = `${this.mapData.startPosition.x}px`;
    startPosition.style.top = `${this.mapData.startPosition.y}px`;
    startPosition.style.cursor = 'move';
    startPosition.title = 'Player Start Position';
    
    this.mapElement.appendChild(startPosition);
  }

  private setupEventListeners(): void {
    if (!this.editorContainer || !this.mapElement || !this.toolbarElement) return;
    
    // Toolbar event listeners
    const newMapBtn = document.getElementById('btn-new-map');
    if (newMapBtn) {
      newMapBtn.addEventListener('click', () => this.createNewMap());
    }
    
    const loadMapBtn = document.getElementById('btn-load-map');
    if (loadMapBtn) {
      loadMapBtn.addEventListener('click', () => this.loadMap());
    }
    
    const saveMapBtn = document.getElementById('btn-save-map');
    if (saveMapBtn) {
      saveMapBtn.addEventListener('click', () => this.saveMap());
    }
    
    // Mode buttons
    const modeButtons = document.querySelectorAll('.mode-button');
    modeButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const mode = target.id.replace('btn-', '').replace('-mode', '') as EditorMode;
        this.setEditorMode(mode);
      });
    });
    
    // Object type select
    const objectTypeSelect = document.getElementById('object-type-select') as HTMLSelectElement;
    if (objectTypeSelect) {
      objectTypeSelect.addEventListener('change', () => {
        this.editorState.selectedObjectType = objectTypeSelect.value as ObjectType;
        this.updateSubtypeSelects();
      });
    }
    
    // Building subtype select
    const buildingSubtypeSelect = document.getElementById('building-subtype-select') as HTMLSelectElement;
    if (buildingSubtypeSelect) {
      buildingSubtypeSelect.addEventListener('change', () => {
        this.editorState.selectedSubtype = (buildingSubtypeSelect as HTMLSelectElement).value as BuildingType;
      });
    }
    
    // Mob subtype select
    const mobSubtypeSelect = document.getElementById('mob-subtype-select') as HTMLSelectElement;
    if (mobSubtypeSelect) {
      mobSubtypeSelect.addEventListener('change', () => {
        this.editorState.selectedSubtype = (mobSubtypeSelect as HTMLSelectElement).value as MobType;
      });
    }
    
    // Grid settings
    const gridToggle = document.getElementById('grid-toggle') as HTMLInputElement;
    if (gridToggle) {
      gridToggle.addEventListener('change', () => {
        this.editorState.grid = gridToggle.checked;
        this.updateGrid();
      });
    }
    
    const snapToGrid = document.getElementById('snap-to-grid') as HTMLInputElement;
    if (snapToGrid) {
      snapToGrid.addEventListener('change', () => {
        this.editorState.snapToGrid = snapToGrid.checked;
      });
    }
    
    const gridSize = document.getElementById('grid-size') as HTMLInputElement;
    if (gridSize) {
      gridSize.addEventListener('change', () => {
        this.editorState.gridSize = parseInt(gridSize.value, 10);
        this.updateGrid();
      });
    }
    
    // Map settings
    const mapWidth = document.getElementById('map-width') as HTMLInputElement;
    if (mapWidth) {
      mapWidth.addEventListener('change', () => {
        this.mapData.mapWidth = parseInt(mapWidth.value, 10);
        if (this.mapElement) {
          this.mapElement.style.width = `${this.mapData.mapWidth}px`;
        }
        this.updateGrid();
      });
    }
    
    const mapHeight = document.getElementById('map-height') as HTMLInputElement;
    if (mapHeight) {
      mapHeight.addEventListener('change', () => {
        this.mapData.mapHeight = parseInt(mapHeight.value, 10);
        if (this.mapElement) {
          this.mapElement.style.height = `${this.mapData.mapHeight}px`;
        }
        this.updateGrid();
      });
    }
    
    const mapBackground = document.getElementById('map-background') as HTMLInputElement;
    if (mapBackground) {
      mapBackground.addEventListener('change', () => {
        this.mapData.background = mapBackground.value;
        if (this.mapElement) {
          this.mapElement.style.backgroundColor = this.mapData.background;
        }
      });
    }
    
    // Map click event for adding objects
    this.mapElement.addEventListener('mousedown', (e) => this.handleMapMouseDown(e));
    this.mapElement.addEventListener('mousemove', (e) => this.handleMapMouseMove(e));
    document.addEventListener('mouseup', () => this.handleMapMouseUp());
    
    // Start position drag
    const startPositionElement = document.getElementById('player-start-position');
    if (startPositionElement) {
      startPositionElement.addEventListener('mousedown', (e) => {
        this.dragStartPosition = { 
          x: e.clientX - parseFloat(startPositionElement.style.left), 
          y: e.clientY - parseFloat(startPositionElement.style.top) 
        };
        this.isDragging = true;
        e.stopPropagation();
      });
      
      startPositionElement.addEventListener('mousemove', (e) => {
        if (this.isDragging && this.dragStartPosition) {
          let newX = e.clientX - this.dragStartPosition.x;
          let newY = e.clientY - this.dragStartPosition.y;
          
          if (this.editorState.snapToGrid) {
            newX = Math.round(newX / this.editorState.gridSize) * this.editorState.gridSize;
            newY = Math.round(newY / this.editorState.gridSize) * this.editorState.gridSize;
          }
          
          startPositionElement.style.left = `${newX}px`;
          startPositionElement.style.top = `${newY}px`;
          
          this.mapData.startPosition.x = newX;
          this.mapData.startPosition.y = newY;
        }
      });
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Delete selected object
      if (e.key === 'Delete' && this.editorState.selectedObject) {
        this.deleteSelectedObject();
      }
      
      // Copy with Ctrl+C
      if (e.key === 'c' && (e.ctrlKey || e.metaKey) && this.editorState.selectedObject) {
        this.copySelectedObject();
      }
      
      // Paste with Ctrl+V
      if (e.key === 'v' && (e.ctrlKey || e.metaKey) && this.editorState.clipboard) {
        this.pasteObject(this.lastMousePosition);
      }
    });
  }

  private updateSubtypeSelects(): void {
    const buildingSubtypeContainer = document.getElementById('building-subtype-select');
    const mobSubtypeContainer = document.getElementById('mob-subtype-select');
    
    if (buildingSubtypeContainer && mobSubtypeContainer) {
      // Hide all subtype selects
      buildingSubtypeContainer.style.display = 'none';
      mobSubtypeContainer.style.display = 'none';
      
      // Show appropriate subtype select based on selected object type
      switch (this.editorState.selectedObjectType) {
        case 'building':
          buildingSubtypeContainer.style.display = 'block';
          this.editorState.selectedSubtype = (buildingSubtypeContainer as HTMLSelectElement).value as BuildingType;
          break;
        case 'mob':
          mobSubtypeContainer.style.display = 'block';
          this.editorState.selectedSubtype = (mobSubtypeContainer as HTMLSelectElement).value as MobType;
          break;
        default:
          // Other object types don't have subtypes
          this.editorState.selectedSubtype = undefined;
      }
    }
  }

  private updateGrid(): void {
    if (!this.gridOverlay || !this.mapElement) return;
    
    // Clear previous grid
    this.gridOverlay.innerHTML = '';
    
    if (!this.editorState.grid) {
      this.gridOverlay.style.display = 'none';
      return;
    }
    
    this.gridOverlay.style.display = 'block';
    this.gridOverlay.style.width = `${this.mapData.mapWidth}px`;
    this.gridOverlay.style.height = `${this.mapData.mapHeight}px`;
    
    // Create grid CSS
    const gridSize = this.editorState.gridSize;
    this.gridOverlay.style.backgroundImage = `
      linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
    `;
    this.gridOverlay.style.backgroundSize = `${gridSize}px ${gridSize}px`;
  }

  private setEditorMode(mode: EditorMode): void {
    this.editorState.mode = mode;
    
    // Update UI
    const modeButtons = document.querySelectorAll('.mode-button');
    modeButtons.forEach(btn => {
      btn.classList.remove('active');
    });
    
    const activeButton = document.getElementById(`btn-${mode}-mode`);
    if (activeButton) {
      activeButton.classList.add('active');
    }
    
    // If not in select mode, deselect current object
    if (mode !== 'select' && this.editorState.selectedObject) {
      this.deselectObject();
    }
  }

  private handleMapMouseDown(e: MouseEvent): void {
    if (!this.mapElement) return;
    
    // Get mouse position relative to map
    const rect = this.mapElement.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    this.lastMousePosition = { x, y };
    
    // Handle based on current mode
    switch (this.editorState.mode) {
      case 'add':
        this.addObjectAt(x, y);
        break;
      case 'select':
        this.selectObjectAt(x, y);
        break;
      case 'delete':
        this.deleteObjectAt(x, y);
        break;
      case 'move':
        // Start drag operation
        const clickedObj = this.getObjectAt(x, y);
        if (clickedObj) {
          this.selectObject(clickedObj);
          this.dragStartPosition = { x: e.clientX - clickedObj.x, y: e.clientY - clickedObj.y };
          this.isDragging = true;
        }
        break;
    }
  }

  private handleMapMouseMove(e: MouseEvent): void {
    if (!this.mapElement) return;
    
    // Get mouse position relative to map
    const rect = this.mapElement.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    this.lastMousePosition = { x, y };
    
    // Handle dragging
    if (this.isDragging && this.editorState.selectedObject && this.dragStartPosition) {
      let newX = e.clientX - this.dragStartPosition.x;
      let newY = e.clientY - this.dragStartPosition.y;
      
      if (this.editorState.snapToGrid) {
        newX = Math.round(newX / this.editorState.gridSize) * this.editorState.gridSize;
        newY = Math.round(newY / this.editorState.gridSize) * this.editorState.gridSize;
      }
      
      // Update object position
      this.editorState.selectedObject.x = newX;
      this.editorState.selectedObject.y = newY;
      
      // Update DOM
      this.updateObjectElement(this.editorState.selectedObject);
    }
    
    // Handle resizing
    if (this.isResizing && this.editorState.selectedObject) {
      let newWidth = this.editorState.selectedObject.width;
      let newHeight = this.editorState.selectedObject.height;
      let newX = this.editorState.selectedObject.x;
      let newY = this.editorState.selectedObject.y;
      
      switch (this.resizeHandle) {
        case 'se':
          newWidth = Math.max(10, x - newX);
          newHeight = Math.max(10, y - newY);
          break;
        case 'sw':
          newWidth = Math.max(10, newX + newWidth - x);
          newHeight = Math.max(10, y - newY);
          newX = x;
          break;
        case 'ne':
          newWidth = Math.max(10, x - newX);
          newHeight = Math.max(10, newY + newHeight - y);
          newY = y;
          break;
        case 'nw':
          newWidth = Math.max(10, newX + newWidth - x);
          newHeight = Math.max(10, newY + newHeight - y);
          newX = x;
          newY = y;
          break;
      }
      
      if (this.editorState.snapToGrid) {
        newWidth = Math.round(newWidth / this.editorState.gridSize) * this.editorState.gridSize;
        newHeight = Math.round(newHeight / this.editorState.gridSize) * this.editorState.gridSize;
        newX = Math.round(newX / this.editorState.gridSize) * this.editorState.gridSize;
        newY = Math.round(newY / this.editorState.gridSize) * this.editorState.gridSize;
      }
      
      // Update object dimensions
      this.editorState.selectedObject.width = newWidth;
      this.editorState.selectedObject.height = newHeight;
      this.editorState.selectedObject.x = newX;
      this.editorState.selectedObject.y = newY;
      
      // Update DOM
      this.updateObjectElement(this.editorState.selectedObject);
    }
  }

  private handleMapMouseUp(): void {
    this.isDragging = false;
    this.isResizing = false;
    this.dragStartPosition = null;
  }

  private addObjectAt(x: number, y: number): void {
    if (!this.mapElement) return;
    
    // Get template for selected object type
    const templateKey = this.editorState.selectedSubtype
      ? `${this.editorState.selectedObjectType}-${this.editorState.selectedSubtype}`
      : this.editorState.selectedObjectType;
    
    const template = this.editorState.templates[templateKey];
    if (!template) {
      console.error(`No template found for ${templateKey}`);
      return;
    }
    
    // Adjust position based on grid
    let posX = x;
    let posY = y;
    
    if (this.editorState.snapToGrid) {
      posX = Math.round(posX / this.editorState.gridSize) * this.editorState.gridSize;
      posY = Math.round(posY / this.editorState.gridSize) * this.editorState.gridSize;
    }
    
    // Create new object based on template
    const newObject: MapObject = {
      ...template,
      x: posX,
      y: posY,
      id: `obj-${this.objectIdCounter++}`
    };
    
    // Add to map data
    this.mapData.objects.push(newObject);
    
    // Create visual element
    this.createObjectElement(newObject);
    
    // Select the new object
    this.selectObject(newObject);
  }

  private selectObjectAt(x: number, y: number): void {
    const obj = this.getObjectAt(x, y);
    if (obj) {
      this.selectObject(obj);
    } else {
      this.deselectObject();
    }
  }

  private deleteObjectAt(x: number, y: number): void {
    const obj = this.getObjectAt(x, y);
    if (obj) {
      // Remove from map data
      const index = this.mapData.objects.findIndex(o => o.id === obj.id);
      if (index !== -1) {
        this.mapData.objects.splice(index, 1);
      }
      
      // Remove visual element
      const element = document.getElementById(obj.id || '');
      if (element) {
        element.remove();
      }
      
      // If it was selected, clear selection
      if (this.editorState.selectedObject && this.editorState.selectedObject.id === obj.id) {
        this.deselectObject();
      }
    }
  }

  private getObjectAt(x: number, y: number): MapObject | null {
    // Check if coordinates are within any object bounds
    // Iterate in reverse to get the topmost object first (the latest added)
    for (let i = this.mapData.objects.length - 1; i >= 0; i--) {
      const obj = this.mapData.objects[i];
      if (
        x >= obj.x && 
        x <= obj.x + obj.width && 
        y >= obj.y && 
        y <= obj.y + obj.height
      ) {
        return obj;
      }
    }
    return null;
  }

  private selectObject(obj: MapObject): void {
    // Deselect previous selection
    this.deselectObject();
    
    // Set as selected
    this.editorState.selectedObject = obj;
    
    // Update UI
    const element = document.getElementById(obj.id || '');
    if (element) {
      element.classList.add('selected');
      
      // Add resize handles
      this.addResizeHandles(element);
    }
    
    // Update properties panel
    this.updatePropertiesPanel();
  }

  private deselectObject(): void {
    if (this.editorState.selectedObject) {
      // Remove selected class
      const element = document.getElementById(this.editorState.selectedObject.id || '');
      if (element) {
        element.classList.remove('selected');
        
        // Remove resize handles
        const handles = element.querySelectorAll('.resize-handle');
        handles.forEach(handle => handle.remove());
      }
    }
    
    // Clear selection
    this.editorState.selectedObject = null;
    
    // Update properties panel
    this.updatePropertiesPanel();
  }

  private addResizeHandles(element: HTMLElement): void {
    const positions = ['nw', 'ne', 'sw', 'se'];
    
    positions.forEach(pos => {
      const handle = document.createElement('div');
      handle.className = `resize-handle ${pos}`;
      handle.dataset.handle = pos;
      
      // Add mouse down event to start resizing
      handle.addEventListener('mousedown', (e) => {
        this.isResizing = true;
        this.resizeHandle = pos;
        e.stopPropagation(); // Prevent dragging start
      });
      
      element.appendChild(handle);
    });
  }

  private updatePropertiesPanel(): void {
    if (!this.propertiesPanelElement) return;
    
    const propertiesContent = document.getElementById('properties-content');
    if (!propertiesContent) return;
    
    if (!this.editorState.selectedObject) {
      propertiesContent.innerHTML = 'No object selected';
      return;
    }
    
    const obj = this.editorState.selectedObject;
    
    // Create properties form
    let html = `
      <div class="properties-group">
        <h4>Position & Size</h4>
        <div class="property-row">
          <label>X:</label>
          <input type="number" id="prop-x" value="${obj.x}">
        </div>
        <div class="property-row">
          <label>Y:</label>
          <input type="number" id="prop-y" value="${obj.y}">
        </div>
        <div class="property-row">
          <label>Width:</label>
          <input type="number" id="prop-width" value="${obj.width}">
        </div>
        <div class="property-row">
          <label>Height:</label>
          <input type="number" id="prop-height" value="${obj.height}">
        </div>
        <div class="property-row">
          <label>Collision:</label>
          <input type="checkbox" id="prop-collision" ${obj.collision ? 'checked' : ''}>
        </div>
      </div>
    `;
    
    // Type-specific properties
    if (obj.type === 'building') {
      html += `
        <div class="properties-group">
          <h4>Building Properties</h4>
          <div class="property-row">
            <label>Type:</label>
            <select id="prop-building-type">
              <option value="house" ${obj.subtype === 'house' ? 'selected' : ''}>House</option>
              <option value="shop" ${obj.subtype === 'shop' ? 'selected' : ''}>Shop</option>
            </select>
          </div>
          <div class="property-row">
            <label>Color:</label>
            <input type="color" id="prop-color" value="${obj.color || '#8B4513'}">
          </div>
          <div class="property-row">
            <label>Border Color:</label>
            <input type="color" id="prop-border-color" value="${obj.borderColor || '#5D2906'}">
          </div>
          <div class="property-row">
            <label>Roof Color:</label>
            <input type="color" id="prop-roof-color" value="${'roofColor' in obj ? obj.roofColor : '#A52A2A'}">
          </div>
        </div>
      `;
    } else if (obj.type === 'path' || obj.type === 'grass') {
      html += `
        <div class="properties-group">
          <h4>Path Properties</h4>
          <div class="property-row">
            <label>Color:</label>
            <input type="color" id="prop-color" value="${obj.color || '#D2B48C'}">
          </div>
        </div>
      `;
    } else if (obj.type === 'mob') {
      html += `
        <div class="properties-group">
          <h4>Mob Properties</h4>
          <div class="property-row">
            <label>Type:</label>
            <select id="prop-mob-type">
              <option value="rabbit" ${obj.subtype === 'rabbit' ? 'selected' : ''}>Rabbit</option>
              <option value="fox" ${obj.subtype === 'fox' ? 'selected' : ''}>Fox</option>
              <option value="boar" ${obj.subtype === 'boar' ? 'selected' : ''}>Boar</option>
              <option value="wolf" ${obj.subtype === 'wolf' ? 'selected' : ''}>Wolf</option>
              <option value="deer" ${obj.subtype === 'deer' ? 'selected' : ''}>Deer</option>
            </select>
          </div>
          <div class="property-row">
            <label>Health:</label>
            <input type="number" id="prop-health" value="${'health' in obj ? obj.health : 10}">
          </div>
          <div class="property-row">
            <label>Max Health:</label>
            <input type="number" id="prop-max-health" value="${'maxHealth' in obj ? obj.maxHealth : 10}">
          </div>
          <div class="property-row">
            <label>Damage:</label>
            <input type="number" id="prop-damage" value="${'damage' in obj ? obj.damage : 0}">
          </div>
          <div class="property-row">
            <label>Speed:</label>
            <input type="number" id="prop-speed" step="0.1" value="${'speed' in obj ? obj.speed : 1}">
          </div>
          <div class="property-row">
            <label>Money Value:</label>
            <input type="number" id="prop-money" value="${'money' in obj ? obj.money : 5}">
          </div>
        </div>
      `;
    } else if (obj.type === 'coin') {
      html += `
        <div class="properties-group">
          <h4>Coin Properties</h4>
          <div class="property-row">
            <label>Value:</label>
            <input type="number" id="prop-value" value="${'value' in obj ? obj.value : 1}">
          </div>
        </div>
      `;
    }
    
    // Action buttons
    html += `
      <div class="properties-group">
        <button id="prop-btn-update">Update Properties</button>
        <button id="prop-btn-duplicate">Duplicate</button>
        <button id="prop-btn-delete">Delete</button>
      </div>
    `;
    
    propertiesContent.innerHTML = html;
    
    // Add event listeners to form elements
    const updateBtn = document.getElementById('prop-btn-update');
    if (updateBtn) {
      updateBtn.addEventListener('click', () => this.updateObjectProperties());
    }
    
    const duplicateBtn = document.getElementById('prop-btn-duplicate');
    if (duplicateBtn) {
      duplicateBtn.addEventListener('click', () => this.duplicateSelectedObject());
    }
    
    const deleteBtn = document.getElementById('prop-btn-delete');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => this.deleteSelectedObject());
    }
  }

  private updateObjectProperties(): void {
    if (!this.editorState.selectedObject) return;
    
    const obj = this.editorState.selectedObject;
    
    // Update common properties
    const xInput = document.getElementById('prop-x') as HTMLInputElement;
    const yInput = document.getElementById('prop-y') as HTMLInputElement;
    const widthInput = document.getElementById('prop-width') as HTMLInputElement;
    const heightInput = document.getElementById('prop-height') as HTMLInputElement;
    const collisionInput = document.getElementById('prop-collision') as HTMLInputElement;
    
    if (xInput && yInput && widthInput && heightInput && collisionInput) {
      obj.x = parseInt(xInput.value);
      obj.y = parseInt(yInput.value);
      obj.width = parseInt(widthInput.value);
      obj.height = parseInt(heightInput.value);
      obj.collision = collisionInput.checked;
    }
    
    // Update type-specific properties
    if (obj.type === 'building') {
      const typeSelect = document.getElementById('prop-building-type') as HTMLSelectElement;
      const colorInput = document.getElementById('prop-color') as HTMLInputElement;
      const borderColorInput = document.getElementById('prop-border-color') as HTMLInputElement;
      const roofColorInput = document.getElementById('prop-roof-color') as HTMLInputElement;
      
      if (typeSelect && colorInput && borderColorInput && roofColorInput) {
        obj.subtype = typeSelect.value as BuildingType;
        obj.color = colorInput.value;
        obj.borderColor = borderColorInput.value;
        if ('roofColor' in obj) {
          obj.roofColor = roofColorInput.value;
        }
      }
    } else if (obj.type === 'path' || obj.type === 'grass') {
      const colorInput = document.getElementById('prop-color') as HTMLInputElement;
      
      if (colorInput) {
        obj.color = colorInput.value;
      }
    } else if (obj.type === 'mob') {
      const typeSelect = document.getElementById('prop-mob-type') as HTMLSelectElement;
      const healthInput = document.getElementById('prop-health') as HTMLInputElement;
      const maxHealthInput = document.getElementById('prop-max-health') as HTMLInputElement;
      const damageInput = document.getElementById('prop-damage') as HTMLInputElement;
      const speedInput = document.getElementById('prop-speed') as HTMLInputElement;
      const moneyInput = document.getElementById('prop-money') as HTMLInputElement;
      
      if (typeSelect && healthInput && maxHealthInput && damageInput && speedInput && moneyInput) {
        obj.subtype = typeSelect.value as MobType;
        if ('health' in obj) {
          obj.health = parseInt(healthInput.value);
          obj.maxHealth = parseInt(maxHealthInput.value);
          obj.damage = parseInt(damageInput.value);
          obj.speed = parseFloat(speedInput.value);
          obj.money = parseInt(moneyInput.value);
        }
      }
    } else if (obj.type === 'coin') {
      const valueInput = document.getElementById('prop-value') as HTMLInputElement;
      
      if (valueInput && 'value' in obj) {
        obj.value = parseInt(valueInput.value);
      }
    }
    
    // Update visual element
    this.updateObjectElement(obj);
  }

  private duplicateSelectedObject(): void {
    if (!this.editorState.selectedObject) return;
    
    // Create a deep copy of the selected object
    const originalObj = this.editorState.selectedObject;
    const newObj: MapObject = JSON.parse(JSON.stringify(originalObj));
    
    // Give it a new ID and offset position
    newObj.id = `obj-${this.objectIdCounter++}`;
    newObj.x += 50;
    newObj.y += 50;
    
    // Add to map data
    this.mapData.objects.push(newObj);
    
    // Create visual element
    this.createObjectElement(newObj);
    
    // Select the new object
    this.selectObject(newObj);
  }

  private deleteSelectedObject(): void {
    if (!this.editorState.selectedObject) return;
    
    // Remove from map data
    const index = this.mapData.objects.findIndex(o => o.id === this.editorState.selectedObject?.id);
    if (index !== -1) {
      this.mapData.objects.splice(index, 1);
    }
    
    // Remove visual element
    const element = document.getElementById(this.editorState.selectedObject.id || '');
    if (element) {
      element.remove();
    }
    
    // Clear selection
    this.deselectObject();
  }

  private copySelectedObject(): void {
    if (!this.editorState.selectedObject) return;
    
    // Create a deep copy of the selected object
    this.editorState.clipboard = JSON.parse(JSON.stringify(this.editorState.selectedObject));
  }

  private pasteObject(position: Position): void {
    if (!this.editorState.clipboard || !this.mapElement) return;
    
    // Create a deep copy of the clipboard object
    const newObj: MapObject = JSON.parse(JSON.stringify(this.editorState.clipboard));
    
    // Give it a new ID and set position
    newObj.id = `obj-${this.objectIdCounter++}`;
    newObj.x = position.x;
    newObj.y = position.y;
    
    if (this.editorState.snapToGrid) {
      newObj.x = Math.round(newObj.x / this.editorState.gridSize) * this.editorState.gridSize;
      newObj.y = Math.round(newObj.y / this.editorState.gridSize) * this.editorState.gridSize;
    }
    
    // Add to map data
    this.mapData.objects.push(newObj);
    
    // Create visual element
    this.createObjectElement(newObj);
    
    // Select the new object
    this.selectObject(newObj);
  }

  private createObjectElement(obj: MapObject): void {
    if (!this.mapElement) return;
    
    const element = document.createElement('div');
    element.id = obj.id || '';
    element.className = `map-object ${obj.type}`;
    if (obj.subtype) {
      element.classList.add(obj.subtype);
    }
    
    // Set position and size
    element.style.left = `${obj.x}px`;
    element.style.top = `${obj.y}px`;
    element.style.width = `${obj.width}px`;
    element.style.height = `${obj.height}px`;
    
    // Set specific properties based on object type
    switch (obj.type) {
      case 'building':
        if (obj.color) element.style.backgroundColor = obj.color;
        if (obj.borderColor) element.style.borderColor = obj.borderColor;
        element.classList.add('with-roof');
        
        if ('roofColor' in obj && obj.roofColor) {
          element.style.setProperty('--roof-color', obj.roofColor);
        }
        break;
      case 'path':
      case 'grass':
        if (obj.color) element.style.backgroundColor = obj.color;
        break;
      case 'mob':
        if ('health' in obj) {
          element.textContent = obj.subtype?.charAt(0).toUpperCase() || 'M';
        }
        break;
      case 'coin':
        element.innerHTML = '$';
        break;
    }
    
    this.mapElement.appendChild(element);
  }

  private updateObjectElement(obj: MapObject): void {
    const element = document.getElementById(obj.id || '');
    if (!element) return;
    
    // Update position and size
    element.style.left = `${obj.x}px`;
    element.style.top = `${obj.y}px`;
    element.style.width = `${obj.width}px`;
    element.style.height = `${obj.height}px`;
    
    // Update class for subtype
    element.className = `map-object ${obj.type}`;
    if (obj.subtype) {
      element.classList.add(obj.subtype);
    }
    if (this.editorState.selectedObject && this.editorState.selectedObject.id === obj.id) {
      element.classList.add('selected');
    }
    
    // Update specific properties based on object type
    switch (obj.type) {
      case 'building':
        if (obj.color) element.style.backgroundColor = obj.color;
        if (obj.borderColor) element.style.borderColor = obj.borderColor;
        element.classList.add('with-roof');
        
        if ('roofColor' in obj && obj.roofColor) {
          element.style.setProperty('--roof-color', obj.roofColor);
        }
        break;
      case 'path':
      case 'grass':
        if (obj.color) element.style.backgroundColor = obj.color;
        break;
      case 'mob':
        if ('health' in obj) {
          element.textContent = obj.subtype?.charAt(0).toUpperCase() || 'M';
        }
        break;
    }
    
    // Re-add resize handles if selected
    if (this.editorState.selectedObject && this.editorState.selectedObject.id === obj.id) {
      const handles = element.querySelectorAll('.resize-handle');
      handles.forEach(handle => handle.remove());
      this.addResizeHandles(element);
    }
  }

  public renderMap(): void {
    if (!this.mapElement) return;
    
    // Clear existing objects but keep player start position
    const playerStartPos = document.getElementById('player-start-position');
    this.mapElement.innerHTML = '';
    if (playerStartPos) {
      this.mapElement.appendChild(playerStartPos);
    }
    
    // Render all objects
    this.mapData.objects.forEach(obj => {
      this.createObjectElement(obj);
    });
  }

  private createNewMap(): void {
    const confirmed = confirm('Create a new map? This will clear all current objects.');
    if (!confirmed) return;
    
    // Reset map data
    this.mapData = {
      mapWidth: 1500,
      mapHeight: 1500,
      tileSize: 50,
      background: '#7caa2d',
      startPosition: { x: 750, y: 750 },
      objects: []
    };
    
    // Update UI
    const mapWidth = document.getElementById('map-width') as HTMLInputElement;
    const mapHeight = document.getElementById('map-height') as HTMLInputElement;
    const mapBackground = document.getElementById('map-background') as HTMLInputElement;
    
    if (mapWidth && mapHeight && mapBackground) {
      mapWidth.value = this.mapData.mapWidth.toString();
      mapHeight.value = this.mapData.mapHeight.toString();
      mapBackground.value = this.mapData.background;
    }
    
    // Update map element
    if (this.mapElement) {
      this.mapElement.style.width = `${this.mapData.mapWidth}px`;
      this.mapElement.style.height = `${this.mapData.mapHeight}px`;
      this.mapElement.style.backgroundColor = this.mapData.background;
    }
    
    // Update player start position
    const startPosition = document.getElementById('player-start-position');
    if (startPosition) {
      startPosition.style.left = `${this.mapData.startPosition.x}px`;
      startPosition.style.top = `${this.mapData.startPosition.y}px`;
    }
    
    // Clear objects
    this.renderMap();
    
    // Update grid
    this.updateGrid();
  }

  private loadMap(): void {
    // Create a file input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    
    fileInput.addEventListener('change', (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (!target.files || target.files.length === 0) return;
      
      const file = target.files[0];
      const reader = new FileReader();
      
      reader.onload = (event: ProgressEvent<FileReader>) => {
        try {
          const jsonData = event.target?.result as string;
          const mapData = JSON.parse(jsonData) as MapData;
          
          // Validate the map data
          if (!mapData.mapWidth || !mapData.mapHeight || !mapData.startPosition || !Array.isArray(mapData.objects)) {
            throw new Error('Invalid map data format');
          }
          
          // Load the map data
          this.mapData = mapData;
          
          // Update UI
          const mapWidth = document.getElementById('map-width') as HTMLInputElement;
          const mapHeight = document.getElementById('map-height') as HTMLInputElement;
          const mapBackground = document.getElementById('map-background') as HTMLInputElement;
          
          if (mapWidth && mapHeight && mapBackground) {
            mapWidth.value = this.mapData.mapWidth.toString();
            mapHeight.value = this.mapData.mapHeight.toString();
            mapBackground.value = this.mapData.background;
          }
          
          // Update map element
          if (this.mapElement) {
            this.mapElement.style.width = `${this.mapData.mapWidth}px`;
            this.mapElement.style.height = `${this.mapData.mapHeight}px`;
            this.mapElement.style.backgroundColor = this.mapData.background;
          }
          
          // Update player start position
          const startPosition = document.getElementById('player-start-position');
          if (startPosition) {
            startPosition.style.left = `${this.mapData.startPosition.x}px`;
            startPosition.style.top = `${this.mapData.startPosition.y}px`;
          }
          
          // Render map objects
          this.renderMap();
          
          // Update grid
          this.updateGrid();
          
          alert('Map loaded successfully');
        } catch (error) {
          console.error('Error loading map:', error);
          alert('Error loading map. Check console for details.');
        }
      };
      
      reader.readAsText(file);
    });
    
    // Trigger click on file input
    fileInput.click();
  }

  private saveMap(): void {
    // Create a download link for the map JSON
    const mapJson = JSON.stringify(this.mapData, null, 2);
    const blob = new Blob([mapJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = 'map.json';
    
    // Trigger download
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    // Cleanup
    URL.revokeObjectURL(url);
  }

  public getMapData(): MapData {
    return this.mapData;
  }
}