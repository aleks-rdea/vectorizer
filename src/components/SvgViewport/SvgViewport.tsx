import { useMemo, useRef, useEffect, useState, useCallback } from 'react'
import {
  computeFitToViewportTransform,
  clampPanToViewport,
} from '../../lib/viewportTransform'
import { useViewport } from '../../contexts/ViewportContext'
import './SvgViewport.css'

export type SvgViewportProps = {
  /** SVG markup string, or null for empty state */
  svg: string | null
  /** Width of the source image (for aspect ratio / viewport sync) */
  imageWidth: number
  /** Height of the source image */
  imageHeight: number
  /** Optional error message when SVG failed to load */
  error?: string | null
  /** Canvas background (color or gradient, e.g. #fff, linear-gradient(...)) */
  backgroundColor?: string
}

const EMPTY_MESSAGE = 'View vectorized version here'

export function SvgViewport({
  svg,
  imageWidth,
  imageHeight,
  error,
  backgroundColor = '#fff',
}: SvgViewportProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })
  const { viewport, setZoomPan, reset } = useViewport()
  const { zoom, panX, panY } = viewport

  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 })

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new ResizeObserver(() => {
      const rect = el.getBoundingClientRect()
      setSize({ w: Math.floor(rect.width), h: Math.floor(rect.height) })
    })
    observer.observe(el)
    const rect = el.getBoundingClientRect()
    setSize({ w: Math.floor(rect.width), h: Math.floor(rect.height) })
    return () => observer.disconnect()
  }, [])

  const fit = useMemo(() => {
    if (size.w <= 0 || size.h <= 0 || imageWidth <= 0 || imageHeight <= 0) return null
    return computeFitToViewportTransform(imageWidth, imageHeight, size.w, size.h)
  }, [size.w, size.h, imageWidth, imageHeight])

  const transformStyle = useMemo(() => {
    if (!fit) return undefined
    const scale = fit.scale * zoom
    const x = fit.offsetX + panX
    const y = fit.offsetY + panY
    return { transform: `translate(${x}px, ${y}px) scale(${scale})`, transformOrigin: '0 0' }
  }, [fit, zoom, panX, panY])

  const sanitized = useMemo(() => {
    if (!svg || typeof svg !== 'string') return null
    const trimmed = svg.trim()
    const svgStart = trimmed.indexOf('<svg')
    if (svgStart === -1) return null
    return trimmed.slice(svgStart)
  }, [svg])

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      if (!containerRef.current || !fit) return
      e.preventDefault()
      const rect = containerRef.current.getBoundingClientRect()
      const viewportX = e.clientX - rect.left
      const viewportY = e.clientY - rect.top
      const zoomSensitivity = 0.004
      const maxZoomDelta = 0.12
      const zoomDelta = Math.max(
        -maxZoomDelta,
        Math.min(maxZoomDelta, -e.deltaY * zoomSensitivity)
      )
      const factor = 1 + zoomDelta
      const newZoom = Math.max(0.1, Math.min(10, zoom * factor))
      const contentX = viewportX - fit.offsetX - panX
      const contentY = viewportY - fit.offsetY - panY
      const newPanX = viewportX - contentX * (newZoom / zoom) - fit.offsetX
      const newPanY = viewportY - contentY * (newZoom / zoom) - fit.offsetY
      setZoomPan(newZoom, newPanX, newPanY)
    },
    [fit, zoom, panX, panY, setZoomPan, imageWidth, imageHeight]
  )

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    container.addEventListener('wheel', handleWheel, { passive: false })
    return () => container.removeEventListener('wheel', handleWheel)
  }, [handleWheel])

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return
      e.preventDefault()
      setIsDragging(true)
      dragStartRef.current = { x: e.clientX, y: e.clientY, panX, panY }
    },
    [panX, panY]
  )

  const handleDoubleClick = useCallback(() => {
    reset()
  }, [reset])

  useEffect(() => {
    if (!isDragging) return
    const onMove = (e: MouseEvent) => {
      const { x, y, panX: startPanX, panY: startPanY } = dragStartRef.current
      const rawPanX = startPanX + (e.clientX - x)
      const rawPanY = startPanY + (e.clientY - y)
      if (!containerRef.current || !fit) {
        setZoomPan(zoom, rawPanX, rawPanY)
        return
      }
      const rect = containerRef.current.getBoundingClientRect()
      const clamped = clampPanToViewport(
        rawPanX,
        rawPanY,
        rect.width,
        rect.height,
        fit,
        zoom,
        imageWidth,
        imageHeight
      )
      setZoomPan(zoom, clamped.panX, clamped.panY)
    }
    const onUp = () => setIsDragging(false)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [isDragging, zoom, setZoomPan, fit, imageWidth, imageHeight])

  const viewportStyle = { background: backgroundColor }

  if (error) {
    return (
      <div className="svg-viewport svg-viewport--error" style={viewportStyle}>
        <p className="layout-pane-empty-text-muted" role="alert">
          {error}
        </p>
      </div>
    )
  }

  if (!sanitized) {
    return (
      <div className="svg-viewport svg-viewport--empty" style={viewportStyle}>
        <p className="layout-pane-empty-text">{EMPTY_MESSAGE}</p>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="svg-viewport"
      style={{ ...viewportStyle, cursor: isDragging ? 'grabbing' : 'grab' }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      role="img"
      aria-label="Vector SVG viewport"
    >
      <div
        className="svg-viewport__transform"
        style={{
          width: imageWidth,
          height: imageHeight,
          ...transformStyle,
        }}
      >
        <div
          className="svg-viewport__inner"
          dangerouslySetInnerHTML={{ __html: sanitized }}
        />
      </div>
    </div>
  )
}
