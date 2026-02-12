import { describe, it, expect } from 'vitest'
import { getViewBoxFromSvg } from './svgViewBox'

describe('getViewBoxFromSvg', () => {
  it('returns viewBox when present', () => {
    const svg = '<svg viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg"></svg>'
    const result = getViewBoxFromSvg(svg)
    expect(result).toEqual({ minX: 0, minY: 0, width: 100, height: 50 })
  })

  it('returns viewBox with negative minX/minY', () => {
    const svg = '<svg viewBox="-10 -20 30 40"></svg>'
    const result = getViewBoxFromSvg(svg)
    expect(result).toEqual({ minX: -10, minY: -20, width: 30, height: 40 })
  })

  it('returns null when viewBox is missing', () => {
    const svg = '<svg width="100" height="50"></svg>'
    expect(getViewBoxFromSvg(svg)).toBeNull()
  })

  it('returns null when viewBox has invalid values', () => {
    const svg = '<svg viewBox="0 0 0 50"></svg>'
    const result = getViewBoxFromSvg(svg)
    expect(result).toBeNull()
  })

  it('handles viewBox with quotes and extra spaces', () => {
    const svg = '<svg viewBox="  -5  -5  200  100  "></svg>'
    const result = getViewBoxFromSvg(svg)
    expect(result).toEqual({ minX: -5, minY: -5, width: 200, height: 100 })
  })
})
