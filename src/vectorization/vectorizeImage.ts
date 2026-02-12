import { potrace, init } from 'esm-potrace-wasm'

let initPromise: Promise<void> | null = null

function ensureInit(): Promise<void> {
  if (initPromise == null) {
    initPromise = init()
  }
  return initPromise
}

export type VectorizeOptions = {
  /** 0–255: pixels darker than this become black in the trace */
  threshold: number
  /** Curve smoothness; higher = smoother curves (maps to opttolerance) */
  smoothness: number
  /** Detail level; higher = fewer small shapes (maps to turdsize) */
  detailLevel: number
  /** Corner rounding; higher = rounder corners (maps to alphamax) */
  cornerRounding: number
  /** 1 = black/white only; 2–8 = multi-color (extractcolors + posterizelevel) */
  colorCount: number
}

const DEFAULT_OPTIONS: VectorizeOptions = {
  threshold: 128,
  smoothness: 1.25,
  detailLevel: 2,
  cornerRounding: 1,
  colorCount: 1,
}

/**
 * Binarize ImageData by threshold: luminance < threshold -> black (0), else white (255).
 * Iterates by pixel count so we never read/write out of bounds (handles buffers with row padding).
 */
function binarizeImageData(
  imageData: ImageData,
  threshold: number
): ImageData {
  const { data, width, height } = imageData
  const out = new ImageData(width, height)
  const outData = out.data
  const pixelCount = width * height

  for (let p = 0; p < pixelCount; p++) {
    const i = p * 4
    const r = data[i] ?? 0
    const g = data[i + 1] ?? 0
    const b = data[i + 2] ?? 0
    const a = data[i + 3] ?? 255
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) * (a / 255)
    const value = luminance < threshold ? 0 : 255
    outData[i] = value
    outData[i + 1] = value
    outData[i + 2] = value
    outData[i + 3] = 255
  }

  return out
}

/**
 * Map our 0–1 or custom ranges to potrace options.
 * - smoothness: 0.5–2 → opttolerance 0.1–0.5
 * - detailLevel: 1–20 → turdsize (suppress speckles), higher = less detail
 * - cornerRounding: 0.5–2 → alphamax
 */
function mapOptions(opts: VectorizeOptions) {
  const threshold = Math.max(0, Math.min(255, Math.round(opts.threshold)))
  const opttolerance = Math.max(0.1, Math.min(0.5, 0.1 + opts.smoothness * 0.2))
  const turdsize = Math.max(0, Math.min(50, Math.round(opts.detailLevel)))
  const alphamax = Math.max(0.1, Math.min(2, opts.cornerRounding))
  const colorCount = Math.max(1, Math.min(8, Math.round(opts.colorCount)))
  const extractcolors = colorCount > 1
  const posterizelevel = Math.max(1, Math.min(255, colorCount))

  return {
    threshold,
    potraceOptions: {
      turdsize,
      turnpolicy: 4,
      alphamax,
      opticurve: 1,
      opttolerance,
      pathonly: false,
      extractcolors,
      ...(extractcolors && {
        posterizelevel,
        posterizationalgorithm: 0,
      }),
    },
  }
}

/**
 * Vectorize raster image data to SVG using Potrace.
 * @param imageData - RGBA ImageData (e.g. from canvas getImageData)
 * @param options - threshold, smoothness, detailLevel, cornerRounding
 * @returns SVG markup string
 */
const EXPECTED_BYTES_PER_PIXEL = 4

const DEBUG_VECTORIZE = typeof import.meta !== 'undefined' && import.meta.env?.DEV

function debugLog(...args: unknown[]) {
  if (DEBUG_VECTORIZE) {
    console.log('[vectorize]', ...args)
  }
}

export async function vectorizeImage(
  imageData: ImageData,
  options: Partial<VectorizeOptions> = {}
): Promise<string> {
  const { data, width, height } = imageData
  const expectedLength = width * height * EXPECTED_BYTES_PER_PIXEL

  debugLog('Input ImageData:', { width, height, dataLength: data.length, expectedLength })

  if (
    width <= 0 ||
    height <= 0 ||
    data.length !== expectedLength
  ) {
    const msg = `Invalid image data: dimensions ${width}x${height} do not match data length (expected ${expectedLength}, got ${data.length}). Try a different image.`
    debugLog('Validation failed:', msg)
    throw new Error(msg)
  }

  const opts: VectorizeOptions = { ...DEFAULT_OPTIONS, ...options }
  const { threshold, potraceOptions } = mapOptions(opts)

  try {
    await ensureInit()
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    debugLog('Init failed:', msg)
    throw new Error(`Failed to initialize vectorization: ${msg}`)
  }

  const tightData = new Uint8ClampedArray(expectedLength)
  tightData.set(data.subarray(0, expectedLength))
  const normalized = new ImageData(tightData, width, height)

  const useColor = potraceOptions.extractcolors
  const inputForPotrace = useColor
    ? normalized
    : binarizeImageData(normalized, threshold)

  debugLog(useColor ? 'Color mode: passing RGBA to Potrace...' : 'Binarizing...', {
    width,
    height,
  })
  debugLog('Calling Potrace WASM...', {
    width: inputForPotrace.width,
    height: inputForPotrace.height,
    dataLength: inputForPotrace.data.length,
  })

  let svg: string
  try {
    svg = await potrace(inputForPotrace, potraceOptions)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[vectorize] Potrace WASM threw:', msg, {
      width: inputForPotrace.width,
      height: inputForPotrace.height,
      pixelCount: inputForPotrace.width * inputForPotrace.height,
    })
    throw new Error(
      `Vectorization failed (offset is out of bounds often means the image is too large or has unsupported dimensions). Try a smaller image or different format. Original error: ${msg}`
    )
  }

  if (typeof svg !== 'string' || !svg.includes('<svg')) {
    throw new Error('Vectorization did not produce valid SVG.')
  }

  debugLog('Potrace done.')
  return svg
}

export { DEFAULT_OPTIONS }
