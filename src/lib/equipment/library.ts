import { EquipmentItem } from './types'

// Real amusement ride data from Final_Ride_Dimensions_2025.csv
// This replaces all default equipment with actual ride specifications
export const equipmentLibrary: EquipmentItem[] = [
  {
    id: 'bounce',
    name: 'Bounce',
    category: 'rides',
    dimensions: {"shape":"rectangle","width":20,"height":25},
    clearance: {"type":"rectangular","all":10},
    color: '#FF6B6B',
    description: "Bounce - Professional amusement ride",
    specifications: {"capacity":50,"weight":25000},
    tags: ["amusement","ride","professional"],
    // Operational specifications
    weight: 25000,
    capacity: 50,
    turnAroundTime: 3,
    verticalHeight: 20,
    rideClearing: 10
  },
  {
    id: 'century-wheel',
    name: 'Century Wheel',
    category: 'rides',
    dimensions: {"shape":"circle","radius":26.5},
    clearance: {"type":"rectangular","all":12},
    color: '#4ECDC4',
    description: "Century Wheel - Professional amusement ride",
    specifications: {"capacity":186,"weight":92750},
    tags: ["amusement","ride","professional"],
    // Operational specifications
    weight: 92750,
    capacity: 186,
    turnAroundTime: 3,
    verticalHeight: 42,
    rideClearing: 12
  },
  {
    id: 'cliffhanger',
    name: 'Cliffhanger',
    category: 'rides',
    dimensions: {"shape":"rectangle","width":64,"height":70},
    clearance: {"type":"rectangular","all":27},
    color: '#45B7D1',
    description: "Cliffhanger - Professional amusement ride",
    specifications: {"capacity":448,"weight":224000},
    tags: ["amusement","ride","professional"],
    // Operational specifications
    weight: 224000,
    capacity: 448,
    turnAroundTime: 3,
    verticalHeight: 56,
    rideClearing: 27
  },
  {
    id: 'crystal-lils',
    name: 'Crystal Lils',
    category: 'rides',
    dimensions: {"shape":"rectangle","width":70,"height":18},
    clearance: {"type":"rectangular","all":6},
    color: '#96CEB4',
    description: "Crystal Lils - Professional amusement ride - 9-48-13>",
    specifications: {"capacity":126,"weight":63000},
    tags: ["amusement","ride","professional"],
    // Operational specifications
    weight: 63000,
    capacity: 126,
    turnAroundTime: 3,
    verticalHeight: 56,
    rideClearing: 6
  },
  {
    id: 'dizzy-dragon',
    name: 'Dizzy Dragon',
    category: 'rides',
    dimensions: {"shape":"rectangle","width":30,"height":33},
    clearance: {"type":"rectangular","all":18},
    color: '#FFEAA7',
    description: "Dizzy Dragon - Professional amusement ride - (8'6)",
    specifications: {"capacity":99,"weight":49500},
    tags: ["amusement","ride","professional"],
    // Operational specifications
    weight: 49500,
    capacity: 99,
    turnAroundTime: 3,
    verticalHeight: 26,
    rideClearing: 18
  },
  {
    id: 'dragon-wagon',
    name: 'Dragon Wagon',
    category: 'rides',
    dimensions: {"shape":"rectangle","width":70,"height":30},
    clearance: {"type":"rectangular","all":3},
    color: '#DDA0DD',
    description: "Dragon Wagon - Professional amusement ride - <22-28-17",
    specifications: {"capacity":210,"weight":105000},
    tags: ["amusement","ride","professional"],
    // Operational specifications
    weight: 105000,
    capacity: 210,
    turnAroundTime: 3,
    verticalHeight: 56,
    rideClearing: 3
  },
  {
    id: 'euro-wheel',
    name: 'Euro Wheel',
    category: 'rides',
    dimensions: {"shape":"circle","radius":24},
    clearance: {"type":"rectangular","all":7},
    color: '#98D8C8',
    description: "Euro Wheel - Professional amusement ride",
    specifications: {"capacity":106,"weight":52800},
    tags: ["amusement","ride","professional"],
    // Operational specifications
    weight: 52800,
    capacity: 106,
    turnAroundTime: 3,
    verticalHeight: 38,
    rideClearing: 7
  },
  {
    id: 'farm-train',
    name: 'Farm Train',
    category: 'rides',
    dimensions: {"shape":"rectangle","width":60,"height":30},
    clearance: {"type":"rectangular","all":21},
    color: '#F7DC6F',
    description: "Farm Train - Professional amusement ride - <14-32-14",
    specifications: {"capacity":180,"weight":90000},
    tags: ["amusement","ride","professional"],
    // Operational specifications
    weight: 90000,
    capacity: 180,
    turnAroundTime: 3,
    verticalHeight: 48,
    rideClearing: 21
  },
  {
    id: 'freak-out',
    name: 'Freak Out',
    category: 'rides',
    dimensions: {"shape":"rectangle","width":48,"height":56},
    clearance: {"type":"rectangular","all":14},
    color: '#BB8FCE',
    description: "Freak Out - Professional amusement ride - >",
    specifications: {"capacity":269,"weight":134400},
    tags: ["amusement","ride","professional"],
    // Operational specifications
    weight: 134400,
    capacity: 269,
    turnAroundTime: 3,
    verticalHeight: 45,
    rideClearing: 14
  },
  {
    id: 'fury',
    name: 'Fury',
    category: 'rides',
    dimensions: {"shape":"rectangle","width":53,"height":30},
    clearance: {"type":"rectangular","all":10},
    color: '#85C1E9',
    description: "Fury - Professional amusement ride - <17-53-17> OR-5'",
    specifications: {"capacity":159,"weight":79500},
    tags: ["amusement","ride","professional"],
    // Operational specifications
    weight: 79500,
    capacity: 159,
    turnAroundTime: 3,
    verticalHeight: 42,
    rideClearing: 10
  },
  {
    id: 'himalaya',
    name: 'Himalaya',
    category: 'rides',
    dimensions: {"shape":"rectangle","width":55,"height":46},
    clearance: {"type":"rectangular","all":22},
    color: '#F8C471',
    description: "Himalaya - Professional amusement ride - BS-16'",
    specifications: {"capacity":253,"weight":126500},
    tags: ["amusement","ride","professional"],
    // Operational specifications
    weight: 126500,
    capacity: 253,
    turnAroundTime: 3,
    verticalHeight: 44,
    rideClearing: 22
  },
  {
    id: 'magic-maze',
    name: 'Magic Maze',
    category: 'rides',
    dimensions: {"shape":"rectangle","width":70,"height":18},
    clearance: {"type":"rectangular","all":6},
    color: '#82E0AA',
    description: "Magic Maze - Professional amusement ride - 9-48-13>",
    specifications: {"capacity":126,"weight":63000},
    tags: ["amusement","ride","professional"],
    // Operational specifications
    weight: 63000,
    capacity: 126,
    turnAroundTime: 3,
    verticalHeight: 56,
    rideClearing: 6
  },
  {
    id: 'mgr',
    name: 'MGR',
    category: 'rides',
    dimensions: {"shape":"rectangle","width":42,"height":42},
    clearance: {"type":"rectangular","all":24},
    color: '#F1948A',
    description: "MGR - Professional amusement ride",
    specifications: {"capacity":176,"weight":88200},
    tags: ["amusement","ride","professional"],
    // Operational specifications
    weight: 88200,
    capacity: 176,
    turnAroundTime: 3,
    verticalHeight: 34,
    rideClearing: 24
  },
  {
    id: 'mini-mgr',
    name: 'Mini MGR',
    category: 'rides',
    dimensions: {"shape":"rectangle","width":22,"height":25},
    clearance: {"type":"rectangular","all":14},
    color: '#85C1E9',
    description: "Mini MGR - Professional amusement ride",
    specifications: {"capacity":55,"weight":27500},
    tags: ["amusement","ride","professional"],
    // Operational specifications
    weight: 27500,
    capacity: 55,
    turnAroundTime: 3,
    verticalHeight: 20,
    rideClearing: 14
  },
  {
    id: 'motorcycles',
    name: 'Motorcycles',
    category: 'rides',
    dimensions: {"shape":"rectangle","width":30,"height":33},
    clearance: {"type":"rectangular","all":18},
    color: '#D7BDE2',
    description: "Motorcycles - Professional amusement ride",
    specifications: {"capacity":99,"weight":49500},
    tags: ["amusement","ride","professional"],
    // Operational specifications
    weight: 49500,
    capacity: 99,
    turnAroundTime: 3,
    verticalHeight: 26,
    rideClearing: 18
  },
  {
    id: 'raiders',
    name: 'Raiders',
    category: 'rides',
    dimensions: {"shape":"rectangle","width":60,"height":18},
    clearance: {"type":"rectangular","all":6},
    color: '#A3E4D7',
    description: "Raiders - Professional amusement ride - 16-28-24>",
    specifications: {"capacity":108,"weight":54000},
    tags: ["amusement","ride","professional"],
    // Operational specifications
    weight: 54000,
    capacity: 108,
    turnAroundTime: 3,
    verticalHeight: 48,
    rideClearing: 6
  },
  {
    id: 'ring',
    name: 'Ring',
    category: 'rides',
    dimensions: {"shape":"rectangle","width":60,"height":60},
    clearance: {"type":"rectangular","all":16},
    color: '#F9E79F',
    description: "Ring - Professional amusement ride - 7-46-7>",
    specifications: {"capacity":360,"weight":180000},
    tags: ["amusement","ride","professional"],
    // Operational specifications
    weight: 180000,
    capacity: 360,
    turnAroundTime: 3,
    verticalHeight: 48,
    rideClearing: 16
  },
  {
    id: 'rockstar',
    name: 'Rockstar',
    category: 'rides',
    dimensions: {"shape":"rectangle","width":50,"height":24},
    clearance: {"type":"rectangular","all":10},
    color: '#D5A6BD',
    description: "Rockstar - Professional amusement ride - 22-50-10> BS-6'",
    specifications: {"capacity":120,"weight":60000},
    tags: ["amusement","ride","professional"],
    // Operational specifications
    weight: 60000,
    capacity: 120,
    turnAroundTime: 3,
    verticalHeight: 40,
    rideClearing: 10
  },
  {
    id: 'sand-storm',
    name: 'Sand Storm',
    category: 'rides',
    dimensions: {"shape":"rectangle","width":50,"height":24},
    clearance: {"type":"rectangular","all":10},
    color: '#AED6F1',
    description: "Sand Storm - Professional amusement ride - 20-48-56>",
    specifications: {"capacity":120,"weight":60000},
    tags: ["amusement","ride","professional"],
    // Operational specifications
    weight: 60000,
    capacity: 120,
    turnAroundTime: 3,
    verticalHeight: 40,
    rideClearing: 10
  },
  {
    id: 'sizzler',
    name: 'Sizzler',
    category: 'rides',
    dimensions: {"shape":"rectangle","width":60,"height":60},
    clearance: {"type":"rectangular","all":10},
    color: '#A9DFBF',
    description: "Sizzler - Professional amusement ride",
    specifications: {"capacity":360,"weight":180000},
    tags: ["amusement","ride","professional"],
    // Operational specifications
    weight: 180000,
    capacity: 360,
    turnAroundTime: 3,
    verticalHeight: 48,
    rideClearing: 10
  },
  {
    id: 'slide',
    name: 'Slide',
    category: 'rides',
    dimensions: {"shape":"rectangle","width":20,"height":105},
    clearance: {"type":"rectangular","all":4},
    color: '#F5B7B1',
    description: "Slide - Professional amusement ride - 04 (Secondary clearance: 12ft)",
    specifications: {"capacity":210,"weight":105000},
    tags: ["amusement","ride","professional"],
    // Operational specifications
    weight: 105000,
    capacity: 210,
    turnAroundTime: 3,
    verticalHeight: 84,
    rideClearing: 4
  },
  {
    id: 'speedway',
    name: 'Speedway',
    category: 'rides',
    dimensions: {"shape":"rectangle","width":55,"height":22},
    clearance: {"type":"rectangular","all":10},
    color: '#D2B4DE',
    description: "Speedway - Professional amusement ride - <7-24-7",
    specifications: {"capacity":121,"weight":60500},
    tags: ["amusement","ride","professional"],
    // Operational specifications
    weight: 60500,
    capacity: 121,
    turnAroundTime: 3,
    verticalHeight: 44,
    rideClearing: 10
  },
  {
    id: 'starship',
    name: 'Starship',
    category: 'rides',
    dimensions: {"shape":"rectangle","width":56,"height":40},
    clearance: {"type":"rectangular","all":10},
    color: '#A9CCE3',
    description: "Starship - Professional amusement ride - <4-46-6 BS-13'",
    specifications: {"capacity":224,"weight":112000},
    tags: ["amusement","ride","professional"],
    // Operational specifications
    weight: 112000,
    capacity: 224,
    turnAroundTime: 3,
    verticalHeight: 45,
    rideClearing: 10
  },
  {
    id: 'swings',
    name: 'Swings',
    category: 'rides',
    dimensions: {"shape":"rectangle","width":30,"height":30},
    clearance: {"type":"rectangular","all":10},
    color: '#A3E4D7',
    description: "Swings - Professional amusement ride",
    specifications: {"capacity":90,"weight":45000},
    tags: ["amusement","ride","professional"],
    // Operational specifications
    weight: 45000,
    capacity: 90,
    turnAroundTime: 3,
    verticalHeight: 24,
    rideClearing: 10
  },
  {
    id: 'tornado',
    name: 'Tornado',
    category: 'rides',
    dimensions: {"shape":"rectangle","width":45,"height":30},
    clearance: {"type":"rectangular","all":10},
    color: '#F7DC6F',
    description: "Tornado - Professional amusement ride",
    specifications: {"capacity":135,"weight":67500},
    tags: ["amusement","ride","professional"],
    // Operational specifications
    weight: 67500,
    capacity: 135,
    turnAroundTime: 3,
    verticalHeight: 36,
    rideClearing: 10
  },
  {
    id: 'vertigo',
    name: 'Vertigo',
    category: 'rides',
    dimensions: {"shape":"rectangle","width":80,"height":40},
    clearance: {"type":"rectangular","all":10},
    color: '#D7BDE2',
    description: "Vertigo - Professional amusement ride",
    specifications: {"capacity":320,"weight":160000},
    tags: ["amusement","ride","professional"],
    // Operational specifications
    weight: 160000,
    capacity: 320,
    turnAroundTime: 3,
    verticalHeight: 64,
    rideClearing: 10
  },
  {
    id: 'wacky-shack',
    name: 'Wacky Shack',
    category: 'rides',
    dimensions: {"shape":"rectangle","width":40,"height":16},
    clearance: {"type":"rectangular","all":9},
    color: '#AED6F1',
    description: "Wacky Shack - Professional amusement ride - 13> (Secondary clearance: 50'6ft)",
    specifications: {"capacity":64,"weight":32000},
    tags: ["amusement","ride","professional"],
    // Operational specifications
    weight: 32000,
    capacity: 64,
    turnAroundTime: 3,
    verticalHeight: 32,
    rideClearing: 9
  },
  {
    id: 'zero-gravity',
    name: 'Zero Gravity',
    category: 'rides',
    dimensions: {"shape":"rectangle","width":70,"height":30},
    clearance: {"type":"rectangular","all":10},
    color: '#A9DFBF',
    description: "Zero Gravity - Professional amusement ride",
    specifications: {"capacity":210,"weight":105000},
    tags: ["amusement","ride","professional"],
    // Operational specifications
    weight: 105000,
    capacity: 210,
    turnAroundTime: 3,
    verticalHeight: 56,
    rideClearing: 10
  },
  {
    id: 'zipper',
    name: 'Zipper',
    category: 'rides',
    dimensions: {"shape":"rectangle","width":56,"height":60},
    clearance: {"type":"rectangular","all":13},
    color: '#F5B7B1',
    description: "Zipper - Professional amusement ride - 21-8-21(3)",
    specifications: {"capacity":336,"weight":168000},
    tags: ["amusement","ride","professional"],
    // Operational specifications
    weight: 168000,
    capacity: 336,
    turnAroundTime: 3,
    verticalHeight: 48,
    rideClearing: 13
  }
]

// Create organized library with categories (only rides category now)
export const organizedLibrary: Record<string, EquipmentItem[]> = {
  'rides': equipmentLibrary.filter(item => item.category === 'rides')
}

// Search function
export function searchEquipment(query: string): EquipmentItem[] {
  const searchTerm = query.toLowerCase()
  return equipmentLibrary.filter(item => 
    item.name.toLowerCase().includes(searchTerm) ||
    item.description?.toLowerCase().includes(searchTerm) ||
    item.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
  )
}
