import { useState } from 'react';
import './Slider.css';

export function Slider({ 
  label, 
  value = 0, 
  onChange, 
  min = 0, 
  max = 100, 
  step = 1,
  showValue = true,
  editable = false,
  vertical = false,
  height,
  className = '' 
}) {
  const [isDragging, setIsDragging] = useState(false);

  const handleChange = (e) => {
    const newValue = parseFloat(e.target.value);
    onChange?.(newValue);
  };

  const handleInputChange = (e) => {
    let newValue = parseFloat(e.target.value);
    if (isNaN(newValue)) return;
    
    // Clamp value
    if (newValue < min) newValue = min;
    if (newValue > max) newValue = max;
    
    onChange?.(newValue);
  };

  return (
    <div 
      className={`slider-wrapper ${vertical ? 'vertical' : ''} ${className}`}
      style={vertical ? { height: height || '100%' } : {}}
    >
      <div className="slider-header">
        {label && <label className="slider-label">{label}</label>}
        {showValue && (
          editable ? (
            <input
              type="number"
              className="slider-value-input"
              value={value}
              onChange={handleInputChange}
              min={min}
              max={max}
              step={step}
              onFocus={(e) => e.target.select()}
            />
          ) : (
            <span className="slider-value">{value}</span>
          )
        )}
      </div>
      <div className="slider-track-wrapper">
        <input
          type="range"
          className={`slider ${isDragging ? 'dragging' : ''}`}
          value={value}
          onChange={handleChange}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          min={min}
          max={max}
          step={step}
        />
        <div 
          className="slider-fill" 
          style={vertical 
            ? { height: `${((value - min) / (max - min)) * 100}%`, width: '100%', top: 'auto', bottom: 0 }
            : { width: `${((value - min) / (max - min)) * 100}%` }
          }
        />
      </div>
    </div>
  );
}
