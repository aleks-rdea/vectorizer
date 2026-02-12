import { describe, it, expect } from 'vitest'
import {
  validateImageFileSync,
  MAX_FILE_SIZE_BYTES,
  ALLOWED_MIME_TYPES,
} from './imageValidation'

function makeFile(overrides: { type?: string; size?: number } = {}): File {
  const { type = 'image/png', size = 100 } = overrides
  const blob = new Blob([new Uint8Array(size)], { type })
  return new File([blob], 'test.png', { type })
}

describe('validateImageFileSync', () => {
  it('returns error for null or undefined', () => {
    expect(validateImageFileSync(null).ok).toBe(false)
    expect(validateImageFileSync(undefined).ok).toBe(false)
    if (!validateImageFileSync(null).ok) {
      expect((validateImageFileSync(null) as { error: string }).error).toContain('No file')
    }
  })

  it('returns error for empty file', () => {
    const file = new File([], 'empty', { type: 'image/png' })
    const result = validateImageFileSync(file)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toContain('No file')
  })

  it('accepts allowed MIME types', () => {
    for (const type of ALLOWED_MIME_TYPES) {
      const result = validateImageFileSync(makeFile({ type, size: 100 }))
      expect(result.ok).toBe(true)
    }
  })

  it('returns error for unsupported MIME type', () => {
    const result = validateImageFileSync(makeFile({ type: 'text/plain' }))
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toContain('Unsupported format')
  })

  it('returns error when file exceeds max size', () => {
    const blob = new Blob([new Uint8Array(MAX_FILE_SIZE_BYTES + 1)])
    const file = new File([blob], 'big.png', { type: 'image/png' })
    const result = validateImageFileSync(file)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toContain('too large')
  })

  it('accepts file at exactly max size', () => {
    const blob = new Blob([new Uint8Array(MAX_FILE_SIZE_BYTES)])
    const file = new File([blob], 'max.jpg', { type: 'image/jpeg' })
    const result = validateImageFileSync(file)
    expect(result.ok).toBe(true)
  })
})
