import { Direction, PlayerState } from '../types/game-types';

export class CombatSystem {
  private player: HTMLElement | null = null;
  private map: HTMLElement | null = null;
  private playerState: PlayerState | null = null;
  private swordAttackRange: number = 50;
  private attackCooldown: boolean = false;
  private attackCooldownTime: number = 500; // milliseconds

  constructor() {}

  public init(player: HTMLElement, map: HTMLElement, playerState: PlayerState): void {
    this.player = player;
    this.map = map;
    this.playerState = playerState;
    this.setupEventListeners();
    this.updateHealthBar();
    this.updateMoneyDisplay();
  }

  private setupEventListeners(): void {
    document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.code === 'Space' && !this.attackCooldown) {
        this.attack();
      }
    });
  }

  public updatePlayerSwordPosition(direction: Direction): void {
    if (!this.player) return;

    // Update debug panel
    const debugDirElement = document.getElementById('debug-player-dir');
    if (debugDirElement) {
      debugDirElement.textContent = direction;
    }
  }

  private attack(): void {
    if (!this.player || !this.map || this.attackCooldown) return;

    this.attackCooldown = true;
    setTimeout(() => {
      this.attackCooldown = false;
    }, this.attackCooldownTime);

    // Get player position
    const playerRect = this.player.getBoundingClientRect();
    const mapRect = this.map.getBoundingClientRect();
    
    // Create sword attack element
    const swordAttack = document.createElement('div');
    swordAttack.className = 'sword-attack';
    
    // Get direction
    const debugDirElement = document.getElementById('debug-player-dir');
    const direction = debugDirElement ? debugDirElement.textContent as Direction : 'down';
    
    // Position and size sword attack based on direction
    let left = 0;
    let top = 0;
    
    switch (direction) {
      case 'up':
        left = parseInt(this.player.style.left || '0') - 15;
        top = parseInt(this.player.style.top || '0') - this.swordAttackRange - 30;
        swordAttack.style.width = '30px';
        swordAttack.style.height = '50px';
        break;
      case 'down':
        left = parseInt(this.player.style.left || '0') - 15;
        top = parseInt(this.player.style.top || '0') + 20;
        swordAttack.style.width = '30px';
        swordAttack.style.height = '50px';
        break;
      case 'left':
        left = parseInt(this.player.style.left || '0') - this.swordAttackRange - 30;
        top = parseInt(this.player.style.top || '0') - 15;
        swordAttack.style.width = '50px';
        swordAttack.style.height = '30px';
        break;
      case 'right':
        left = parseInt(this.player.style.left || '0') + 20;
        top = parseInt(this.player.style.top || '0') - 15;
        swordAttack.style.width = '50px';
        swordAttack.style.height = '30px';
        break;
    }
    
    swordAttack.style.left = `${left}px`;
    swordAttack.style.top = `${top}px`;
    
    // Add sword to map
    this.map.appendChild(swordAttack);
    
    // Check for hits on mobs
    this.checkHits(swordAttack);
    
    // Remove sword after animation
    setTimeout(() => {
      swordAttack.remove();
    }, 300);
  }

  private checkHits(swordAttack: HTMLElement): void {
    if (!this.map) return;

    // Get all mobs
    const mobs = document.querySelectorAll('.map-object.mob');
    
    // Get sword attack rect
    const attackRect = swordAttack.getBoundingClientRect();
    const mapRect = this.map.getBoundingClientRect();
    
    // Adjust for map position
    const attackLeft = attackRect.left - mapRect.left;
    const attackTop = attackRect.top - mapRect.top;
    const attackRight = attackLeft + attackRect.width;
    const attackBottom = attackTop + attackRect.height;
    
    // Check each mob for collision with sword
    mobs.forEach((mob) => {
      const mobElement = mob as HTMLElement;
      if (mobElement.classList.contains('dead')) return;
      
      const mobRect = mobElement.getBoundingClientRect();
      // Adjust for map position
      const mobLeft = mobRect.left - mapRect.left;
      const mobTop = mobRect.top - mapRect.top;
      const mobRight = mobLeft + mobRect.width;
      const mobBottom = mobTop + mobRect.height;
      
      // Simple collision detection
      if (
        attackLeft < mobRight &&
        attackRight > mobLeft &&
        attackTop < mobBottom &&
        attackBottom > mobTop
      ) {
        // Hit detected!
        this.damageEnemy(mobElement);
      }
    });
  }

  private damageEnemy(enemy: HTMLElement): void {
    // Apply damage effect
    enemy.classList.add('damage');
    setTimeout(() => {
      enemy.classList.remove('damage');
    }, 300);
    
    // Get current health from data attribute
    let health = parseInt(enemy.dataset.health || '0');
    const maxHealth = parseInt(enemy.dataset.maxHealth || '1');
    
    // Reduce health by player damage
    const playerDamage = this.playerState ? this.playerState.damage : 5;
    health -= playerDamage;
    
    // Update health in data attribute
    enemy.dataset.health = health.toString();
    
    // Update health bar
    const healthPercent = Math.max(0, health / maxHealth);
    enemy.style.setProperty('--health-scale', healthPercent.toString());
    
    if (health <= 0) {
      this.killEnemy(enemy);
    }
  }

  private killEnemy(enemy: HTMLElement): void {
    // Mark as dead
    enemy.classList.add('dead');
    
    // Spawn coins
    this.spawnCoin(enemy);
    
    // Remove from collision detection (handled in game.js)
    
    // Remove after some time for visual effect
    setTimeout(() => {
      enemy.remove();
    }, 2000);
  }

  private spawnCoin(enemy: HTMLElement): void {
    if (!this.map) return;

    // Get enemy position and money value
    const enemyX = parseInt(enemy.style.left || '0');
    const enemyY = parseInt(enemy.style.top || '0');
    const moneyValue = parseInt(enemy.dataset.money || '0');
    
    // Create coin element
    const coin = document.createElement('div');
    coin.className = 'map-object coin';
    coin.style.left = `${enemyX + 10}px`;
    coin.style.top = `${enemyY + 10}px`;
    coin.dataset.value = moneyValue.toString();
    
    // Add coin to map
    this.map.appendChild(coin);
    
    // Add event listener for collecting coin
    coin.addEventListener('click', () => this.collectCoin(coin));
    
    // Check if player is already over the coin
    setTimeout(() => this.checkCoinCollision(), 100);
  }

  private collectCoin(coin: HTMLElement): void {
    if (!this.playerState) return;
    
    // Get coin value
    const value = parseInt(coin.dataset.value || '1');
    
    // Add to player money
    this.playerState.money += value;
    
    // Update money display
    this.updateMoneyDisplay();
    
    // Remove coin
    coin.remove();
  }

  public checkCoinCollision(): void {
    if (!this.player || !this.map) return;

    // Get all coins
    const coins = document.querySelectorAll('.map-object.coin');
    
    // Get player position
    const playerX = parseInt(this.player.style.left || '0');
    const playerY = parseInt(this.player.style.top || '0');
    
    // Check each coin for collision with player
    coins.forEach((coin) => {
      const coinElement = coin as HTMLElement;
      const coinX = parseInt(coinElement.style.left || '0');
      const coinY = parseInt(coinElement.style.top || '0');
      
      // Simple distance-based collision
      const distance = Math.sqrt(
        Math.pow(playerX - coinX, 2) + Math.pow(playerY - coinY, 2)
      );
      
      // If player is close enough, collect the coin
      if (distance < 30) {
        this.collectCoin(coinElement);
      }
    });
  }

  private updateMoneyDisplay(): void {
    if (!this.playerState) return;
    
    // Update money count
    const moneyElement = document.getElementById('money-count');
    if (moneyElement) {
      moneyElement.textContent = this.playerState.money.toString();
    }
    
    // Update debug panel
    const debugMoneyElement = document.getElementById('debug-player-money');
    if (debugMoneyElement) {
      debugMoneyElement.textContent = this.playerState.money.toString();
    }
  }

  private updateHealthBar(): void {
    if (!this.player || !this.playerState) return;

    // Update health bar
    const healthBar = this.player.querySelector('.health-bar-fill') as HTMLElement;
    if (healthBar) {
      healthBar.style.width = `${(this.playerState.health / this.playerState.maxHealth) * 100}%`;
    }
    
    // Update debug panel
    const debugHealthElement = document.getElementById('debug-player-health');
    if (debugHealthElement) {
      debugHealthElement.textContent = `${this.playerState.health}/${this.playerState.maxHealth}`;
    }
  }

  public getPlayerMoney(): number {
    return this.playerState ? this.playerState.money : 0;
  }

  public getPlayerHealth(): number {
    return this.playerState ? this.playerState.health : 0;
  }
  
  public getPlayerDamage(): number {
    return this.playerState ? this.playerState.damage : 5;
  }
  
  public getPlayerDefense(): number {
    return this.playerState ? this.playerState.defense : 0;
  }
}