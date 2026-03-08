import React from 'react';

interface ImageGridProps {
  images: string[];
}

export const ImageGrid: React.FC<ImageGridProps> = ({ images }) => {
  if (images.length === 0) return null;

  return (
    <div className="image-grid">
      {images.map((src, index) => (
        <div key={index} className="image-item">
          <img src={src} alt={`Uploaded ${index}`} />
        </div>
      ))}
    </div>
  );
};
