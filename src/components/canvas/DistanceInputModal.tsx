/**
 * Distance Input Modal Component
 * Modal for entering real-world distance to verify measurement scale
 */

import React, { useState, useEffect } from 'react';

interface DistanceInputModalProps {
  isOpen: boolean;
  calculatedDistance: number;
  onSubmit: (actualDistance: number) => void;
  onCancel: () => void;
}

export default function DistanceInputModal({
  isOpen,
  calculatedDistance,
  onSubmit,
  onCancel
}: DistanceInputModalProps) {
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (isOpen) {
      setInputValue('');
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const actualDistance = parseFloat(inputValue);
    if (isNaN(actualDistance) || actualDistance <= 0) {
      alert('Please enter a valid distance in feet');
      return;
    }

    onSubmit(actualDistance);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  if (!isOpen) return null;

  const scaleAccuracy = inputValue ? parseFloat(inputValue) / calculatedDistance : 1;
  const accuracyPercent = Math.round(scaleAccuracy * 100);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Calibrate Image Scale
        </h2>
        
        <div className="mb-4">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
            <p className="text-sm text-blue-800">
              <strong>Calculated Distance:</strong> {calculatedDistance.toFixed(1)} feet
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Based on current satellite image scale
            </p>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
            <p className="text-sm text-green-800">
              <strong>Auto-Calibration:</strong> The satellite image scale will be automatically adjusted to match your measurement.
            </p>
            <p className="text-xs text-green-600 mt-1">
              This ensures all future measurements and equipment placement will be precisely scaled.
            </p>
          </div>
          
          <form onSubmit={handleSubmit}>
            <label htmlFor="actualDistance" className="block text-sm font-medium text-gray-700 mb-2">
              Enter the actual real-world distance (in feet):
            </label>
            <input
              id="actualDistance"
              type="number"
              step="0.1"
              min="0.1"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 150.0"
              autoFocus
            />
            
            {inputValue && (
              <div className="mt-3 p-3 rounded-md bg-blue-50 border border-blue-200">
                <p className="text-sm font-medium text-blue-800">
                  Calibration Factor: {scaleAccuracy.toFixed(3)}x
                </p>
                <p className="text-xs mt-1 text-blue-600">
                  {scaleAccuracy > 1 
                    ? `Image will be scaled up by ${((scaleAccuracy - 1) * 100).toFixed(1)}%` 
                    : scaleAccuracy < 1 
                    ? `Image will be scaled down by ${((1 - scaleAccuracy) * 100).toFixed(1)}%`
                    : 'No scaling adjustment needed - perfect match!'
                  }
                </p>
              </div>
            )}
            
            <div className="flex gap-3 mt-6">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Calibrate Scale
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
        
        <div className="text-xs text-gray-500 mt-4">
          <p><strong>Tip:</strong> Measure known features like roads, buildings, or parking lots for best accuracy verification.</p>
        </div>
      </div>
    </div>
  );
}
