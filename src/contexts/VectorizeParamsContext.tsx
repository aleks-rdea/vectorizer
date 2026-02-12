/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useReducer,
  type ReactNode,
} from 'react'
import { DEFAULT_OPTIONS, type VectorizeOptions } from '../vectorization/vectorizeImage'

export type CanvasBackground = 'dark' | 'light' | 'mid'

export type VectorizeParamsState = VectorizeOptions & {
  canvasBackground: CanvasBackground
}

const DEFAULT_BACKGROUND: CanvasBackground = 'dark'

type VectorizeParamsAction =
  | { type: 'SET'; payload: Partial<VectorizeParamsState> }
  | { type: 'RESET' }

const initialState: VectorizeParamsState = {
  ...DEFAULT_OPTIONS,
  canvasBackground: DEFAULT_BACKGROUND,
}

function paramsReducer(
  state: VectorizeParamsState,
  action: VectorizeParamsAction
): VectorizeParamsState {
  switch (action.type) {
    case 'SET':
      return { ...state, ...action.payload }
    case 'RESET':
      return { ...initialState }
    default:
      return state
  }
}

type VectorizeParamsContextValue = {
  params: VectorizeParamsState
  setParam: <K extends keyof VectorizeParamsState>(key: K, value: VectorizeParamsState[K]) => void
  resetParams: () => void
}

const VectorizeParamsContext = createContext<VectorizeParamsContextValue | null>(null)

type VectorizeParamsProviderProps = {
  children: ReactNode
}

export function VectorizeParamsProvider({ children }: VectorizeParamsProviderProps) {
  const [params, dispatch] = useReducer(paramsReducer, initialState)

  const setParam = useCallback(<K extends keyof VectorizeParamsState>(
    key: K,
    value: VectorizeParamsState[K]
  ) => {
    dispatch({ type: 'SET', payload: { [key]: value } })
  }, [])

  const resetParams = useCallback(() => {
    dispatch({ type: 'RESET' })
  }, [])

  const value: VectorizeParamsContextValue = {
    params,
    setParam,
    resetParams,
  }

  return (
    <VectorizeParamsContext.Provider value={value}>
      {children}
    </VectorizeParamsContext.Provider>
  )
}

export function useVectorizeParams(): VectorizeParamsContextValue {
  const ctx = useContext(VectorizeParamsContext)
  if (ctx == null) {
    throw new Error('useVectorizeParams must be used within a VectorizeParamsProvider')
  }
  return ctx
}
