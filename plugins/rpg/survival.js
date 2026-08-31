import fs from "fs"

const USER_DB = "./survival_user.json"
const ISLAND_DB = "./island.json"
const ISLAND_SIZE = 15 // 15x15 grid for the island
const MAX_HEALTH = 100
const MAX_HUNGER = 100
const MAX_THIRST = 100
const HEALTH_DECREASE_RATE = 5
const HUNGER_DECREASE_RATE = 2
const THIRST_DECREASE_RATE = 3
const HOURS_PER_DAY = 24
const STARTING_HOUR = 8 // Game starts at 8 AM

// Animals on the island
const ANIMALS = {
  "🐗": { name: "Wild Boar", hostile: true, hp: 30, damage: 10, meat: 3, hide: 2 },
  "🐊": { name: "Crocodile", hostile: true, hp: 50, damage: 15, meat: 4, hide: 3 },
  "🐅": { name: "Tiger", hostile: true, hp: 40, damage: 20, meat: 3, hide: 3 },
  "🐍": { name: "Snake", hostile: true, hp: 15, damage: 8, meat: 1, hide: 1 },
  "🦊": { name: "Fox", hostile: false, hp: 15, damage: 5, meat: 2, hide: 1 },
  "🐇": { name: "Rabbit", hostile: false, hp: 10, damage: 0, meat: 1, hide: 1 },
  "🐦": { name: "Bird", hostile: false, hp: 5, damage: 0, meat: 1, hide: 0 },
}

// Items that can be found or crafted
const ITEMS = {
  // Weapons
  "🔪": { name: "Knife", type: "weapon", damage: 5, durability: 20, craftable: true, materials: { "🪵": 1, "🪨": 1 } },
  "🪓": { name: "Axe", type: "weapon", damage: 8, durability: 15, craftable: true, materials: { "🪵": 1, "🪨": 2 } },
  "🔫": { name: "Pistol", type: "weapon", damage: 15, durability: 10, ammo: "🔴" },
  "🏹": {
    name: "Bow",
    type: "weapon",
    damage: 10,
    durability: 15,
    craftable: true,
    materials: { "🪵": 2, "🧵": 1 },
    ammo: "🏹",
  },

  // Clothing
  "👕": { name: "T-Shirt", type: "clothing", warmth: 5, durability: 10 },
  "🧥": { name: "Jacket", type: "clothing", warmth: 15, durability: 15 },
  "👖": { name: "Pants", type: "clothing", warmth: 10, durability: 12 },

  // Food and water
  "🥩": { name: "Meat", type: "food", hunger: 20, spoilTime: 48 },
  "🍎": { name: "Apple", type: "food", hunger: 10, spoilTime: 72 },
  "🥫": { name: "Canned Food", type: "food", hunger: 30, spoilTime: 999 },
  "💧": { name: "Water", type: "drink", thirst: 20 },
  "🧴": { name: "Water Bottle", type: "drink", thirst: 40 },

  // Materials
  "🪵": { name: "Wood", type: "material" },
  "🪨": { name: "Stone", type: "material" },
  "🧵": { name: "String", type: "material" },
  "🧪": { name: "Medical Supplies", type: "healing", health: 30 },
  "🔴": { name: "Bullets", type: "ammo", for: "🔫", amount: 6 },
  "🏹": { name: "Arrows", type: "ammo", for: "🏹", amount: 5, craftable: true, materials: { "🪵": 1, "🪨": 1 } },

  // Special items
  "🔥": { name: "Fire Starter", type: "tool", craftable: true, materials: { "🪵": 2, "🪨": 1 } },
  "🧰": { name: "Repair Kit", type: "tool", craftable: true, materials: { "🪵": 1, "🪨": 1, "🧵": 1 } },
  "📻": { name: "Radio", type: "tool", durability: 5 },
  "🚩": { name: "Flare Gun", type: "tool", durability: 1 },
  "🔦": { name: "Flashlight", type: "tool", durability: 10 },
}

// Craftable structures
const STRUCTURES = {
  "⛺": { name: "Tent", protection: 10, warmth: 15, materials: { "🪵": 3, "👕": 1 } },
  "🏠": { name: "Shelter", protection: 20, warmth: 25, materials: { "🪵": 10, "🪨": 5 } },
  "🔥": { name: "Campfire", warmth: 20, materials: { "🪵": 5, "🪨": 3 } },
  "🪤": { name: "Trap", materials: { "🪵": 3, "🧵": 1 } },
}

// Terrain types
const TERRAIN_TYPES = ["forest", "beach", "mountain", "river", "lake", "cave", "plane", "bunker"]
const TERRAIN_EMOJI = {
  forest: "🌲",
  beach: "🏖️",
  mountain: "⛰️",
  river: "🌊",
  lake: "💦",
  cave: "🕳️",
  plane: "✈️",
  bunker: "🏢",
}

// Direction emojis
const DIRECTION_EMOJI = {
  north: "⬆️",
  east: "➡️",
  south: "⬇️",
  west: "⬅️",
}

// Load user data
function loadUsers() {
  if (!fs.existsSync(USER_DB)) fs.writeFileSync(USER_DB, "{}")
  return JSON.parse(fs.readFileSync(USER_DB))
}

// Save user data
function saveUsers(data) {
  fs.writeFileSync(USER_DB, JSON.stringify(data, null, 2))
}

// Load island data
function loadIsland() {
  if (!fs.existsSync(ISLAND_DB)) {
    // Initialize with empty island
    const initialData = {
      map: generateIsland(),
      players: {},
    }
    fs.writeFileSync(ISLAND_DB, JSON.stringify(initialData, null, 2))
  }
  return JSON.parse(fs.readFileSync(ISLAND_DB))
}

// Save island data
function saveIsland(data) {
  fs.writeFileSync(ISLAND_DB, JSON.stringify(data, null, 2))
}

// Generate a random island map
function generateIsland() {
  const island = []

  // Generate terrain distribution
  for (let y = 0; y < ISLAND_SIZE; y++) {
    const row = []
    for (let x = 0; x < ISLAND_SIZE; x++) {
      // Determine terrain type based on position
      let terrainType

      // Edges are more likely to be beach
      const isEdge = x === 0 || y === 0 || x === ISLAND_SIZE - 1 || y === ISLAND_SIZE - 1

      if (isEdge) {
        terrainType = Math.random() < 0.8 ? "beach" : "forest"
      } else {
        // Random terrain for inner parts
        const rand = Math.random()

        if (rand < 0.5) {
          terrainType = "forest"
        } else if (rand < 0.7) {
          terrainType = "mountain"
        } else if (rand < 0.8) {
          terrainType = "river"
        } else if (rand < 0.85) {
          terrainType = "lake"
        } else if (rand < 0.9) {
          terrainType = "cave"
        } else {
          terrainType = "beach"
        }
      }

      // Create the location
      const location = {
        type: terrainType,
        explored: false,
        items: [],
        animals: [],
        bodies: [],
        structures: [],
        description: generateDescription(terrainType),
      }

      // Add special locations
      if (terrainType === "forest" && Math.random() < 0.05) {
        location.type = "plane"
        location.description = "A part of the crashed plane. There might be useful supplies here."
      } else if (terrainType === "mountain" && Math.random() < 0.03) {
        location.type = "bunker"
        location.description = "An old military bunker hidden in the mountain. It might contain valuable supplies."
      }

      // Add random items based on terrain
      addRandomItems(location)

      // Add random animals based on terrain
      addRandomAnimals(location)

      // Add random bodies near the plane crash
      if (location.type === "plane" || (Math.random() < 0.1 && (terrainType === "forest" || terrainType === "beach"))) {
        addRandomBodies(location)
      }

      row.push(location)
    }
    island.push(row)
  }

  return island
}

// Generate description based on terrain type
function generateDescription(terrainType) {
  const descriptions = {
    forest: [
      "A dense forest with tall trees blocking most of the sunlight.",
      "A forest with various trees and bushes. You can hear birds chirping.",
      "A forest area with fallen trees and thick undergrowth.",
    ],
    beach: [
      "A sandy beach with waves crashing on the shore.",
      "A rocky beach with small tide pools.",
      "A wide open beach with palm trees nearby.",
    ],
    mountain: [
      "A rocky mountain area with a steep climb.",
      "A mountain slope with loose rocks and little vegetation.",
      "A mountain ridge offering a good view of the surrounding area.",
    ],
    river: [
      "A flowing river with clear water.",
      "A shallow river that you could cross carefully.",
      "A river bend with deeper water in the middle.",
    ],
    lake: [
      "A small lake with calm water.",
      "A lake surrounded by reeds and water plants.",
      "A clear lake that seems to be a good source of water.",
    ],
    cave: [
      "A dark cave entrance that could provide shelter.",
      "A shallow cave with a dry floor.",
      "A cave with strange markings on the walls.",
    ],
  }

  const options = descriptions[terrainType] || ["An area on the island."]
  return options[Math.floor(Math.random() * options.length)]
}

// Add random items to a location based on terrain
function addRandomItems(location) {
  const terrainType = location.type

  // Different probabilities for different terrain types
  let itemCount = 0
  let itemPool = []

  switch (terrainType) {
    case "forest":
      itemCount = Math.floor(Math.random() * 3)
      itemPool = ["🪵", "🪵", "🪵", "🪨", "🧵", "🍎"]
      break
    case "beach":
      itemCount = Math.floor(Math.random() * 2)
      itemPool = ["🪨", "🪨", "🪵", "🧵"]
      break
    case "mountain":
      itemCount = Math.floor(Math.random() * 2)
      itemPool = ["🪨", "🪨", "🪨", "🪵"]
      break
    case "river":
    case "lake":
      itemCount = Math.floor(Math.random() * 2)
      itemPool = ["💧", "💧", "🪨", "🪵"]
      break
    case "cave":
      itemCount = Math.floor(Math.random() * 3)
      itemPool = ["🪨", "🪨", "🪨", "🧵"]
      break
    case "plane":
      itemCount = 3 + Math.floor(Math.random() * 4) // More items in plane wreckage
      itemPool = ["🥫", "🥫", "🧴", "🧴", "👕", "👖", "🧥", "🧪", "🧪", "📻", "🔦", "🚩"]
      break
    case "bunker":
      itemCount = 4 + Math.floor(Math.random() * 5) // Most items in bunker
      itemPool = ["🥫", "🥫", "🥫", "🧴", "🧴", "🧪", "🧪", "🔫", "🔴", "🧥", "📻", "🔦", "🚩"]
      break
  }

  // Add random items from the pool
  for (let i = 0; i < itemCount; i++) {
    const randomItem = itemPool[Math.floor(Math.random() * itemPool.length)]
    location.items.push(randomItem)
  }

  // Special case: Add a pistol to one of the bodies if this is a plane location
  if (terrainType === "plane" && Math.random() < 0.3) {
    location.specialBody = {
      description: "The body of what appears to be a police officer or security personnel.",
      items: ["🔫", "🔴"],
    }
  }
}

// Add random animals to a location based on terrain
function addRandomAnimals(location) {
  const terrainType = location.type

  // Different probabilities for different terrain types
  let animalCount = 0
  let animalPool = []

  switch (terrainType) {
    case "forest":
      animalCount = Math.random() < 0.7 ? Math.floor(Math.random() * 3) : 0
      animalPool = ["🐗", "🐅", "🐍", "🦊", "🐇", "🐦", "🐦"]
      break
    case "beach":
      animalCount = Math.random() < 0.4 ? Math.floor(Math.random() * 2) : 0
      animalPool = ["🐦", "🐦", "🐦", "🐍"]
      break
    case "mountain":
      animalCount = Math.random() < 0.5 ? Math.floor(Math.random() * 2) : 0
      animalPool = ["🐗", "🐅", "🐍", "🦊", "🐦"]
      break
    case "river":
    case "lake":
      animalCount = Math.random() < 0.6 ? Math.floor(Math.random() * 2) : 0
      animalPool = ["🐊", "🐊", "🐦", "🐦", "🐍"]
      break
    case "cave":
      animalCount = Math.random() < 0.4 ? 1 : 0
      animalPool = ["🐍", "🐍", "🦊"]
      break
    default:
      animalCount = 0
      break
  }

  // Add random animals from the pool
  for (let i = 0; i < animalCount; i++) {
    const animalEmoji = animalPool[Math.floor(Math.random() * animalPool.length)]
    const animal = { ...ANIMALS[animalEmoji], emoji: animalEmoji }
    location.animals.push(animal)
  }
}

// Add random bodies to a location
function addRandomBodies(location) {
  // Determine number of bodies
  let bodyCount = 0

  if (location.type === "plane") {
    bodyCount = 2 + Math.floor(Math.random() * 3) // More bodies near plane
  } else {
    bodyCount = 1
  }

  // Add bodies with random items
  for (let i = 0; i < bodyCount; i++) {
    const body = {
      description: getRandomBodyDescription(),
      items: getRandomBodyItems(),
    }
    location.bodies.push(body)
  }
}

// Get random description for a body
function getRandomBodyDescription() {
  const descriptions = [
    "The body of a passenger from the plane crash.",
    "A deceased person wearing tattered clothes.",
    "The remains of someone who didn't survive the crash.",
    "A body partially covered by debris.",
    "The body of someone who appears to have died recently.",
  ]

  return descriptions[Math.floor(Math.random() * descriptions.length)]
}

// Get random items for a body
function getRandomBodyItems() {
  const items = []
  const itemPool = ["👕", "👖", "🧥", "🥫", "🧴", "🧪", "🧵", "🔦"]

  // Add 1-3 random items
  const itemCount = 1 + Math.floor(Math.random() * 3)
  for (let i = 0; i < itemCount; i++) {
    const randomItem = itemPool[Math.floor(Math.random() * itemPool.length)]
    items.push(randomItem)
  }

  return items
}

// Main handler function
const handler = async (m, { conn, args, command, text }) => {
  // Load user data
  const users = loadUsers()
  const sender = m.sender.split("@")[0]

  // Initialize user if not exists
  if (!users[sender]) {
    users[sender] = {
      balance: 0,
      survival: {},
    }
    saveUsers(users)
  }

  // Initialize survival data if not exists
  if (!users[sender].survival) {
    users[sender].survival = {}
    saveUsers(users)
  }

  // Load island data
  const islandData = loadIsland()

  // Command handler
  try {
    const subCommand = args[0]?.toLowerCase()

    // Start a new survival game
    if (subCommand === "start") {
      // Check if player is already in a game
      if (users[sender].survival.active) {
        return m.reply(`⚠️ You are already in a survival game! Use .survival exit to leave.`)
      }

      // Get username
      const username = args[1]
      if (!username) {
        return m.reply(`⚠️ Please enter a username for your character! Example: .survival start Survivor`)
      }

      // Show prologue
      await conn.sendMessage(m.chat, {
        text:
          `🏝️ *ISLAND SURVIVAL* 🏝️\n\n` +
          `*PROLOGUE*\n\n` +
          `You were on flight AX-427, traveling over the Pacific Ocean when disaster struck. A sudden violent storm caused the plane to lose control. The last thing you remember is the oxygen masks dropping, the screams of passengers, and the sickening feeling of the plane plummeting toward the ocean.\n\n` +
          `You wake up, your body aching all over. The sound of waves and birds fills your ears. You're alive, somehow. Looking around, you see pieces of the plane scattered across the area. Bodies of other passengers lie motionless nearby.\n\n` +
          `You are the only survivor of flight AX-427, stranded on an uninhabited island with nothing but your wits and whatever you can salvage. Your only goal now is to survive long enough to be rescued.\n\n` +
          `Type .survival continue to begin your fight for survival...`,
      })

      // Initialize player stats
      users[sender].survival = {
        active: true,
        username: username,
        prologue: true, // Player needs to continue from prologue
        health: MAX_HEALTH,
        maxHealth: MAX_HEALTH,
        hunger: MAX_HUNGER,
        maxHunger: MAX_HUNGER,
        thirst: MAX_THIRST,
        maxThirst: MAX_THIRST,
        inventory: [],
        equippedWeapon: null,
        equippedClothing: null,
        visitedLocations: {},
        gameTime: {
          days: 1,
          hours: STARTING_HOUR,
          totalHours: STARTING_HOUR,
        },
        rescueChance: 0, // Percentage chance of rescue
        rescueAttempts: 0, // Number of rescue attempts made
      }

      saveUsers(users)

      return
    }

    // Continue from prologue
    if (subCommand === "continue") {
      // Check if player is in prologue
      if (!users[sender].survival.active || !users[sender].survival.prologue) {
        return m.reply(`⚠️ You need to start a new game with .survival start [username]`)
      }

      // Determine random starting position
      const startX = Math.floor(Math.random() * ISLAND_SIZE)
      const startY = Math.floor(Math.random() * ISLAND_SIZE)

      // Make sure starting position is either forest or beach
      let startingTerrain = islandData.map[startY][startX].type
      if (startingTerrain !== "forest" && startingTerrain !== "beach") {
        // Find the nearest forest or beach
        let found = false
        let searchRadius = 1

        while (!found && searchRadius < ISLAND_SIZE) {
          for (let y = Math.max(0, startY - searchRadius); y <= Math.min(ISLAND_SIZE - 1, startY + searchRadius); y++) {
            for (
              let x = Math.max(0, startX - searchRadius);
              x <= Math.min(ISLAND_SIZE - 1, startX + searchRadius);
              x++
            ) {
              const terrain = islandData.map[y][x].type
              if (terrain === "forest" || terrain === "beach") {
                users[sender].survival.position = { x, y }
                startingTerrain = terrain
                found = true
                break
              }
            }
            if (found) break
          }
          searchRadius++
        }
      } else {
        users[sender].survival.position = { x: startX, y: startY }
      }

      // Mark location as visited
      const { x, y } = users[sender].survival.position
      users[sender].survival.visitedLocations[`${x},${y}`] = true
      islandData.map[y][x].explored = true

      // Set current location
      users[sender].survival.currentLocation = islandData.map[y][x]

      // Remove prologue flag
      users[sender].survival.prologue = false

      // Register player in global island
      islandData.players[sender] = {
        username: users[sender].survival.username,
        position: users[sender].survival.position,
        health: users[sender].survival.health,
        maxHealth: users[sender].survival.maxHealth,
      }

      saveUsers(users)
      saveIsland(islandData)

      // Show starting message
      await conn.sendMessage(m.chat, {
        text:
          `🏝️ *ISLAND SURVIVAL* 🏝️\n\n` +
          `You regain consciousness on a ${startingTerrain === "forest" ? "forested area" : "beach"} of the island.\n\n` +
          `Your survival begins now, ${users[sender].survival.username}.\n\n` +
          describeLocation(users[sender].survival, islandData, sender),
      })

      return
    }

    // Check if player is in a game
    if (!users[sender].survival.active || users[sender].survival.prologue) {
      return m.reply(`⚠️ You haven't started a survival game yet! Use .survival start [username] to begin.`)
    }

    // Move command
    if (subCommand === "move") {
      const direction = args[1]?.toLowerCase()

      if (!direction || !["north", "east", "south", "west"].includes(direction)) {
        return m.reply(`⚠️ Invalid direction! Use: north, east, south, or west.`)
      }

      // Check if movement is possible
      const { x, y } = users[sender].survival.position
      let newX = x
      let newY = y

      switch (direction) {
        case "north":
          newY = Math.max(0, y - 1)
          break
        case "south":
          newY = Math.min(ISLAND_SIZE - 1, y + 1)
          break
        case "west":
          newX = Math.max(0, x - 1)
          break
        case "east":
          newX = Math.min(ISLAND_SIZE - 1, x + 1)
          break
      }

      // Check if position changed (hit edge of map)
      if (newX === x && newY === y) {
        return m.reply(`🌊 You can't go any further in that direction. The ocean stretches as far as you can see.`)
      }

      // Update position
      users[sender].survival.position = { x: newX, y: newY }
      islandData.players[sender].position = { x: newX, y: newY }

      // Mark location as visited
      users[sender].survival.visitedLocations[`${newX},${newY}`] = true
      islandData.map[newY][newX].explored = true

      // Get new location
      users[sender].survival.currentLocation = islandData.map[newY][newX]

      // Update game time and survival stats
      updateGameTime(users[sender].survival, 1) // Moving takes 1 hour
      updateSurvivalStats(users[sender].survival)

      // Check for random events
      const eventOccurred = checkForRandomEvents(users[sender].survival, islandData, sender)

      saveUsers(users)
      saveIsland(islandData)

      // Describe the new location
      await conn.sendMessage(m.chat, {
        text:
          `${DIRECTION_EMOJI[direction]} You move ${direction}.\n\n` +
          (eventOccurred ? "" : describeLocation(users[sender].survival, islandData, sender)),
      })

      return
    }

    // Explore command
    if (subCommand === "explore") {
      const survival = users[sender].survival
      const location = survival.currentLocation

      // Exploring takes time
      updateGameTime(survival, 2) // Exploring takes 2 hours
      updateSurvivalStats(survival)

      // Chance to find new items
      const foundItems = []
      const exploreChance = Math.random()

      if (exploreChance < 0.7) {
        // 70% chance to find something
        // Determine what items to find based on terrain
        const terrainType = location.type
        let itemPool = []

        switch (terrainType) {
          case "forest":
            itemPool = ["🪵", "🪵", "🪵", "🪨", "🧵", "🍎"]
            break
          case "beach":
            itemPool = ["🪨", "🪨", "🪵", "🧵"]
            break
          case "mountain":
            itemPool = ["🪨", "🪨", "🪨", "🪵"]
            break
          case "river":
          case "lake":
            itemPool = ["💧", "💧", "🪨", "🪵"]
            break
          case "cave":
            itemPool = ["🪨", "🪨", "🪨", "🧵"]
            break
          default:
            itemPool = ["🪵", "🪨", "🧵"]
            break
        }

        // Add 1-2 random items
        const itemCount = 1 + Math.floor(Math.random() * 2)
        for (let i = 0; i < itemCount; i++) {
          const randomItem = itemPool[Math.floor(Math.random() * itemPool.length)]
          foundItems.push(randomItem)
          survival.inventory.push(randomItem)
        }
      }

      // Chance to find animals
      const foundAnimals = []
      const animalChance = Math.random()

      if (animalChance < 0.4) {
        // 40% chance to encounter animals
        // Determine what animals based on terrain
        const terrainType = location.type
        let animalPool = []

        switch (terrainType) {
          case "forest":
            animalPool = ["🐗", "🐅", "🐍", "🦊", "🐇", "🐦", "🐦"]
            break
          case "beach":
            animalPool = ["🐦", "🐦", "🐦", "🐍"]
            break
          case "mountain":
            animalPool = ["🐗", "🐅", "🐍", "🦊", "🐦"]
            break
          case "river":
          case "lake":
            animalPool = ["🐊", "🐊", "🐦", "🐦", "🐍"]
            break
          case "cave":
            animalPool = ["🐍", "🐍", "🦊"]
            break
          default:
            animalPool = ["🐦", "🐇"]
            break
        }

        // Add 1 random animal
        const animalEmoji = animalPool[Math.floor(Math.random() * animalPool.length)]
        const animal = { ...ANIMALS[animalEmoji], emoji: animalEmoji }
        foundAnimals.push(animal)
        location.animals.push(animal)
      }

      saveUsers(users)
      saveIsland(islandData)

      // Construct response message
      let responseText = `🔍 You spend some time exploring the area.\n\n`

      if (foundItems.length > 0) {
        responseText += `✅ You found: ${foundItems.join(", ")}\n`
      }

      if (foundAnimals.length > 0) {
        const animal = foundAnimals[0]
        responseText += `🐾 You encountered a ${animal.emoji} ${animal.name}!\n`

        if (animal.hostile) {
          responseText += `⚠️ It seems aggressive! Use .survival fight or .survival run to respond.\n`
        } else {
          responseText += `It doesn't seem dangerous. You could try to hunt it with .survival hunt\n`
        }
      } else {
        responseText += `\n${describeLocation(survival, islandData, sender)}`
      }

      await conn.sendMessage(m.chat, {
        text: responseText,
      })

      return
    }

    // Search/loot bodies
    if (subCommand === "search" || subCommand === "loot") {
      const survival = users[sender].survival
      const location = survival.currentLocation

      // Check if there are bodies to search
      if (location.bodies.length === 0 && !location.specialBody) {
        return m.reply(`⚠️ There are no bodies to search in this area.`)
      }

      // Searching takes time
      updateGameTime(survival, 1) // Searching takes 1 hour
      updateSurvivalStats(survival)

      let responseText = `🔍 You search the bodies in the area.\n\n`
      let foundItems = []

      // Search regular bodies
      if (location.bodies.length > 0) {
        const body = location.bodies.shift() // Remove the first body
        responseText += `${body.description}\n\n`

        if (body.items.length > 0) {
          responseText += `You found: ${body.items.join(", ")}\n`
          foundItems = [...foundItems, ...body.items]
          survival.inventory = [...survival.inventory, ...body.items]
        } else {
          responseText += `You didn't find anything useful.\n`
        }
      }

      // Search special body (police officer with gun)
      if (location.specialBody) {
        responseText += `${location.specialBody.description}\n\n`

        if (location.specialBody.items.length > 0) {
          responseText += `You found: ${location.specialBody.items.join(", ")}\n`
          foundItems = [...foundItems, ...location.specialBody.items]
          survival.inventory = [...survival.inventory, ...location.specialBody.items]
        }

        delete location.specialBody
      }

      saveUsers(users)
      saveIsland(islandData)

      responseText += `\n${describeLocation(survival, islandData, sender)}`

      await conn.sendMessage(m.chat, {
        text: responseText,
      })

      return
    }

    // Take/collect items
    if (subCommand === "take" || subCommand === "collect") {
      const survival = users[sender].survival
      const location = survival.currentLocation

      // Check if there are items to take
      if (location.items.length === 0) {
        return m.reply(`⚠️ There are no items to collect in this area.`)
      }

      // Taking items takes a little time
      updateGameTime(survival, 0.5) // Taking items takes 30 minutes
      updateSurvivalStats(survival)

      // Take all items
      const items = [...location.items]
      survival.inventory = [...survival.inventory, ...items]
      location.items = []

      saveUsers(users)
      saveIsland(islandData)

      await conn.sendMessage(m.chat, {
        text: `✅ You collected: ${items.join(", ")}\n\n` + describeLocation(survival, islandData, sender),
      })

      return
    }

    // Craft items
    if (subCommand === "craft") {
      const itemEmoji = args[1]

      if (!itemEmoji) {
        // Show craftable items
        let craftableText = `🛠️ *CRAFTABLE ITEMS* 🛠️\n\n`

        // Check items
        for (const [emoji, item] of Object.entries(ITEMS)) {
          if (item.craftable) {
            craftableText += `${emoji} ${item.name}\n`
            craftableText += `Materials needed: `

            for (const [material, count] of Object.entries(item.materials)) {
              craftableText += `${material} x${count} `
            }

            craftableText += `\n\n`
          }
        }

        // Check structures
        craftableText += `🏗️ *CRAFTABLE STRUCTURES* 🏗️\n\n`

        for (const [emoji, structure] of Object.entries(STRUCTURES)) {
          craftableText += `${emoji} ${structure.name}\n`
          craftableText += `Materials needed: `

          for (const [material, count] of Object.entries(structure.materials)) {
            craftableText += `${material} x${count} `
          }

          craftableText += `\n\n`
        }

        craftableText += `Use .survival craft [emoji] to craft an item.`

        await conn.sendMessage(m.chat, {
          text: craftableText,
        })

        return
      }

      const survival = users[sender].survival

      // Check if item is craftable
      let craftable = null
      let isStructure = false

      if (ITEMS[itemEmoji] && ITEMS[itemEmoji].craftable) {
        craftable = ITEMS[itemEmoji]
      } else if (STRUCTURES[itemEmoji]) {
        craftable = STRUCTURES[itemEmoji]
        isStructure = true
      }

      if (!craftable) {
        return m.reply(`⚠️ ${itemEmoji} is not a craftable item or structure.`)
      }

      // Check if player has required materials
      const materials = craftable.materials
      const inventory = [...survival.inventory]
      let canCraft = true

      for (const [material, count] of Object.entries(materials)) {
        let availableCount = 0

        for (let i = 0; i < inventory.length; i++) {
          if (inventory[i] === material) {
            availableCount++
            if (availableCount >= count) break
          }
        }

        if (availableCount < count) {
          canCraft = false
          return m.reply(
            `⚠️ You don't have enough materials to craft ${itemEmoji}. You need ${count}x ${material} but only have ${availableCount}.`,
          )
        }
      }

      // Remove materials from inventory
      for (const [material, count] of Object.entries(materials)) {
        let removedCount = 0

        for (let i = inventory.length - 1; i >= 0; i--) {
          if (inventory[i] === material) {
            inventory.splice(i, 1)
            removedCount++
            if (removedCount >= count) break
          }
        }
      }

      // Add crafted item to inventory or place structure
      if (isStructure) {
        survival.currentLocation.structures.push(itemEmoji)
      } else {
        inventory.push(itemEmoji)
      }

      survival.inventory = inventory

      // Crafting takes time
      updateGameTime(survival, 2) // Crafting takes 2 hours
      updateSurvivalStats(survival)

      saveUsers(users)
      saveIsland(islandData)

      await conn.sendMessage(m.chat, {
        text:
          `🛠️ You successfully crafted ${itemEmoji} ${isStructure ? STRUCTURES[itemEmoji].name : ITEMS[itemEmoji].name}!\n\n` +
          describeLocation(survival, islandData, sender),
      })

      return
    }

    // Use items (food, water, medical supplies)
    if (subCommand === "use") {
      const itemEmoji = args[1]

      if (!itemEmoji) {
        return m.reply(`⚠️ Please specify an item to use. Example: .survival use 🥩`)
      }

      const survival = users[sender].survival
      const inventory = [...survival.inventory]

      // Check if player has the item
      const itemIndex = inventory.indexOf(itemEmoji)

      if (itemIndex === -1) {
        return m.reply(`⚠️ You don't have ${itemEmoji} in your inventory.`)
      }

      // Check if item is usable
      if (!ITEMS[itemEmoji]) {
        return m.reply(`⚠️ ${itemEmoji} is not a recognized item.`)
      }

      const item = ITEMS[itemEmoji]
      let responseText = ``

      // Handle different item types
      if (item.type === "food") {
        // Food increases hunger
        survival.hunger = Math.min(survival.maxHunger, survival.hunger + item.hunger)
        responseText =
          `🍽️ You ate ${itemEmoji} ${item.name} and restored ${item.hunger} hunger.\n` +
          `Hunger: ${survival.hunger}/${survival.maxHunger}`
      } else if (item.type === "drink") {
        // Drinks increase thirst
        survival.thirst = Math.min(survival.maxThirst, survival.thirst + item.thirst)
        responseText =
          `🥤 You drank ${itemEmoji} ${item.name} and restored ${item.thirst} thirst.\n` +
          `Thirst: ${survival.thirst}/${survival.maxThirst}`
      } else if (item.type === "healing") {
        // Medical supplies heal health
        survival.health = Math.min(survival.maxHealth, survival.health + item.health)
        responseText =
          `🩹 You used ${itemEmoji} ${item.name} and restored ${item.health} health.\n` +
          `Health: ${survival.health}/${survival.maxHealth}`
      } else if (item.type === "tool" && itemEmoji === "📻") {
        // Using radio increases rescue chance
        survival.rescueChance += 5
        responseText =
          `📻 You used the radio to send out a distress signal.\n` +
          `Rescue chance increased by 5%.\n` +
          `Current rescue chance: ${survival.rescueChance}%`
      } else if (item.type === "tool" && itemEmoji === "🚩") {
        // Using flare gun triggers immediate rescue attempt
        responseText = `🚩 You fired the flare gun into the sky!\n\n`

        // Check if rescue happens
        const rescueRoll = Math.random() * 100
        if (rescueRoll < survival.rescueChance + 30) {
          // Flare gun gives +30% chance
          // Rescued!
          await conn.sendMessage(m.chat, {
            text:
              responseText +
              `🚁 *RESCUE HELICOPTER SPOTTED!* 🚁\n\n` +
              `The helicopter has seen your flare and is coming to rescue you!\n\n` +
              `Congratulations, ${survival.username}! You have survived for ${survival.gameTime.days} days and ${survival.gameTime.hours} hours on the island.\n\n` +
              `🎮 *GAME COMPLETED* 🎮\n` +
              `Use .survival start [username] to play again.`,
          })

          // Reset player
          users[sender].survival = {}
          delete islandData.players[sender]

          saveUsers(users)
          saveIsland(islandData)

          return
        } else {
          responseText += `You wait anxiously, but no rescue arrives. Perhaps you need to try again later or increase your rescue chance.\n`
        }
      } else {
        return m.reply(`⚠️ ${itemEmoji} ${item.name} cannot be used in this way.`)
      }

      // Remove item from inventory
      inventory.splice(itemIndex, 1)
      survival.inventory = inventory

      // Using items takes a little time
      updateGameTime(survival, 0.5) // Using items takes 30 minutes
      updateSurvivalStats(survival)

      saveUsers(users)

      await conn.sendMessage(m.chat, {
        text: responseText,
      })

      return
    }

    // Equip items (weapons, clothing)
    if (subCommand === "equip") {
      const itemEmoji = args[1]

      if (!itemEmoji) {
        return m.reply(`⚠️ Please specify an item to equip. Example: .survival equip 🔪`)
      }

      const survival = users[sender].survival
      const inventory = [...survival.inventory]

      // Check if player has the item
      const itemIndex = inventory.indexOf(itemEmoji)

      if (itemIndex === -1) {
        return m.reply(`⚠️ You don't have ${itemEmoji} in your inventory.`)
      }

      // Check if item is equippable
      if (!ITEMS[itemEmoji]) {
        return m.reply(`⚠️ ${itemEmoji} is not a recognized item.`)
      }

      const item = ITEMS[itemEmoji]

      // Handle different item types
      if (item.type === "weapon") {
        // Unequip current weapon if any
        if (survival.equippedWeapon) {
          inventory.push(survival.equippedWeapon)
        }

        survival.equippedWeapon = itemEmoji
        inventory.splice(itemIndex, 1)

        await conn.sendMessage(m.chat, {
          text: `🔪 You equipped ${itemEmoji} ${item.name} as your weapon.\n` + `Damage: +${item.damage}`,
        })
      } else if (item.type === "clothing") {
        // Unequip current clothing if any
        if (survival.equippedClothing) {
          inventory.push(survival.equippedClothing)
        }

        survival.equippedClothing = itemEmoji
        inventory.splice(itemIndex, 1)

        await conn.sendMessage(m.chat, {
          text: `👕 You equipped ${itemEmoji} ${item.name}.\n` + `Warmth: +${item.warmth}`,
        })
      } else {
        return m.reply(`⚠️ ${itemEmoji} ${item.name} cannot be equipped.`)
      }

      survival.inventory = inventory

      // Equipping takes a little time
      updateGameTime(survival, 0.2) // Equipping takes 12 minutes

      saveUsers(users)

      return
    }

    // Fight hostile animals
    if (subCommand === "fight") {
      const survival = users[sender].survival
      const location = survival.currentLocation

      // Check if there are animals to fight
      if (location.animals.length === 0) {
        return m.reply(`⚠️ There are no animals to fight in this area.`)
      }

      const animal = location.animals[0] // Fight the first animal

      // Check if animal is hostile
      if (!animal.hostile) {
        return m.reply(`⚠️ ${animal.emoji} ${animal.name} is not hostile. Use .survival hunt to hunt it instead.`)
      }

      // Calculate damage
      const weaponDamage = survival.equippedWeapon ? ITEMS[survival.equippedWeapon].damage : 0
      const playerDamage = 5 + weaponDamage // Base damage + weapon

      // Deal damage to animal
      animal.hp -= playerDamage

      // Check if animal is defeated
      if (animal.hp <= 0) {
        // Animal defeated
        location.animals.shift() // Remove the animal

        // Add meat and hide to inventory
        for (let i = 0; i < animal.meat; i++) {
          survival.inventory.push("🥩")
        }

        for (let i = 0; i < animal.hide; i++) {
          survival.inventory.push("🧵")
        }

        // Fighting takes time
        updateGameTime(survival, 1) // Fighting takes 1 hour
        updateSurvivalStats(survival)

        saveUsers(users)
        saveIsland(islandData)

        await conn.sendMessage(m.chat, {
          text:
            `⚔️ You attack the ${animal.emoji} ${animal.name} and deal ${playerDamage} damage!\n\n` +
            `🎯 You defeated the ${animal.emoji} ${animal.name}!\n` +
            `You collected ${animal.meat}x 🥩 Meat and ${animal.hide}x 🧵 Hide.\n\n` +
            describeLocation(survival, islandData, sender),
        })

        return
      }

      // Animal still alive, counter attack
      const animalDamage = Math.max(1, animal.damage)

      // Check if clothing is damaged
      let clothingDamaged = false
      if (survival.equippedClothing && Math.random() < 0.3) {
        // 30% chance to damage clothing
        clothingDamaged = true
        survival.inventory.push(survival.equippedClothing) // Add damaged clothing to inventory
        survival.equippedClothing = null // Remove equipped clothing
      }

      // Take damage
      survival.health -= animalDamage

      // Check if player is defeated
      if (survival.health <= 0) {
        // Player died
        await conn.sendMessage(m.chat, {
          text:
            `⚔️ You attack the ${animal.emoji} ${animal.name} and deal ${playerDamage} damage!\n\n` +
            `💥 The ${animal.emoji} ${animal.name} attacks you and deals ${animalDamage} damage!\n\n` +
            `💀 *YOU DIED* 💀\n` +
            `You survived for ${survival.gameTime.days} days and ${survival.gameTime.hours} hours on the island.\n\n` +
            `🎮 *GAME OVER* 🎮\n` +
            `Use .survival start [username] to play again.`,
        })

        // Reset player
        users[sender].survival = {}
        delete islandData.players[sender]

        saveUsers(users)
        saveIsland(islandData)

        return
      }

      // Fighting takes time
      updateGameTime(survival, 0.5) // Fighting round takes 30 minutes
      updateSurvivalStats(survival)

      saveUsers(users)
      saveIsland(islandData)

      await conn.sendMessage(m.chat, {
        text:
          `⚔️ You attack the ${animal.emoji} ${animal.name} and deal ${playerDamage} damage!\n\n` +
          `💥 The ${animal.emoji} ${animal.name} attacks you and deals ${animalDamage} damage!\n\n` +
          (clothingDamaged ? `⚠️ Your ${ITEMS[survival.equippedClothing].name} was damaged in the fight!\n\n` : "") +
          `${animal.emoji} HP: ${animal.hp}\n` +
          `❤️ Your HP: ${survival.health}/${survival.maxHealth}\n\n` +
          `Use .survival fight to continue fighting or .survival run to try to escape.`,
      })

      return
    }

    // Run from hostile animals
    if (subCommand === "run") {
      const survival = users[sender].survival
      const location = survival.currentLocation

      // Check if there are animals to run from
      if (location.animals.length === 0) {
        return m.reply(`⚠️ There are no animals to run from in this area.`)
      }

      const animal = location.animals[0] // Run from the first animal

      // Check if animal is hostile
      if (!animal.hostile) {
        return m.reply(`⚠️ ${animal.emoji} ${animal.name} is not hostile. There's no need to run.`)
      }

      // Chance to escape based on animal type
      const escapeChance = Math.random()
      const escaped = escapeChance < 0.7 // 70% chance to escape

      if (escaped) {
        // Successfully escaped
        location.animals.shift() // Remove the animal

        // Running takes time
        updateGameTime(survival, 0.5) // Running takes 30 minutes
        updateSurvivalStats(survival)

        saveUsers(users)
        saveIsland(islandData)

        await conn.sendMessage(m.chat, {
          text:
            `🏃 You run away from the ${animal.emoji} ${animal.name} and manage to escape!\n\n` +
            describeLocation(survival, islandData, sender),
        })

        return
      } else {
        // Failed to escape, animal attacks
        const animalDamage = Math.max(1, animal.damage)

        // Take damage
        survival.health -= animalDamage

        // Check if player is defeated
        if (survival.health <= 0) {
          // Player died
          await conn.sendMessage(m.chat, {
            text:
              `🏃 You try to run away from the ${animal.emoji} ${animal.name} but it catches you!\n\n` +
              `💥 The ${animal.emoji} ${animal.name} attacks you and deals ${animalDamage} damage!\n\n` +
              `💀 *YOU DIED* 💀\n` +
              `You survived for ${survival.gameTime.days} days and ${survival.gameTime.hours} hours on the island.\n\n` +
              `🎮 *GAME OVER* 🎮\n` +
              `Use .survival start [username] to play again.`,
          })

          // Reset player
          users[sender].survival = {}
          delete islandData.players[sender]

          saveUsers(users)
          saveIsland(islandData)

          return
        }

        // Running takes time
        updateGameTime(survival, 0.5) // Running takes 30 minutes
        updateSurvivalStats(survival)

        saveUsers(users)
        saveIsland(islandData)

        await conn.sendMessage(m.chat, {
          text:
            `🏃 You try to run away from the ${animal.emoji} ${animal.name} but it catches you!\n\n` +
            `💥 The ${animal.emoji} ${animal.name} attacks you and deals ${animalDamage} damage!\n\n` +
            `❤️ Your HP: ${survival.health}/${survival.maxHealth}\n\n` +
            `Use .survival fight to fight back or .survival run to try escaping again.`,
        })

        return
      }
    }

    // Hunt non-hostile animals
    if (subCommand === "hunt") {
      const survival = users[sender].survival
      const location = survival.currentLocation

      // Check if there are animals to hunt
      if (location.animals.length === 0) {
        return m.reply(`⚠️ There are no animals to hunt in this area.`)
      }

      const animal = location.animals[0] // Hunt the first animal

      // Check if animal is non-hostile
      if (animal.hostile) {
        return m.reply(
          `⚠️ ${animal.emoji} ${animal.name} is hostile. Use .survival fight to fight it or .survival run to escape.`,
        )
      }

      // Calculate success chance based on weapon
      const weaponDamage = survival.equippedWeapon ? ITEMS[survival.equippedWeapon].damage : 0
      const successChance = 0.4 + weaponDamage * 0.05 // Base 40% + 5% per weapon damage

      const huntSuccess = Math.random() < successChance

      if (huntSuccess) {
        // Successfully hunted
        location.animals.shift() // Remove the animal

        // Add meat and hide to inventory
        for (let i = 0; i < animal.meat; i++) {
          survival.inventory.push("🥩")
        }

        for (let i = 0; i < animal.hide; i++) {
          survival.inventory.push("🧵")
        }

        // Hunting takes time
        updateGameTime(survival, 1) // Hunting takes 1 hour
        updateSurvivalStats(survival)

        saveUsers(users)
        saveIsland(islandData)

        await conn.sendMessage(m.chat, {
          text:
            `🏹 You successfully hunted the ${animal.emoji} ${animal.name}!\n` +
            `You collected ${animal.meat}x 🥩 Meat and ${animal.hide}x 🧵 Hide.\n\n` +
            describeLocation(survival, islandData, sender),
        })

        return
      } else {
        // Failed to hunt, animal escapes
        location.animals.shift() // Animal runs away

        // Hunting takes time
        updateGameTime(survival, 1) // Hunting takes 1 hour
        updateSurvivalStats(survival)

        saveUsers(users)
        saveIsland(islandData)

        await conn.sendMessage(m.chat, {
          text:
            `🏹 You tried to hunt the ${animal.emoji} ${animal.name}, but it got away!\n\n` +
            describeLocation(survival, islandData, sender),
        })

        return
      }
    }

    // Rest/sleep
    if (subCommand === "rest" || subCommand === "sleep") {
      const survival = users[sender].survival
      const location = survival.currentLocation

      // Check if it's night time or if there's shelter
      const isNight = survival.gameTime.hours >= 18 || survival.gameTime.hours < 6
      const hasShelter = location.structures.some((s) => ["⛺", "🏠", "🕳️"].includes(s)) || location.type === "cave"

      if (!isNight && !hasShelter) {
        return m.reply(
          `⚠️ It's not night time yet and you don't have shelter here. You can only rest at night or if you have shelter.`,
        )
      }

      // Calculate rest duration
      let restHours = 0

      if (isNight) {
        // Rest until morning (6 AM)
        if (survival.gameTime.hours < 6) {
          restHours = 6 - survival.gameTime.hours
        } else {
          restHours = 24 - survival.gameTime.hours + 6
        }
      } else {
        // Just a short rest during day (2 hours)
        restHours = 2
      }

      // Calculate health recovery
      const healthRecovery = hasShelter ? 20 : 10 // More recovery with shelter
      survival.health = Math.min(survival.maxHealth, survival.health + healthRecovery)

      // Update game time
      updateGameTime(survival, restHours)

      // Hunger and thirst still decrease while resting, but at a slower rate
      survival.hunger = Math.max(0, survival.hunger - HUNGER_DECREASE_RATE * restHours * 0.5)
      survival.thirst = Math.max(0, survival.thirst - THIRST_DECREASE_RATE * restHours * 0.5)

      // Check for random events during sleep
      let eventText = ""
      const eventChance = Math.random()

      if (!hasShelter && eventChance < 0.3) {
        // Animal attack while sleeping without shelter
        const animalTypes = Object.keys(ANIMALS).filter((key) => ANIMALS[key].hostile)
        const animalEmoji = animalTypes[Math.floor(Math.random() * animalTypes.length)]
        const animal = ANIMALS[animalEmoji]

        const damage = Math.floor(animal.damage * 0.7) // Reduced damage
        survival.health = Math.max(0, survival.health - damage)

        eventText = `⚠️ While you were sleeping, a ${animalEmoji} ${animal.name} found you and attacked! You took ${damage} damage.\n\n`

        // Check if player died
        if (survival.health <= 0) {
          await conn.sendMessage(m.chat, {
            text:
              `😴 You ${subCommand === "rest" ? "rest" : "sleep"} for ${restHours} hours...\n\n` +
              eventText +
              `💀 *YOU DIED* 💀\n` +
              `You survived for ${survival.gameTime.days} days and ${survival.gameTime.hours} hours on the island.\n\n` +
              `🎮 *GAME OVER* 🎮\n` +
              `Use .survival start [username] to play again.`,
          })

          // Reset player
          users[sender].survival = {}
          delete islandData.players[sender]

          saveUsers(users)
          saveIsland(islandData)

          return
        }
      }

      saveUsers(users)

      await conn.sendMessage(m.chat, {
        text:
          `😴 You ${subCommand === "rest" ? "rest" : "sleep"} for ${restHours} hours...\n\n` +
          eventText +
          `⏰ It's now Day ${survival.gameTime.days}, ${survival.gameTime.hours}:00\n` +
          `❤️ Health restored to ${survival.health}/${survival.maxHealth}\n` +
          `🍗 Hunger: ${Math.floor(survival.hunger)}/${survival.maxHunger}\n` +
          `💧 Thirst: ${Math.floor(survival.thirst)}/${survival.maxThirst}\n\n` +
          describeLocation(survival, islandData, sender),
      })

      return
    }

    // Call for help / use signal
    if (subCommand === "signal" || subCommand === "help" || subCommand === "rescue") {
      const survival = users[sender].survival
      const location = survival.currentLocation

      // Check if player is on the beach for better rescue chance
      const isBeach = location.type === "beach"

      // Check if player has items that can help with signaling
      const hasFlare = survival.inventory.includes("🚩")
      const hasRadio = survival.inventory.includes("📻")
      const hasFire = location.structures.includes("🔥")

      let signalMethod = ""
      let rescueChanceIncrease = 0

      if (args[1] === "flare" && hasFlare) {
        signalMethod = "flare gun"
        rescueChanceIncrease = 30

        // Remove flare from inventory
        const flareIndex = survival.inventory.indexOf("🚩")
        survival.inventory.splice(flareIndex, 1)
      } else if (args[1] === "radio" && hasRadio) {
        signalMethod = "radio"
        rescueChanceIncrease = 15

        // Radio has limited uses
        const radioItem = ITEMS["📻"]
        if (radioItem.durability <= 1) {
          // Remove radio from inventory if used up
          const radioIndex = survival.inventory.indexOf("📻")
          survival.inventory.splice(radioIndex, 1)
        } else {
          // Reduce durability
          radioItem.durability -= 1
        }
      } else if (args[1] === "fire" && hasFire) {
        signalMethod = "smoke signal from your campfire"
        rescueChanceIncrease = 10
      } else if (args[1] === "shout" || args[1] === "yell") {
        signalMethod = "shouting for help"
        rescueChanceIncrease = 2
      } else {
        // Default to waving arms if no method specified
        signalMethod = "waving your arms and shouting"
        rescueChanceIncrease = 5
      }

      // Beach location increases rescue chance
      if (isBeach) {
        rescueChanceIncrease += 5
      }

      // Update rescue chance
      survival.rescueChance += rescueChanceIncrease

      // Signaling takes time
      updateGameTime(survival, 2) // Signaling takes 2 hours
      updateSurvivalStats(survival)

      // Check if rescue happens
      const rescueRoll = Math.random() * 100
      if (rescueRoll < survival.rescueChance) {
        // Rescued!
        let rescueMethod = ""

        if (isBeach) {
          rescueMethod = Math.random() < 0.5 ? "helicopter" : "boat"
        } else {
          rescueMethod = "helicopter"
        }

        await conn.sendMessage(m.chat, {
          text:
            `🆘 You try to signal for help using your ${signalMethod}...\n\n` +
            `🚁 *${rescueMethod.toUpperCase()} SPOTTED!* 🚁\n\n` +
            `The ${rescueMethod} has seen your signal and is coming to rescue you!\n\n` +
            `Congratulations, ${survival.username}! You have survived for ${survival.gameTime.days} days and ${survival.gameTime.hours} hours on the island.\n\n` +
            `🎮 *GAME COMPLETED* 🎮\n` +
            `Use .survival start [username] to play again.`,
        })

        // Reset player
        users[sender].survival = {}
        delete islandData.players[sender]

        saveUsers(users)
        saveIsland(islandData)

        return
      } else {
        // No rescue yet
        survival.rescueAttempts += 1

        saveUsers(users)

        await conn.sendMessage(m.chat, {
          text:
            `🆘 You try to signal for help using your ${signalMethod}...\n\n` +
            `You wait anxiously, but no rescue arrives.\n\n` +
            `Rescue chance increased by ${rescueChanceIncrease}%\n` +
            `Current rescue chance: ${survival.rescueChance}%\n\n` +
            `Don't give up! Keep trying to signal for help or explore more of the island.\n\n` +
            describeLocation(survival, islandData, sender),
        })

        return
      }
    }

    // Check inventory
    if (subCommand === "inventory" || subCommand === "inv") {
      const survival = users[sender].survival

      // Count items
      const itemCounts = {}
      survival.inventory.forEach((item) => {
        itemCounts[item] = (itemCounts[item] || 0) + 1
      })

      // Format inventory
      let inventoryText = `🎒 *INVENTORY* 🎒\n\n`

      if (Object.keys(itemCounts).length === 0) {
        inventoryText += `Your inventory is empty.\n`
      } else {
        for (const [emoji, count] of Object.entries(itemCounts)) {
          const item = ITEMS[emoji]
          if (!item) continue // Skip unknown items

          inventoryText += `${emoji} ${item.name} (${count}x)\n`

          if (item.type === "weapon") {
            inventoryText += `   ⚔️ Damage: +${item.damage}\n`
          } else if (item.type === "clothing") {
            inventoryText += `   🧥 Warmth: +${item.warmth}\n`
          } else if (item.type === "food") {
            inventoryText += `   🍗 Hunger: +${item.hunger}\n`
          } else if (item.type === "drink") {
            inventoryText += `   💧 Thirst: +${item.thirst}\n`
          } else if (item.type === "healing") {
            inventoryText += `   ❤️ Health: +${item.health}\n`
          }
        }
      }

      // Show equipped items
      inventoryText += `\n⚔️ *EQUIPPED* ⚔️\n`

      if (survival.equippedWeapon) {
        const weapon = ITEMS[survival.equippedWeapon]
        inventoryText += `Weapon: ${survival.equippedWeapon} ${weapon.name} (+${weapon.damage} damage)\n`
      } else {
        inventoryText += `Weapon: None\n`
      }

      if (survival.equippedClothing) {
        const clothing = ITEMS[survival.equippedClothing]
        inventoryText += `Clothing: ${survival.equippedClothing} ${clothing.name} (+${clothing.warmth} warmth)\n`
      } else {
        inventoryText += `Clothing: None\n`
      }

      await conn.sendMessage(m.chat, { text: inventoryText })

      return
    }

    // Check status
    if (subCommand === "status" || subCommand === "stat") {
      const survival = users[sender].survival

      const statusText =
        `📊 *STATUS* 📊\n\n` +
        `👤 Name: ${survival.username}\n` +
        `❤️ Health: ${Math.floor(survival.health)}/${survival.maxHealth}\n` +
        `🍗 Hunger: ${Math.floor(survival.hunger)}/${survival.maxHunger}\n` +
        `💧 Thirst: ${Math.floor(survival.thirst)}/${survival.maxThirst}\n\n` +
        `⏰ Day: ${survival.gameTime.days}\n` +
        `⏰ Time: ${survival.gameTime.hours}:00\n` +
        `🔍 Locations explored: ${Object.keys(survival.visitedLocations).length}/${ISLAND_SIZE * ISLAND_SIZE}\n` +
        `🚁 Rescue chance: ${survival.rescueChance}%\n` +
        `🆘 Rescue attempts: ${survival.rescueAttempts}\n\n` +
        `🗺️ Current position: (${survival.position.x}, ${survival.position.y})\n` +
        `🏞️ Terrain: ${TERRAIN_EMOJI[survival.currentLocation.type]} ${survival.currentLocation.type}`

      await conn.sendMessage(m.chat, { text: statusText })

      return
    }

    // Show map
    if (subCommand === "map") {
      const survival = users[sender].survival

      let mapText = `🗺️ *ISLAND MAP* 🗺️\n\n`

      for (let y = 0; y < ISLAND_SIZE; y++) {
        let row = ""
        for (let x = 0; x < ISLAND_SIZE; x++) {
          const isCurrentPos = survival.position.x === x && survival.position.y === y
          const isVisited = survival.visitedLocations[`${x},${y}`]

          if (isCurrentPos) {
            row += "🟢" // Current position
          } else if (isVisited) {
            const location = islandData.map[y][x]
            row += TERRAIN_EMOJI[location.type] // Show terrain type
          } else {
            row += "⬛" // Unexplored
          }
        }
        mapText += row + "\n"
      }

      mapText +=
        `\n🟢 Your position\n` +
        `🌲 Forest\n` +
        `🏖️ Beach\n` +
        `⛰️ Mountain\n` +
        `🌊 River\n` +
        `💦 Lake\n` +
        `🕳️ Cave\n` +
        `✈️ Plane wreckage\n` +
        `🏢 Bunker\n` +
        `⬛ Unexplored`

      await conn.sendMessage(m.chat, { text: mapText })

      return
    }

    // Exit game
    if (subCommand === "exit") {
      const survival = users[sender].survival

      await conn.sendMessage(m.chat, {
        text:
          `🚪 You have exited the survival game.\n\n` +
          `You survived for ${survival.gameTime.days} days and ${survival.gameTime.hours} hours on the island.\n\n` +
          `Use .survival start [username] to play again.`,
      })

      // Reset player
      users[sender].survival = {}
      delete islandData.players[sender]

      saveUsers(users)
      saveIsland(islandData)

      return
    }

    // Help command
    if (subCommand === "cmd" || !subCommand) {
      const helpText =
        `🏝️ *ISLAND SURVIVAL HELP* 🏝️\n\n` +
        `*.survival start [username]* - Start a new game\n` +
        `*.survival continue* - Continue from prologue\n` +
        `*.survival move [direction]* - Move (north/east/south/west)\n` +
        `*.survival explore* - Explore current area\n` +
        `*.survival search/loot* - Search bodies for items\n` +
        `*.survival take/collect* - Collect items in the area\n` +
        `*.survival craft [emoji]* - Craft items or structures\n` +
        `*.survival use [emoji]* - Use food, water, or medical supplies\n` +
        `*.survival equip [emoji]* - Equip weapons or clothing\n` +
        `*.survival fight* - Fight hostile animals\n` +
        `*.survival run* - Run from hostile animals\n` +
        `*.survival hunt* - Hunt non-hostile animals\n` +
        `*.survival rest/sleep* - Rest to recover health\n` +
        `*.survival signal [method]* - Signal for rescue (flare/radio/fire/shout)\n` +
        `*.survival inventory/inv* - Check inventory\n` +
        `*.survival status/stat* - Check player status\n` +
        `*.survival map* - View island map\n` +
        `*.survival exit* - Exit the game\n\n` +
        `Good luck surviving! 🏝️`

      await conn.sendMessage(m.chat, { text: helpText })

      return
    }

    // Unknown command
    return m.reply(`⚠️ Unknown command! Use .survival help for assistance.`)
  } catch (error) {
    console.error("Error in survival game:", error)
    m.reply("An error occurred while processing the command!")
  }
}

// Update game time
function updateGameTime(survival, hours) {
  survival.gameTime.totalHours += hours
  survival.gameTime.hours += hours

  // Handle day change
  while (survival.gameTime.hours >= 24) {
    survival.gameTime.hours -= 24
    survival.gameTime.days += 1
  }
}

// Update survival stats (hunger, thirst, health)
function updateSurvivalStats(survival) {
  // Decrease hunger and thirst based on time passed
  survival.hunger = Math.max(0, survival.hunger - HUNGER_DECREASE_RATE * 1) // 1 hour
  survival.thirst = Math.max(0, survival.thirst - THIRST_DECREASE_RATE * 1) // 1 hour

  // If hunger or thirst are at 0, decrease health
  if (survival.hunger <= 0 || survival.thirst <= 0) {
    survival.health = Math.max(0, survival.health - HEALTH_DECREASE_RATE)
  }

  // Check if player died
  if (survival.health <= 0) {
    survival.died = true
  }
}

// Check for random events
function checkForRandomEvents(survival, islandData, sender) {
  // Only trigger events occasionally
  if (Math.random() > 0.2) return false

  const eventType = Math.random()

  // Rescue helicopter/ship event (10% chance if rescue chance > 0)
  if (eventType < 0.1 && survival.rescueChance > 0) {
    const rescueRoll = Math.random() * 100

    if (rescueRoll < survival.rescueChance * 0.5) {
      // Half the normal chance
      // Rescue spotted but player needs to signal
      const isBeach = survival.currentLocation.type === "beach"
      const rescueMethod = isBeach && Math.random() < 0.5 ? "ship" : "helicopter"

      conn.sendMessage(sender + "@s.whatsapp.net", {
        text:
          `🚨 *RESCUE OPPORTUNITY!* 🚨\n\n` +
          `You spot a ${rescueMethod} in the distance! This might be your chance to be rescued!\n\n` +
          `Use .survival signal [method] to try to get their attention!\n` +
          `Methods: flare, radio, fire, shout`,
      })

      return true
    }
  }

  // Weather event (20% chance)
  else if (eventType < 0.3) {
    const weatherTypes = ["rain", "storm", "fog", "heat"]
    const weather = weatherTypes[Math.floor(Math.random() * weatherTypes.length)]

    let weatherEffect = ""

    switch (weather) {
      case "rain":
        // Rain reduces thirst but can make you cold
        survival.thirst = Math.min(survival.maxThirst, survival.thirst + 20)

        if (!survival.equippedClothing) {
          survival.health = Math.max(0, survival.health - 5)
          weatherEffect = `You're getting wet and cold without proper clothing. (-5 health)\n`
        }

        conn.sendMessage(sender + "@s.whatsapp.net", {
          text:
            `🌧️ It starts to rain heavily.\n\n` +
            `You collect some rainwater. (+20 thirst)\n` +
            weatherEffect +
            `The rain continues for a few hours before stopping.`,
        })

        return true

      case "storm":
        // Storm is dangerous without shelter
        const hasShelter =
          survival.currentLocation.structures.some((s) => ["⛺", "🏠"].includes(s)) ||
          survival.currentLocation.type === "cave"

        if (!hasShelter) {
          survival.health = Math.max(0, survival.health - 15)
          weatherEffect = `Without shelter, you're exposed to the elements. (-15 health)\n`

          if (survival.health <= 0) {
            conn.sendMessage(sender + "@s.whatsapp.net", {
              text:
                `🌩️ A violent storm hits the island!\n\n` +
                weatherEffect +
                `💀 *YOU DIED* 💀\n` +
                `You survived for ${survival.gameTime.days} days and ${survival.gameTime.hours} hours on the island.\n\n` +
                `🎮 *GAME OVER* 🎮\n` +
                `Use .survival start [username] to play again.`,
            })

            // Reset player
            users[sender].survival = {}
            delete islandData.players[sender]

            saveUsers(users)
            saveIsland(islandData)

            return true
          }
        } else {
          weatherEffect = `Thankfully, you have shelter and remain safe during the storm.\n`
        }

        conn.sendMessage(sender + "@s.whatsapp.net", {
          text:
            `🌩️ A violent storm hits the island!\n\n` +
            weatherEffect +
            `The storm rages for several hours before passing.`,
        })

        return true

      case "fog":
        // Fog makes it harder to be rescued
        survival.rescueChance = Math.max(0, survival.rescueChance - 5)

        conn.sendMessage(sender + "@s.whatsapp.net", {
          text:
            `🌫️ A thick fog descends on the island.\n\n` +
            `Visibility is severely reduced. Rescue chance decreased by 5%.\n` +
            `Current rescue chance: ${survival.rescueChance}%\n\n` +
            `The fog will likely clear in a few hours.`,
        })

        return true

      case "heat":
        // Heat wave increases thirst
        survival.thirst = Math.max(0, survival.thirst - 15)

        weatherEffect = `You're losing water faster due to the heat. (-15 thirst)\n`

        if (survival.thirst <= 0) {
          survival.health = Math.max(0, survival.health - 10)
          weatherEffect += `You're becoming dehydrated. (-10 health)\n`

          if (survival.health <= 0) {
            conn.sendMessage(sender + "@s.whatsapp.net", {
              text:
                `☀️ A scorching heat wave hits the island!\n\n` +
                weatherEffect +
                `💀 *YOU DIED* 💀\n` +
                `You survived for ${survival.gameTime.days} days and ${survival.gameTime.hours} hours on the island.\n\n` +
                `🎮 *GAME OVER* 🎮\n` +
                `Use .survival start [username] to play again.`,
            })

            // Reset player
            users[sender].survival = {}
            delete islandData.players[sender]

            saveUsers(users)
            saveIsland(islandData)

            return true
          }
        }

        conn.sendMessage(sender + "@s.whatsapp.net", {
          text:
            `☀️ A scorching heat wave hits the island!\n\n` +
            weatherEffect +
            `Find water quickly or use what you have in your inventory.`,
        })

        return true
    }
  }

  return false
}

// Describe the current location
function describeLocation(survival, islandData, sender) {
  const location = survival.currentLocation
  const { x, y } = survival.position

  let description = `🧭 *POSITION: (${x}, ${y})* 🧭\n\n`

  // Time of day
  const timeOfDay = getTimeOfDay(survival.gameTime.hours)
  description += `⏰ Day ${survival.gameTime.days}, ${survival.gameTime.hours}:00 (${timeOfDay})\n\n`

  // Location description
  description += `${TERRAIN_EMOJI[location.type]} ${location.description}\n\n`

  // Items in the area
  if (location.items.length > 0) {
    description += `🔍 *ITEMS:* ${location.items.join(", ")}\n`
    description += `Use .survival take to collect them.\n\n`
  }

  // Bodies in the area
  if (location.bodies.length > 0 || location.specialBody) {
    const bodyCount = location.bodies.length + (location.specialBody ? 1 : 0)
    description += `⚰️ *BODIES:* You see ${bodyCount} ${bodyCount === 1 ? "body" : "bodies"} nearby.\n`
    description += `Use .survival search to look for useful items.\n\n`
  }

  // Animals in the area
  if (location.animals.length > 0) {
    description += `🐾 *ANIMALS:*\n`

    location.animals.forEach((animal) => {
      description += `${animal.emoji} ${animal.name} - ${animal.hostile ? "⚠️ Hostile" : "🦌 Passive"}\n`
    })

    description += `\n`
  }

  // Structures in the area
  if (location.structures.length > 0) {
    description += `🏗️ *STRUCTURES:*\n`

    location.structures.forEach((structureEmoji) => {
      const structure = STRUCTURES[structureEmoji]
      description += `${structureEmoji} ${structure.name}\n`
    })

    description += `\n`
  }

  // Available directions
  description += `🚶 *DIRECTIONS:*\n`

  if (y > 0) description += `${DIRECTION_EMOJI.north} North\n`
  if (x < ISLAND_SIZE - 1) description += `${DIRECTION_EMOJI.east} East\n`
  if (y < ISLAND_SIZE - 1) description += `${DIRECTION_EMOJI.south} South\n`
  if (x > 0) description += `${DIRECTION_EMOJI.west} West\n`

  description += `\n`

  // Player status
  description += `📊 *STATUS:* 📊\n`
  description += `❤️ Health: ${Math.floor(survival.health)}/${survival.maxHealth}\n`
  description += `🍗 Hunger: ${Math.floor(survival.hunger)}/${survival.maxHunger}\n`
  description += `💧 Thirst: ${Math.floor(survival.thirst)}/${survival.maxThirst}\n`

  return description
}

// Get time of day description
function getTimeOfDay(hour) {
  if (hour >= 5 && hour < 8) return "Early Morning"
  if (hour >= 8 && hour < 12) return "Morning"
  if (hour >= 12 && hour < 14) return "Noon"
  if (hour >= 14 && hour < 17) return "Afternoon"
  if (hour >= 17 && hour < 20) return "Evening"
  if (hour >= 20 && hour < 22) return "Dusk"
  return "Night"
}

handler.help = ["survival"]
handler.tags = ["rpg", "game"]
handler.command = ["survival", "sv"]
handler.group = true;
export default handler
