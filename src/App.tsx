import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import './App.css'
import { AppLayout } from './components/layout/AppLayout'
import { ImageInput, type ImageInputHandle } from './components/ImageInput/ImageInput'
import { RasterViewport } from './components/RasterViewport/RasterViewport'
import { SettingsPanel } from './components/SettingsPanel/SettingsPanel'
import { SvgViewport } from './components/SvgViewport/SvgViewport'
import { useDebounce } from './hooks/useDebounce'
import { useImage } from './contexts/ImageContext'
import { useViewport } from './contexts/ViewportContext'
import {
  useVectorizeParams,
  type CanvasBackground,
} from './contexts/VectorizeParamsContext'
import { useToast } from './contexts/ToastContext'
import { vectorizeImage } from './vectorization/vectorizeImage'

const CANVAS_BACKGROUND_STYLES: Record<CanvasBackground, string> = {
  dark: 'linear-gradient(to bottom, #000000, #333333)',
  light: '#fff',
  mid: 'linear-gradient(to bottom, #666666, #808080)',
}

/** Max width/height for vectorization; Potrace WASM can fail with "offset is out of bounds" above ~1024. */
const MAX_VECTORIZE_DIMENSION = 1024

const DEBUG_IMAGE = import.meta.env?.DEV

/**
 * Resize dimensions to fit within maxSize, preserving aspect ratio.
 * Returns new [w, h] with both <= maxSize. When downscaling, forces even dimensions (some WASM code is sensitive to odd sizes).
 */
function resizeToFitMax(
  width: number,
  height: number,
  maxSize: number
): [number, number] {
  if (width <= maxSize && height <= maxSize) return [width, height]
  const scale = Math.min(maxSize / width, maxSize / height)
  const w = Math.round(width * scale)
  const h = Math.round(height * scale)
  return [Math.max(2, w & ~1), Math.max(2, h & ~1)]
}

type ImageDataResult = { imageData: ImageData; wasResized: boolean }

type ImageFilterOptions = { contrast: number; saturation: number }

function imageToImageData(
  url: string,
  _width: number,
  _height: number,
  options?: ImageFilterOptions
): Promise<ImageDataResult> {
  const contrast = options?.contrast ?? 1
  const saturation = options?.saturation ?? 1
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      let w = img.naturalWidth
      let h = img.naturalHeight
      if (w <= 0 || h <= 0) {
        reject(new Error('Image has invalid dimensions'))
        return
      }
      if (DEBUG_IMAGE) {
        console.log('[vectorize] Image loaded:', { width: w, height: h })
      }
      const [drawW, drawH] = resizeToFitMax(w, h, MAX_VECTORIZE_DIMENSION)
      const wasResized = drawW < w || drawH < h
      if (wasResized) {
        w = drawW
        h = drawH
        if (DEBUG_IMAGE) {
          console.log('[vectorize] Resized to fit max:', { width: w, height: h })
        }
      }
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Canvas 2d not available'))
        return
      }
      ctx.filter = `contrast(${contrast}) saturate(${saturation})`
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      const imageData = ctx.getImageData(0, 0, w, h)
      if (DEBUG_IMAGE) {
        console.log('[vectorize] getImageData:', {
          width: imageData.width,
          height: imageData.height,
          dataLength: imageData.data.length,
          expected: w * h * 4,
        })
      }
      resolve({ imageData, wasResized })
    }
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = url
  })
}

const VECTORIZE_DEBOUNCE_MS = 300

function App() {
  const { image, clearImage } = useImage()
  const { reset: resetViewport } = useViewport()
  const { params, setParam, resetParams } = useVectorizeParams()
  const { showToast } = useToast()
  const debouncedParams = useDebounce(params, VECTORIZE_DEBOUNCE_MS)
  const paramsKey = useMemo(
    () =>
      `${debouncedParams.threshold}-${debouncedParams.smoothness}-${debouncedParams.detailLevel}-${debouncedParams.cornerRounding}-${debouncedParams.colorCount}-${debouncedParams.contrast}-${debouncedParams.saturation}`,
    [debouncedParams]
  )

  const [svg, setSvg] = useState<string | null>(null)
  const [vectorizeError, setVectorizeError] = useState<string | null>(null)
  const [isVectorizing, setIsVectorizing] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const imageInputRef = useRef<ImageInputHandle>(null)

  useEffect(() => {
    if (image) resetViewport()
    // Intentionally depend on image?.url only so we reset when the image source changes
  }, [image?.url, resetViewport]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!image) return
    let cancelled = false
    // Show loading state immediately so user sees "Vectorizing..." (intentional sync setState)
    /* eslint-disable react-hooks/set-state-in-effect */
    setIsVectorizing(true)
    setVectorizeError(null)
    /* eslint-enable react-hooks/set-state-in-effect */
    imageToImageData(image.url, image.width, image.height, {
      contrast: debouncedParams.contrast,
      saturation: debouncedParams.saturation,
    })
      .then(({ imageData, wasResized }) => {
        if (wasResized) {
          showToast('Image resized to fit maximum size for vectorization')
        }
        return vectorizeImage(imageData, {
          threshold: debouncedParams.threshold,
          smoothness: debouncedParams.smoothness,
          detailLevel: debouncedParams.detailLevel,
          cornerRounding: debouncedParams.cornerRounding,
          colorCount: debouncedParams.colorCount,
        })
      })
      .then((result) => {
        if (!cancelled) {
          setSvg(result)
          setVectorizeError(null)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'Vectorization failed'
          setSvg(null)
          setVectorizeError(message)
          showToast(message, 'error')
        }
      })
      .finally(() => {
        if (!cancelled) setIsVectorizing(false)
      })
    return () => {
      cancelled = true
    }
  }, [image?.url, image?.width, image?.height, paramsKey, showToast]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleClearCanvas = useCallback(() => {
    clearImage()
    resetViewport()
    resetParams()
    setSvg(null)
    setVectorizeError(null)
    setSettingsOpen(false)
  }, [clearImage, resetViewport, resetParams])

  const handleDownloadSvg = useCallback(() => {
    if (!svg) return
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'vectorized.svg'
    a.click()
    URL.revokeObjectURL(url)
    showToast('SVG downloaded')
  }, [svg, showToast])

  const handleCopySvg = useCallback(async () => {
    if (!svg) return
    try {
      await navigator.clipboard.writeText(svg)
      showToast('Copied to clipboard')
    } catch {
      try {
        const textArea = document.createElement('textarea')
        textArea.value = svg
        textArea.style.position = 'fixed'
        textArea.style.opacity = '0'
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        showToast('Copied to clipboard')
      } catch {
        showToast('Failed to copy to clipboard', 'error')
      }
    }
  }, [svg, showToast])

  const rightContent = useCallback(() => {
    if (isVectorizing) {
      return (
        <p className="layout-pane-empty-text-muted">Vectorizing…</p>
      )
    }
    return (
      <SvgViewport
        svg={image ? svg : null}
        imageWidth={image?.width ?? 0}
        imageHeight={image?.height ?? 0}
        error={image ? vectorizeError : null}
        backgroundColor="transparent"
      />
    )
  }, [svg, image, vectorizeError, isVectorizing])

  return (
    <div className="app-root">
      <main className="app-main" role="main">
        <AppLayout
          canvasBackgroundStyle={CANVAS_BACKGROUND_STYLES[params.canvasBackground]}
          canvasBackground={params.canvasBackground}
          hasSvg={!!(image && svg)}
          hasImage={!!image}
           isSettingsOpen={settingsOpen}
          onSettingsClick={() => setSettingsOpen((o) => !o)}
          onResetViewClick={resetViewport}
          onDownloadClick={handleDownloadSvg}
          onCopyClick={handleCopySvg}
          onClearCanvas={handleClearCanvas}
          onAddImageClick={() => imageInputRef.current?.openFileDialog?.()}
          leftContent={
            image ? (
              <RasterViewport image={image} backgroundColor="transparent" />
            ) : (
              <ImageInput ref={imageInputRef} />
            )
          }
          rightContent={rightContent()}
        />
      </main>
      {settingsOpen && (
        <SettingsPanel
          params={params}
          onParamChange={setParam}
          onClearCanvas={handleClearCanvas}
          onClose={() => setSettingsOpen(false)}
          isVectorizing={isVectorizing}
        />
      )}
    </div>
  )
}

export default App
