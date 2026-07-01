import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export async function exportElementToPdf(
  elementId: string,
  fileName: string
): Promise<void> {
  const element = document.getElementById(elementId)
  if (!element) {
    console.error(`Export failed — element #${elementId} not found.`)
    return
  }

  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: '#FFFFFF',
    useCORS: true,
  })

  const imgData = canvas.toDataURL('image/png')

  // A4 width in points (jsPDF default unit), scaled to image aspect ratio
  const pdf = new jsPDF({
    orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
    unit: 'px',
    format: [canvas.width, canvas.height],
  })

  pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height)
  pdf.save(`${fileName}.pdf`)
}