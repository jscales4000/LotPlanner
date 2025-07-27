'use client'

import React, { useRef, useEffect, useState } from 'react'
import { Image as KonvaImage, Group, Rect, Text } from 'react-konva'
import Konva from 'konva'

export interface BackgroundImage {
  id: string
  name: string
  url: string
  x: number
  y: number
  width: number
  height: number
  scaleX: number
  scaleY: number
  rotation: number
  opacity: number
  visible: boolean
  locked: boolean
}

interface BackgroundLayerProps {
  images: BackgroundImage[]
  onImageUpdate?: (imageId: string, updates: Partial<BackgroundImage>) => void
  onImageDelete?: (imageId: string) => void
  onImageSelect?: (imageId: string | null) => void
  selectedImageId?: string | null
  scale: number
  editable?: boolean
  measurementToolActive?: boolean
}

const BackgroundLayer: React.FC<BackgroundLayerProps> = ({
  images,
  onImageUpdate,
  onImageDelete,
  onImageSelect,
  selectedImageId,
  scale,
  editable = true,
  measurementToolActive = false
}) => {
  const [loadedImages, setLoadedImages] = useState<Map<string, HTMLImageElement>>(new Map())
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set())

  // Note: Auto-removal disabled to prevent infinite loops
  // Failed images are tracked and skipped, but not automatically removed

  // Load images when URLs change
  useEffect(() => {
    const loadImages = async () => {
      const newLoadedImages = new Map<string, HTMLImageElement>()
      
      for (const bgImage of images) {
        // Skip images that have already failed
        if (failedImages.has(bgImage.id)) {
          console.warn(`Skipping previously failed image: ${bgImage.id}`)
          continue
        }
        
        if (!loadedImages.has(bgImage.id)) {
          try {
            const img = new window.Image()
            img.crossOrigin = 'anonymous'
            
            await new Promise<void>((resolve, reject) => {
              const timeout = setTimeout(() => {
                reject(new Error('Image load timeout'))
              }, 10000) // 10 second timeout
              
              img.onload = () => {
                clearTimeout(timeout)
                resolve()
              }
              img.onerror = (error) => {
                clearTimeout(timeout)
                reject(error)
              }
              img.src = bgImage.url
            })
            
            newLoadedImages.set(bgImage.id, img)
          } catch (error) {
            console.error(`Failed to load background image ${bgImage.id}:`, error)
            // Add to failed images set
            setFailedImages(prev => new Set([...prev, bgImage.id]))
            continue
          }
        } else {
          newLoadedImages.set(bgImage.id, loadedImages.get(bgImage.id)!)
        }
      }
      
      // Only update if there are changes
      if (newLoadedImages.size !== loadedImages.size || 
          Array.from(newLoadedImages.keys()).some(key => !loadedImages.has(key))) {
        setLoadedImages(newLoadedImages)
      }
    }

    if (images.length > 0) {
      loadImages()
    }
  }, [images])

  // Note: Transformer functionality removed - background images are not resizable

  const handleImageClick = (imageId: string) => {
    if (editable) {
      onImageSelect?.(imageId)
    }
  }

  const handleImageDragEnd = (imageId: string, e: Konva.KonvaEventObject<DragEvent>) => {
    const node = e.target as Konva.Image
    onImageUpdate?.(imageId, {
      x: node.x(),
      y: node.y()
    })
  }

  const handleImageTransform = (imageId: string, e: Konva.KonvaEventObject<Event>) => {
    const node = e.target as Konva.Image
    onImageUpdate?.(imageId, {
      x: node.x(),
      y: node.y(),
      scaleX: node.scaleX(),
      scaleY: node.scaleY(),
      rotation: node.rotation(),
      width: node.width() * node.scaleX(),
      height: node.height() * node.scaleY()
    })
  }

  return (
    <Group>
      {images.map((bgImage) => {
        const loadedImage = loadedImages.get(bgImage.id)
        if (!loadedImage || !bgImage.visible) return null

        const isSelected = selectedImageId === bgImage.id

        return (
          <Group key={bgImage.id}>
            <KonvaImage
              image={loadedImage}
              x={bgImage.x}
              y={bgImage.y}
              width={bgImage.width}
              height={bgImage.height}
              scaleX={bgImage.scaleX}
              scaleY={bgImage.scaleY}
              rotation={bgImage.rotation}
              opacity={bgImage.locked ? bgImage.opacity * 0.8 : bgImage.opacity} // Slightly dimmed when locked
              draggable={editable && !bgImage.locked}
              onClick={() => handleImageClick(bgImage.id)}
              onTap={() => handleImageClick(bgImage.id)}
              onDragEnd={(e) => handleImageDragEnd(bgImage.id, e)}
              onTransformEnd={(e) => handleImageTransform(bgImage.id, e)}
              listening={editable && !measurementToolActive} // Disable listening when measurement tools are active
              filters={bgImage.locked ? [Konva.Filters.Grayscale] : undefined} // Grayscale when locked
            />
            
            {/* Lock indicator overlay */}
            {bgImage.locked && (
              <Group
                x={bgImage.x + bgImage.width * bgImage.scaleX - 40}
                y={bgImage.y + 10}
                rotation={bgImage.rotation}
              >
                {/* Lock icon background */}
                <Rect
                  width={30}
                  height={30}
                  fill="rgba(239, 68, 68, 0.9)" // Red background
                  stroke="#ffffff"
                  strokeWidth={2}
                  cornerRadius={4}
                  shadowColor="black"
                  shadowBlur={4}
                  shadowOpacity={0.3}
                />
                
                {/* Lock icon text */}
                <Text
                  x={6}
                  y={6}
                  text="🔒"
                  fontSize={18}
                  fill="white"
                />
              </Group>
            )}
            
            {/* Locked border overlay */}
            {bgImage.locked && (
              <Rect
                x={bgImage.x}
                y={bgImage.y}
                width={bgImage.width}
                height={bgImage.height}
                scaleX={bgImage.scaleX}
                scaleY={bgImage.scaleY}
                rotation={bgImage.rotation}
                stroke="#ef4444" // Red border
                strokeWidth={3 / scale} // Scale with zoom
                dash={[10, 5]} // Dashed border
                listening={false}
              />
            )}
          </Group>
        )
      })}
      
      {/* Note: Transformer disabled for background images to preserve scale accuracy */}
      {/* Background images (satellite imagery) should not be resizable to maintain measurement precision */}
    </Group>
  )
}

export default BackgroundLayer
