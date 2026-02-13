import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ImageProvider } from '../../contexts/ImageContext'
import { ToastProvider } from '../../contexts/ToastContext'
import { ImageInput } from './ImageInput'

function renderWithProvider(ui: React.ReactElement) {
  return render(
    <ImageProvider>
      <ToastProvider>{ui}</ToastProvider>
    </ImageProvider>
  )
}

describe('ImageInput', () => {
  it('renders drop zone text (add button is in toolbar when used in app)', () => {
    renderWithProvider(<ImageInput />)
    expect(screen.getByText('Drop an Image Here')).toBeInTheDocument()
    expect(screen.getByText(/or paste from your clipboard/i)).toBeInTheDocument()
  })

  it('shows validation error when dropping unsupported file type', () => {
    renderWithProvider(<ImageInput />)
    const dropzone = screen.getByText('Drop an Image Here').closest('.image-input-dropzone')
    expect(dropzone).toBeInTheDocument()

    const file = new File(['hello'], 'hello.txt', { type: 'text/plain' })
    fireEvent.drop(dropzone!, {
      dataTransfer: { files: [file] },
    })

    expect(screen.getByRole('alert')).toHaveTextContent(/Unsupported format/i)
  })

  it('has hidden file input with correct accept attribute', () => {
    renderWithProvider(<ImageInput />)
    const input = document.querySelector('.image-input-hidden-input') as HTMLInputElement
    expect(input).toBeInTheDocument()
    expect(input?.type).toBe('file')
    expect(input?.accept).toContain('image/png')
    expect(input?.accept).toContain('image/jpeg')
  })
})
