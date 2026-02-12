import { describe, it, expect } from 'vitest'
import {
  computeFitToViewportTransform,
  type FitToViewportTransform,
} from './viewportTransform'

describe('computeFitToViewportTransform', () => {
  it('returns scale 1 and centers when image is smaller than viewport', () => {
    const t = computeFitToViewportTransform(100, 50, 400, 300)
    expect(t.scale).toBe(1)
    expect(t.offsetX).toBe((400 - 100) / 2)
    expect(t.offsetY).toBe((300 - 50) / 2)
  })

  it('scales down and centers when image is larger than viewport', () => {
    const t = computeFitToViewportTransform(800, 600, 400, 300)
    expect(t.scale).toBe(0.5)
    expect(t.offsetX).toBe(0)
    expect(t.offsetY).toBe(0)
  })

  it('preserves aspect ratio for landscape image in portrait viewport', () => {
    const t = computeFitToViewportTransform(400, 200, 200, 400)
    expect(t.scale).toBe(0.5)
    const scaledWidth = 400 * t.scale
    const scaledHeight = 200 * t.scale
    expect(t.offsetX).toBe((200 - scaledWidth) / 2)
    expect(t.offsetY).toBe((400 - scaledHeight) / 2)
  })

  it('preserves aspect ratio for portrait image in landscape viewport', () => {
    const t = computeFitToViewportTransform(200, 400, 400, 200)
    expect(t.scale).toBe(0.5)
    expect(t.offsetX).toBe((400 - 100) / 2)
    expect(t.offsetY).toBe(0)
  })

  it('returns safe default for zero dimensions', () => {
    const t = computeFitToViewportTransform(0, 100, 400, 300)
    expect(t).toEqual({ scale: 1, offsetX: 0, offsetY: 0 } as FitToViewportTransform)
    const t2 = computeFitToViewportTransform(100, 100, 0, 300)
    expect(t2).toEqual({ scale: 1, offsetX: 0, offsetY: 0 } as FitToViewportTransform)
  })
})
