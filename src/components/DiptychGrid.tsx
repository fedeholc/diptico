import React from "react";

type DiptychItem = {
  images: [string, string];
  starred: boolean;
};

interface DiptychGridProps {
  diptychs: DiptychItem[];
  onSelect: (index: number) => void;
  onToggleStar: (index: number) => void;
  layout: "horizontal" | "vertical";
}

export const DiptychGrid: React.FC<DiptychGridProps> = ({
  diptychs,
  onSelect,
  onToggleStar,
  layout,
}) => {
  if (diptychs.length === 0) return null;

  return (
    <div className="diptych-grid">
      {diptychs.map((diptych, index) => (
        <div
          key={index}
          className="diptych-grid-item"
          onClick={() => onSelect(index)}
        >
          <div className={`diptych-preview ${layout}`}>
            <img src={diptych.images[0]} alt={`Left ${index}`} />
            <img src={diptych.images[1]} alt={`Right ${index}`} />
          </div>
          <div className="diptych-info">
            <span>{index + 1}</span>
            <button
              type="button"
              className={`star-toggle ${diptych.starred ? "is-starred" : ""}`}
              title={diptych.starred ? "Quitar destacado" : "Marcar destacado"}
              aria-label={
                diptych.starred ? "Quitar destacado" : "Marcar destacado"
              }
              onClick={(e) => {
                e.stopPropagation();
                onToggleStar(index);
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M11.48 3.5a.56.56 0 0 1 1.04 0l2.13 5.11a.56.56 0 0 0 .47.34l5.52.44a.56.56 0 0 1 .32.98l-4.2 3.6a.56.56 0 0 0-.18.56l1.28 5.38a.56.56 0 0 1-.83.61l-4.73-2.89a.56.56 0 0 0-.58 0l-4.73 2.89a.56.56 0 0 1-.83-.6l1.28-5.39a.56.56 0 0 0-.18-.56l-4.2-3.6a.56.56 0 0 1 .32-.98l5.52-.44a.56.56 0 0 0 .47-.34z" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
