import React, { useEffect, useCallback, useState } from "react";

interface DiptychModalProps {
  diptych: [string, string];
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
  initialLayout?: "horizontal" | "vertical";
}

export const DiptychModal: React.FC<DiptychModalProps> = ({
  diptych,
  onNext,
  onPrev,
  onClose,
  initialLayout = "horizontal",
}) => {
  const [isSwapped, setIsSwapped] = useState(false);
  const [layout, setLayout] = useState<"horizontal" | "vertical">(
    initialLayout,
  );
  const [showHelp, setShowHelp] = useState(false);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") onNext();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "Escape") onClose();
      if (e.key === "s" || e.key === "S") setIsSwapped((prev) => !prev);
      if (e.key === "v" || e.key === "V")
        setLayout((prev) =>
          prev === "horizontal" ? "vertical" : "horizontal",
        );
    },
    [onNext, onPrev, onClose],
  );

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      if (e.deltaY > 0) onNext();
      else if (e.deltaY < 0) onPrev();
    },
    [onNext, onPrev],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("wheel", handleWheel);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("wheel", handleWheel);
    };
  }, [handleKeyDown, handleWheel]);

  const displayImages = isSwapped
    ? [diptych[1], diptych[0]]
    : [diptych[0], diptych[1]];

  return (
    <div className="modal-overlay">
      <div className={`diptych-container ${layout}`}>
        <div className="diptych-image-wrapper">
          <img src={displayImages[0]} alt="First" className="diptych-image" />
        </div>
        <div className="diptych-image-wrapper">
          <img src={displayImages[1]} alt="Second" className="diptych-image" />
        </div>
      </div>

      <div className="modal-toolbar">
        <button
          className="toolbar-button"
          onClick={onPrev}
          title="Anterior (←)"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>

        <button
          className="toolbar-button"
          onClick={() => setIsSwapped(!isSwapped)}
          title="Intercambiar (S)"
        >
          {layout === "horizontal" ? (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 7 5 5-5 5" />
              <path d="m9 7-5 5 5 5" />
            </svg>
          ) : (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m7 15 5 5 5-5" />
              <path d="m7 9 5-5 5 5" />
            </svg>
          )}
        </button>

        <button
          className="toolbar-button toolbar-button-close"
          onClick={onClose}
          title="Cerrar (Esc)"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>

        <button
          className="toolbar-button"
          onClick={() =>
            setLayout(layout === "horizontal" ? "vertical" : "horizontal")
          }
          title="Cambiar Diseño (V)"
        >
          {layout === "horizontal" ? (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M12 3v18" />
            </svg>
          ) : (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M3 12h18" />
            </svg>
          )}
        </button>

        <button
          className="toolbar-button"
          onClick={onNext}
          title="Siguiente (→)"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>

      <div className="help-container">
        <button
          className={`toolbar-button help-button ${showHelp ? "active" : ""}`}
          onClick={() => setShowHelp(!showHelp)}
          title="Shortcuts (?)"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <path d="M12 17h.01" />
          </svg>
        </button>

        {showHelp && (
          <div className="shortcuts-panel">
            <div className="shortcuts-header">Shortcuts</div>
            <div className="shortcut-item">
              <span className="shortcut-key">← / →</span>
              <span className="shortcut-desc">Anterior / Siguiente</span>
            </div>
            <div className="shortcut-item">
              <span className="shortcut-key">S</span>
              <span className="shortcut-desc">Intercambiar</span>
            </div>
            <div className="shortcut-item">
              <span className="shortcut-key">V</span>
              <span className="shortcut-desc">Diseño H/V</span>
            </div>
            <div className="shortcut-item">
              <span className="shortcut-key">Esc</span>
              <span className="shortcut-desc">Cerrar</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
