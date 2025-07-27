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
 * Generate satellite image configuration
 */
export function generateSatelliteImageConfig(lat: number, lng: number, zoom: number): SatelliteImageConfig {
  // Canvas is 500' x 500' at 10 pixels per foot
  const canvasWidthFeet = 500;
  const canvasHeightFeet = 500;
  const canvasPixelsPerFoot = 10;
  
  // Google Maps Static API is limited to 640x640 pixels
  const maxApiSize = 640;
  
  // Calculate what zoom level we need to cover 500' x 500' within 640x640 pixels
  const metersPerFoot = 0.3048;
  const targetWidthMeters = canvasWidthFeet * metersPerFoot; // 152.4 meters
  const targetHeightMeters = canvasHeightFeet * metersPerFoot; // 152.4 meters
  
  // Calculate required ground resolution to fit our target area in 640 pixels
  const requiredGroundResolution = targetWidthMeters / maxApiSize; // meters per pixel needed
  
  // Calculate the optimal zoom level for this ground resolution
  const earthCircumference = 40075017; // meters
  const latitudeRadians = lat * Math.PI / 180;
  const optimalZoom = Math.log2(earthCircumference * Math.cos(latitudeRadians) / (requiredGroundResolution * 256)) - 1;
  const adjustedZoom = Math.max(1, Math.min(20, Math.round(optimalZoom))); // Clamp between 1-20
  
  // Recalculate ground resolution with adjusted zoom
  const actualGroundResolution = calculateGroundResolution(lat, adjustedZoom);
  const feetPerPixel = actualGroundResolution / metersPerFoot;
  const pixelsPerFoot = 1 / feetPerPixel;
  
  // Use maximum API size for best quality
  const imageWidthPixels = maxApiSize;
  const imageHeightPixels = maxApiSize;
  
  // Calculate actual coverage area
  const actualWidthFeet = imageWidthPixels * feetPerPixel;
  const actualHeightFeet = imageHeightPixels * feetPerPixel;
  
  // Generate Google Maps Static API URL for satellite imagery
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  
  let imageUrl: string;
  if (apiKey) {
    imageUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${adjustedZoom}&size=${imageWidthPixels}x${imageHeightPixels}&maptype=satellite&key=${apiKey}`;
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
