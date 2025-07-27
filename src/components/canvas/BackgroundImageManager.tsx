'use client'

import React, { useState, useRef, useCallback } from 'react'
import { BackgroundImage } from './BackgroundLayer'
import GoogleMapsImport from './GoogleMapsImport'

interface BackgroundImageManagerProps {
  images: BackgroundImage[]
  onImageAdd: (image: Omit<BackgroundImage, 'id'>) => void
  onImageUpdate: (imageId: string, updates: Partial<BackgroundImage>) => void
  onImageDelete: (imageId: string) => void
  onImageSelect: (imageId: string | null) => void
  selectedImageId: string | null
  isOpen: boolean
  onClose: () => void
}

const BackgroundImageManager: React.FC<BackgroundImageManagerProps> = ({
  images,
  onImageAdd,
  onImageUpdate,
  onImageDelete,
  onImageSelect,
  selectedImageId,
  isOpen,
  onClose
}) => {
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [showGoogleMapsImport, setShowGoogleMapsImport] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }, [])

  const handleFiles = async (files: FileList) => {
    setUploading(true)
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not an image file`)
        continue
      }

      // Check file size (limit to 50MB)
      if (file.size > 50 * 1024 * 1024) {
        alert(`${file.name} is too large. Maximum size is 50MB`)
        continue
      }

      try {
        // Create object URL for the image
        const url = URL.createObjectURL(file)
        
        // Load image to get dimensions
        const img = new Image()
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve()
          img.onerror = reject
          img.src = url
        })

        // Create background image object
        const backgroundImage: Omit<BackgroundImage, 'id'> = {
          name: file.name,
          url: url,
          x: 0,
          y: 0,
          width: img.naturalWidth,
          height: img.naturalHeight,
          scaleX: 1,
          scaleY: 1,
          rotation: 0,
          opacity: 0.7, // Default to semi-transparent
          visible: true,
          locked: false
        }

        onImageAdd(backgroundImage)
      } catch (error) {
        console.error(`Failed to load image ${file.name}:`, error)
        alert(`Failed to load image ${file.name}`)
      }
    }
    
    setUploading(false)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files)
    }
  }

  const handleGoogleMapsImport = (imageUrl: string, config: any) => {
    // Create a new background image from Google Maps data
    const newImage: Omit<BackgroundImage, 'id'> = {
      url: imageUrl,
      name: config.name || 'Google Maps Satellite',
      x: 0, // Center on canvas
      y: 0,
      scaleX: 1,
      scaleY: 1,
      rotation: 0,
      opacity: 0.7,
      visible: true,
      locked: false,
      width: config.widthFeet * 10, // Convert feet to pixels (10 pixels per foot)
      height: config.heightFeet * 10
    }
    
    onImageAdd(newImage)
    setShowGoogleMapsImport(false)
  }

  const selectedImage = images.find(img => img.id === selectedImageId)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Background Images</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Image List */}
          <div className="w-1/2 border-r flex flex-col">
            {/* Upload Area */}
            <div className="p-4 border-b">
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  dragActive
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
                
                {uploading ? (
                  <div className="text-blue-600">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    Uploading images...
                  </div>
                ) : (
                  <>
                    <div className="text-gray-600 mb-2">
                      Drag & drop images here or
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Browse Files
                      </button>
                      <button
                        onClick={() => setShowGoogleMapsImport(true)}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center space-x-2"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        <span>Import from Google Maps</span>
                      </button>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      Upload files or import satellite imagery from Google Maps
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Image List */}
            <div className="flex-1 overflow-y-auto p-4">
              {images.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  No background images uploaded yet
                </div>
              ) : (
                <div className="space-y-2">
                  {images.map((image) => (
                    <div
                      key={image.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedImageId === image.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => onImageSelect(image.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">
                            {image.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {Math.round(image.width)} × {Math.round(image.height)} px
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onImageUpdate(image.id, { visible: !image.visible })
                            }}
                            className={`p-1 rounded ${
                              image.visible
                                ? 'text-blue-600 hover:bg-blue-100'
                                : 'text-gray-400 hover:bg-gray-100'
                            }`}
                            title={image.visible ? 'Hide' : 'Show'}
                          >
                            {image.visible ? '👁️' : '👁️‍🗨️'}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onImageUpdate(image.id, { locked: !image.locked })
                            }}
                            className={`p-1 rounded ${
                              image.locked
                                ? 'text-red-600 hover:bg-red-100'
                                : 'text-gray-400 hover:bg-gray-100'
                            }`}
                            title={image.locked ? 'Unlock' : 'Lock'}
                          >
                            {image.locked ? '🔒' : '🔓'}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              if (confirm(`Delete ${image.name}?`)) {
                                onImageDelete(image.id)
                              }
                            }}
                            className="p-1 text-red-600 hover:bg-red-100 rounded"
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Properties Panel */}
          <div className="w-1/2 p-4 overflow-y-auto">
            {selectedImage ? (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Image Properties</h3>
                
                {/* Image Preview */}
                <div className="border rounded-lg p-4">
                  <img
                    src={selectedImage.url}
                    alt={selectedImage.name}
                    className="max-w-full max-h-32 object-contain mx-auto"
                  />
                </div>

                {/* Basic Properties */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <input
                      type="text"
                      value={selectedImage.name}
                      onChange={(e) => onImageUpdate(selectedImage.id, { name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">X Position</label>
                      <input
                        type="number"
                        value={Math.round(selectedImage.x || 0)}
                        onChange={(e) => onImageUpdate(selectedImage.id, { x: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Y Position</label>
                      <input
                        type="number"
                        value={Math.round(selectedImage.y || 0)}
                        onChange={(e) => onImageUpdate(selectedImage.id, { y: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Width</label>
                      <input
                        type="number"
                        value={Math.round(selectedImage.width || 0)}
                        onChange={(e) => onImageUpdate(selectedImage.id, { width: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Height</label>
                      <input
                        type="number"
                        value={Math.round(selectedImage.height || 0)}
                        onChange={(e) => onImageUpdate(selectedImage.id, { height: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Rotation (degrees)</label>
                    <input
                      type="number"
                      value={Math.round(selectedImage.rotation || 0)}
                      onChange={(e) => onImageUpdate(selectedImage.id, { rotation: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Opacity ({Math.round((selectedImage.opacity || 0) * 100)}%)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={selectedImage.opacity || 0}
                      onChange={(e) => onImageUpdate(selectedImage.id, { opacity: Number(e.target.value) })}
                      className="w-full"
                    />
                  </div>

                  {/* Lock/Unlock Toggle - Prominent placement */}
                  <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                    <h4 className="font-medium text-gray-900 mb-2">Image Controls</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedImage.visible}
                            onChange={(e) => onImageUpdate(selectedImage.id, { visible: e.target.checked })}
                            className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="flex items-center">
                            <span className="mr-2">{selectedImage.visible ? '👁️' : '🙈'}</span>
                            <span className="text-sm font-medium">Visible</span>
                          </span>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedImage.locked}
                            onChange={(e) => onImageUpdate(selectedImage.id, { locked: e.target.checked })}
                            className="mr-3 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                          />
                          <span className="flex items-center">
                            <span className="mr-2">{selectedImage.locked ? '🔒' : '🔓'}</span>
                            <span className={`text-sm font-medium ${
                              selectedImage.locked ? 'text-red-700' : 'text-gray-700'
                            }`}>
                              {selectedImage.locked ? 'Locked (Cannot Move)' : 'Unlocked (Can Move)'}
                            </span>
                          </span>
                        </label>
                      </div>
                      
                      {selectedImage.locked && (
                        <div className="bg-red-50 border border-red-200 rounded p-2">
                          <p className="text-xs text-red-700">
                            🔒 This image is locked and cannot be moved or resized on the canvas. 
                            Uncheck &ldquo;Locked&rdquo; to make changes.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-2">
                  <h4 className="font-medium">Quick Actions</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onImageUpdate(selectedImage.id, { 
                        scaleX: 1, 
                        scaleY: 1,
                        width: selectedImage.width / selectedImage.scaleX,
                        height: selectedImage.height / selectedImage.scaleY
                      })}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm"
                    >
                      Reset Scale
                    </button>
                    <button
                      onClick={() => onImageUpdate(selectedImage.id, { rotation: 0 })}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm"
                    >
                      Reset Rotation
                    </button>
                    <button
                      onClick={() => onImageUpdate(selectedImage.id, { x: 0, y: 0 })}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm"
                    >
                      Reset Position
                    </button>
                    <button
                      onClick={() => onImageUpdate(selectedImage.id, { opacity: 0.7 })}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm"
                    >
                      Reset Opacity
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                Select an image to view properties
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Google Maps Import Modal */}
      {showGoogleMapsImport && (
        <GoogleMapsImport
          onImport={handleGoogleMapsImport}
          onClose={() => setShowGoogleMapsImport(false)}
        />
      )}
    </div>
  )
}

export default BackgroundImageManager
