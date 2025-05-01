import React, { useState } from 'react';

interface ColorCirclesProps {
  colors: { value: string; label: string }[];
  selectedColor: string;
  onChange: (color: string) => void;
  onCustomColor: (color: string) => void;
}

const ColorCircles: React.FC<ColorCirclesProps> = ({
  colors,
  selectedColor,
  onChange,
  onCustomColor,
}) => {
  const [customColor, setCustomColor] = useState(selectedColor);
  const [showCustomPicker, setShowCustomPicker] = useState(false);

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomColor(e.target.value);
    onCustomColor(e.target.value);
  };

  const toggleCustomPicker = () => {
    setShowCustomPicker(!showCustomPicker);
  };

  return (
    <div className="color-circles-container">
      <div className="color-circles">
        {colors.map((color) => (
          <div
            key={color.value}
            className={`color-circle ${selectedColor === color.value ? 'selected' : ''}`}
            style={{ backgroundColor: color.value }}
            title={color.label}
            onClick={() => onChange(color.value)}
          />
        ))}
        <button 
          className="custom-color-btn" 
          onClick={toggleCustomPicker}
          title="Choose a custom color"
        >
          Custom
        </button>
      </div>
      
      {showCustomPicker && (
        <div className="custom-color-picker">
          <input
            type="color"
            value={customColor}
            onChange={handleCustomColorChange}
          />
        </div>
      )}
    </div>
  );
};

export default ColorCircles; 