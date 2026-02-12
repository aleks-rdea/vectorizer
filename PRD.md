# Vectorize – Product Requirements Document

## 1. Product Overview

- **Product name**: Vectorize (working title)
- **Description**: A single-page web app that lets users drop or paste a raster image (JPG, PNG, GIF, etc.), vectorizes it via a Potrace-compatible tracer, and previews the original and resulting SVG side-by-side with synchronized zoom and pan. Users can tune vectorization parameters via a settings panel and export or copy the SVG.
- **Primary users**: Designers, developers, and hobbyists needing quick bitmap-to-vector conversions for icons, logos, and silhouettes.
- **Primary goals**:
  - Rapid, frictionless vectorization with minimal setup.
  - Intuitive comparison of source bitmap vs vector output.
  - Easy export (download as SVG file or copy to clipboard).

## 2. Key User Flows

### 2.1 First visit / empty state

- User lands on full-screen app.
- Left pane shows drop target with instructions: drag-and-drop, click `+` to browse, or paste image from clipboard.
- Right pane shows placeholder text like "View vectorized version here".
- Bottom-center floating toolbar shows disabled download/copy (until an SVG exists) and active settings button (settings panel may be hidden by default).

### 2.2 Import image

- **Drag & drop**: User drags an image file (JPG, PNG, GIF, possibly WEBP) onto the left pane.
- **Click `+`**: User clicks the plus button, native file picker opens filtered to image MIME types.
- **Paste from clipboard**: User presses `Cmd+V` / `Ctrl+V` while an image is in the clipboard; if clipboard contains an image (PNG/JPEG/GIF), it is loaded.
- The app validates file:
  - Accepts only supported MIME types and reasonable size limits (e.g. < 10MB, max dimensions ~4000px; configurable constant).
  - On invalid type or too large, shows non-blocking error toast/message.
- Once accepted, app shows a loading indicator while raster is processed and vectorized.

### 2.3 View & compare

- Left canvas renders the raster image, fit-to-screen with letterboxing as needed.
- Right canvas renders the SVG overlay or separate SVG viewport matching the left view.
- User can zoom (mouse wheel / trackpad pinch / +/- buttons) and pan (click-drag or scrollbars).
- Zoom level and pan are **synchronized** across both panes: same world coordinates are visible in each pane (mirrored view).

### 2.4 Adjust settings

- User opens settings panel via bottom toolbar settings icon.
- Panel appears centered (between the two panes) or attached to bottom center, non-modal, and resizable/responsive.
- Sliders for:
  - **Threshold**: controls light/dark threshold used by Potrace (e.g. 0–255 or normalized).
  - **Smoothness**: controls curve smoothing.
  - **Detail level**: controls level of detail/complexity (e.g. turnpolicy, turdsize, etc. mapped to a single control).
  - **Corner rounding**: controls how sharp vs rounded corners are.
- Each slider updates in real time or with small debounce (e.g. 150–250 ms) to re-run vectorization and update the SVG.
- While vectorization is running, show small inline spinner/"Updating…" indicator.

### 2.5 Export SVG

- **Download**: Clicking download icon triggers SVG file download (`vectorized.svg` by default). File name may incorporate original image name.
- **Copy**: Clicking copy icon copies the SVG markup to clipboard as text; show confirmation toast.
- Disabled/tooltip state when no image/SVG is present.

### 2.6 Clear canvas & reset

- `Clear Canvas` button in settings panel clears both panes and resets sliders to default values.
- Returns UI to initial empty state; allows new image selection.

## 3. Functional Requirements

### 3.1 Image Input

- **Supported sources**:
  - File drag-and-drop onto left pane.
  - File selection via `+` button (input type `file`).
  - Clipboard paste (listen for `paste` events containing image blobs).
- **Supported formats**: at least `image/jpeg`, `image/png`, `image/gif`; optionally `image/webp` if underlying tracer supports it.
- **Validation**:
  - Reject unsupported MIME types with clear error message.
  - Enforce maximum file size and pixel dimensions with configurable constants.
  - Handle corrupted image files and decoding errors gracefully.
- **Security**:
  - All processing happens client-side; no image upload to server.
  - No persistence beyond in-memory state.

### 3.2 Vectorization Engine

- Uses a Potrace-compatible implementation that can run fully in the browser (e.g. WebAssembly or JS port).
- Accepts bitmap data (e.g. `ImageData`) and parameter set (threshold, smoothness, detail, corner rounding) and returns SVG markup string.
- Performance constraints:
  - Must handle at least moderate resolution images (e.g. 2000×2000) within a few seconds on a typical laptop.
  - Avoid locking the UI thread excessively; consider using a Web Worker if library/API makes this straightforward (could be a stretch goal).
- Error handling:
  - Surface any vectorization failure in UI and allow retry.

### 3.3 Viewports & Interaction

- Left and right panes each render:
  - A zoomable, pannable viewport sharing a common coordinate system.
  - Mouse wheel to zoom around cursor focus.
  - Drag (left mouse) to pan when zoomed in.
  - Double-click or toolbar controls to reset zoom to fit.
- **Synchronization**:
  - Maintain a shared `viewport` state (center coordinates + zoom factor + optional rotation = 0) for both panes.
  - Both canvases subscribe to this state; interactions on either pane update the shared viewport.
- Visual polish:
  - Subtle borders around canvases.
  - Optional background grid or neutral gray.

### 3.4 Settings Panel & Controls

- Bottom floating toolbar centered horizontally, containing:
  - Settings icon (Google Material symbols) toggling settings panel.
  - Download icon (SVG download) with tooltip.
  - Copy icon with tooltip.
- Settings panel:
  - Four labeled sliders with numeric display of current value.
  - Optional reset-to-default button for each slider.
  - `Clear Canvas` button.
- All changes to settings re-run vectorization with debouncing; indicator while running.

### 3.5 Export & Clipboard

- **Download SVG**:
  - Generates a Blob from current SVG string and triggers `a` tag download.
  - Works in modern browsers (Chrome, Edge, Firefox, Safari recent).
- **Copy SVG**:
  - Uses `navigator.clipboard.writeText` if available, with graceful fallback / error messaging otherwise.
- Must reflect current settings (recent re-vectorization) at time of action.

### 3.6 Error & Empty States

- Empty state messaging on right pane when no SVG available.
- Toasts or inline messages for:
  - Unsupported file types.
  - File too large / dimensions too big.
  - Vectorization errors.
  - Clipboard copy success/failure.

## 4. Non-Functional Requirements

- **Tech stack**:
  - React + TypeScript.
  - Vite as the build tool.
  - `pnpm` for package management.
  - Google Material Symbols for icons (via web font or icon component lib).
- **Performance**:
  - Initial page load under ~2 seconds on typical broadband.
  - Vectorization + re-render within a few seconds for moderate images.
  - Debounced slider updates to prevent thrashing.
- **Responsiveness**:
  - Layout adapts to different desktop viewport sizes.
  - Mobile support is nice-to-have but not primary (if handled, panes may stack vertically with synced zoom/pan preserved).
- **Accessibility**:
  - Keyboard-accessible sliders and buttons.
  - ARIA labels for toolbar icons and major controls.
  - High-contrast text and UI elements.

## 5. Out of Scope (for initial version)

- Multi-layer / color vectorization beyond monochrome/threshold-based tracing.
- Saving user presets to local storage (could be a later enhancement).
- Image editing operations beyond scaling and thresholding.
- Backend services or authentication.

## 6. Success Metrics

- User can load a supported image and see both raster and vector versions within 5 seconds for moderate-size images.
- User can adjust all four parameters and see live updates.
- User can successfully download and copy SVG in at least two target browsers (Chrome, Safari).
