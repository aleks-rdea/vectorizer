/**
 * Transform that scales and translates image so it fits inside the viewport
 * and is centered. Aspect ratio is preserved.
 */
export type FitToViewportTransform = {
  scale: number
  offsetX: number
  offsetY: number
}

/**
 * Computes scale and offset so that an image of (imageWidth, imageHeight)
 * fits inside a viewport of (viewportWidth, viewportHeight) and is centered.
 * Aspect ratio is preserved.
 */
export function computeFitToViewportTransform(
  imageWidth: number,
  imageHeight: number,
  viewportWidth: number,
  viewportHeight: number
): FitToViewportTransform {
  if (imageWidth <= 0 || imageHeight <= 0 || viewportWidth <= 0 || viewportHeight <= 0) {
    return { scale: 1, offsetX: 0, offsetY: 0 }
  }

  const scaleX = viewportWidth / imageWidth
  const scaleY = viewportHeight / imageHeight
  const scale = Math.min(scaleX, scaleY, 1)

  const scaledWidth = imageWidth * scale
  const scaledHeight = imageHeight * scale
  const offsetX = (viewportWidth - scaledWidth) / 2
  const offsetY = (viewportHeight - scaledHeight) / 2

  return { scale, offsetX, offsetY }
}

/** Minimum visible portion of the image (px) when panning so it can't be lost off-screen */
const PAN_MARGIN = 60

/**
 * Clamps pan so at least PAN_MARGIN pixels of the scaled image remain visible
 * in each direction (or a fraction of viewport if smaller).
 */
export function clampPanToViewport(
  panX: number,
  panY: number,
  viewportWidth: number,
  viewportHeight: number,
  fit: FitToViewportTransform,
  zoom: number,
  imageWidth: number,
  imageHeight: number
): { panX: number; panY: number } {
  const scaledW = imageWidth * fit.scale * zoom
  const scaledH = imageHeight * fit.scale * zoom
  const marginX = Math.min(PAN_MARGIN, viewportWidth * 0.15)
  const marginY = Math.min(PAN_MARGIN, viewportHeight * 0.15)

  let minPanX = -fit.offsetX - scaledW + marginX
  let maxPanX = viewportWidth - fit.offsetX - marginX
  let minPanY = -fit.offsetY - scaledH + marginY
  let maxPanY = viewportHeight - fit.offsetY - marginY

  if (minPanX > maxPanX) {
    const mid = (minPanX + maxPanX) / 2
    minPanX = maxPanX = mid
  }
  if (minPanY > maxPanY) {
    const mid = (minPanY + maxPanY) / 2
    minPanY = maxPanY = mid
  }

  return {
    panX: Math.max(minPanX, Math.min(maxPanX, panX)),
    panY: Math.max(minPanY, Math.min(maxPanY, panY)),
  }
}
