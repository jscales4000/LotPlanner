const fs = require('fs');
const path = require('path');

// Read the CSV file
const csvPath = path.join(__dirname, '..', 'Final_Ride_Dimensions_2025.csv');
const csvContent = fs.readFileSync(csvPath, 'utf8');

// Parse CSV manually (simple approach for this specific format)
const lines = csvContent.split('\n').filter(line => line.trim());
const headers = lines[0].split(',');
const dataLines = lines.slice(1).filter(line => line.trim());

console.log('Headers:', headers);
console.log('Total rides found:', dataLines.length);

// Transform CSV data to equipment library format
const rides = dataLines.map((line, index) => {
  // Split by comma but handle quoted values
  const values = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current.trim()); // Add the last value
  
  const [rideName, rideWidth, rideLength, clearanceA, clearanceB, notes] = values;
  
  // Skip empty lines
  if (!rideName || rideName.trim() === '') {
    return null;
  }
  
  // Parse dimensions
  let width = parseFloat(rideWidth) || 0;
  let height = parseFloat(rideLength) || 0;
  
  // Handle special cases like "50-56" (take the larger value)
  if (rideWidth.includes('-')) {
    const widthRange = rideWidth.split('-').map(v => parseFloat(v.trim()));
    width = Math.max(...widthRange.filter(v => !isNaN(v)));
  }
  
  // Handle special cases like "40(60)" (take the value in parentheses if present)
  if (rideLength.includes('(')) {
    const match = rideLength.match(/\((\d+)\)/);
    if (match) {
      height = parseFloat(match[1]);
    }
  }
  
  // Parse clearance - use Clearance A as primary, fallback to reasonable default
  let clearance = parseFloat(clearanceA) || 10;
  
  // Generate unique ID from ride name
  const id = rideName.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  
  // Determine if ride should be circular based on name/dimensions
  const isCircular = rideName.toLowerCase().includes('wheel') || 
                    rideName.toLowerCase().includes('round') ||
                    (Math.abs(width - height) < 5 && (rideName.toLowerCase().includes('spin') || rideName.toLowerCase().includes('carousel')));
  
  // Generate color based on ride type
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', 
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2',
    '#A3E4D7', '#F9E79F', '#D5A6BD', '#AED6F1', '#A9DFBF',
    '#F5B7B1', '#D2B4DE', '#A9CCE3', '#A3E4D7', '#F7DC6F',
    '#D7BDE2', '#AED6F1', '#A9DFBF', '#F5B7B1'
  ];
  const color = colors[index % colors.length];
  
  // Create equipment item
  // Build description string first
  let description = `${rideName} - Professional amusement ride`;
  
  // Add notes to description if present
  if (notes && notes.trim()) {
    description += ` - ${notes.trim()}`;
  }
  
  // Handle dual clearance (Clearance B)
  if (clearanceB && clearanceB.trim() && !isNaN(parseFloat(clearanceB))) {
    description += ` (Secondary clearance: ${clearanceB.trim()}ft)`;
  }

  const equipmentItem = {
    id: id,
    name: rideName,
    category: 'rides',
    dimensions: isCircular 
      ? { shape: 'circle', radius: Math.max(width, height) / 2 }
      : { shape: 'rectangle', width: width, height: height },
    clearance: {
      type: 'rectangular',
      all: clearance
    },
    color: color,
    description: description,
    specifications: { 
      capacity: Math.round((width * height) / 10), // Rough estimate based on size
      weight: Math.round((width * height) * 50) // Rough estimate
    },
    tags: ['amusement', 'ride', 'professional'],
    // New operational specification fields
    weight: Math.round((width * height) * 50),
    capacity: Math.round((width * height) / 10),
    turnAroundTime: 3, // Default 3 minutes
    verticalHeight: Math.max(15, Math.round(Math.max(width, height) * 0.8)), // Estimate based on size
    rideClearing: clearance
  };
  
  return equipmentItem;
}).filter(item => item !== null);

console.log('\nParsed rides:');
rides.forEach((ride, index) => {
  console.log(`${index + 1}. ${ride.name} - ${ride.dimensions.shape === 'circle' ? `${ride.dimensions.radius * 2}ft diameter` : `${ride.dimensions.width}x${ride.dimensions.height}ft`} - ${ride.rideClearing}ft clearance`);
});

// Generate the new equipment library file
const libraryContent = `import { EquipmentItem } from './types'

// Real amusement ride data from Final_Ride_Dimensions_2025.csv
// This replaces all default equipment with actual ride specifications
export const equipmentLibrary: EquipmentItem[] = [
${rides.map(ride => `  {
    id: '${ride.id}',
    name: '${ride.name}',
    category: '${ride.category}',
    dimensions: ${JSON.stringify(ride.dimensions)},
    clearance: ${JSON.stringify(ride.clearance)},
    color: '${ride.color}',
    description: ${JSON.stringify(ride.description)},
    specifications: ${JSON.stringify(ride.specifications)},
    tags: ${JSON.stringify(ride.tags)},
    // Operational specifications
    weight: ${ride.weight},
    capacity: ${ride.capacity},
    turnAroundTime: ${ride.turnAroundTime},
    verticalHeight: ${ride.verticalHeight},
    rideClearing: ${ride.rideClearing}
  }`).join(',\n')}
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
`;

// Write the new library file
const outputPath = path.join(__dirname, '..', 'src', 'lib', 'equipment', 'library.ts');
fs.writeFileSync(outputPath, libraryContent);

console.log(`\n✅ Successfully generated new equipment library with ${rides.length} rides!`);
console.log(`📄 Written to: ${outputPath}`);
console.log('\n🎢 All default equipment has been replaced with real ride data from CSV!');
