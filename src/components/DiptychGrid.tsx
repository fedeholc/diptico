import React from 'react';

interface DiptychGridProps {
  diptychs: [string, string][];
  onSelect: (index: number) => void;
  layout: 'horizontal' | 'vertical';
}

export const DiptychGrid: React.FC<DiptychGridProps> = ({ diptychs, onSelect, layout }) => {
  if (diptychs.length === 0) return null;

  return (
    <div className="diptych-grid">
      {diptychs.map((pair, index) => (
        <div
          key={index}
          className="diptych-grid-item"
          onClick={() => onSelect(index)}
        >
          <div className={`diptych-preview ${layout}`}>
            <img src={pair[0]} alt={`Left ${index}`} />
            <img src={pair[1]} alt={`Right ${index}`} />
          </div>
          <div className="diptych-info">{index + 1}</div>
        </div>
      ))}
    </div>
  );
};
