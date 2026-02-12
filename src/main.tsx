import { createRoot } from 'react-dom/client'
import './index.css'
import { ImageProvider } from './contexts/ImageContext.tsx'
import { ViewportProvider } from './contexts/ViewportContext.tsx'
import { VectorizeParamsProvider } from './contexts/VectorizeParamsContext.tsx'
import { ToastProvider } from './contexts/ToastContext.tsx'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <ImageProvider>
    <ViewportProvider>
      <VectorizeParamsProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </VectorizeParamsProvider>
    </ViewportProvider>
  </ImageProvider>,
)
