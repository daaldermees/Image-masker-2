import React from 'react';

interface ColorOption {
  value: string;
  label: string;
}

interface ColorPickerProps {
  colors: ColorOption[];
  selectedColor: string;
  onChange: (color: string) => void;
  label?: string;
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  colors,
  selectedColor,
  onChange,
  label
}) => {
  return (
    <div className="color-section">
      {label && <label>{label}</label>}
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
        </div>
      </div>
    </div>
  );
};

export default ColorPicker; 