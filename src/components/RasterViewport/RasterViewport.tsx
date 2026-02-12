import { useEffect, useRef, useCallback, useState } from 'react'
import type { ImageState } from '../../contexts/ImageContext'
import { useViewport } from '../../contexts/ViewportContext'
import {
  computeFitToViewportTransform,
  clampPanToViewport,
} from '../../lib/viewportTransform'
import './RasterViewport.css'

type RasterViewportProps = {
  image: ImageState
  /** Canvas background (color or gradient, e.g. #fff, linear-gradient(...)) */
  backgroundColor?: string
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = url
  })
}

export function RasterViewport({ image, backgroundColor = '#fff' }: RasterViewportProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)
  const { viewport, setZoomPan, reset } = useViewport()
  const { zoom, panX, panY } = viewport

  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 })

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    const img = imageRef.current
    if (!canvas || !container || !img) return

    const dpr = window.devicePixelRatio ?? 1
    const rect = container.getBoundingClientRect()
    const w = Math.floor(rect.width)
    const h = Math.floor(rect.height)
    if (w <= 0 || h <= 0) return

    canvas.width = w * dpr
    canvas.height = h * dpr
    canvas.style.width = `${w}px`
    canvas.style.height = `${h}px`

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.scale(dpr, dpr)

    const fit = computeFitToViewportTransform(
      img.naturalWidth,
      img.naturalHeight,
      w,
      h
    )
    const scale = fit.scale * zoom
    const offsetX = fit.offsetX + panX
    const offsetY = fit.offsetY + panY

    ctx.drawImage(
      img,
      0,
      0,
      img.naturalWidth,
      img.naturalHeight,
      offsetX,
      offsetY,
      img.naturalWidth * scale,
      img.naturalHeight * scale
    )
  }, [zoom, panX, panY])

  useEffect(() => {
    let cancelled = false
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    loadImage(image.url)
      .then((img) => {
        if (cancelled) return
        imageRef.current = img
        draw()
      })
      .catch(() => {
        if (!cancelled) imageRef.current = null
      })

    return () => {
      cancelled = true
      imageRef.current = null
    }
  }, [image.url, draw])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new ResizeObserver(() => draw())
    observer.observe(container)
    return () => observer.disconnect()
  }, [draw])

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      const container = containerRef.current
      const img = imageRef.current
      if (!container || !img) return
      e.preventDefault()
      const rect = container.getBoundingClientRect()
      const viewportX = e.clientX - rect.left
      const viewportY = e.clientY - rect.top
      const fit = computeFitToViewportTransform(
        img.naturalWidth,
        img.naturalHeight,
        rect.width,
        rect.height
      )
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
    [zoom, panX, panY, setZoomPan]
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
      const container = containerRef.current
      const img = imageRef.current
      if (!container || !img) {
        setZoomPan(zoom, rawPanX, rawPanY)
        return
      }
      const rect = container.getBoundingClientRect()
      const fit = computeFitToViewportTransform(
        img.naturalWidth,
        img.naturalHeight,
        rect.width,
        rect.height
      )
      const clamped = clampPanToViewport(
        rawPanX,
        rawPanY,
        rect.width,
        rect.height,
        fit,
        zoom,
        img.naturalWidth,
        img.naturalHeight
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
  }, [isDragging, zoom, setZoomPan])

  return (
    <div
      ref={containerRef}
      className="raster-viewport"
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      role="img"
      aria-label="Raster image viewport"
      style={{
        cursor: isDragging ? 'grabbing' : 'grab',
        background: backgroundColor,
      }}
    >
      <canvas ref={canvasRef} className="raster-viewport-canvas" />
    </div>
  )
}
