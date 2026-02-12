import type { ReactNode } from "react";
import type { CanvasBackground } from "../../contexts/VectorizeParamsContext";
import { Pane } from "./Pane";
import { BottomToolbar } from "./BottomToolbar";
import "./layout.css";

type AppLayoutProps = {
  leftContent?: ReactNode;
  rightContent?: ReactNode;
  /** CSS value for canvas background (color or gradient), same for both panes */
  canvasBackgroundStyle?: string;
  /** Theme for grid overlay and toolbar variant */
  canvasBackground?: CanvasBackground;
  hasSvg?: boolean;
  hasImage?: boolean;
  isSettingsOpen?: boolean;
  onSettingsClick?: () => void;
  onResetViewClick?: () => void;
  onDownloadClick?: () => void;
  onCopyClick?: () => void;
  onClearCanvas?: () => void;
  onAddImageClick?: () => void;
};

const GRID_BY_BACKGROUND: Record<CanvasBackground, string> = {
  dark: "/grid-dark.svg",
  light: "/grid-light.svg",
  mid: "/grid-mid.svg",
};

export function AppLayout({
  leftContent,
  rightContent,
  canvasBackgroundStyle = "#fff",
  canvasBackground = "dark",
  hasSvg = false,
  hasImage = false,
  isSettingsOpen = false,
  onSettingsClick,
  onResetViewClick,
  onDownloadClick,
  onCopyClick,
  onClearCanvas,
  onAddImageClick,
}: AppLayoutProps) {
  const isLightCanvas = canvasBackground === "light";
  return (
    <div className={`app-layout${isLightCanvas ? " app-layout--light" : ""}`}>
      <header className="app-layout-header" aria-hidden>
        <img
          src="/logo.svg"
          width={100}
          height={100}
          alt=""
          className="app-layout-logo"
        />
      </header>
      <div
        className={`app-layout-panes ${
          !hasImage ? "app-layout-panes--single" : ""
        }`}
      >
        <div
          className="app-layout-bg"
          aria-hidden
          style={{ background: canvasBackgroundStyle }}
        />
        <div
          className="app-layout-bg-grid"
          aria-hidden
          style={{
            backgroundImage: `url(${GRID_BY_BACKGROUND[canvasBackground]})`,
          }}
        />
        <Pane className="app-layout-pane-left">{leftContent}</Pane>
        {hasImage && (
          <>
            <div className="app-layout-divider" aria-hidden />
            <Pane className="app-layout-pane-right">{rightContent}</Pane>
          </>
        )}
      </div>
      {hasImage && (
        <>
          <span
            className="app-layout-pane-label app-layout-pane-label--left"
            aria-hidden
          >
            Original
          </span>
          <span
            className="app-layout-pane-label app-layout-pane-label--right"
            aria-hidden
          >
            Vectorized
          </span>
        </>
      )}
      <BottomToolbar
        canvasBackground={canvasBackground}
        hasSvg={hasSvg}
        hasImage={hasImage}
        isSettingsOpen={isSettingsOpen}
        onSettingsClick={onSettingsClick}
        onResetViewClick={onResetViewClick}
        onDownloadClick={onDownloadClick}
        onCopyClick={onCopyClick}
        onClearCanvas={onClearCanvas}
        onAddImageClick={onAddImageClick}
      />
    </div>
  );
}
