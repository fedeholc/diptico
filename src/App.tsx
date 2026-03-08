import { useState, useCallback } from "react";
import { jsPDF } from "jspdf";
import { Dropzone } from "./components/Dropzone";
import { ImageGrid } from "./components/ImageGrid";
import { DiptychModal } from "./components/DiptychModal";
import { DiptychGrid } from "./components/DiptychGrid";

type DiptychItem = {
  images: [string, string];
  starred: boolean;
};

function App() {
  const [images, setImages] = useState<string[]>([]);
  const [diptychs, setDiptychs] = useState<DiptychItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [gridLayout, setGridLayout] = useState<"horizontal" | "vertical">(
    "horizontal",
  );

  const handleFilesSelected = useCallback((files: File[]) => {
    const urls = files.map((file) => URL.createObjectURL(file));
    setImages((prev) => [...prev, ...urls]);
    setDiptychs([]);
  }, []);

  const handleReset = useCallback(() => {
    images.forEach((url) => URL.revokeObjectURL(url));
    setImages([]);
    setDiptychs([]);
  }, [images]);

  const generateDiptychs = useCallback(() => {
    const combinations: DiptychItem[] = [];
    for (let i = 0; i < images.length; i++) {
      for (let j = 0; j < images.length; j++) {
        if (i === j) continue;
        combinations.push({ images: [images[i], images[j]], starred: false });
      }
    }
    setDiptychs(combinations);
  }, [images]);

  const toggleDiptychStar = useCallback((index: number) => {
    setDiptychs((prev) =>
      prev.map((diptych, diptychIndex) =>
        diptychIndex === index
          ? { ...diptych, starred: !diptych.starred }
          : diptych,
      ),
    );
  }, []);

  const setAllDiptychsStarred = useCallback((starred: boolean) => {
    setDiptychs((prev) => prev.map((diptych) => ({ ...diptych, starred })));
  }, []);

  const openModal = useCallback(
    (index = 0) => {
      if (diptychs.length > index) {
        setCurrentIndex(index);
        setIsModalOpen(true);
      }
    },
    [diptychs],
  );

  const nextDiptych = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % diptychs.length);
  }, [diptychs.length]);

  const prevDiptych = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + diptychs.length) % diptychs.length);
  }, [diptychs.length]);

  const downloadPDF = useCallback(async () => {
    const starredDiptychs = diptychs.filter((d) => d.starred);
    if (starredDiptychs.length === 0) return;
    setIsDownloading(true);

    const orientation = gridLayout === "vertical" ? "portrait" : "landscape";
    let doc: jsPDF | null = null;
    try {
      doc = new jsPDF({
        orientation,
        unit: "mm",
        format: "a4",
      });
    } catch (error) {
      console.error("Error al generar PDF:", error);
    }

    if (!doc) {
      setIsDownloading(false);
      console.error("No se pudo crear el documento PDF.");
      return;
    }

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 10;
    const gap = 10;

    const availableWidth = pageWidth - margin * 2;
    const availableHeight = pageHeight - margin * 2;

    type ImageArea = {
      x: number;
      y: number;
      width: number;
      height: number;
    };

    const imageAreas: [ImageArea, ImageArea] =
      gridLayout === "vertical"
        ? [
            {
              x: margin,
              y: margin,
              width: availableWidth,
              height: (availableHeight - gap) / 2,
            },
            {
              x: margin,
              y: margin + (availableHeight - gap) / 2 + gap,
              width: availableWidth,
              height: (availableHeight - gap) / 2,
            },
          ]
        : [
            {
              x: margin,
              y: margin,
              width: (availableWidth - gap) / 2,
              height: availableHeight,
            },
            {
              x: margin + (availableWidth - gap) / 2 + gap,
              y: margin,
              width: (availableWidth - gap) / 2,
              height: availableHeight,
            },
          ];

    // Helper function to load image and get dimensions
    const getImageDimensions = (
      url: string,
    ): Promise<{ width: number; height: number }> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () =>
          resolve({ width: img.naturalWidth, height: img.naturalHeight });
        img.onerror = reject;
        img.src = url;
      });
    };

    for (let i = 0; i < starredDiptychs.length; i++) {
      if (i > 0) doc.addPage();

      const [leftUrl, rightUrl] = starredDiptychs[i].images;

      // Parallel load dimensions
      const [leftDim, rightDim] = await Promise.all([
        getImageDimensions(leftUrl),
        getImageDimensions(rightUrl),
      ]);

      const drawImageInArea = (
        url: string,
        dim: { width: number; height: number },
        area: ImageArea,
      ) => {
        const ratio = dim.width / dim.height;
        const areaRatio = area.width / area.height;

        let finalW, finalH;
        if (ratio > areaRatio) {
          // Limited by width
          finalW = area.width;
          finalH = area.width / ratio;
        } else {
          // Limited by height
          finalH = area.height;
          finalW = area.height * ratio;
        }

        // Center in its area
        const x = area.x + (area.width - finalW) / 2;
        const y = area.y + (area.height - finalH) / 2;

        doc.addImage(url, "JPEG", x, y, finalW, finalH, undefined, "FAST");
      };

      drawImageInArea(leftUrl, leftDim, imageAreas[0]);
      drawImageInArea(rightUrl, rightDim, imageAreas[1]);
    }

    doc.save("dipticos-generados.pdf");
    setIsDownloading(false);
    return;
  }, [diptychs, gridLayout]);

  const canGenerate = images.length >= 2;
  const hasGenerated = diptychs.length > 0;
  const starredCount = diptychs.filter((d) => d.starred).length;

  return (
    <>
      <h1>Diptico</h1>
      {!isModalOpen && (
        <>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              width: "100%",
              maxWidth: "600px",
              paddingBottom: "0.5rem",
            }}
          >
            <Dropzone onFilesSelected={handleFilesSelected} />
            <button
              className="button button-secondary button-reset"
              onClick={handleReset}
              disabled={images.length === 0}
              title="Eliminar todas las imágenes"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
              Reiniciar
            </button>
          </div>

          <ImageGrid images={images} />

          <div className="actions">
            <button
              className="button button-primary"
              onClick={generateDiptychs}
              disabled={!canGenerate}
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
                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                <path d="M5 3v4" />
                <path d="M3 5h4" />
                <path d="M21 17v4" />
                <path d="M19 19h4" />
              </svg>
              Generar Dípticos
            </button>

            <button
              className="button button-secondary"
              onClick={() => openModal(0)}
              disabled={!hasGenerated}
              style={{ borderColor: "#10b981", color: "#10b981" }}
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
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <span style={{ color: "#ffffff" }}>
                Ver Dípticos ({diptychs.length})
              </span>
            </button>
          </div>

          <hr
            style={{
              width: "100%",
              margin: "2rem 0",
              borderColor: "var(--panel-bg)",
            }}
          ></hr>
          {diptychs.length > 0 && (
            <div className="bulk-actions">
              <button
                className="button button-secondary"
                onClick={() =>
                  setGridLayout((prev) =>
                    prev === "horizontal" ? "vertical" : "horizontal",
                  )
                }
                disabled={!hasGenerated}
                title="Cambiar Diseño de Grilla"
              >
                {gridLayout === "horizontal" ? (
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
                Cambiar orientación
              </button>

              <button
                className="button button-secondary"
                onClick={() => setAllDiptychsStarred(true)}
                disabled={!hasGenerated}
                title="Marcar todos como destacados"
              >
                <div style={{ color: "#67e8f9", display: "flex" }}>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M11.48 3.5a.56.56 0 0 1 1.04 0l2.13 5.11a.56.56 0 0 0 .47.34l5.52.44a.56.56 0 0 1 .32.98l-4.2 3.6a.56.56 0 0 0-.18.56l1.28 5.38a.56.56 0 0 1-.83.61l-4.73-2.89a.56.56 0 0 0-.58 0l-4.73 2.89a.56.56 0 0 1-.83-.6l1.28-5.39a.56.56 0 0 0-.18-.56l-4.2-3.6a.56.56 0 0 1 .32-.98l5.52-.44a.56.56 0 0 0 .47-.34z" />
                  </svg>
                </div>
                Seleccionar todos
              </button>

              <button
                className="button button-secondary"
                onClick={() => setAllDiptychsStarred(false)}
                disabled={!hasGenerated}
                title="Quitar destacado de todos"
              >
                <div style={{ color: "#000000", display: "flex" }}>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M11.48 3.5a.56.56 0 0 1 1.04 0l2.13 5.11a.56.56 0 0 0 .47.34l5.52.44a.56.56 0 0 1 .32.98l-4.2 3.6a.56.56 0 0 0-.18.56l1.28 5.38a.56.56 0 0 1-.83.61l-4.73-2.89a.56.56 0 0 0-.58 0l-4.73 2.89a.56.56 0 0 1-.83-.6l1.28-5.39a.56.56 0 0 0-.18-.56l-4.2-3.6a.56.56 0 0 1 .32-.98l5.52-.44a.56.56 0 0 0 .47-.34z" />
                  </svg>
                </div>
                Seleccionar ninguno
              </button>
              <button
                className="button button-secondary"
                onClick={downloadPDF}
                disabled={starredCount === 0 || isDownloading}
                style={{ borderColor: "#10b981", color: "#10b981" }}
              >
                {isDownloading ? (
                  "Generando..."
                ) : (
                  <>
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
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    <span style={{ color: "#ffffff" }}>
                      Descargar PDF ({starredCount})
                    </span>
                  </>
                )}
              </button>
            </div>
          )}

          <DiptychGrid
            diptychs={diptychs}
            onSelect={(index) => openModal(index)}
            onToggleStar={toggleDiptychStar}
            layout={gridLayout}
          />
        </>
      )}

      {isModalOpen && diptychs.length > 0 && (
        <DiptychModal
          diptych={diptychs[currentIndex].images}
          isStarred={diptychs[currentIndex].starred}
          onToggleStar={() => toggleDiptychStar(currentIndex)}
          onNext={nextDiptych}
          onPrev={prevDiptych}
          onClose={() => setIsModalOpen(false)}
          initialLayout={gridLayout}
        />
      )}
    </>
  );
}

export default App;
