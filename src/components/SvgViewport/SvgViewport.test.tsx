import type { ReactElement } from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ViewportProvider } from '../../contexts/ViewportContext'
import { SvgViewport } from './SvgViewport'

function renderWithViewport(ui: ReactElement) {
  return render(<ViewportProvider>{ui}</ViewportProvider>)
}

describe('SvgViewport', () => {
  it('shows empty message when svg is null', () => {
    renderWithViewport(
      <SvgViewport svg={null} imageWidth={100} imageHeight={50} />
    )
    expect(screen.getByText('View vectorized version here')).toBeInTheDocument()
  })

  it('shows error message when error prop is set', () => {
    renderWithViewport(
      <SvgViewport
        svg={null}
        imageWidth={100}
        imageHeight={50}
        error="Vectorization failed"
      />
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Vectorization failed')
  })

  it('renders SVG content when valid svg string is provided', () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><path d="M0 0 L10 10"/></svg>'
    const { container } = renderWithViewport(
      <SvgViewport svg={svg} imageWidth={10} imageHeight={10} />
    )
    const inner = container.querySelector('.svg-viewport__inner')
    expect(inner).toBeInTheDocument()
    expect(inner?.innerHTML).toContain('<svg')
    expect(inner?.innerHTML).toContain('<path')
  })

  it('shows empty state when svg string does not start with <svg', () => {
    renderWithViewport(
      <SvgViewport svg="not valid svg" imageWidth={100} imageHeight={50} />
    )
    expect(screen.getByText('View vectorized version here')).toBeInTheDocument()
  })
})
