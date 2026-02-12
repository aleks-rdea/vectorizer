import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { ViewportProvider, useViewport, ZOOM_MIN, ZOOM_MAX, ZOOM_DEFAULT } from './ViewportContext'

function renderViewportHook() {
  return renderHook(() => useViewport(), {
    wrapper: ({ children }) => <ViewportProvider>{children}</ViewportProvider>,
  })
}

describe('ViewportContext', () => {
  it('exposes default viewport state', () => {
    const { result } = renderViewportHook()
    expect(result.current.viewport).toEqual({
      zoom: ZOOM_DEFAULT,
      panX: 0,
      panY: 0,
    })
  })

  it('setZoomPan updates zoom and pan', () => {
    const { result } = renderViewportHook()
    act(() => {
      result.current.setZoomPan(2, 10, -5)
    })
    expect(result.current.viewport.zoom).toBe(2)
    expect(result.current.viewport.panX).toBe(10)
    expect(result.current.viewport.panY).toBe(-5)
  })

  it('clamps zoom to min and max', () => {
    const { result } = renderViewportHook()
    act(() => {
      result.current.setZoomPan(100, 0, 0)
    })
    expect(result.current.viewport.zoom).toBe(ZOOM_MAX)
    act(() => {
      result.current.setZoomPan(0.01, 0, 0)
    })
    expect(result.current.viewport.zoom).toBe(ZOOM_MIN)
  })

  it('reset restores default viewport', () => {
    const { result } = renderViewportHook()
    act(() => {
      result.current.setZoomPan(3, 20, 30)
    })
    act(() => {
      result.current.reset()
    })
    expect(result.current.viewport).toEqual({
      zoom: ZOOM_DEFAULT,
      panX: 0,
      panY: 0,
    })
  })
})
