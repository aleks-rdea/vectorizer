/**
 * Allowed MIME types for image upload (drag-drop, file picker, paste).
 */
export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
] as const

export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number]

/** Max file size in bytes (default 10MB). */
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024

/** Max width or height in pixels (default 4000). */
export const MAX_DIMENSION = 4000

export type ValidationOk = { ok: true }
export type ValidationError = { ok: false; error: string }
export type ValidationResult = ValidationOk | ValidationError

/**
 * Validates a file for type and size only.
 * Dimension validation should be done after loading the image.
 */
export function validateImageFileSync(file: File | null | undefined): ValidationResult {
  if (file == null || file.size === 0) {
    return { ok: false, error: 'No file provided.' }
  }

  const type = file.type?.toLowerCase()
  if (!type || !ALLOWED_MIME_TYPES.includes(type as AllowedMimeType)) {
    return {
      ok: false,
      error: `Unsupported format. Use ${ALLOWED_MIME_TYPES.join(', ')}.`,
    }
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    const mb = Math.round(MAX_FILE_SIZE_BYTES / (1024 * 1024))
    return { ok: false, error: `File too large. Maximum size is ${mb}MB.` }
  }

  return { ok: true }
}
