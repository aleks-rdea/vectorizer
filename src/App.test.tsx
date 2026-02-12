import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { ImageProvider } from './contexts/ImageContext'
import { ViewportProvider } from './contexts/ViewportContext'
import { VectorizeParamsProvider } from './contexts/VectorizeParamsContext'
import { ToastProvider } from './contexts/ToastContext'
import App from './App'

vi.mock('esm-potrace-wasm', () => ({
  init: () => Promise.resolve(),
  potrace: () => Promise.resolve('<svg xmlns="http://www.w3.org/2000/svg"></svg>'),
}))

function renderApp() {
  return render(
    <ImageProvider>
      <ViewportProvider>
        <VectorizeParamsProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </VectorizeParamsProvider>
      </ViewportProvider>
    </ImageProvider>
  )
}

describe('App', () => {
  it('renders root layout container', () => {
    renderApp()
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('when no image, renders full-width drop zone and add-image toolbar only', () => {
    renderApp()
    expect(screen.getByText('Drop image here to vectorise')).toBeInTheDocument()
    expect(screen.getByText('[png, gif, jpg]')).toBeInTheDocument()
    expect(screen.queryByText('View vectorized version here')).not.toBeInTheDocument()
    const toolbar = screen.getByRole('toolbar', { name: 'Add image' })
    expect(toolbar).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Choose image file' })).toBeInTheDocument()
  })

  it('when no image, toolbar shows only add image button', () => {
    renderApp()
    expect(screen.getByRole('toolbar', { name: 'Add image' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Choose image file' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Toggle settings panel' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Download SVG' })).not.toBeInTheDocument()
  })
})

