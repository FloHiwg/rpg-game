import { PlayerState, Item, ItemSlot, Shop } from '../types/game-types';

export class InventorySystem {
  private playerState: PlayerState | null = null;
  private inventoryPanel: HTMLElement | null = null;
  private equipmentPanel: HTMLElement | null = null;
  private shopPanel: HTMLElement | null = null;
  private isInventoryOpen: boolean = false;
  private isShopOpen: boolean = false;
  
  // Predefined items for the shop
  private shops: Record<string, Shop> = {};
  private defaultItems: Item[] = [];
  
  constructor() {
    // Initialize default items
    this.initializeDefaultItems();
    
    // Initialize shops
    this.initializeShops();
  }
  
  private initializeDefaultItems(): void {
    // Weapons
    this.defaultItems = [
      {
        id: 'wooden-sword',
        name: 'Wooden Sword',
        type: 'weapon',
        slot: 'weapon',
        subtype: 'sword',
        damage: 7,
        value: 10,
        description: 'A basic wooden sword. Not very durable.'
      },
      {
        id: 'iron-sword',
        name: 'Iron Sword',
        type: 'weapon',
        slot: 'weapon',
        subtype: 'sword',
        damage: 12,
        value: 50,
        description: 'A standard iron sword. Reliable and durable.'
      },
      {
        id: 'battle-axe',
        name: 'Battle Axe',
        type: 'weapon',
        slot: 'weapon',
        subtype: 'axe',
        damage: 15,
        value: 75,
        description: 'A heavy axe that deals significant damage.'
      },
      {
        id: 'hunting-bow',
        name: 'Hunting Bow',
        type: 'weapon',
        slot: 'weapon',
        subtype: 'bow',
        damage: 10,
        value: 60,
        description: 'A bow for long-range attacks.'
      },
      // Armor - Head
      {
        id: 'leather-cap',
        name: 'Leather Cap',
        type: 'armor',
        slot: 'head',
        subtype: 'helmet',
        defense: 2,
        value: 15,
        description: 'A simple leather cap providing minimal protection.'
      },
      {
        id: 'iron-helmet',
        name: 'Iron Helmet',
        type: 'armor',
        slot: 'head',
        subtype: 'helmet',
        defense: 5,
        value: 40,
        description: 'A standard iron helmet offering decent protection.'
      },
      // Armor - Body
      {
        id: 'cloth-tunic',
        name: 'Cloth Tunic',
        type: 'armor',
        slot: 'body',
        subtype: 'chestplate',
        defense: 1,
        value: 5,
        description: 'A basic cloth tunic offering minimal protection.'
      },
      {
        id: 'leather-vest',
        name: 'Leather Vest',
        type: 'armor',
        slot: 'body',
        subtype: 'chestplate',
        defense: 3,
        value: 25,
        description: 'A leather vest providing some protection.'
      },
      {
        id: 'iron-chestplate',
        name: 'Iron Chestplate',
        type: 'armor',
        slot: 'body',
        subtype: 'chestplate',
        defense: 7,
        value: 80,
        description: 'A sturdy iron chestplate offering good protection.'
      },
      // Armor - Legs
      {
        id: 'cloth-pants',
        name: 'Cloth Pants',
        type: 'armor',
        slot: 'legs',
        subtype: 'leggings',
        defense: 1,
        value: 5,
        description: 'Basic cloth pants offering minimal protection.'
      },
      {
        id: 'leather-pants',
        name: 'Leather Pants',
        type: 'armor',
        slot: 'legs',
        subtype: 'leggings',
        defense: 2,
        value: 20,
        description: 'Leather pants providing some leg protection.'
      },
      {
        id: 'iron-greaves',
        name: 'Iron Greaves',
        type: 'armor',
        slot: 'legs',
        subtype: 'leggings',
        defense: 5,
        value: 60,
        description: 'Heavy iron leg armor offering good protection.'
      },
      // Consumables
      {
        id: 'health-potion',
        name: 'Health Potion',
        type: 'consumable',
        slot: 'none',
        value: 15,
        description: 'Restores 25 health when consumed.'
      },
      {
        id: 'strength-potion',
        name: 'Strength Potion',
        type: 'consumable',
        slot: 'none',
        value: 25,
        description: 'Temporarily increases damage by 5.'
      }
    ];
  }
  
  private initializeShops(): void {
    // Blacksmith shop
    this.shops['blacksmith-shop'] = {
      id: 'blacksmith-shop',
      name: 'Blacksmith',
      inventory: [
        this.getItemById('wooden-sword'),
        this.getItemById('iron-sword'),
        this.getItemById('battle-axe'),
        this.getItemById('leather-cap'),
        this.getItemById('iron-helmet'),
        this.getItemById('leather-vest'),
        this.getItemById('iron-chestplate'),
        this.getItemById('leather-pants'),
        this.getItemById('iron-greaves')
      ],
      buyMultiplier: 1.5,
      sellMultiplier: 0.5
    };
    
    // General store
    this.shops['general-store'] = {
      id: 'general-store',
      name: 'General Store',
      inventory: [
        this.getItemById('cloth-tunic'),
        this.getItemById('cloth-pants'),
        this.getItemById('leather-cap'),
        this.getItemById('wooden-sword'),
        this.getItemById('hunting-bow'),
        this.getItemById('health-potion'),
        this.getItemById('strength-potion')
      ],
      buyMultiplier: 1.2,
      sellMultiplier: 0.6
    };
  }
  
  private getItemById(id: string): Item {
    const item = this.defaultItems.find(item => item.id === id);
    if (!item) {
      throw new Error(`Item with id ${id} not found`);
    }
    return { ...item }; // Return a copy to avoid modifying the original
  }
  
  public init(playerState: PlayerState): void {
    this.playerState = playerState;
    
    // Create UI elements if they don't exist
    this.createInventoryPanel();
    this.createEquipmentPanel();
    this.createShopPanel();
    
    // Give the player a starter weapon if they don't have one
    if (playerState.inventory.length === 0) {
      const starterWeapon = this.getItemById('wooden-sword');
      this.addItemToInventory(starterWeapon);
      this.equipItem(starterWeapon);
    }
  }
  
  private createInventoryPanel(): void {
    // Check if panel already exists
    const existingPanel = document.getElementById('inventory-panel');
    if (existingPanel) {
      this.inventoryPanel = existingPanel;
      return;
    }
    
    // Create inventory panel
    const panel = document.createElement('div');
    panel.id = 'inventory-panel';
    panel.className = 'game-panel inventory-panel';
    panel.style.display = 'none';
    
    // Add title
    const title = document.createElement('h2');
    title.textContent = 'Inventory';
    panel.appendChild(title);
    
    // Add close button
    const closeButton = document.createElement('button');
    closeButton.className = 'close-button';
    closeButton.textContent = 'X';
    closeButton.onclick = () => this.toggleInventoryPanel();
    panel.appendChild(closeButton);
    
    // Add inventory slots container
    const slotsContainer = document.createElement('div');
    slotsContainer.className = 'inventory-slots';
    panel.appendChild(slotsContainer);
    
    // Add to document body
    document.body.appendChild(panel);
    this.inventoryPanel = panel;
  }
  
  private createEquipmentPanel(): void {
    // Check if panel already exists
    const existingPanel = document.getElementById('equipment-panel');
    if (existingPanel) {
      this.equipmentPanel = existingPanel;
      return;
    }
    
    // Create equipment panel
    const panel = document.createElement('div');
    panel.id = 'equipment-panel';
    panel.className = 'game-panel equipment-panel';
    
    // Add title
    const title = document.createElement('h2');
    title.textContent = 'Equipment';
    panel.appendChild(title);
    
    // Create equipment slots
    const slots = ['weapon', 'head', 'body', 'legs'];
    const slotsContainer = document.createElement('div');
    slotsContainer.className = 'equipment-slots';
    
    slots.forEach(slotType => {
      const slot = document.createElement('div');
      slot.className = `equipment-slot ${slotType}-slot`;
      slot.dataset.slot = slotType;
      
      const slotLabel = document.createElement('div');
      slotLabel.className = 'slot-label';
      slotLabel.textContent = slotType.charAt(0).toUpperCase() + slotType.slice(1);
      
      slot.appendChild(slotLabel);
      slotsContainer.appendChild(slot);
    });
    
    panel.appendChild(slotsContainer);
    
    // Add stats display
    const statsContainer = document.createElement('div');
    statsContainer.className = 'stats-container';
    
    const damageDisplay = document.createElement('div');
    damageDisplay.id = 'damage-display';
    damageDisplay.textContent = 'Damage: 5';
    
    const defenseDisplay = document.createElement('div');
    defenseDisplay.id = 'defense-display';
    defenseDisplay.textContent = 'Defense: 0';
    
    statsContainer.appendChild(damageDisplay);
    statsContainer.appendChild(defenseDisplay);
    panel.appendChild(statsContainer);
    
    // Add to the inventory panel
    if (this.inventoryPanel) {
      this.inventoryPanel.appendChild(panel);
    }
    
    this.equipmentPanel = panel;
  }
  
  private createShopPanel(): void {
    // Check if panel already exists
    const existingPanel = document.getElementById('shop-panel');
    if (existingPanel) {
      this.shopPanel = existingPanel;
      return;
    }
    
    // Create shop panel
    const panel = document.createElement('div');
    panel.id = 'shop-panel';
    panel.className = 'game-panel shop-panel';
    panel.style.display = 'none';
    
    // Add title (will be updated with shop name)
    const title = document.createElement('h2');
    title.id = 'shop-title';
    title.textContent = 'Shop';
    panel.appendChild(title);
    
    // Add close button
    const closeButton = document.createElement('button');
    closeButton.className = 'close-button';
    closeButton.textContent = 'X';
    closeButton.onclick = () => this.closeShop();
    panel.appendChild(closeButton);
    
    // Create shop items container
    const shopItemsContainer = document.createElement('div');
    shopItemsContainer.className = 'shop-items';
    shopItemsContainer.id = 'shop-items';
    panel.appendChild(shopItemsContainer);
    
    // Add player money display
    const moneyDisplay = document.createElement('div');
    moneyDisplay.id = 'shop-money-display';
    moneyDisplay.className = 'shop-money-display';
    moneyDisplay.textContent = 'Your money: $0';
    panel.appendChild(moneyDisplay);
    
    // Add to document body
    document.body.appendChild(panel);
    this.shopPanel = panel;
  }
  
  public toggleInventoryPanel(): void {
    if (!this.inventoryPanel || !this.playerState) return;
    
    this.isInventoryOpen = !this.isInventoryOpen;
    
    if (this.isInventoryOpen) {
      // Show inventory panel
      this.inventoryPanel.style.display = 'block';
      
      // Update inventory display
      this.refreshInventoryDisplay();
      this.refreshEquipmentDisplay();
      
      // Close shop if it's open
      this.closeShop();
    } else {
      // Hide inventory panel
      this.inventoryPanel.style.display = 'none';
    }
  }
  
  private refreshInventoryDisplay(): void {
    if (!this.inventoryPanel || !this.playerState) return;
    
    // Get slots container
    const slotsContainer = this.inventoryPanel.querySelector('.inventory-slots');
    if (!slotsContainer) return;
    
    // Clear existing slots
    slotsContainer.innerHTML = '';
    
    // Create a slot for each inventory item
    this.playerState.inventory.forEach((item, index) => {
      const slot = document.createElement('div');
      slot.className = 'inventory-slot';
      slot.dataset.itemId = item.id;
      
      // Add item icon (colored background based on item type)
      const itemIcon = document.createElement('div');
      itemIcon.className = `item-icon ${item.type} ${item.subtype || ''}`;
      
      // Add item name
      const itemName = document.createElement('div');
      itemName.className = 'item-name';
      itemName.textContent = item.name;
      
      // Add hover tooltip
      const itemTooltip = document.createElement('div');
      itemTooltip.className = 'item-tooltip';
      
      const tooltipName = document.createElement('strong');
      tooltipName.textContent = item.name;
      
      const tooltipType = document.createElement('span');
      tooltipType.textContent = `${item.type.charAt(0).toUpperCase() + item.type.slice(1)}`;
      if (item.subtype) {
        tooltipType.textContent += ` (${item.subtype})`;
      }
      
      const tooltipStats = document.createElement('span');
      if (item.damage) {
        tooltipStats.textContent = `Damage: ${item.damage}`;
      } else if (item.defense) {
        tooltipStats.textContent = `Defense: ${item.defense}`;
      }
      
      const tooltipDesc = document.createElement('p');
      tooltipDesc.textContent = item.description;
      
      const tooltipValue = document.createElement('span');
      tooltipValue.textContent = `Value: $${item.value}`;
      
      // Add action buttons
      const actionContainer = document.createElement('div');
      actionContainer.className = 'tooltip-actions';
      
      if (item.slot !== 'none') {
        const equipButton = document.createElement('button');
        equipButton.textContent = 'Equip';
        equipButton.onclick = (e) => {
          e.stopPropagation();
          this.equipItem(item);
        };
        actionContainer.appendChild(equipButton);
      }
      
      // Add consumable use button for consumables
      if (item.type === 'consumable') {
        const useButton = document.createElement('button');
        useButton.textContent = 'Use';
        useButton.onclick = (e) => {
          e.stopPropagation();
          this.useConsumable(item);
        };
        actionContainer.appendChild(useButton);
      }
      
      // Assemble tooltip
      itemTooltip.appendChild(tooltipName);
      itemTooltip.appendChild(document.createElement('br'));
      itemTooltip.appendChild(tooltipType);
      if (tooltipStats.textContent) {
        itemTooltip.appendChild(document.createElement('br'));
        itemTooltip.appendChild(tooltipStats);
      }
      itemTooltip.appendChild(document.createElement('br'));
      itemTooltip.appendChild(tooltipDesc);
      itemTooltip.appendChild(document.createElement('br'));
      itemTooltip.appendChild(tooltipValue);
      itemTooltip.appendChild(actionContainer);
      
      // Add all elements to slot
      slot.appendChild(itemIcon);
      slot.appendChild(itemName);
      slot.appendChild(itemTooltip);
      
      // Add to container
      slotsContainer.appendChild(slot);
    });
    
    // Add empty slot message if inventory is empty
    if (this.playerState.inventory.length === 0) {
      const emptyMessage = document.createElement('div');
      emptyMessage.className = 'empty-inventory';
      emptyMessage.textContent = 'Your inventory is empty.';
      slotsContainer.appendChild(emptyMessage);
    }
  }
  
  private refreshEquipmentDisplay(): void {
    if (!this.equipmentPanel || !this.playerState) return;
    
    const slots = this.equipmentPanel.querySelectorAll('.equipment-slot');
    
    // Clear all equipment visuals
    slots.forEach(slot => {
      // Remove any item display except the label
      const slotElement = slot as HTMLElement;
      const label = slotElement.querySelector('.slot-label');
      
      // Clear slot contents except label
      slotElement.innerHTML = '';
      if (label) {
        slotElement.appendChild(label);
      }
      
      // Check if there's an item equipped in this slot
      const slotType = slotElement.dataset.slot as ItemSlot;
      const equippedItem = this.playerState?.equipped[slotType];
      
      if (equippedItem) {
        // Create item display
        const itemDisplay = document.createElement('div');
        itemDisplay.className = 'equipped-item';
        
        // Create icon
        const itemIcon = document.createElement('div');
        itemIcon.className = `item-icon ${equippedItem.type} ${equippedItem.subtype || ''}`;
        
        // Create name display
        const itemName = document.createElement('div');
        itemName.className = 'item-name';
        itemName.textContent = equippedItem.name;
        
        // Add tooltip similar to inventory
        const itemTooltip = document.createElement('div');
        itemTooltip.className = 'item-tooltip';
        
        const tooltipName = document.createElement('strong');
        tooltipName.textContent = equippedItem.name;
        
        const tooltipType = document.createElement('span');
        tooltipType.textContent = `${equippedItem.type.charAt(0).toUpperCase() + equippedItem.type.slice(1)}`;
        if (equippedItem.subtype) {
          tooltipType.textContent += ` (${equippedItem.subtype})`;
        }
        
        const tooltipStats = document.createElement('span');
        if (equippedItem.damage) {
          tooltipStats.textContent = `Damage: ${equippedItem.damage}`;
        } else if (equippedItem.defense) {
          tooltipStats.textContent = `Defense: ${equippedItem.defense}`;
        }
        
        const tooltipDesc = document.createElement('p');
        tooltipDesc.textContent = equippedItem.description;
        
        // Add unequip button
        const unequipButton = document.createElement('button');
        unequipButton.textContent = 'Unequip';
        unequipButton.onclick = (e) => {
          e.stopPropagation();
          this.unequipItem(slotType);
        };
        
        // Assemble tooltip
        itemTooltip.appendChild(tooltipName);
        itemTooltip.appendChild(document.createElement('br'));
        itemTooltip.appendChild(tooltipType);
        if (tooltipStats.textContent) {
          itemTooltip.appendChild(document.createElement('br'));
          itemTooltip.appendChild(tooltipStats);
        }
        itemTooltip.appendChild(document.createElement('br'));
        itemTooltip.appendChild(tooltipDesc);
        itemTooltip.appendChild(document.createElement('br'));
        itemTooltip.appendChild(unequipButton);
        
        // Add all elements to display
        itemDisplay.appendChild(itemIcon);
        itemDisplay.appendChild(itemName);
        itemDisplay.appendChild(itemTooltip);
        
        // Add to slot
        slotElement.appendChild(itemDisplay);
      }
    });
    
    // Update stats display
    this.updateStatsDisplay();
  }
  
  private updateStatsDisplay(): void {
    if (!this.equipmentPanel || !this.playerState) return;
    
    const damageDisplay = document.getElementById('damage-display');
    const defenseDisplay = document.getElementById('defense-display');
    
    if (damageDisplay) {
      damageDisplay.textContent = `Damage: ${this.playerState.damage}`;
    }
    
    if (defenseDisplay) {
      defenseDisplay.textContent = `Defense: ${this.playerState.defense}`;
    }
  }
  
  public addItemToInventory(item: Item): void {
    if (!this.playerState) return;
    
    // Add item to inventory
    this.playerState.inventory.push({ ...item });
    
    // Refresh inventory display if open
    if (this.isInventoryOpen) {
      this.refreshInventoryDisplay();
    }
  }
  
  public equipItem(item: Item): void {
    if (!this.playerState || item.slot === 'none') return;
    
    // Check if the item is in inventory
    const inventoryIndex = this.playerState.inventory.findIndex(i => i.id === item.id);
    if (inventoryIndex === -1) return;
    
    // Unequip current item in the slot if there is one
    const currentEquipped = this.playerState.equipped[item.slot];
    if (currentEquipped) {
      // Add current equipped item back to inventory
      this.playerState.inventory.push({ ...currentEquipped });
    }
    
    // Remove item from inventory
    this.playerState.inventory.splice(inventoryIndex, 1);
    
    // Equip the new item
    this.playerState.equipped[item.slot] = { ...item };
    
    // Update player stats
    this.recalculatePlayerStats();
    
    // Refresh displays
    if (this.isInventoryOpen) {
      this.refreshInventoryDisplay();
      this.refreshEquipmentDisplay();
    }
  }
  
  public unequipItem(slot: ItemSlot): void {
    if (!this.playerState) return;
    
    // Check if there's an item in the slot
    const equippedItem = this.playerState.equipped[slot];
    if (!equippedItem) return;
    
    // Add the item back to inventory
    this.playerState.inventory.push({ ...equippedItem });
    
    // Remove from equipped
    this.playerState.equipped[slot] = null;
    
    // Update player stats
    this.recalculatePlayerStats();
    
    // Refresh displays
    if (this.isInventoryOpen) {
      this.refreshInventoryDisplay();
      this.refreshEquipmentDisplay();
    }
  }
  
  public useConsumable(item: Item): void {
    if (!this.playerState || item.type !== 'consumable') return;
    
    // Find the item in inventory
    const inventoryIndex = this.playerState.inventory.findIndex(i => i.id === item.id);
    if (inventoryIndex === -1) return;
    
    // Apply effect based on item
    switch (item.id) {
      case 'health-potion':
        // Restore health
        this.playerState.health = Math.min(
          this.playerState.health + 25,
          this.playerState.maxHealth
        );
        break;
        
      case 'strength-potion':
        // Temporary damage buff would require a timing system
        // For simplicity, just add a small permanent increase
        this.playerState.damage += 1;
        break;
        
      default:
        console.warn(`Unknown consumable item: ${item.id}`);
        return; // Don't remove the item if its effect is unknown
    }
    
    // Remove the item from inventory
    this.playerState.inventory.splice(inventoryIndex, 1);
    
    // Refresh displays
    if (this.isInventoryOpen) {
      this.refreshInventoryDisplay();
      this.refreshEquipmentDisplay();
    }
  }
  
  private recalculatePlayerStats(): void {
    if (!this.playerState) return;
    
    // Reset to base values
    this.playerState.damage = 5; // Base damage
    this.playerState.defense = 0; // Base defense
    
    // Add stats from equipped items
    Object.values(this.playerState.equipped).forEach(item => {
      if (item) {
        if (item.damage) {
          this.playerState!.damage += item.damage;
        }
        if (item.defense) {
          this.playerState!.defense += item.defense;
        }
      }
    });
  }
  
  public openShop(shopId: string): void {
    if (!this.shopPanel || !this.playerState) return;
    
    // Get the shop data
    const shop = this.shops[shopId];
    if (!shop) {
      console.error(`Shop with ID ${shopId} not found`);
      return;
    }
    
    // Set shop as open
    this.isShopOpen = true;
    
    // Display the shop panel
    this.shopPanel.style.display = 'block';
    
    // Set shop title
    const shopTitle = document.getElementById('shop-title');
    if (shopTitle) {
      shopTitle.textContent = shop.name;
    }
    
    // Update player money display
    this.updateShopMoneyDisplay();
    
    // Display shop items
    this.displayShopItems(shop);
    
    // Close inventory if it's open
    if (this.isInventoryOpen) {
      this.toggleInventoryPanel();
    }
  }
  
  private displayShopItems(shop: Shop): void {
    if (!this.shopPanel || !this.playerState) return;
    
    const shopItemsContainer = document.getElementById('shop-items');
    if (!shopItemsContainer) return;
    
    // Clear current items
    shopItemsContainer.innerHTML = '';
    
    // Add each shop item
    shop.inventory.forEach(item => {
      const itemContainer = document.createElement('div');
      itemContainer.className = 'shop-item';
      
      // Create item icon
      const itemIcon = document.createElement('div');
      itemIcon.className = `item-icon ${item.type} ${item.subtype || ''}`;
      
      // Create item info
      const itemInfo = document.createElement('div');
      itemInfo.className = 'item-info';
      
      const itemName = document.createElement('div');
      itemName.className = 'item-name';
      itemName.textContent = item.name;
      
      const itemDesc = document.createElement('div');
      itemDesc.className = 'item-desc';
      itemDesc.textContent = item.description;
      
      const itemStats = document.createElement('div');
      itemStats.className = 'item-stats';
      if (item.damage) {
        itemStats.textContent = `Damage: ${item.damage}`;
      } else if (item.defense) {
        itemStats.textContent = `Defense: ${item.defense}`;
      }
      
      // Add buy price
      const buyPrice = Math.round(item.value * shop.buyMultiplier);
      const itemPrice = document.createElement('div');
      itemPrice.className = 'item-price';
      itemPrice.textContent = `Price: $${buyPrice}`;
      
      // Add buy button
      const buyButton = document.createElement('button');
      buyButton.className = 'buy-button';
      buyButton.textContent = 'Buy';
      buyButton.onclick = () => this.buyItem(item, shop);
      
      // Disable button if player can't afford it
      if (this.playerState.money < buyPrice) {
        buyButton.disabled = true;
        buyButton.title = 'Not enough money';
      }
      
      // Assemble item info
      itemInfo.appendChild(itemName);
      if (itemStats.textContent) {
        itemInfo.appendChild(itemStats);
      }
      itemInfo.appendChild(itemDesc);
      
      // Assemble item container
      itemContainer.appendChild(itemIcon);
      itemContainer.appendChild(itemInfo);
      itemContainer.appendChild(itemPrice);
      itemContainer.appendChild(buyButton);
      
      // Add to shop items container
      shopItemsContainer.appendChild(itemContainer);
    });
    
    // Add player items that can be sold
    const sellHeader = document.createElement('h3');
    sellHeader.textContent = 'Your Items';
    shopItemsContainer.appendChild(sellHeader);
    
    if (this.playerState.inventory.length === 0) {
      const emptyMessage = document.createElement('div');
      emptyMessage.className = 'empty-inventory';
      emptyMessage.textContent = 'You have no items to sell.';
      shopItemsContainer.appendChild(emptyMessage);
    } else {
      // Create container for player items
      const playerItemsContainer = document.createElement('div');
      playerItemsContainer.className = 'player-items';
      
      // Add each player item
      this.playerState.inventory.forEach(item => {
        const itemContainer = document.createElement('div');
        itemContainer.className = 'shop-item player-item';
        
        // Create item icon
        const itemIcon = document.createElement('div');
        itemIcon.className = `item-icon ${item.type} ${item.subtype || ''}`;
        
        // Create item info
        const itemInfo = document.createElement('div');
        itemInfo.className = 'item-info';
        
        const itemName = document.createElement('div');
        itemName.className = 'item-name';
        itemName.textContent = item.name;
        
        const itemStats = document.createElement('div');
        itemStats.className = 'item-stats';
        if (item.damage) {
          itemStats.textContent = `Damage: ${item.damage}`;
        } else if (item.defense) {
          itemStats.textContent = `Defense: ${item.defense}`;
        }
        
        // Add sell price
        const sellPrice = Math.round(item.value * shop.sellMultiplier);
        const itemPrice = document.createElement('div');
        itemPrice.className = 'item-price';
        itemPrice.textContent = `Sell: $${sellPrice}`;
        
        // Add sell button
        const sellButton = document.createElement('button');
        sellButton.className = 'sell-button';
        sellButton.textContent = 'Sell';
        sellButton.onclick = () => this.sellItem(item, shop);
        
        // Assemble item info
        itemInfo.appendChild(itemName);
        if (itemStats.textContent) {
          itemInfo.appendChild(itemStats);
        }
        
        // Assemble item container
        itemContainer.appendChild(itemIcon);
        itemContainer.appendChild(itemInfo);
        itemContainer.appendChild(itemPrice);
        itemContainer.appendChild(sellButton);
        
        // Add to player items container
        playerItemsContainer.appendChild(itemContainer);
      });
      
      shopItemsContainer.appendChild(playerItemsContainer);
    }
  }
  
  private updateShopMoneyDisplay(): void {
    if (!this.playerState) return;
    
    const moneyDisplay = document.getElementById('shop-money-display');
    if (moneyDisplay) {
      moneyDisplay.textContent = `Your money: $${this.playerState.money}`;
    }
  }
  
  private buyItem(item: Item, shop: Shop): void {
    if (!this.playerState) return;
    
    // Calculate buy price
    const price = Math.round(item.value * shop.buyMultiplier);
    
    // Check if player has enough money
    if (this.playerState.money < price) {
      alert('Not enough money to buy this item.');
      return;
    }
    
    // Deduct money
    this.playerState.money -= price;
    
    // Add item to inventory
    this.addItemToInventory({ ...item });
    
    // Update displays
    this.updateShopMoneyDisplay();
    this.displayShopItems(shop);
  }
  
  private sellItem(item: Item, shop: Shop): void {
    if (!this.playerState) return;
    
    // Find the item in inventory
    const inventoryIndex = this.playerState.inventory.findIndex(i => i.id === item.id);
    if (inventoryIndex === -1) return;
    
    // Calculate sell price
    const price = Math.round(item.value * shop.sellMultiplier);
    
    // Add money to player
    this.playerState.money += price;
    
    // Remove item from inventory
    this.playerState.inventory.splice(inventoryIndex, 1);
    
    // Update displays
    this.updateShopMoneyDisplay();
    this.displayShopItems(shop);
  }
  
  public closeShop(): void {
    if (!this.shopPanel) return;
    
    // Hide shop panel
    this.shopPanel.style.display = 'none';
    this.isShopOpen = false;
  }
}