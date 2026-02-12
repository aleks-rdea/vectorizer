# Vectorize

A browser-based app that converts raster images (PNG, JPEG, GIF, WebP) into vector SVG using [Potrace](http://potrace.sourceforge.net/) (WASM). Drop an image, adjust settings, and download or copy the SVG.

## Run

```bash
pnpm install
pnpm dev
```

Open http://localhost:5173

## Build

```bash
pnpm build
```

Output is in `dist/`. Preview with `pnpm preview`.

## Tests

- **Unit tests:** `pnpm test` (watch) or `pnpm test:run` (single run)
- **E2E tests:** `pnpm test:e2e` — runs Playwright against the dev server (install browsers once with `pnpm exec playwright install`)

## Supported formats and limits

- **Formats:** PNG, JPEG, GIF, WebP
- **Max file size:** 10 MB
- **Max dimension:** 4000 px (width or height). Larger images are accepted but vectorization uses a downscaled copy (max 1024 px per side) to avoid engine limits.
- **Output:** SVG (1 color = black/white, or 2–8 colors via settings)

## Usage

1. **Add an image** — Drag and drop onto the left pane, click the + button to pick a file, or paste from the clipboard.
2. **Compare** — Left pane shows the raster image; right pane shows the vectorized SVG. Zoom and pan are shared (scroll to zoom, drag to pan, double-click or toolbar button to reset).
3. **Settings** — Click the settings icon in the bottom toolbar to adjust threshold, smoothness, detail level, corner rounding, colors (1–8), and canvas background.
4. **Export** — Use **Download SVG** or **Copy SVG to clipboard** in the toolbar when an image is loaded.

## Tech

- React 19, TypeScript, Vite
- [esm-potrace-wasm](https://github.com/tomayac/esm-potrace-wasm) for vectorization
- Vitest + Testing Library for unit tests, Playwright for E2E
