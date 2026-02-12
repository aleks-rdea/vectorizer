/**
 * Extract viewBox from an SVG string.
 * Returns null if not found or malformed.
 */
export type ViewBox = {
  minX: number
  minY: number
  width: number
  height: number
}

const VIEWBOX_REGEX = /viewBox\s*=\s*["']?\s*(-?\d*\.?\d+)\s+(-?\d*\.?\d+)\s+(-?\d*\.?\d+)\s+(-?\d*\.?\d+)\s*["']?/

export function getViewBoxFromSvg(svg: string): ViewBox | null {
  const match = svg.match(VIEWBOX_REGEX)
  if (!match) return null
  const minX = parseFloat(match[1])
  const minY = parseFloat(match[2])
  const width = parseFloat(match[3])
  const height = parseFloat(match[4])
  if (Number.isNaN(minX) || Number.isNaN(minY) || width <= 0 || height <= 0) {
    return null
  }
  return { minX, minY, width, height }
}
