/**
 * Google Maps Import Component
 * Allows users to paste Google Maps links and automatically import satellite imagery
 */

import React, { useState } from 'react';
import { parseGoogleMapsUrl, generateSatelliteImageConfig, isGoogleMapsUrl, getLocationDescription } from '@/lib/utils/googleMapsParser';

interface GoogleMapsImportProps {
  onImport: (imageUrl: string, config: any) => void;
  onClose: () => void;
}

export default function GoogleMapsImport({ onImport, onClose }: GoogleMapsImportProps) {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewData, setPreviewData] = useState<any>(null);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    setError('');
    setPreviewData(null);

    // Auto-parse URL as user types
    if (newUrl.trim() && isGoogleMapsUrl(newUrl)) {
      const mapsData = parseGoogleMapsUrl(newUrl);
      if (mapsData) {
        const satelliteConfig = generateSatelliteImageConfig(
          mapsData.latitude,
          mapsData.longitude,
          mapsData.zoom,
          'ultra', // Use highest quality available
          'landscape', // Use landscape orientation for wide lots
          2.0 // 2x coverage area for larger satellite image
        );
        setPreviewData({
          mapsData,
          config: satelliteConfig,
          description: getLocationDescription(mapsData)
        });
      }
    }
  };

  const handleImport = async () => {
    if (!url.trim()) {
      setError('Please enter a Google Maps URL');
      return;
    }

    if (!isGoogleMapsUrl(url)) {
      setError('Please enter a valid Google Maps URL');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const mapsData = parseGoogleMapsUrl(url);
      if (!mapsData) {
        throw new Error('Could not parse Google Maps URL');
      }

      const config = generateSatelliteImageConfig(
        mapsData.latitude,
        mapsData.longitude,
        mapsData.zoom,
        'ultra', // Use highest quality available
        'landscape', // Use landscape orientation for wide lots
        2.0 // 2x coverage area for larger satellite image
      );
      
      // Use the real Google Maps Static API with the configured API key
      const satelliteImageUrl = config.imageUrl;

      // Import the image with calculated configuration
      onImport(satelliteImageUrl, {
        name: `Satellite Image - ${config.centerLat.toFixed(4)}, ${config.centerLng.toFixed(4)}`,
        scale: config.scale,
        widthFeet: config.widthFeet,
        heightFeet: config.heightFeet,
        autoPositioned: true,
        googleMapsData: mapsData
      });

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import satellite image');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Import from Google Maps</h2>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            title="Close"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <label htmlFor="maps-url" className="block text-sm font-medium text-gray-700 mb-2">
              Google Maps URL
            </label>
            <input
              id="maps-url"
              type="url"
              value={url}
              onChange={handleUrlChange}
              placeholder="Paste Google Maps link here..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Paste a link from Google Maps (e.g., from sharing a location)
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {previewData && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <h4 className="text-sm font-medium text-green-800 mb-2">Preview:</h4>
              <p className="text-sm text-gray-600">We&apos;ll import a satellite image for this location with the calculated scale.</p>
              <p className="text-sm text-green-700">
                <strong>Image Size:</strong> {previewData.config.widthFeet}&apos; × {previewData.config.heightFeet}&apos;
              </p>
              <p className="text-sm text-green-700">
                <strong>Scale:</strong> {previewData.config.scale} pixels/foot
              </p>
            </div>
          )}

          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
            <div className="flex">
              <svg className="w-5 h-5 text-yellow-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm text-yellow-700">
                  <strong>Note:</strong> This demo uses a placeholder image. In production, you would need a Google Maps API key to fetch actual satellite imagery.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 px-6 py-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={isLoading || !previewData}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Importing...' : 'Import Satellite Image'}
          </button>
        </div>
      </div>
    </div>
  );
}
