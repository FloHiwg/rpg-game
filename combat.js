// Combat system
class CombatSystem {
    constructor() {
        this.playerHealth = 100;
        this.playerMaxHealth = 100;
        this.playerDamage = 20;
        this.attackCooldown = false;
        this.attackCooldownTime = 400; // ms
        this.attackRange = 50; // px
        
        // Attack directions (relative to player position)
        this.attackOffsets = {
            'up': { x: 0, y: -this.attackRange * 2, rotation: 0 },
            'right': { x: this.attackRange, y: 0, rotation: 90 },
            'down': { x: 0, y: this.attackRange, rotation: 180 },
            'left': { x: -this.attackRange * 2, y: 0, rotation: -90 }
        };
    }
    
    // Initialize combat system
    init(player, map) {
        this.player = player;
        this.map = map;
        this.updatePlayerHealthDisplay();
        
        // Sword position needs the character::after element position to be updated
        this.updatePlayerSwordPosition('up');
        
        // Add attack key listener
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !this.attackCooldown) {
                this.playerAttack();
            }
        });
    }
    
    // Update player health display
    updatePlayerHealthDisplay() {
        // Update UI health bar
        const healthBar = document.querySelector('.health-bar-fill');
        if (healthBar) {
            healthBar.style.width = `${(this.playerHealth / this.playerMaxHealth) * 100}%`;
        }
        
        // Update debug panel
        const debugHealth = document.getElementById('debug-player-health');
        if (debugHealth) {
            debugHealth.textContent = `${this.playerHealth}/${this.playerMaxHealth}`;
        }
    }
    
    // Update player sword position based on direction
    updatePlayerSwordPosition(direction) {
        // Store current direction
        this.currentDirection = direction;
        
        // Update debug panel
        const debugDirection = document.getElementById('debug-player-dir');
        if (debugDirection) {
            debugDirection.textContent = direction;
        }
        
        // Handle sword position based on direction
        switch (direction) {
            case 'up':
                this.player.style.setProperty('--sword-top', '-15px');
                this.player.style.setProperty('--sword-right', '16px');
                this.player.style.setProperty('--sword-rotation', '0deg');
                break;
            case 'right':
                this.player.style.setProperty('--sword-top', '16px');
                this.player.style.setProperty('--sword-right', '-15px');
                this.player.style.setProperty('--sword-rotation', '90deg');
                break;
            case 'down':
                this.player.style.setProperty('--sword-top', '40px');
                this.player.style.setProperty('--sword-right', '16px');
                this.player.style.setProperty('--sword-rotation', '180deg');
                break;
            case 'left':
                this.player.style.setProperty('--sword-top', '16px');
                this.player.style.setProperty('--sword-right', '40px');
                this.player.style.setProperty('--sword-rotation', '-90deg');
                break;
        }
    }
    
    // Player attack
    playerAttack() {
        if (this.attackCooldown) return;
        
        // Set cooldown
        this.attackCooldown = true;
        setTimeout(() => {
            this.attackCooldown = false;
        }, this.attackCooldownTime);
        
        // Get player position (center point)
        const playerRect = this.player.getBoundingClientRect();
        const playerX = parseInt(this.player.style.left, 10);
        const playerY = parseInt(this.player.style.top, 10);
        
        // Calculate attack area position
        const offset = this.attackOffsets[this.currentDirection];
        const attackX = playerX + offset.x;
        const attackY = playerY + offset.y;
        
        // Create attack area visual effect
        this.createAttackEffect(attackX, attackY, offset.rotation);
        
        // Find mobs in attack range
        this.checkAttackHits(attackX, attackY);
    }
    
    // Create visual effect for attack
    createAttackEffect(x, y, rotation) {
        // Create attack area element
        const attackArea = document.createElement('div');
        attackArea.className = 'attack-area';
        attackArea.style.left = `${x}px`;
        attackArea.style.top = `${y}px`;
        attackArea.style.width = `${this.attackRange}px`;
        attackArea.style.height = `${this.attackRange}px`;
        attackArea.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
        
        // Add to map
        this.map.appendChild(attackArea);
        
        // Remove after animation
        setTimeout(() => {
            attackArea.remove();
        }, 300);
    }
    
    // Check if attack hits any mobs
    checkAttackHits(attackX, attackY) {
        // Get all mobs
        const mobs = document.querySelectorAll('.mob');
        
        mobs.forEach(mob => {
            // Skip if already dead
            if (mob.classList.contains('dead')) return;
            
            // Get mob position and size
            const mobX = parseInt(mob.style.left, 10);
            const mobY = parseInt(mob.style.top, 10);
            const mobWidth = parseInt(mob.style.width, 10);
            const mobHeight = parseInt(mob.style.height, 10);
            
            // Simple collision detection - check if attack area overlaps with mob
            const distance = Math.sqrt(
                Math.pow(mobX - attackX, 2) + Math.pow(mobY - attackY, 2)
            );
            
            // If distance is less than attack range + mob radius, it's a hit
            if (distance < this.attackRange / 2 + Math.max(mobWidth, mobHeight) / 2) {
                this.hitMob(mob);
            }
        });
    }
    
    // Apply damage to mob
    hitMob(mob) {
        // Get mob health from data attributes
        let health = parseInt(mob.dataset.health, 10);
        const maxHealth = parseInt(mob.dataset.maxHealth, 10);
        
        // Apply damage
        health -= this.playerDamage;
        health = Math.max(0, health); // Don't go below 0
        
        // Update mob health
        mob.dataset.health = health;
        
        // Update health bar
        mob.style.setProperty('--health-scale', health / maxHealth);
        
        // Add damage visual effect
        mob.classList.add('damaged');
        setTimeout(() => {
            mob.classList.remove('damaged');
        }, 300);
        
        // Check if mob is dead
        if (health <= 0) {
            this.killMob(mob);
        }
        
        console.log(`Hit ${mob.classList[2]} for ${this.playerDamage} damage! Health: ${health}/${maxHealth}`);
    }
    
    // Kill the mob
    killMob(mob) {
        // Mark as dead
        mob.classList.add('dead');
        
        // Remove collision
        mob.dataset.collision = "false";
        
        // Update text
        mob.textContent = '†';
        
        console.log(`Killed ${mob.classList[2]}!`);
    }
    
    // Player takes damage
    playerTakeDamage(amount) {
        this.playerHealth -= amount;
        this.playerHealth = Math.max(0, this.playerHealth); // Don't go below 0
        
        // Update health display
        this.updatePlayerHealthDisplay();
        
        // Flash player to indicate damage
        this.player.classList.add('damaged');
        setTimeout(() => {
            this.player.classList.remove('damaged');
        }, 300);
        
        // Check if player is dead
        if (this.playerHealth <= 0) {
            this.playerDie();
        }
    }
    
    // Player dies
    playerDie() {
        console.log('Player died!');
        // Could add game over screen here
    }
}

// Create global combat system
window.combatSystem = new CombatSystem();