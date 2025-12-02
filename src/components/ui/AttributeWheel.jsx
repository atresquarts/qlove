import React, { useState, useRef, useEffect } from 'react';
import './AttributeWheel.css';

export function AttributeWheel({ value, onChange, min = 0, max = 100, label }) {
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);
  const startValue = useRef(0);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    startY.current = e.clientY;
    startValue.current = value;
    document.body.style.cursor = 'ns-resize';
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      
      const deltaY = startY.current - e.clientY;
      const sensitivity = 0.5; // Adjust for speed
      const newValue = Math.min(max, Math.max(min, startValue.current + deltaY * sensitivity));
      
      onChange(Math.round(newValue));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.cursor = '';
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, min, max, onChange]);

  // Calculate rotation based on value (0-100 maps to -135 to 135 degrees)
  const rotation = (value / (max - min)) * 270 - 135;

  return (
    <div className="attribute-wheel-container">
      <div className="attribute-label" title={label}>{label}</div>
      <div 
        className="attribute-wheel" 
        onMouseDown={handleMouseDown}
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        <div className="wheel-marker"></div>
      </div>
      <div className="attribute-value">{Math.round(value)}</div>
    </div>
  );
}
