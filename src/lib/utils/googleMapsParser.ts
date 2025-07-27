/**
 * Google Maps URL Parser and Satellite Image Fetcher
 * Handles parsing Google Maps links and calculating appropriate scale for satellite imagery
 */

export interface GoogleMapsData {
  latitude: number;
  longitude: number;
  zoom: number;
  mapType?: string;
}

export interface SatelliteImageConfig {
  imageUrl: string;
  scale: number; // pixels per foot
  centerLat: number;
  centerLng: number;
  widthMeters: number;
  heightMeters: number;
  widthFeet: number;
  heightFeet: number;
}

/**
 * Parse various Google Maps URL formats to extract coordinates and zoom
 */
export function parseGoogleMapsUrl(url: string): GoogleMapsData | null {
  try {
    const urlObj = new URL(url);
    
    // Handle different Google Maps URL formats
    
    // Format 1: https://www.google.com/maps/@lat,lng,zoom
    const atMatch = url.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*),(\d+\.?\d*)z/);
    if (atMatch) {
      return {
        latitude: parseFloat(atMatch[1]),
        longitude: parseFloat(atMatch[2]),
        zoom: parseFloat(atMatch[3])
      };
    }
    
    // Format 2: https://maps.google.com/maps?q=lat,lng&z=zoom
    const qMatch = url.match(/q=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
    const zMatch = url.match(/z=(\d+)/);
    if (qMatch) {
      return {
        latitude: parseFloat(qMatch[1]),
        longitude: parseFloat(qMatch[2]),
        zoom: zMatch ? parseFloat(zMatch[1]) : 18 // Default zoom
      };
    }
    
    // Format 3: https://www.google.com/maps/place/.../@lat,lng,zoom
    const placeMatch = url.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*),(\d+\.?\d*)/);
    if (placeMatch) {
      return {
        latitude: parseFloat(placeMatch[1]),
        longitude: parseFloat(placeMatch[2]),
        zoom: parseFloat(placeMatch[3])
      };
    }
    
    // Format 4: URL parameters
    const searchParams = urlObj.searchParams;
    const lat = searchParams.get('lat') || searchParams.get('latitude');
    const lng = searchParams.get('lng') || searchParams.get('longitude');
    const zoom = searchParams.get('z') || searchParams.get('zoom');
    
    if (lat && lng) {
      return {
        latitude: parseFloat(lat),
        longitude: parseFloat(lng),
        zoom: zoom ? parseFloat(zoom) : 18
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing Google Maps URL:', error);
    return null;
  }
}

/**
 * Calculate the ground resolution (meters per pixel) based on zoom level and latitude
 * Formula from Google Maps documentation
 */
export function calculateGroundResolution(latitude: number, zoom: number): number {
  const earthCircumference = 40075017; // meters
  const latitudeRadians = latitude * Math.PI / 180;
  const metersPerPixel = earthCircumference * Math.cos(latitudeRadians) / Math.pow(2, zoom + 8);
  return metersPerPixel;
}

/**
 * Generate satellite image configuration with quality options
 */
export function generateSatelliteImageConfig(
  lat: number, 
  lng: number, 
  zoom: number, 
  qualityLevel: 'standard' | 'high' | 'ultra' = 'standard',
  aspectRatio: 'square' | 'landscape' | 'portrait' | 'wide' = 'square',
  coverageMultiplier: number = 2.0 // 2x larger coverage area by default
): SatelliteImageConfig {
  // Canvas is 1000' x 1000' at 10 pixels per foot (1,000,000 sq ft)
  const canvasWidthFeet = 1000;
  const canvasHeightFeet = 1000;
  const canvasPixelsPerFoot = 10;
  
  // Quality-based image size selection
  const qualitySettings = {
    standard: { size: 640, scale: 1 },    // Standard quality (free tier)
    high: { size: 1280, scale: 1 },       // High quality (premium tier)
    ultra: { size: 2048, scale: 2 }       // Ultra quality (premium tier with scale=2)
  };
  
  const isPremium = process.env.NEXT_PUBLIC_GOOGLE_MAPS_PREMIUM === 'true';
  const selectedQuality = qualitySettings[qualityLevel];
  
  // Enforce API limits based on account type
  let maxApiSize: number;
  let scaleValue: number;
  
  if (!isPremium && qualityLevel !== 'standard') {
    console.warn(`Quality level '${qualityLevel}' requires premium API. Falling back to standard.`);
    maxApiSize = qualitySettings.standard.size;
    scaleValue = qualitySettings.standard.scale;
  } else {
    maxApiSize = Math.min(selectedQuality.size, isPremium ? 2048 : 640);
    scaleValue = selectedQuality.scale;
  }

  console.log(`🎯 SATELLITE IMAGE QUALITY DEBUG:`, {
    requestedQuality: qualityLevel,
    isPremium,
    maxApiSize,
    scaleValue,
    resultingResolution: `${maxApiSize}x${maxApiSize}`,
    scaleMultiplier: scaleValue,
    effectiveResolution: `${maxApiSize * scaleValue}x${maxApiSize * scaleValue}`
  });
  
  // Calculate image dimensions based on aspect ratio FIRST
  let imageWidthPixels: number;
  let imageHeightPixels: number;
  
  switch (aspectRatio) {
    case 'landscape':
      // 2:1 landscape (wider than tall) - perfect for wide lots
      imageWidthPixels = maxApiSize;
      imageHeightPixels = Math.floor(maxApiSize / 2);
      break;
    case 'wide':
      // 3:1 wide (much wider than tall) - perfect for strip lots
      imageWidthPixels = maxApiSize;
      imageHeightPixels = Math.floor(maxApiSize / 3);
      break;
    case 'portrait':
      // 1:2 portrait (taller than wide)
      imageWidthPixels = Math.floor(maxApiSize / 2);
      imageHeightPixels = maxApiSize;
      break;
    case 'square':
    default:
      // 1:1 square (current behavior)
      imageWidthPixels = maxApiSize;
      imageHeightPixels = maxApiSize;
      break;
  }
  
  console.log(`📐 ASPECT RATIO: ${aspectRatio} → ${imageWidthPixels}×${imageHeightPixels} pixels`);
  
  // Ensure dimensions don't exceed API limits
  imageWidthPixels = Math.min(imageWidthPixels, isPremium ? 2048 : 640);
  imageHeightPixels = Math.min(imageHeightPixels, isPremium ? 2048 : 640);
  
  // Calculate what zoom level we need to cover expanded area within the image size
  const metersPerFoot = 0.3048;
  // Apply coverage multiplier to get larger area (2x = 2000' x 2000', 3x = 3000' x 3000', etc.)
  const expandedWidthFeet = canvasWidthFeet * coverageMultiplier;
  const expandedHeightFeet = canvasHeightFeet * coverageMultiplier;
  const targetWidthMeters = expandedWidthFeet * metersPerFoot;
  const targetHeightMeters = expandedHeightFeet * metersPerFoot;
  
  console.log(`🗺️ COVERAGE EXPANSION: ${coverageMultiplier}x → ${expandedWidthFeet}' × ${expandedHeightFeet}' area`);
  
  // Calculate required ground resolution to fit our expanded target area
  const requiredGroundResolution = targetWidthMeters / Math.max(imageWidthPixels, imageHeightPixels); // meters per pixel needed
  
  // Calculate the optimal zoom level for this ground resolution
  const earthCircumference = 40075017; // meters
  const latitudeRadians = lat * Math.PI / 180;
  const optimalZoom = Math.log2(earthCircumference * Math.cos(latitudeRadians) / (requiredGroundResolution * 256)) - 1;
  const adjustedZoom = Math.max(1, Math.min(20, Math.round(optimalZoom))); // Clamp between 1-20
  
  // Recalculate ground resolution with adjusted zoom
  const actualGroundResolution = calculateGroundResolution(lat, adjustedZoom);
  const feetPerPixel = actualGroundResolution / metersPerFoot;
  const pixelsPerFoot = 1 / feetPerPixel;
  
  // Image dimensions already calculated above
  
  // Calculate actual coverage area
  const actualWidthFeet = imageWidthPixels * feetPerPixel;
  const actualHeightFeet = imageHeightPixels * feetPerPixel;
  
  // Generate Google Maps Static API URL for satellite imagery
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  
  let imageUrl: string;
  if (apiKey) {
    // Add scale parameter for higher resolution (premium accounts only)
    const scaleParam = isPremium && scaleValue > 1 ? `&scale=${scaleValue}` : '';
    imageUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${adjustedZoom}&size=${imageWidthPixels}x${imageHeightPixels}&maptype=satellite${scaleParam}&key=${apiKey}`;
    
    console.log(`🚀 FINAL IMAGE URL:`, {
      url: imageUrl,
      hasScaleParam: scaleParam !== '',
      actualResolution: scaleParam ? `${imageWidthPixels * scaleValue}x${imageHeightPixels * scaleValue}` : `${imageWidthPixels}x${imageHeightPixels}`
    });
  } else {
    const svgContent = `
      <svg width="${imageWidthPixels}" height="${imageHeightPixels}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#e5e7eb"/>
        <text x="50%" y="40%" text-anchor="middle" font-family="Arial" font-size="16" fill="#374151">
          Satellite Image Placeholder
        </text>
        <text x="50%" y="50%" text-anchor="middle" font-family="Arial" font-size="14" fill="#6b7280">
          Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}
        </text>
        <text x="50%" y="60%" text-anchor="middle" font-family="Arial" font-size="14" fill="#6b7280">
          Zoom: ${zoom} | Scale: ${feetPerPixel.toFixed(2)} ft/px
        </text>
      </svg>
    `;
    imageUrl = `data:image/svg+xml,${encodeURIComponent(svgContent)}`;
  }
  
  return {
    imageUrl,
    scale: pixelsPerFoot,
    centerLat: lat,
    centerLng: lng,
    widthMeters: imageWidthPixels * actualGroundResolution,
    heightMeters: imageHeightPixels * actualGroundResolution,
    widthFeet: actualWidthFeet,
    heightFeet: actualHeightFeet
  };
}

/**
 * Validate if a URL looks like a Google Maps link
 */
export function isGoogleMapsUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    return hostname.includes('google.com') || hostname.includes('maps.google.com') || hostname.includes('goo.gl');
  } catch {
    return false;
  }
}

/**
 * Get a user-friendly description of the parsed location
 */
export function getLocationDescription(mapsData: GoogleMapsData): string {
  return `${mapsData.latitude.toFixed(6)}, ${mapsData.longitude.toFixed(6)} (Zoom: ${mapsData.zoom})`;
}
