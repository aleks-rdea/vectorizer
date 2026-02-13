import { useState } from 'react'
import type {
  VectorizeParamsState,
  CanvasBackground,
} from '../../contexts/VectorizeParamsContext'
import './SettingsPanel.css'

type SettingsPage = 'input' | 'output'

const BACKGROUND_OPTIONS: { value: CanvasBackground; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "mid", label: "A bit mid" },
  { value: "dark", label: "Dark" },
];

const COLOR_COUNT_OPTIONS = [
  { value: 1, label: "1 (Black & white)" },
  { value: 2, label: "2" },
  { value: 3, label: "3" },
  { value: 4, label: "4" },
  { value: 5, label: "5" },
  { value: 6, label: "6" },
  { value: 7, label: "7" },
  { value: 8, label: "8" },
] as const;

const THRESHOLD_MIN = 0;
const THRESHOLD_MAX = 255;
const SMOOTHNESS_MIN = 0.5;
const SMOOTHNESS_MAX = 2;
const DETAIL_MIN = 1;
const DETAIL_MAX = 20;
const CORNER_MIN = 0.5
const CORNER_MAX = 2
const CONTRAST_MIN = 0.5
const CONTRAST_MAX = 2
const SATURATION_MIN = 0
const SATURATION_MAX = 2

type SettingsPanelProps = {
  params: VectorizeParamsState;
  onParamChange: <K extends keyof VectorizeParamsState>(
    key: K,
    value: VectorizeParamsState[K]
  ) => void;
  onClearCanvas: () => void;
  onClose?: () => void;
  isVectorizing?: boolean;
};

export function SettingsPanel({
  params,
  onParamChange,
  isVectorizing = false,
  ..._rest // onClearCanvas, onClose kept for API
}: SettingsPanelProps) {
  const [page, setPage] = useState<SettingsPage>('output')
  void _rest // onClearCanvas, onClose consumed for API compatibility

  return (
    <div
      className="settings-panel"
      role="dialog"
      aria-label="Vectorize settings"
    >
      <div className="settings-panel__header">
        <div
          className="settings-panel__page-toggle"
          role="tablist"
          aria-label="Settings view"
        >
          <button
            type="button"
            role="tab"
            aria-selected={page === 'input'}
            aria-controls="settings-page-input"
            id="tab-input"
            className={
              'settings-panel__page-toggle-btn' +
              (page === 'input' ? ' settings-panel__page-toggle-btn--active' : '')
            }
            onClick={() => setPage('input')}
          >
            Input
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={page === 'output'}
            aria-controls="settings-page-output"
            id="tab-output"
            className={
              'settings-panel__page-toggle-btn' +
              (page === 'output' ? ' settings-panel__page-toggle-btn--active' : '')
            }
            onClick={() => setPage('output')}
          >
            Output
          </button>
        </div>
      </div>

      <div className="settings-panel__body">
        {page === 'input' && (
          <div
            id="settings-page-input"
            role="tabpanel"
            aria-labelledby="tab-input"
            className="settings-panel__page"
          >
            <div className="settings-panel__row">
              <div className="settings-panel__slider">
                <div className="settings-panel__slider-header">
                  <label
                    className="settings-panel__label"
                    htmlFor="setting-contrast"
                  >
                    Contrast
                  </label>
                  <span className="settings-panel__value">
                    {params.contrast.toFixed(2)}
                  </span>
                </div>
                <input
                  id="setting-contrast"
                  type="range"
                  min={CONTRAST_MIN}
                  max={CONTRAST_MAX}
                  step={0.05}
                  value={params.contrast}
                  onChange={(e) =>
                    onParamChange('contrast', e.target.valueAsNumber)
                  }
                  aria-valuemin={CONTRAST_MIN}
                  aria-valuemax={CONTRAST_MAX}
                  aria-valuenow={params.contrast}
                />
              </div>
            </div>
            <div className="settings-panel__row">
              <div className="settings-panel__slider">
                <div className="settings-panel__slider-header">
                  <label
                    className="settings-panel__label"
                    htmlFor="setting-saturation"
                  >
                    Saturation
                  </label>
                  <span className="settings-panel__value">
                    {params.saturation.toFixed(2)}
                  </span>
                </div>
                <input
                  id="setting-saturation"
                  type="range"
                  min={SATURATION_MIN}
                  max={SATURATION_MAX}
                  step={0.05}
                  value={params.saturation}
                  onChange={(e) =>
                    onParamChange('saturation', e.target.valueAsNumber)
                  }
                  aria-valuemin={SATURATION_MIN}
                  aria-valuemax={SATURATION_MAX}
                  aria-valuenow={params.saturation}
                />
              </div>
            </div>
          </div>
        )}
        {page === 'output' && (
          <div
            id="settings-page-output"
            role="tabpanel"
            aria-labelledby="tab-output"
            className="settings-panel__page"
          >
            {isVectorizing && (
              <p className="settings-panel__updating" aria-live="polite">
                Updating…
              </p>
            )}

            <div className="settings-panel__row">
              <div className="settings-panel__slider">
                <div className="settings-panel__slider-header">
                  <label
                    className="settings-panel__label"
                    htmlFor="setting-threshold"
                  >
                    Threshold
                  </label>
                  <span className="settings-panel__value">
                    {Math.round(params.threshold)}
                  </span>
                </div>
                <input
                  id="setting-threshold"
                  type="range"
                  min={THRESHOLD_MIN}
                  max={THRESHOLD_MAX}
                  value={params.threshold}
                  onChange={(e) =>
                    onParamChange("threshold", e.target.valueAsNumber)
                  }
                  aria-valuemin={THRESHOLD_MIN}
                  aria-valuemax={THRESHOLD_MAX}
                  aria-valuenow={params.threshold}
                />
              </div>
            </div>

            <div className="settings-panel__row">
              <div className="settings-panel__slider">
                <div className="settings-panel__slider-header">
                  <label
                    className="settings-panel__label"
                    htmlFor="setting-smoothness"
                  >
                    Smoothness
                  </label>
                  <span className="settings-panel__value">
                    {params.smoothness.toFixed(2)}
                  </span>
                </div>
                <input
                  id="setting-smoothness"
                  type="range"
                  min={SMOOTHNESS_MIN}
                  max={SMOOTHNESS_MAX}
                  step={0.05}
                  value={params.smoothness}
                  onChange={(e) =>
                    onParamChange("smoothness", e.target.valueAsNumber)
                  }
                  aria-valuemin={SMOOTHNESS_MIN}
                  aria-valuemax={SMOOTHNESS_MAX}
                  aria-valuenow={params.smoothness}
                />
              </div>
            </div>

            <div className="settings-panel__row">
              <div className="settings-panel__slider">
                <div className="settings-panel__slider-header">
                  <label
                    className="settings-panel__label"
                    htmlFor="setting-detail"
                  >
                    Detail
                  </label>
                  <span className="settings-panel__value">
                    {params.detailLevel}
                  </span>
                </div>
                <input
                  id="setting-detail"
                  type="range"
                  min={DETAIL_MIN}
                  max={DETAIL_MAX}
                  value={params.detailLevel}
                  onChange={(e) =>
                    onParamChange("detailLevel", e.target.valueAsNumber)
                  }
                  aria-valuemin={DETAIL_MIN}
                  aria-valuemax={DETAIL_MAX}
                  aria-valuenow={params.detailLevel}
                />
              </div>
            </div>

            <div className="settings-panel__row">
              <div className="settings-panel__slider">
                <div className="settings-panel__slider-header">
                  <label
                    className="settings-panel__label"
                    htmlFor="setting-corner"
                  >
                    Rounded corners
                  </label>
                  <span className="settings-panel__value">
                    {params.cornerRounding.toFixed(2)}
                  </span>
                </div>
                <input
                  id="setting-corner"
                  type="range"
                  min={CORNER_MIN}
                  max={CORNER_MAX}
                  step={0.05}
                  value={params.cornerRounding}
                  onChange={(e) =>
                    onParamChange("cornerRounding", e.target.valueAsNumber)
                  }
                  aria-valuemin={CORNER_MIN}
                  aria-valuemax={CORNER_MAX}
                  aria-valuenow={params.cornerRounding}
                />
              </div>
            </div>

            <div className="settings-panel__row">
              <div className="settings-panel__slider">
                <div className="settings-panel__slider-header">
                  <label
                    className="settings-panel__label"
                    htmlFor="setting-colors"
                  >
                    Colors
                  </label>
                  <span className="settings-panel__value">
                    {params.colorCount}
                  </span>
                </div>
                <input
                  id="setting-colors"
                  type="range"
                  min={COLOR_COUNT_OPTIONS[0].value}
                  max={
                    COLOR_COUNT_OPTIONS[COLOR_COUNT_OPTIONS.length - 1].value
                  }
                  step={1}
                  value={params.colorCount}
                  onChange={(e) =>
                    onParamChange("colorCount", Number(e.target.value))
                  }
                  aria-valuemin={COLOR_COUNT_OPTIONS[0].value}
                  aria-valuemax={
                    COLOR_COUNT_OPTIONS[COLOR_COUNT_OPTIONS.length - 1].value
                  }
                  aria-valuenow={params.colorCount}
                />
              </div>
            </div>

            <div className="settings-panel__row">
              <span className="settings-panel__label">Background</span>
              <div
                className="settings-panel__toggle"
                role="radiogroup"
                aria-label="Canvas background"
              >
                {BACKGROUND_OPTIONS.map((opt) => {
                  const isActive = params.canvasBackground === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      role="radio"
                      aria-checked={isActive}
                      className={
                        "settings-panel__toggle-btn" +
                        (isActive ? " settings-panel__toggle-btn--active" : "")
                      }
                      onClick={() =>
                        onParamChange("canvasBackground", opt.value)
                      }
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
