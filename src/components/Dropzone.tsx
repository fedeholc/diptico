import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import diptico from "../assets/diptico.png";

interface DropzoneProps {
  onFilesSelected: (files: File[]) => void;
}

export const Dropzone: React.FC<DropzoneProps> = ({ onFilesSelected }) => {
  const { t } = useTranslation();
  const [isActive, setIsActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsActive(true);
    } else if (e.type === "dragleave") {
      setIsActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        onFilesSelected(Array.from(e.dataTransfer.files));
      }
    },
    [onFilesSelected],
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        onFilesSelected(Array.from(e.target.files));
      }
    },
    [onFilesSelected],
  );

  return (
    <div
      className={`dropzone ${isActive ? "active" : ""}`}
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      onClick={() => document.getElementById("file-input")?.click()}
    >
      <input
        id="file-input"
        type="file"
        multiple
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFileInput}
      />
      <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>
        <img src={diptico} alt="Diptico" />
      </div>
      <p style={{ fontSize: "1.2rem", fontWeight: 600 }}>
        {t("dropzone.drag")}
      </p>
      <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>
        {t("dropzone.click")}
      </p>
    </div>
  );
};
