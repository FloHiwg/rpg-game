// Tests for MapLoader class
describe('MapLoader', () => {
  // Mock DOM setup
  let mapLoader;
  let mockMapElement;
  let mockMapData;

  beforeEach(() => {
    // Create a mock DOM for testing
    document.body.innerHTML = `
      <div id="game-map"></div>
    `;
    
    mockMapElement = document.getElementById('game-map');
    
    // Create a fresh instance for each test
    mapLoader = new MapLoader();
    
    // Mock map data for testing
    mockMapData = {
      mapWidth: 1000,
      mapHeight: 1000,
      tileSize: 50,
      background: '#00ff00',
      startPosition: {
        x: 500,
        y: 500
      },
      objects: [
        {
          type: 'building',
          subtype: 'house',
          x: 100,
          y: 200,
          width: 100,
          height: 80,
          collision: true,
          color: '#8B4513',
          borderColor: '#5D2906',
          roofColor: '#A52A2A'
        },
        {
          type: 'tree',
          x: 300,
          y: 400,
          width: 60,
          height: 60,
          collision: true
        },
        {
          type: 'path',
          x: 500,
          y: 500,
          width: 200,
          height: 50,
          collision: false,
          color: '#D2B48C'
        }
      ]
    };
    
    // Mock fetch API
    global.fetch = jest.fn(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockMapData)
      })
    );
  });

  afterEach(() => {
    // Cleanup
    document.body.innerHTML = '';
    jest.resetAllMocks();
  });

  test('should load map data from JSON file', async () => {
    // Act
    const result = await mapLoader.loadMap('test-map.json');
    
    // Assert
    expect(global.fetch).toHaveBeenCalledWith('test-map.json');
    expect(result).toEqual(mockMapData);
    expect(mapLoader.mapData).toEqual(mockMapData);
  });

  test('should handle fetch errors gracefully', async () => {
    // Arrange
    global.fetch = jest.fn(() => 
      Promise.resolve({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      })
    );
    console.error = jest.fn(); // Spy on console.error
    
    // Act
    const result = await mapLoader.loadMap();
    
    // Assert
    expect(result).toBeNull();
    expect(console.error).toHaveBeenCalled();
  });

  test('should render map with correct dimensions and background', async () => {
    // Arrange
    mapLoader.mapData = mockMapData;
    
    // Act
    mapLoader.renderMap();
    
    // Assert
    expect(mockMapElement.style.width).toBe('1000px');
    expect(mockMapElement.style.height).toBe('1000px');
    expect(mockMapElement.style.backgroundColor).toBe('#00ff00');
    expect(mockMapElement.style.backgroundSize).toBe('50px 50px');
  });

  test('should create map objects with correct properties', async () => {
    // Arrange
    mapLoader.mapData = mockMapData;
    
    // Act
    mapLoader.renderMap();
    
    // Assert
    const buildingElement = mockMapElement.querySelector('.building');
    const treeElement = mockMapElement.querySelector('.tree');
    const pathElement = mockMapElement.querySelector('.path');
    
    // Check if objects were created
    expect(buildingElement).not.toBeNull();
    expect(treeElement).not.toBeNull();
    expect(pathElement).not.toBeNull();
    
    // Check building properties
    expect(buildingElement.style.left).toBe('100px');
    expect(buildingElement.style.top).toBe('200px');
    expect(buildingElement.style.width).toBe('100px');
    expect(buildingElement.style.height).toBe('80px');
    expect(buildingElement.classList.contains('with-roof')).toBe(true);
    expect(buildingElement.classList.contains('house')).toBe(true);
    
    // Check tree properties
    expect(treeElement.style.left).toBe('300px');
    expect(treeElement.style.top).toBe('400px');
  });

  test('should collect collision objects correctly', async () => {
    // Arrange
    mapLoader.mapData = mockMapData;
    
    // Act
    mapLoader.renderMap();
    const collisions = mapLoader.getCollisionObjects();
    
    // Assert
    expect(collisions.length).toBe(2); // Building and tree have collision
    expect(collisions[0]).toEqual({
      x: 100,
      y: 200,
      width: 100,
      height: 80
    });
    expect(collisions[1]).toEqual({
      x: 300,
      y: 400,
      width: 60,
      height: 60
    });
  });

  test('should return start position from map data', () => {
    // Arrange
    mapLoader.mapData = mockMapData;
    
    // Act
    const startPos = mapLoader.getStartPosition();
    
    // Assert
    expect(startPos).toEqual({ x: 500, y: 500 });
  });

  test('should return default start position if map data is missing', () => {
    // Arrange
    mapLoader.mapData = null;
    
    // Act
    const startPos = mapLoader.getStartPosition();
    
    // Assert
    expect(startPos).toEqual({ x: 0, y: 0 });
  });

  test('should return map dimensions from map data', () => {
    // Arrange
    mapLoader.mapData = mockMapData;
    
    // Act
    const dimensions = mapLoader.getMapDimensions();
    
    // Assert
    expect(dimensions).toEqual({ width: 1000, height: 1000 });
  });

  test('should return zero dimensions if map data is missing', () => {
    // Arrange
    mapLoader.mapData = null;
    
    // Act
    const dimensions = mapLoader.getMapDimensions();
    
    // Assert
    expect(dimensions).toEqual({ width: 0, height: 0 });
  });
});