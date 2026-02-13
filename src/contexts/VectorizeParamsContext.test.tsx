import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { VectorizeParamsProvider, useVectorizeParams } from './VectorizeParamsContext'
import { DEFAULT_OPTIONS } from '../vectorization/vectorizeImage'

vi.mock('esm-potrace-wasm', () => ({
  init: () => Promise.resolve(),
  potrace: () => Promise.resolve('<svg></svg>'),
}))

function renderParamsHook() {
  return renderHook(() => useVectorizeParams(), {
    wrapper: ({ children }) => (
      <VectorizeParamsProvider>{children}</VectorizeParamsProvider>
    ),
  })
}

describe('VectorizeParamsContext', () => {
  it('exposes default params', () => {
    const { result } = renderParamsHook()
    expect(result.current.params).toMatchObject(DEFAULT_OPTIONS)
    expect(result.current.params.canvasBackground).toBe('mid')
    expect(result.current.params.contrast).toBe(1)
    expect(result.current.params.saturation).toBe(1)
  })

  it('setParam updates a single param', () => {
    const { result } = renderParamsHook()
    act(() => {
      result.current.setParam('threshold', 200)
    })
    expect(result.current.params.threshold).toBe(200)
    expect(result.current.params.smoothness).toBe(DEFAULT_OPTIONS.smoothness)
  })

  it('setParam can update each param', () => {
    const { result } = renderParamsHook()
    act(() => {
      result.current.setParam('smoothness', 1.5)
    })
    expect(result.current.params.smoothness).toBe(1.5)
    act(() => {
      result.current.setParam('detailLevel', 5)
    })
    expect(result.current.params.detailLevel).toBe(5)
    act(() => {
      result.current.setParam('cornerRounding', 1.2)
    })
    expect(result.current.params.cornerRounding).toBe(1.2)
  })

  it('setParam updates contrast and saturation', () => {
    const { result } = renderParamsHook()
    act(() => {
      result.current.setParam('contrast', 1.5)
    })
    expect(result.current.params.contrast).toBe(1.5)
    act(() => {
      result.current.setParam('saturation', 0.8)
    })
    expect(result.current.params.saturation).toBe(0.8)
  })

  it('resetParams restores defaults', () => {
    const { result } = renderParamsHook()
    act(() => {
      result.current.setParam('threshold', 100)
      result.current.setParam('detailLevel', 10)
      result.current.setParam('contrast', 1.8)
      result.current.setParam('saturation', 0.5)
    })
    act(() => {
      result.current.resetParams()
    })
    expect(result.current.params).toMatchObject(DEFAULT_OPTIONS)
    expect(result.current.params.canvasBackground).toBe('mid')
    expect(result.current.params.contrast).toBe(1)
    expect(result.current.params.saturation).toBe(1)
  })
})
