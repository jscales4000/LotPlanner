import { EquipmentItem, EquipmentLibrary } from './types'

export const equipmentLibrary: EquipmentItem[] = [
  // RIDES CATEGORY
  {
    id: 'freak-out',
    name: 'Freak-Out',
    category: 'rides',
    dimensions: { shape: 'rectangle', width: 40, height: 40 },
    clearance: { all: 10 },
    color: '#FF6B6B',
    description: 'High-intensity spinning ride with multiple arms',
    specifications: { capacity: 24, weight: 15000 },
    tags: ['thrill', 'spinning', 'outdoor'],
    // New operational specification fields
    weight: 15000,
    capacity: 24,
    turnAroundTime: 3,
    verticalHeight: 45,
    rideClearing: 25 // 25ft clearance zone for safety
  },
  {
    id: 'merry-go-round',
    name: 'Merry Go Round',
    category: 'rides',
    dimensions: { shape: 'circle', radius: 25 },
    clearance: { all: 8 },
    color: '#FFD93D',
    description: 'Classic carousel with painted horses',
    specifications: { capacity: 32, weight: 12000 },
    tags: ['family', 'classic', 'outdoor'],
    // New operational specification fields
    weight: 12000,
    capacity: 32,
    turnAroundTime: 2,
    verticalHeight: 20,
    rideClearing: 15 // 15ft clearance zone for safety
  },
  {
    id: 'himalaya',
    name: 'Himalaya',
    category: 'rides',
    dimensions: { shape: 'circle', radius: 30 },
    clearance: { all: 12 },
    color: '#4ECDC4',
    description: 'Fast-spinning circular ride with music',
    specifications: { capacity: 40, weight: 18000 },
    tags: ['thrill', 'spinning', 'music'],
    // New operational specification fields
    weight: 18000,
    capacity: 40,
    turnAroundTime: 4,
    verticalHeight: 25,
    rideClearing: 20 // 20ft clearance zone for safety
  },
  {
    id: 'popper',
    name: 'Popper',
    category: 'kiddy-rides',
    dimensions: { shape: 'rectangle', width: 15, height: 20 },
    clearance: { all: 6 },
    color: '#95E1D3',
    description: 'Gentle bouncing ride for children',
    specifications: { capacity: 12, weight: 3500 },
    tags: ['kids', 'gentle', 'bouncing'],
    // New operational specification fields
    weight: 3500,
    capacity: 12,
    turnAroundTime: 1.5,
    verticalHeight: 8,
    rideClearing: 10 // 10ft clearance zone for safety
  },
  {
    id: 'tilt-a-whirl',
    name: 'Tilt-A-Whirl',
    category: 'rides',
    dimensions: { shape: 'circle', radius: 22 },
    clearance: { all: 8 },
    color: '#A8E6CF',
    description: 'Classic spinning ride with individual cars',
    specifications: { capacity: 21, weight: 8500 },
    tags: ['family', 'spinning', 'classic'],
    // New operational specification fields
    weight: 8500,
    capacity: 21,
    turnAroundTime: 2.5,
    verticalHeight: 15,
    rideClearing: 12 // 12ft clearance zone for safety
  },
  // EQUIPMENT CATEGORY
  {
    id: 'chair-folding',
    name: 'Folding Chair',
    category: 'equipment',
    dimensions: { shape: 'rectangle', width: 1.5, height: 3 },
    clearance: { all: 0.5 },
    color: '#8B4513',
    description: 'Standard folding chair for events',
    specifications: { capacity: 1, weight: 8 },
    tags: ['portable', 'indoor', 'outdoor']
  },
  {
    id: 'chair-plastic',
    name: 'Plastic Chair',
    category: 'equipment',
    dimensions: { shape: 'rectangle', width: 1.5, height: 2.5 },
    clearance: { all: 0.5 },
    color: '#4A90E2',
    description: 'Lightweight plastic chair',
    specifications: { capacity: 1, weight: 5 },
    tags: ['lightweight', 'outdoor', 'stackable']
  },
  {
    id: 'table-round-4ft',
    name: 'Round Table (4ft)',
    category: 'equipment',
    dimensions: { shape: 'circle', radius: 2 },
    clearance: { all: 1.5 },
    color: '#D2691E',
    description: 'Round table seating 4-6 people',
    specifications: { capacity: 6, weight: 45 },
    tags: ['round', 'dining', 'indoor', 'outdoor']
  },
  {
    id: 'table-round-6ft',
    name: 'Round Table (6ft)',
    category: 'equipment',
    dimensions: { shape: 'circle', radius: 3 },
    clearance: { all: 1.5 },
    color: '#D2691E',
    description: 'Round table seating 8-10 people',
    specifications: { capacity: 10, weight: 65 },
    tags: ['round', 'dining', 'indoor', 'outdoor']
  },
  {
    id: 'bench-8ft',
    name: '8ft Bench',
    category: 'equipment',
    dimensions: { shape: 'rectangle', width: 8, height: 1.5 },
    clearance: { front: 2, back: 1 },
    color: '#8B4513',
    description: '8-foot wooden bench',
    specifications: { capacity: 4, weight: 45 },
    tags: ['wooden', 'outdoor', 'long']
  },
  {
    id: 'bleacher-3tier',
    name: '3-Tier Bleacher',
    category: 'equipment',
    dimensions: { shape: 'rectangle', width: 15, height: 8 },
    clearance: { front: 3, back: 2 },
    color: '#A0A0A0',
    description: '3-tier aluminum bleacher',
    specifications: { capacity: 24, weight: 200 },
    tags: ['aluminum', 'tiered', 'large']
  },
  {
    id: 'bleacher-5tier',
    name: '5-Tier Bleacher',
    category: 'equipment',
    dimensions: { shape: 'rectangle', width: 15, height: 12 },
    clearance: { front: 4, back: 2 },
    color: '#A0A0A0',
    description: '5-tier aluminum bleacher',
    specifications: { capacity: 40, weight: 350 },
    tags: ['aluminum', 'tiered', 'large']
  },
  {
    id: 'picnic-table',
    name: 'Picnic Table',
    category: 'equipment',
    dimensions: { shape: 'rectangle', width: 6, height: 8 },
    clearance: { all: 2 },
    color: '#8B4513',
    description: 'Standard picnic table with benches',
    specifications: { capacity: 8, weight: 120 },
    tags: ['wooden', 'outdoor', 'table']
  },

  // BARRIERS CATEGORY
  {
    id: 'fence-panel-8ft',
    name: '8ft Fence Panel',
    category: 'equipment',
    dimensions: { shape: 'rectangle', width: 8, height: 0.5 },
    clearance: { all: 0.5 },
    color: '#654321',
    description: '8-foot wooden fence panel',
    specifications: { height: 6, weight: 35 },
    tags: ['wooden', 'privacy', 'temporary']
  },
  {
    id: 'chain-link-panel',
    name: 'Chain Link Panel',
    category: 'equipment',
    dimensions: { shape: 'rectangle', width: 8, height: 0.5 },
    clearance: { all: 0.5 },
    color: '#C0C0C0',
    description: '8-foot chain link fence panel',
    specifications: { height: 6, weight: 25 },
    tags: ['metal', 'see-through', 'security']
  },
  {
    id: 'crowd-barrier',
    name: 'Crowd Control Barrier',
    category: 'equipment',
    dimensions: { shape: 'rectangle', width: 8, height: 1 },
    clearance: { all: 1 },
    color: '#FFD700',
    description: 'Steel crowd control barrier',
    specifications: { height: 3.5, weight: 40 },
    tags: ['steel', 'crowd-control', 'portable']
  },
  {
    id: 'jersey-barrier',
    name: 'Jersey Barrier',
    category: 'equipment',
    dimensions: { shape: 'rectangle', width: 12, height: 2 },
    clearance: { all: 1 },
    color: '#808080',
    description: 'Concrete jersey barrier',
    specifications: { height: 3, weight: 4000 },
    tags: ['concrete', 'heavy', 'permanent']
  },
  {
    id: 'gate-single',
    name: 'Single Gate',
    category: 'equipment',
    dimensions: { shape: 'rectangle', width: 4, height: 0.5 },
    clearance: { front: 4, all: 0.5 },
    color: '#654321',
    description: '4-foot wide gate',
    specifications: { height: 6, weight: 45 },
    tags: ['wooden', 'entry', 'swing']
  },
  {
    id: 'gate-double',
    name: 'Double Gate',
    category: 'equipment',
    dimensions: { shape: 'rectangle', width: 8, height: 0.5 },
    clearance: { front: 4, all: 0.5 },
    color: '#654321',
    description: '8-foot wide double gate',
    specifications: { height: 6, weight: 80 },
    tags: ['wooden', 'entry', 'wide']
  },

  // STAGES CATEGORY
  {
    id: 'stage-4x8',
    name: '4x8 Stage Platform',
    category: 'equipment',
    dimensions: { shape: 'rectangle', width: 4, height: 8 },
    clearance: { all: 2 },
    color: '#2F4F4F',
    description: '4x8 foot stage platform',
    specifications: { height: 2, weight: 150 },
    tags: ['platform', 'modular', 'portable']
  },
  {
    id: 'stage-8x8',
    name: '8x8 Stage Platform',
    category: 'equipment',
    dimensions: { shape: 'rectangle', width: 8, height: 8 },
    clearance: { all: 3 },
    color: '#2F4F4F',
    description: '8x8 foot stage platform',
    specifications: { height: 2, weight: 250 },
    tags: ['platform', 'modular', 'large']
  },
  {
    id: 'stage-riser-2ft',
    name: '2ft Stage Riser',
    category: 'equipment',
    dimensions: { shape: 'rectangle', width: 8, height: 4 },
    clearance: { all: 1 },
    color: '#2F4F4F',
    description: '2-foot high stage riser',
    specifications: { height: 2, weight: 120 },
    tags: ['riser', 'elevation', 'modular']
  },
  {
    id: 'bandshell',
    name: 'Bandshell',
    category: 'equipment',
    dimensions: { shape: 'rectangle', width: 20, height: 15 },
    clearance: { front: 5, back: 3, left: 3, right: 3 },
    color: '#2F4F4F',
    description: 'Large outdoor bandshell',
    specifications: { height: 12, weight: 2000 },
    tags: ['permanent', 'acoustic', 'large']
  },

  // UTILITIES CATEGORY
  {
    id: 'power-box',
    name: 'Power Distribution Box',
    category: 'equipment',
    dimensions: { shape: 'rectangle', width: 2, height: 2 },
    clearance: { all: 3 },
    color: '#FF4500',
    description: 'Electrical power distribution box',
    specifications: { voltage: 240, weight: 80 },
    tags: ['electrical', 'power', 'safety']
  },
  {
    id: 'generator-small',
    name: 'Small Generator',
    category: 'equipment',
    dimensions: { shape: 'rectangle', width: 3, height: 2 },
    clearance: { all: 5 },
    color: '#FF4500',
    description: '5kW portable generator',
    specifications: { power: 5000, weight: 150 },
    tags: ['generator', 'portable', 'fuel']
  },
  {
    id: 'generator-large',
    name: 'Large Generator',
    category: 'equipment',
    dimensions: { shape: 'rectangle', width: 6, height: 4 },
    clearance: { all: 8 },
    color: '#FF4500',
    description: '20kW trailer-mounted generator',
    specifications: { power: 20000, weight: 800 },
    tags: ['generator', 'trailer', 'high-power']
  },
  {
    id: 'water-tank',
    name: 'Water Tank',
    category: 'equipment',
    dimensions: { shape: 'rectangle', width: 4, height: 4 },
    clearance: { all: 2 },
    color: '#4169E1',
    description: '500-gallon water tank',
    specifications: { capacity: 500, weight: 4200 },
    tags: ['water', 'storage', 'heavy']
  },
  {
    id: 'dumpster',
    name: 'Dumpster',
    category: 'equipment',
    dimensions: { shape: 'rectangle', width: 8, height: 6 },
    clearance: { all: 3 },
    color: '#228B22',
    description: '10-yard dumpster',
    specifications: { capacity: 10, weight: 3000 },
    tags: ['waste', 'container', 'large']
  },
  {
    id: 'porta-potty',
    name: 'Porta Potty',
    category: 'equipment',
    dimensions: { shape: 'rectangle', width: 4, height: 4 },
    clearance: { front: 3, all: 1 },
    color: '#32CD32',
    description: 'Standard portable restroom',
    specifications: { capacity: 1, weight: 200 },
    tags: ['restroom', 'portable', 'sanitation']
  },

  // VEHICLES CATEGORY
  {
    id: 'pickup-truck',
    name: 'Pickup Truck',
    category: 'equipment',
    dimensions: { shape: 'rectangle', width: 6, height: 18 },
    clearance: { all: 2 },
    color: '#B22222',
    description: 'Standard pickup truck',
    specifications: { length: 18, weight: 4500 },
    tags: ['vehicle', 'transport', 'utility']
  },
  {
    id: 'semi-truck',
    name: 'Semi Truck & Trailer',
    category: 'equipment',
    dimensions: { shape: 'rectangle', width: 8.5, height: 53 },
    clearance: { all: 5 },
    color: '#B22222',
    description: 'Semi truck with 53ft trailer',
    specifications: { length: 53, weight: 80000 },
    tags: ['vehicle', 'large', 'commercial']
  },
  {
    id: 'rv-class-a',
    name: 'Class A RV',
    category: 'equipment',
    dimensions: { shape: 'rectangle', width: 8, height: 35 },
    clearance: { all: 3 },
    color: '#B22222',
    description: 'Large Class A motorhome',
    specifications: { length: 35, weight: 30000 },
    tags: ['vehicle', 'rv', 'large']
  },
  {
    id: 'fire-truck',
    name: 'Fire Truck',
    category: 'equipment',
    dimensions: { shape: 'rectangle', width: 8, height: 30 },
    clearance: { all: 5 },
    color: '#DC143C',
    description: 'Emergency fire truck',
    specifications: { length: 30, weight: 50000 },
    tags: ['vehicle', 'emergency', 'large']
  },
  {
    id: 'ambulance',
    name: 'Ambulance',
    category: 'equipment',
    dimensions: { shape: 'rectangle', width: 7, height: 20 },
    clearance: { all: 3 },
    color: '#FFFFFF',
    description: 'Emergency ambulance',
    specifications: { length: 20, weight: 15000 },
    tags: ['vehicle', 'emergency', 'medical']
  },

  // STRUCTURES CATEGORY
  {
    id: 'tent-10x10',
    name: '10x10 Tent',
    category: 'equipment',
    dimensions: { shape: 'rectangle', width: 10, height: 10 },
    clearance: { all: 2 },
    color: '#FFFFFF',
    description: '10x10 foot popup tent',
    specifications: { height: 10, weight: 50 },
    tags: ['tent', 'portable', 'weather']
  },
  {
    id: 'tent-20x20',
    name: '20x20 Tent',
    category: 'equipment',
    dimensions: { shape: 'rectangle', width: 20, height: 20 },
    clearance: { all: 3 },
    color: '#FFFFFF',
    description: '20x20 foot frame tent',
    specifications: { height: 12, weight: 200 },
    tags: ['tent', 'large', 'frame']
  },
  {
    id: 'tent-40x60',
    name: '40x60 Tent',
    category: 'equipment',
    dimensions: { shape: 'rectangle', width: 40, height: 60 },
    clearance: { all: 5 },
    color: '#FFFFFF',
    description: '40x60 foot pole tent',
    specifications: { height: 16, weight: 800 },
    tags: ['tent', 'large', 'pole']
  },
  {
    id: 'gazebo',
    name: 'Gazebo',
    category: 'equipment',
    dimensions: { shape: 'rectangle', width: 12, height: 12 },
    clearance: { all: 2 },
    color: '#8B4513',
    description: 'Wooden gazebo structure',
    specifications: { height: 12, weight: 500 },
    tags: ['gazebo', 'wooden', 'permanent']
  },
  {
    id: 'pavilion',
    name: 'Pavilion',
    category: 'equipment',
    dimensions: { shape: 'rectangle', width: 20, height: 30 },
    clearance: { all: 3 },
    color: '#8B4513',
    description: 'Large outdoor pavilion',
    specifications: { height: 14, weight: 2000 },
    tags: ['pavilion', 'large', 'shelter']
  },

  // LIGHTING CATEGORY
  {
    id: 'light-tower',
    name: 'Light Tower',
    category: 'equipment',
    dimensions: { shape: 'rectangle', width: 6, height: 6 },
    clearance: { all: 10 },
    color: '#FFFF00',
    description: 'Portable light tower',
    specifications: { height: 30, weight: 1200 },
    tags: ['lighting', 'tower', 'portable']
  },
  {
    id: 'string-lights',
    name: 'String Light Poles',
    category: 'equipment',
    dimensions: { shape: 'rectangle', width: 2, height: 2 },
    clearance: { all: 1 },
    color: '#FFFF00',
    description: 'String light support poles',
    specifications: { height: 12, weight: 30 },
    tags: ['lighting', 'decorative', 'poles']
  },

  // SOUND CATEGORY
  {
    id: 'speaker-tower',
    name: 'Speaker Tower',
    category: 'equipment',
    dimensions: { shape: 'rectangle', width: 3, height: 3 },
    clearance: { all: 5 },
    color: '#000000',
    description: 'Professional speaker tower',
    specifications: { height: 12, weight: 150 },
    tags: ['sound', 'speakers', 'professional']
  },
  {
    id: 'sound-booth',
    name: 'Sound Booth',
    category: 'equipment',
    dimensions: { shape: 'rectangle', width: 8, height: 6 },
    clearance: { all: 2 },
    color: '#2F4F4F',
    description: 'Sound mixing booth',
    specifications: { height: 8, weight: 300 },
    tags: ['sound', 'booth', 'mixing']
  },

  // ADDITIONAL CIRCULAR EQUIPMENT
  {
    id: 'stage-circular-20ft',
    name: 'Circular Stage (20ft)',
    category: 'equipment',
    dimensions: { shape: 'circle', radius: 10 },
    clearance: { all: 3 },
    color: '#8B4513',
    description: 'Large circular performance stage',
    specifications: { height: 4, weight: 800 },
    tags: ['circular', 'performance', 'large']
  },
  {
    id: 'fountain-decorative',
    name: 'Decorative Fountain',
    category: 'equipment',
    dimensions: { shape: 'circle', radius: 4 },
    clearance: { all: 2 },
    color: '#4682B4',
    description: 'Circular decorative water fountain',
    specifications: { height: 3, weight: 500 },
    tags: ['water', 'decorative', 'circular']
  },
  {
    id: 'gazebo-circular',
    name: 'Circular Gazebo',
    category: 'equipment',
    dimensions: { shape: 'circle', radius: 8 },
    clearance: { all: 2 },
    color: '#228B22',
    description: 'Circular gazebo with seating',
    specifications: { height: 12, weight: 600 },
    tags: ['gazebo', 'circular', 'shelter']
  },
  {
    id: 'planter-circular-large',
    name: 'Large Circular Planter',
    category: 'equipment',
    dimensions: { shape: 'circle', radius: 3 },
    clearance: { all: 1 },
    color: '#8FBC8F',
    description: 'Large circular planter for landscaping',
    specifications: { height: 2, weight: 150 },
    tags: ['planter', 'landscaping', 'circular']
  },
  {
    id: 'spotlight-circular-area',
    name: 'Circular Area Spotlight',
    category: 'equipment',
    dimensions: { shape: 'circle', radius: 1.5 },
    clearance: { all: 0.5 },
    color: '#FFD700',
    description: 'Circular area lighting fixture',
    specifications: { height: 8, weight: 25 },
    tags: ['lighting', 'circular', 'area']
  }
]

// Create organized library with categories
export const organizedLibrary: Record<string, EquipmentItem[]> = {
  'mega-rides': equipmentLibrary.filter(item => item.category === 'mega-rides'),
  'rides': equipmentLibrary.filter(item => item.category === 'rides'),
  'kiddy-rides': equipmentLibrary.filter(item => item.category === 'kiddy-rides'),
  'food': equipmentLibrary.filter(item => item.category === 'food'),
  'games': equipmentLibrary.filter(item => item.category === 'games'),
  'equipment': equipmentLibrary.filter(item => item.category === 'equipment'),
  'office': equipmentLibrary.filter(item => item.category === 'office'),
  'home': equipmentLibrary.filter(item => item.category === 'home'),
  'bunks': equipmentLibrary.filter(item => item.category === 'bunks')
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
