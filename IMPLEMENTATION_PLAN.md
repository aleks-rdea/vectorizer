# Vectorize – Implementation Plan

Each step below includes:

- **Goal**: What to accomplish.
- **Implementation outline**: Key tasks for the LLM to perform.
- **Human review & manual tests**: How a human should validate the step.
- **LLM prompt**: A ready-to-use prompt template for executing the step.
- **Testing**: What automated tests should be added/updated.

---

## Step 0 – Repository bootstrap (manual/human)

- Initialize empty directory, `pnpm` workspace (if desired), and git repo.
- This step is primarily human; subsequent steps assume repo exists.

---

## Step 1 – Project setup with Vite + React + TypeScript

- **Goal**: Create a minimal Vite React+TS app using `pnpm`, configure linting/formatting, and wire Google Material Symbols.
- **Implementation outline**:
  - Scaffold app with `pnpm create vite` or equivalent.
  - Configure TypeScript strict mode.
  - Add ESLint + Prettier (or use Vite/TypeScript defaults with minimal lint config).
  - Integrate Google Material Symbols via web font import or a small icon wrapper component.
  - Replace starter content with a bare full-screen layout container.
- **Human review & manual tests**:
  - Run dev server, confirm app builds and loads with no console errors.
  - Confirm Material icon (e.g. a test icon) renders correctly.
- **LLM prompt**:
  - "You are working in a new repository for a React single-page app using Vite, TypeScript, and `pnpm`. Set up the project by scaffolding a Vite React+TS app, configuring TypeScript in strict mode, adding ESLint/Prettier, and integrating Google Material Symbols icons (e.g. via web font import and a reusable `Icon` component). Replace the starter UI with a full-screen `App` shell that renders an empty main layout container. Update or create `README.md` with basic setup/run instructions. Do not add complex business logic yet; focus on clean structure and tooling. After changes, ensure the project builds with `pnpm build`."
- **Testing**:
  - Add a trivial smoke test (e.g. render `App` and assert presence of root layout container using Testing Library).

---

## Step 2 – High-level layout: split panes and bottom toolbar

- **Goal**: Implement responsive layout with left/right panes and bottom-centered floating toolbar.
- **Implementation outline**:
  - Create `Layout` components: `AppLayout`, `Pane`, and `BottomToolbar`.
  - Use CSS Grid or Flexbox to create 2-column full-height layout with vertical divider.
  - Implement placeholder content: left "Drop image here" message and right "View vectorized version here" message.
  - Implement bottom toolbar with three icon buttons (settings, download, copy), with tooltips and disabled state for download/copy.
- **Human review & manual tests**:
  - Visually inspect layout at various viewport widths.
  - Verify toolbar stays centered at bottom and overlaid above panes.
- **LLM prompt**:
  - "In the existing Vite React+TS app, implement the main UI layout: a full-screen two-column split (left/right) with a subtle vertical divider, and a bottom-centered floating toolbar that contains three Material icon buttons for settings, download, and copy. Add a `components/layout` folder with `AppLayout`, `Pane`, and `BottomToolbar` components, and corresponding CSS (or CSS-in-JS) for responsive behavior. The app should show empty-state text in each pane as described in the PRD. Ensure icons are accessible (ARIA labels) and that download/copy buttons are disabled when there is no SVG available (for now, hardcode `false`)."
- **Testing**:
  - Add snapshot or DOM-structure tests verifying two panes and toolbar exist.
  - Test that download/copy buttons are disabled via React Testing Library.

---

## Step 3 – Image ingestion: drag-and-drop, file picker, clipboard paste

- **Goal**: Allow users to provide an image via drag-and-drop, file picker, or clipboard paste; validate and load it into app state.
- **Implementation outline**:
  - Create `ImageInput` component used in left pane.
  - Implement drag-and-drop area using `onDragOver`/`onDrop` with visual highlighting.
  - Integrate `+` button with hidden `<input type="file" accept="image/*">`.
  - Add global or focused `paste` event listener to capture images from clipboard.
  - Validate file type and size; define constants for allowed MIME types, max size, and max dimensions (dimensions may be checked after loading image).
  - Convert accepted input into an in-memory representation (e.g. object URL and/or `ImageBitmap` / HTMLImageElement).
  - Store original image data (URL and dimensions) in app state context (e.g. `ImageContext`).
  - Surface validation errors via small toast system or inline message.
- **Human review & manual tests**:
  - Drag supported/unsupported files; verify only correct ones load and errors are shown appropriately.
  - Use file picker `+` button; verify same behavior.
  - Test pasting image from clipboard in supported browsers.
- **LLM prompt**:
  - "Extend the app by implementing an `ImageInput` component in the left pane that supports three input modes: drag-and-drop, a `+` button opening a file picker, and clipboard paste. Only accept common raster formats (JPEG, PNG, GIF, optionally WEBP) with a configurable max file size and image dimensions. For accepted images, load them into application state (e.g. via React context) including an object URL and intrinsic width/height. Show friendly validation error messages for unsupported formats or oversize images. Include appropriate TypeScript types and unit tests for the validation logic."
- **Testing**:
  - Unit tests for file validation logic (types, size limit, null/empty files).
  - Component tests simulating drop and file selection events.

---

## Step 4 – Rendering raster image in left viewport

- **Goal**: Display the loaded raster image in a canvas-based viewport prepared for zoom/pan sync.
- **Implementation outline**:
  - Create `Viewport` abstraction and `RasterViewport` component for the left side using `<canvas>`.
  - When image is available, draw it scaled to fit initial viewport.
  - Expose props to control zoom and pan from shared state (but interactions may be added in next step).
  - Handle resizing of canvas when window resizes.
- **Human review & manual tests**:
  - Load an image and verify it appears correctly, centered and scaled.
  - Resize browser; confirm image resizes appropriately without distortion.
- **LLM prompt**:
  - "Implement a `RasterViewport` component for the left pane that uses an HTML canvas to render the currently loaded image from app state. The viewport should compute an initial fit-to-screen transform (zoom and pan) and render the image accordingly. Structure the code so that zoom level and pan offset are driven by props/state from a shared viewport model, but for now you may keep them static. Handle window resize events by updating the canvas size and re-rendering. Provide TypeScript types for the viewport model and add unit tests for the transform calculations (fit-to-screen logic)."
- **Testing**:
  - Tests for transform calculations (fit to viewport) and aspect ratio preservation.

---

## Step 5 – Vectorization engine integration (Potrace-compatible)

- **Goal**: Integrate a Potrace-based library that converts raster image data into SVG given parameters.
- **Implementation outline**:
  - Research suitable browser-compatible Potrace implementation (e.g. `potrace-wasm` or other maintained package).
  - Implement `vectorizeImage` utility that accepts `ImageData` + parameter object and returns SVG string.
  - Normalize parameter ranges (0–1 sliders mapped to library-specific values).
  - Handle errors and edge cases gracefully.
- **Human review & manual tests**:
  - Run app, load sample images, manually verify SVG roughly matches silhouette of raster.
  - Check console for errors and performance issues.
- **LLM prompt**:
  - "Add a vectorization engine using a Potrace-compatible browser library. Create a `vectorization/vectorizeImage.ts` module exposing a `vectorizeImage(imageData, options)` function that returns an SVG string. Map the four user-facing parameters (threshold, smoothness, detail level, corner rounding) to whatever options the chosen library supports, choosing sensible ranges and defaults. Ensure the function throws or returns a typed error object on failure. Include unit tests using a small fixture bitmap (e.g. generated programmatically) to assert that an SVG string is produced and contains expected structural elements (such as `<svg` and `<path`)."
- **Testing**:
  - Unit tests for `vectorizeImage` module with mocked or small in-memory images.

---

## Step 6 – Vector SVG rendering in right viewport

- **Goal**: Render the generated SVG in the right pane in a canvas/SVG viewport compatible with shared zoom/pan.
- **Implementation outline**:
  - Decide on rendering strategy: either embed raw `<svg>` and apply viewBox transforms, or draw vector result into `<canvas>`; prefer native `<svg>` for fidelity and easier export.
  - Implement `SvgViewport` component that renders the SVG markup using `dangerouslySetInnerHTML` or a safer parser component, with `preserveAspectRatio` and `viewBox` tied to shared viewport state.
  - Ensure dimensions and coordinate system match raster image's.
  - Handle empty state when no SVG exists.
- **Human review & manual tests**:
  - Load image, confirm SVG appears and roughly aligns with raster.
  - Inspect DOM to verify SVG is correctly sized and scaled.
- **LLM prompt**:
  - "Implement an `SvgViewport` component for the right pane that takes SVG markup and a viewport model (zoom/pan) and renders the SVG so that its coordinate system aligns with the original image dimensions. Use an `<svg>` element with `viewBox` and `preserveAspectRatio` as needed. When no SVG is available, show the empty-state message. Ensure the component is resilient to malformed SVG (catching errors and displaying a fallback error message). Add unit tests verifying that given a viewport model and known SVG width/height, the `viewBox` is computed correctly."
- **Testing**:
  - Unit tests for `SvgViewport` viewBox calculations.

---

## Step 7 – Shared zoom & pan interaction model

- **Goal**: Implement synchronized zoom and pan between left and right viewports driven by a shared state model.
- **Implementation outline**:
  - Create `ViewportContext` or global state hook managing `zoom`, `centerX`, `centerY`.
  - Implement interaction handlers in either/both viewports: mouse wheel zoom (with clamping), drag-to-pan, and double-click to reset.
  - Update both `RasterViewport` and `SvgViewport` to consume viewport state and render accordingly.
  - Implement optional controls (e.g. +/- buttons) for accessibility.
- **Human review & manual tests**:
  - Zoom and pan in left viewport and verify right viewport follows identically.
  - Repeat starting from right viewport.
  - Test reset behavior.
- **LLM prompt**:
  - "Implement a shared viewport interaction model to synchronize zoom and pan between the raster and SVG panes. Create a `ViewportContext` (or equivalent hook) that stores zoom level and center coordinates, with functions to zoom around a point, pan by deltas, and reset to fit-to-screen. Wire the `RasterViewport` and `SvgViewport` components to this context so that any interaction in either pane updates the shared state. Support mouse wheel zoom, click-and-drag panning, and a double-click or toolbar control to reset. Add unit tests for the viewport reducer logic (zoom clamping, pan updates, reset)."
- **Testing**:
  - Unit tests for viewport reducer/state logic.
  - Component tests simulating wheel and drag events verifying synchronized updates.

---

## Step 8 – Settings panel and live parameter control

- **Goal**: Implement settings panel UI and wire sliders to vectorization parameters with live updates.
- **Implementation outline**:
  - Create `SettingsPanel` component with four sliders: threshold, smoothness, detail level, corner rounding.
  - Store slider values in a dedicated parameters state (context/hook) with defaults.
  - Debounce changes before re-running `vectorizeImage` to avoid excessive calls.
  - Show inline loading indicator while vectorization is in progress.
  - Add `Clear Canvas` button that resets image state, SVG, viewport, and parameters.
- **Human review & manual tests**:
  - Move sliders and confirm visible changes in SVG output.
  - Confirm debounce feels responsive; UI remains smooth.
  - Use `Clear Canvas` and confirm app returns to empty state.
- **LLM prompt**:
  - "Add a `SettingsPanel` component that can be toggled from the bottom toolbar. The panel should include four sliders (threshold, smoothness, detail level, corner rounding) with labels and numeric value displays. Implement a parameters context/hook storing these values, and integrate it with the `vectorizeImage` flow so that moving a slider triggers a debounced re-vectorization of the current image. Show a small 'Updating…' indicator while vectorization runs. Include a `Clear Canvas` button that clears the current image, SVG, viewport state, and resets slider values. Write unit tests for the parameter reducer/state and for the debouncing behavior (e.g. using fake timers)."
- **Testing**:
  - Tests for parameters state management and debounce helper.
  - Integration tests ensuring `vectorizeImage` is called with updated parameters.

---

## Step 9 – Export: download SVG and copy to clipboard

- **Goal**: Wire up download and copy actions in bottom toolbar using the current SVG output.
- **Implementation outline**:
  - Implement `useSvgExport` hook or `exportSvg.ts` utility module with `downloadSvg` and `copySvgToClipboard` functions.
  - Connect toolbar download/copy buttons to these utilities, feeding them current SVG string and optional filename.
  - Handle error cases and show success/error toasts.
- **Human review & manual tests**:
  - Click download; verify a valid SVG file is downloaded and opens in browser/editor.
  - Click copy; paste into text editor and confirm SVG contents.
  - Test when no SVG exists; verify buttons are disabled or show appropriate message.
- **LLM prompt**:
  - "Implement SVG export functionality. Create utilities or hooks for `downloadSvg(svg: string, filename?: string)` and `copySvgToClipboard(svg: string)`, using the browser APIs `URL.createObjectURL`/`a` tag for download and `navigator.clipboard.writeText` for copying, with graceful error handling. Connect these to the bottom toolbar buttons so that users can download the current SVG as a file and copy it to the clipboard. Add a simple toast/notification mechanism to show success or failure. Include unit tests for the utilities, mocking browser APIs, and tests for the toolbar's disabled/enabled states."
- **Testing**:
  - Unit tests for export utilities with mocked `window` APIs.
  - Component tests for toolbar behavior.

---

## Step 10 – Error handling, toasts, and UX polish

- **Goal**: Provide consistent error/success messaging and refine UX.
- **Implementation outline**:
  - Implement a small `ToastProvider` or notification system.
  - Route image validation errors, vectorization errors, and clipboard/download statuses through this system.
  - Add ARIA attributes and keyboard focus styles to controls.
  - Refine styles (spacing, typography, colors) to match modern look.
- **Human review & manual tests**:
  - Intentionally trigger various errors and observe messages.
  - Navigate app using keyboard only and confirm usability.
- **LLM prompt**:
  - "Add a lightweight toast/notification system using React context that can display success and error messages in a consistent location (e.g. bottom-right). Integrate it with existing flows: image validation errors, vectorization failures, and SVG copy/download success/failure. Improve accessibility by ensuring buttons and sliders have ARIA labels, focus outlines, and are reachable via keyboard. Fine-tune the styling to match a clean, modern aesthetic using the existing design tokens. Provide unit tests for the toast reducer/context and for components that trigger toasts."
- **Testing**:
  - Unit tests for toast state management.
  - Component tests verifying toasts appear when expected.

---

## Step 11 – End-to-end tests and regression suite

- **Goal**: Add higher-level tests that cover critical flows (load image, vectorize, adjust settings, export).
- **Implementation outline**:
  - Use a test runner like Playwright or Cypress (or React Testing Library + JSDOM for limited E2E-like flows) to simulate real user behavior.
  - Add tests for:
    - Loading an image fixture via file input and verifying both panes show content.
    - Adjusting sliders and confirming SVG changes.
    - Download button produces a Blob and triggers download.
    - Copy button calls clipboard API.
- **Human review & manual tests**:
  - Run the entire test suite; ensure all pass and are reasonably fast.
  - Execute manual sanity check across Chrome/Safari.
- **LLM prompt**:
  - "Create end-to-end style tests for the main user flows of the vectorization app using your chosen E2E or integration testing framework (e.g. Playwright or Cypress). Cover at least: uploading a sample image, verifying raster and SVG panes render, adjusting a settings slider and detecting SVG update (e.g. attribute changes), using the download button to create a downloadable SVG, and using the copy button to call the clipboard API. Ensure tests are reliable (avoid fragile timing) and can run in CI."
- **Testing**:
  - This step is entirely focused on tests; ensure E2E suite is integrated into `pnpm test` or separate script.

---

## Step 12 – Documentation and final QA

- **Goal**: Document the app's behavior, parameters, and limitations; perform final QA pass.
- **Implementation outline**:
  - Update `README.md` with usage instructions, supported formats/limits, and development notes.
  - Add short `USAGE.md` or expand PRD with a user-oriented how-to section.
  - Perform cross-browser manual testing and note any limitations.
- **Human review & manual tests**:
  - Review documentation for clarity and accuracy.
  - Run through all primary flows following docs to check for discrepancies.
- **LLM prompt**:
  - "Update project documentation to clearly describe how to run, build, and use the vectorization app, including supported image formats, size limits, and known limitations. Ensure the README and PRD are consistent with the implemented behavior. Make any minor code cleanups or comment additions that improve readability, but do not introduce new features."
- **Testing**:
  - Ensure all existing unit and E2E tests pass; no new tests required unless documentation changes code behavior.

---

## High-Level TODO List

| ID | Step |
|----|------|
| `setup-project` | Initialize Vite React+TS project with `pnpm`, linting, testing, and Material icons. |
| `layout-ui` | Implement split-pane layout and bottom toolbar. |
| `image-input` | Implement image ingestion (drag/drop, file picker, clipboard) with validation. |
| `raster-viewport` | Render raster image in left viewport. |
| `vector-engine` | Integrate Potrace-compatible vectorization engine. |
| `svg-viewport` | Render SVG in right viewport. |
| `viewport-sync` | Implement shared zoom/pan interactions. |
| `settings-panel` | Build settings panel with live parameter control and clear canvas. |
| `export-svg` | Implement download and copy SVG functionality. |
| `ux-polish` | Add toasts, error handling, accessibility, and styling polish. |
| `e2e-tests` | Implement end-to-end tests for main flows. |
| `docs-final-qa` | Final documentation and QA pass. |
