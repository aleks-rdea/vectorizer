import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SettingsPanel } from './SettingsPanel'
import type { VectorizeParamsState } from '../../contexts/VectorizeParamsContext'

const defaultParams: VectorizeParamsState = {
  threshold: 128,
  smoothness: 1.25,
  detailLevel: 2,
  cornerRounding: 1,
  colorCount: 1,
  canvasBackground: 'mid',
  contrast: 1,
  saturation: 1,
}

describe('SettingsPanel', () => {
  it('shows Input and Output toggle and Output tab is active by default', () => {
    const onParamChange = vi.fn()
    render(
      <SettingsPanel
        params={defaultParams}
        onParamChange={onParamChange}
        onClearCanvas={() => {}}
      />
    )
    expect(screen.getByRole('tab', { name: 'Input' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Output' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Output' })).toHaveAttribute(
      'aria-selected',
      'true'
    )
    expect(screen.getByLabelText('Threshold')).toBeInTheDocument()
  })

  it('shows Contrast and Saturation on Input tab', () => {
    const onParamChange = vi.fn()
    render(
      <SettingsPanel
        params={defaultParams}
        onParamChange={onParamChange}
        onClearCanvas={() => {}}
      />
    )
    fireEvent.click(screen.getByRole('tab', { name: 'Input' }))
    expect(screen.getByLabelText('Contrast')).toBeInTheDocument()
    expect(screen.getByLabelText('Saturation')).toBeInTheDocument()
  })

  it('shows Output sliders when Output tab is selected', () => {
    const onParamChange = vi.fn()
    render(
      <SettingsPanel
        params={defaultParams}
        onParamChange={onParamChange}
        onClearCanvas={() => {}}
      />
    )
    fireEvent.click(screen.getByRole('tab', { name: 'Input' }))
    fireEvent.click(screen.getByRole('tab', { name: 'Output' }))
    expect(screen.getByLabelText('Threshold')).toBeInTheDocument()
    expect(
      screen.getByRole('radiogroup', { name: 'Canvas background' })
    ).toBeInTheDocument()
  })

  it('calls onParamChange when Contrast slider changes', () => {
    const onParamChange = vi.fn()
    render(
      <SettingsPanel
        params={defaultParams}
        onParamChange={onParamChange}
        onClearCanvas={() => {}}
      />
    )
    fireEvent.click(screen.getByRole('tab', { name: 'Input' }))
    const contrastSlider = screen.getByLabelText('Contrast')
    fireEvent.change(contrastSlider, { target: { valueAsNumber: 1.5 } })
    expect(onParamChange).toHaveBeenCalledWith('contrast', 1.5)
  })

  it('calls onParamChange when Saturation slider changes', () => {
    const onParamChange = vi.fn()
    render(
      <SettingsPanel
        params={defaultParams}
        onParamChange={onParamChange}
        onClearCanvas={() => {}}
      />
    )
    fireEvent.click(screen.getByRole('tab', { name: 'Input' }))
    const saturationSlider = screen.getByLabelText('Saturation')
    fireEvent.change(saturationSlider, { target: { valueAsNumber: 0.8 } })
    expect(onParamChange).toHaveBeenCalledWith('saturation', 0.8)
  })
})
