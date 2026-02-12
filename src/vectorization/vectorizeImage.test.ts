import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  vectorizeImage,
  DEFAULT_OPTIONS,
  type VectorizeOptions,
} from './vectorizeImage'

const mockPotrace = vi.fn()
const mockInit = vi.fn().mockResolvedValue(undefined)

vi.mock('esm-potrace-wasm', () => ({
  potrace: (...args: unknown[]) => mockPotrace(...args),
  init: () => mockInit(),
}))

function createImageData(width: number, height: number): ImageData {
  return new ImageData(width, height)
}

describe('vectorizeImage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockInit.mockResolvedValue(undefined)
    mockPotrace.mockResolvedValue(
      '<svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0 L10 10"/></svg>'
    )
  })

  it('returns SVG string containing <svg and path data when trace succeeds', async () => {
    const imageData = createImageData(10, 10)
    const result = await vectorizeImage(imageData)
    expect(typeof result).toBe('string')
    expect(result).toContain('<svg')
    expect(result).toContain('<path')
  })

  it('calls potrace with binarized ImageData and options', async () => {
    const imageData = createImageData(2, 2)
    await vectorizeImage(imageData, { threshold: 100 })
    expect(mockPotrace).toHaveBeenCalledTimes(1)
    const [passedData, passedOpts] = mockPotrace.mock.calls[0] as [
      ImageData,
      Record<string, unknown>
    ]
    expect(passedData).toBeInstanceOf(ImageData)
    expect(passedData.width).toBe(2)
    expect(passedData.height).toBe(2)
    expect(passedOpts).toMatchObject({
      pathonly: false,
      extractcolors: false,
      opticurve: 1,
      turnpolicy: 4,
    })
    expect(typeof passedOpts.turdsize).toBe('number')
    expect(typeof passedOpts.alphamax).toBe('number')
    expect(typeof passedOpts.opttolerance).toBe('number')
  })

  it('throws when potrace returns invalid SVG', async () => {
    mockPotrace.mockResolvedValue('not valid svg')
    const imageData = createImageData(5, 5)
    await expect(vectorizeImage(imageData)).rejects.toThrow(
      'Vectorization did not produce valid SVG'
    )
  })

  it('uses default options when none provided', async () => {
    const imageData = createImageData(3, 3)
    await vectorizeImage(imageData)
    const opts = mockPotrace.mock.calls[0][1] as Record<string, unknown>
    expect(opts.turdsize).toBe(DEFAULT_OPTIONS.detailLevel)
    expect(opts.alphamax).toBe(DEFAULT_OPTIONS.cornerRounding)
  })

  it('merges partial options with defaults', async () => {
    const imageData = createImageData(4, 4)
    await vectorizeImage(imageData, {
      threshold: 200,
      detailLevel: 10,
    } as Partial<VectorizeOptions>)
    const opts = mockPotrace.mock.calls[0][1] as Record<string, unknown>
    expect(opts.turdsize).toBe(10)
  })
})
