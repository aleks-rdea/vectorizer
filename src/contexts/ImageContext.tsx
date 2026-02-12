/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react'
import {
  MAX_DIMENSION,
  validateImageFileSync,
} from '../constants/imageValidation'

export type ImageState = {
  url: string
  width: number
  height: number
}

type ImageContextValue = {
  image: ImageState | null
  error: string | null
  setImageFromFile: (file: File) => Promise<void>
  clearImage: () => void
  clearError: () => void
}

const ImageContext = createContext<ImageContextValue | null>(null)

function loadImageDimensions(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight })
    img.onerror = () => reject(new Error('Failed to load image.'))
    img.src = url
  })
}

type ImageProviderProps = {
  children: ReactNode
}

export function ImageProvider({ children }: ImageProviderProps) {
  const [image, setImage] = useState<ImageState | null>(null)
  const [error, setError] = useState<string | null>(null)

  const clearImage = useCallback(() => {
    setImage((prev) => {
      if (prev?.url) URL.revokeObjectURL(prev.url)
      return null
    })
    setError(null)
  }, [])

  const setImageFromFile = useCallback(async (file: File) => {
    setError(null)

    const result = validateImageFileSync(file)
    if (!result.ok) {
      setError(result.error)
      return
    }

    const url = URL.createObjectURL(file)
    try {
      const { width, height } = await loadImageDimensions(url)
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        URL.revokeObjectURL(url)
        setError(
          `Image too large. Maximum dimension is ${MAX_DIMENSION}px (got ${width}×${height}).`
        )
        return
      }
      setImage({ url, width, height })
    } catch {
      URL.revokeObjectURL(url)
      setError('Could not load image. The file may be corrupted.')
    }
  }, [])

  const clearError = useCallback(() => setError(null), [])

  const value: ImageContextValue = {
    image,
    error,
    setImageFromFile,
    clearImage,
    clearError,
  }

  return (
    <ImageContext.Provider value={value}>
      {children}
    </ImageContext.Provider>
  )
}

export function useImage(): ImageContextValue {
  const ctx = useContext(ImageContext)
  if (ctx == null) {
    throw new Error('useImage must be used within an ImageProvider')
  }
  return ctx
}
