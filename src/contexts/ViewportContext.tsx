/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useReducer,
  type ReactNode,
} from 'react'

export const ZOOM_MIN = 0.1
export const ZOOM_MAX = 10
export const ZOOM_DEFAULT = 1

export type ViewportState = {
  zoom: number
  panX: number
  panY: number
}

type ViewportAction =
  | { type: 'SET_ZOOM_PAN'; payload: { zoom: number; panX: number; panY: number } }
  | { type: 'RESET' }

const initialState: ViewportState = {
  zoom: ZOOM_DEFAULT,
  panX: 0,
  panY: 0,
}

function clampZoom(zoom: number): number {
  return Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, zoom))
}

function viewportReducer(state: ViewportState, action: ViewportAction): ViewportState {
  switch (action.type) {
    case 'SET_ZOOM_PAN':
      return {
        zoom: clampZoom(action.payload.zoom),
        panX: action.payload.panX,
        panY: action.payload.panY,
      }
    case 'RESET':
      return initialState
    default:
      return state
  }
}

type ViewportContextValue = {
  viewport: ViewportState
  setZoomPan: (zoom: number, panX: number, panY: number) => void
  reset: () => void
}

const ViewportContext = createContext<ViewportContextValue | null>(null)

type ViewportProviderProps = {
  children: ReactNode
}

export function ViewportProvider({ children }: ViewportProviderProps) {
  const [viewport, dispatch] = useReducer(viewportReducer, initialState)

  const setZoomPan = useCallback((zoom: number, panX: number, panY: number) => {
    dispatch({
      type: 'SET_ZOOM_PAN',
      payload: { zoom: clampZoom(zoom), panX, panY },
    })
  }, [])

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' })
  }, [])

  const value: ViewportContextValue = {
    viewport,
    setZoomPan,
    reset,
  }

  return (
    <ViewportContext.Provider value={value}>
      {children}
    </ViewportContext.Provider>
  )
}

export function useViewport(): ViewportContextValue {
  const ctx = useContext(ViewportContext)
  if (ctx == null) {
    throw new Error('useViewport must be used within a ViewportProvider')
  }
  return ctx
}

export { clampZoom }
