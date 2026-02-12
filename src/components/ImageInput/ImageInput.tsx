import {
  useRef,
  useEffect,
  useCallback,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { useImage } from "../../contexts/ImageContext";
import { useToast } from "../../contexts/ToastContext";
import { ALLOWED_MIME_TYPES } from "../../constants/imageValidation";
import "./ImageInput.css";

export type ImageInputHandle = { openFileDialog: () => void };

export const ImageInput = forwardRef<ImageInputHandle>(function ImageInput(
  _,
  ref
) {
  const { setImageFromFile, error, clearError } = useImage();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleClick = useCallback(() => {
    clearError();
    fileInputRef.current?.click();
  }, [clearError]);

  useImperativeHandle(
    ref,
    () => ({
      openFileDialog() {
        clearError();
        fileInputRef.current?.click();
      },
    }),
    [clearError]
  );

  const handleFile = useCallback(
    (file: File | null) => {
      if (!file) return;
      setImageFromFile(file);
    },
    [setImageFromFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      clearError();
      const file = e.dataTransfer.files?.[0];
      handleFile(file ?? null);
    },
    [handleFile, clearError]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }, []);

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      handleFile(file ?? null);
      e.target.value = "";
    },
    [handleFile]
  );

  useEffect(() => {
    if (error) showToast(error, "error");
  }, [error, showToast]);

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const item = e.clipboardData?.items
        ? Array.from(e.clipboardData.items).find((item) =>
            ALLOWED_MIME_TYPES.includes(
              item.type as (typeof ALLOWED_MIME_TYPES)[number]
            )
          )
        : undefined;
      const file = item?.getAsFile();
      if (file) {
        e.preventDefault();
        setImageFromFile(file);
      }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [setImageFromFile]);

  return (
    <div className="image-input">
      <div
        className={`image-input-dropzone ${
          isDragging ? "image-input-dropzone--active" : ""
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        <p className="layout-pane-empty-text">Drop an Image Here</p>
        <p className="layout-pane-empty-text-muted">
          or paste from your clipboard
          <br />
          and Vecna will Vectorize you
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_MIME_TYPES.join(",")}
          onChange={handleFileInputChange}
          className="image-input-hidden-input"
          aria-hidden
          tabIndex={-1}
        />
      </div>
      {error && (
        <p className="image-input-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});
