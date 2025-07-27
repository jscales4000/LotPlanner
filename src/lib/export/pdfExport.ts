import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { PlacedEquipment, EquipmentItem } from '@/lib/equipment/types'
import { BackgroundImage } from '@/components/canvas/BackgroundLayer'

export interface PDFExportOptions {
  includeBackground: boolean
  includeEquipmentLabels: boolean
  includeClearanceZones: boolean
  includeDimensions: boolean
  includeScale: boolean
  paperSize: 'letter' | 'legal' | 'a4' | 'a3'
  orientation: 'portrait' | 'landscape'
  title: string
  subtitle?: string
  showGrid: boolean
  quality: 'low' | 'medium' | 'high'
}

export interface PDFMetadata {
  projectName: string
  createdBy: string
  createdDate: string
  scale: string
  totalArea: string
  equipmentCount: number
}

export class PDFExporter {
  private static readonly PIXELS_PER_FOOT = 10
  private static readonly PAPER_SIZES = {
    letter: { width: 8.5, height: 11 },
    legal: { width: 8.5, height: 14 },
    a4: { width: 8.27, height: 11.69 },
    a3: { width: 11.69, height: 16.53 }
  }

  /**
   * Export canvas to PDF with professional formatting
   */
  static async exportToPDF(
    canvasElement: HTMLElement,
    placedEquipment: PlacedEquipment[],
    equipmentDefinitions: EquipmentItem[],
    backgroundImages: BackgroundImage[],
    options: PDFExportOptions,
    metadata: PDFMetadata
  ): Promise<void> {
    try {
      // Create PDF document
      const paperSize = this.PAPER_SIZES[options.paperSize]
      const pdf = new jsPDF({
        orientation: options.orientation,
        unit: 'in',
        format: [paperSize.width, paperSize.height]
      })

      // Set quality settings
      const scale = this.getQualityScale(options.quality)
      
      // Capture canvas as image
      const canvas = await html2canvas(canvasElement, {
        scale,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false
      })

      // Calculate layout dimensions
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 0.5
      const contentWidth = pageWidth - (margin * 2)
      const contentHeight = pageHeight - (margin * 2)

      // Add title page
      this.addTitlePage(pdf, options, metadata, pageWidth, pageHeight)
      
      // Add new page for layout
      pdf.addPage()

      // Add header
      this.addHeader(pdf, options.title, metadata, pageWidth, margin)

      // Calculate canvas dimensions to fit page
      const canvasAspectRatio = canvas.width / canvas.height
      let layoutWidth = contentWidth
      let layoutHeight = contentWidth / canvasAspectRatio

      // Adjust if height exceeds available space
      const availableHeight = contentHeight - 1.5 // Reserve space for header and footer
      if (layoutHeight > availableHeight) {
        layoutHeight = availableHeight
        layoutWidth = layoutHeight * canvasAspectRatio
      }

      // Center the layout
      const layoutX = margin + (contentWidth - layoutWidth) / 2
      const layoutY = margin + 1 // Space for header

      // Add canvas image
      const imgData = canvas.toDataURL('image/png')
      pdf.addImage(imgData, 'PNG', layoutX, layoutY, layoutWidth, layoutHeight)

      // Add scale bar if requested
      if (options.includeScale) {
        this.addScaleBar(pdf, layoutX, layoutY + layoutHeight + 0.1, layoutWidth)
      }

      // Add equipment legend
      if (options.includeEquipmentLabels) {
        this.addEquipmentLegend(pdf, placedEquipment, equipmentDefinitions, pageWidth, pageHeight, margin)
      }

      // Add footer
      this.addFooter(pdf, metadata, pageWidth, pageHeight, margin)

      // Add equipment details page
      if (placedEquipment.length > 0) {
        pdf.addPage()
        this.addEquipmentDetailsPage(pdf, placedEquipment, equipmentDefinitions, options, metadata, pageWidth, pageHeight, margin)
      }

      // Save PDF
      const fileName = `${metadata.projectName.replace(/[^a-z0-9]/gi, '_')}_layout_${new Date().toISOString().split('T')[0]}.pdf`
      pdf.save(fileName)

    } catch (error) {
      console.error('PDF export failed:', error)
      throw new Error(`PDF export failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private static getQualityScale(quality: 'low' | 'medium' | 'high'): number {
    switch (quality) {
      case 'low': return 1
      case 'medium': return 2
      case 'high': return 3
      default: return 2
    }
  }

  private static addTitlePage(
    pdf: jsPDF, 
    options: PDFExportOptions, 
    metadata: PDFMetadata, 
    pageWidth: number, 
    pageHeight: number
  ): void {
    const centerX = pageWidth / 2

    // Title
    pdf.setFontSize(24)
    pdf.setFont('helvetica', 'bold')
    pdf.text(options.title, centerX, 2, { align: 'center' })

    // Subtitle
    if (options.subtitle) {
      pdf.setFontSize(16)
      pdf.setFont('helvetica', 'normal')
      pdf.text(options.subtitle, centerX, 2.8, { align: 'center' })
    }

    // Project info
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Project Information', centerX, 4.5, { align: 'center' })

    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'normal')
    const infoY = 5.2
    const lineHeight = 0.3

    pdf.text(`Project Name: ${metadata.projectName}`, 1, infoY)
    pdf.text(`Created By: ${metadata.createdBy}`, 1, infoY + lineHeight)
    pdf.text(`Date: ${metadata.createdDate}`, 1, infoY + lineHeight * 2)
    pdf.text(`Scale: ${metadata.scale}`, 1, infoY + lineHeight * 3)
    pdf.text(`Total Area: ${metadata.totalArea}`, 1, infoY + lineHeight * 4)
    pdf.text(`Equipment Count: ${metadata.equipmentCount}`, 1, infoY + lineHeight * 5)

    // Export options
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Export Settings', centerX, 7.5, { align: 'center' })

    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'normal')
    const settingsY = 8.2

    pdf.text(`Paper Size: ${options.paperSize.toUpperCase()}`, 1, settingsY)
    pdf.text(`Orientation: ${options.orientation}`, 1, settingsY + lineHeight)
    pdf.text(`Quality: ${options.quality}`, 1, settingsY + lineHeight * 2)
    pdf.text(`Background Images: ${options.includeBackground ? 'Yes' : 'No'}`, 1, settingsY + lineHeight * 3)
    pdf.text(`Equipment Labels: ${options.includeEquipmentLabels ? 'Yes' : 'No'}`, 1, settingsY + lineHeight * 4)
    pdf.text(`Clearance Zones: ${options.includeClearanceZones ? 'Yes' : 'No'}`, 1, settingsY + lineHeight * 5)
    pdf.text(`Dimensions: ${options.includeDimensions ? 'Yes' : 'No'}`, 1, settingsY + lineHeight * 6)

    // Footer
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'italic')
    pdf.text('Generated by Lot Planner', centerX, pageHeight - 0.5, { align: 'center' })
  }

  private static addHeader(
    pdf: jsPDF, 
    title: string, 
    metadata: PDFMetadata, 
    pageWidth: number, 
    margin: number
  ): void {
    pdf.setFontSize(16)
    pdf.setFont('helvetica', 'bold')
    pdf.text(title, margin, margin + 0.3)

    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`${metadata.projectName} - ${metadata.createdDate}`, pageWidth - margin, margin + 0.3, { align: 'right' })

    // Add line under header
    pdf.setLineWidth(0.01)
    pdf.line(margin, margin + 0.5, pageWidth - margin, margin + 0.5)
  }

  private static addScaleBar(
    pdf: jsPDF, 
    x: number, 
    y: number, 
    maxWidth: number
  ): void {
    const scaleBarWidth = Math.min(2, maxWidth * 0.3) // 2 inches or 30% of layout width
    const scaleBarHeight = 0.1
    const feetRepresented = Math.round((scaleBarWidth * 72) / this.PIXELS_PER_FOOT) // Convert inches to pixels to feet

    // Draw scale bar
    pdf.setFillColor(0, 0, 0)
    pdf.rect(x, y, scaleBarWidth, scaleBarHeight, 'F')

    // Add scale text
    pdf.setFontSize(8)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`0`, x, y + scaleBarHeight + 0.15)
    pdf.text(`${feetRepresented}'`, x + scaleBarWidth, y + scaleBarHeight + 0.15, { align: 'right' })
    pdf.text('Scale', x + scaleBarWidth / 2, y - 0.05, { align: 'center' })
  }

  private static addEquipmentLegend(
    pdf: jsPDF,
    placedEquipment: PlacedEquipment[],
    equipmentDefinitions: EquipmentItem[],
    pageWidth: number,
    pageHeight: number,
    margin: number
  ): void {
    // Get unique equipment types
    const uniqueEquipment = new Map<string, { name: string; count: number; category: string }>()
    
    placedEquipment.forEach(placed => {
      const definition = equipmentDefinitions.find(def => def.id === placed.equipmentId)
      if (definition) {
        const key = definition.id
        if (uniqueEquipment.has(key)) {
          uniqueEquipment.get(key)!.count++
        } else {
          uniqueEquipment.set(key, {
            name: definition.name,
            count: 1,
            category: definition.category
          })
        }
      }
    })

    // Add legend box
    const legendX = pageWidth - margin - 2.5
    const legendY = margin + 1.5
    const legendWidth = 2.3
    const legendHeight = Math.min(uniqueEquipment.size * 0.25 + 0.5, pageHeight - legendY - margin)

    pdf.setDrawColor(0, 0, 0)
    pdf.setLineWidth(0.01)
    pdf.rect(legendX, legendY, legendWidth, legendHeight)

    // Legend title
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Equipment Legend', legendX + 0.1, legendY + 0.2)

    // Legend items
    pdf.setFontSize(8)
    pdf.setFont('helvetica', 'normal')
    let itemY = legendY + 0.4
    const lineHeight = 0.2

    Array.from(uniqueEquipment.values()).forEach((equipment, index) => {
      if (itemY + lineHeight < legendY + legendHeight - 0.1) {
        pdf.text(`• ${equipment.name} (${equipment.count})`, legendX + 0.1, itemY)
        itemY += lineHeight
      }
    })
  }

  private static addFooter(
    pdf: jsPDF,
    metadata: PDFMetadata,
    pageWidth: number,
    pageHeight: number,
    margin: number
  ): void {
    const footerY = pageHeight - margin

    pdf.setFontSize(8)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`Generated: ${new Date().toLocaleString()}`, margin, footerY)
    pdf.text(`Page ${pdf.internal.getCurrentPageInfo().pageNumber}`, pageWidth - margin, footerY, { align: 'right' })
  }

  private static addEquipmentDetailsPage(
    pdf: jsPDF,
    placedEquipment: PlacedEquipment[],
    equipmentDefinitions: EquipmentItem[],
    options: PDFExportOptions,
    metadata: PDFMetadata,
    pageWidth: number,
    pageHeight: number,
    margin: number
  ): void {
    // Add header
    this.addHeader(pdf, 'Equipment Details', metadata, pageWidth, margin)

    let currentY = margin + 1
    const lineHeight = 0.15
    const sectionSpacing = 0.3

    // Group equipment by category
    const equipmentByCategory = new Map<string, Array<{ placed: PlacedEquipment; definition: EquipmentItem }>>()
    
    placedEquipment.forEach(placed => {
      const definition = equipmentDefinitions.find(def => def.id === placed.equipmentId)
      if (definition) {
        const category = definition.category
        if (!equipmentByCategory.has(category)) {
          equipmentByCategory.set(category, [])
        }
        equipmentByCategory.get(category)!.push({ placed, definition })
      }
    })

    // Add equipment details by category
    equipmentByCategory.forEach((items, category) => {
      // Category header
      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'bold')
      pdf.text(category, margin, currentY)
      currentY += lineHeight + 0.1

      // Equipment items
      pdf.setFontSize(9)
      pdf.setFont('helvetica', 'normal')

      items.forEach(({ placed, definition }) => {
        // Check if we need a new page
        if (currentY + lineHeight * 4 > pageHeight - margin) {
          pdf.addPage()
          this.addHeader(pdf, 'Equipment Details (continued)', metadata, pageWidth, margin)
          currentY = margin + 1
        }

        // Equipment name
        pdf.setFont('helvetica', 'bold')
        pdf.text(`${definition.name}`, margin + 0.2, currentY)
        currentY += lineHeight

        // Equipment details
        pdf.setFont('helvetica', 'normal')
        const positionX = Math.round(placed.x / this.PIXELS_PER_FOOT)
        const positionY = Math.round(placed.y / this.PIXELS_PER_FOOT)
        
        pdf.text(`Position: (${positionX}', ${positionY}')`, margin + 0.4, currentY)
        currentY += lineHeight

        if (options.includeDimensions && placed.dimensions) {
          const dims = placed.dimensions
          if (dims.shape === 'rectangle') {
            pdf.text(`Dimensions: ${dims.width}' × ${dims.height}'`, margin + 0.4, currentY)
          } else {
            pdf.text(`Dimensions: ${dims.radius}' radius`, margin + 0.4, currentY)
          }
          currentY += lineHeight
        }

        if (placed.rotation !== 0) {
          pdf.text(`Rotation: ${Math.round(placed.rotation)}°`, margin + 0.4, currentY)
          currentY += lineHeight
        }

        currentY += sectionSpacing
      })

      currentY += sectionSpacing
    })

    // Add summary
    currentY += sectionSpacing
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Summary', margin, currentY)
    currentY += lineHeight + 0.1

    pdf.setFontSize(9)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`Total Equipment: ${placedEquipment.length}`, margin + 0.2, currentY)
    currentY += lineHeight
    pdf.text(`Categories: ${equipmentByCategory.size}`, margin + 0.2, currentY)

    // Add footer
    this.addFooter(pdf, metadata, pageWidth, pageHeight, margin)
  }
}
