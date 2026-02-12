import type { CanvasBackground } from '../../contexts/VectorizeParamsContext'
import { Icon } from '../Icon'

type BottomToolbarProps = {
  canvasBackground?: CanvasBackground
  hasSvg?: boolean
  hasImage?: boolean
  isSettingsOpen?: boolean
  onSettingsClick?: () => void
  onResetViewClick?: () => void
  onDownloadClick?: () => void
  onCopyClick?: () => void
  onClearCanvas?: () => void
  onAddImageClick?: () => void
}

export function BottomToolbar({
  canvasBackground = 'dark',
  hasSvg = false,
  hasImage = false,
  isSettingsOpen = false,
  onSettingsClick,
  onResetViewClick,
  onDownloadClick,
  onCopyClick,
  onClearCanvas,
  onAddImageClick,
}: BottomToolbarProps) {
  const isInverted = canvasBackground === 'dark' || canvasBackground === 'mid'
  const toolbarLabel = hasImage ? 'Vectorize actions' : 'Add image'

  return (
    <div
      className={`bottom-toolbar ${isInverted ? 'bottom-toolbar--inverted' : ''}`}
      role="toolbar"
      aria-label={toolbarLabel}
    >
      {hasImage ? (
        <>
          <button
            type="button"
            className="toolbar-btn"
            onClick={onResetViewClick}
            aria-label="Reset zoom and pan"
            title="Reset zoom and pan"
          >
            <Icon name="filter_center_focus" fill={1} aria-label="Reset zoom and pan" />
          </button>
          <button
            type="button"
            className="toolbar-btn"
            onClick={onSettingsClick}
            aria-label="Toggle settings panel"
          >
            <Icon name="tune" aria-label="Toggle settings panel" />
          </button>
          <button
            type="button"
            className="toolbar-btn toolbar-btn--primary"
            onClick={isSettingsOpen ? onSettingsClick : onDownloadClick}
            disabled={!isSettingsOpen && !hasSvg}
            aria-label={isSettingsOpen ? 'Done' : 'Download SVG'}
            title={isSettingsOpen ? 'Done' : 'Download SVG'}
          >
            <Icon
              name={isSettingsOpen ? 'check' : 'arrow_downward'}
              aria-label={isSettingsOpen ? 'Done' : 'Download SVG'}
            />
          </button>
          <button
            type="button"
            className="toolbar-btn"
            onClick={onCopyClick}
            disabled={!hasSvg}
            aria-label="Copy SVG to clipboard"
            title="Copy SVG to clipboard"
          >
            <Icon name="content_copy" aria-label="Copy SVG to clipboard" />
          </button>
          <button
            type="button"
            className="toolbar-btn"
            onClick={onClearCanvas}
            aria-label="Clear canvas"
            title="Clear canvas"
          >
            <Icon name="delete" aria-label="Clear canvas" />
          </button>
        </>
      ) : (
        <button
          type="button"
          className="toolbar-btn toolbar-btn--primary"
          onClick={onAddImageClick}
          aria-label="Choose image file"
          title="Choose image file"
        >
          <Icon name="add" aria-label="Choose image file" />
        </button>
      )}
    </div>
  )
}

