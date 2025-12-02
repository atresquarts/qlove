import React, { useEffect, useState, useRef } from 'react';
import { ColorWheel } from './ColorWheel';
import { Popover } from './Popover';
import './ColorPicker.css';

/**
 * Helper: Convert HSL (0‑360, 0‑100, 0‑100) to RGB (0‑255).
 */
function hslToRgb(h, s, l) {
  s /= 100;
  l /= 100;
  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return { r: Math.round(255 * f(0)), g: Math.round(255 * f(8)), b: Math.round(255 * f(4)) };
}

/**
 * Helper: Convert RGB (0-255) to HSL (0-360, 0-100, 0-100).
 */
function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

/**
 * Convert a value in the UI range 0‑100 to a DMX value 0‑255.
 */
function percentToDmx(p) {
  return Math.round(Math.max(0, Math.min(100, p)) * 2.55);
}

/**
 * Convert a DMX value 0‑255 to UI percent 0‑100.
 */
function dmxToPercent(d) {
  return Math.round(Math.max(0, Math.min(255, d)) / 2.55);
}

export function ColorPicker({ r, g, b, hue, onChange }) {
  const isRgb = typeof r === 'number' && typeof g === 'number' && typeof b === 'number';
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef(null);
  
  // Internal state for wheel
  const [currentHue, setCurrentHue] = useState(0);
  const [currentSat, setCurrentSat] = useState(100);

  useEffect(() => {
    if (isRgb) {
      const r255 = percentToDmx(r);
      const g255 = percentToDmx(g);
      const b255 = percentToDmx(b);
      const hsl = rgbToHsl(r255, g255, b255);
      setCurrentHue(hsl.h);
      setCurrentSat(hsl.s);
    } else if (typeof hue === 'number') {
      const hueVal = (hue / 100) * 360; // Convert 0-100 to 0-360
      setCurrentHue(hueVal);
      setCurrentSat(100); // Default full saturation for hue-only mode
    }
  }, [r, g, b, hue, isRgb]);

  const handleWheelChange = ({ hue: newHue, saturation: newSat }) => {
    setCurrentHue(newHue);
    setCurrentSat(newSat);

    if (isRgb) {
      const rgb = hslToRgb(newHue, newSat, 50); // Assume 50% lightness for full color
      onChange && onChange({
        r: dmxToPercent(rgb.r),
        g: dmxToPercent(rgb.g),
        b: dmxToPercent(rgb.b)
      });
    } else {
      // Hue only mode
      const huePercent = Math.round((newHue / 360) * 100);
      onChange && onChange({ hue: huePercent });
    }
  };

  // Calculate background color for button
  const getButtonColor = () => {
    const { r: r255, g: g255, b: b255 } = hslToRgb(currentHue, currentSat, 50);
    return `rgb(${r255}, ${g255}, ${b255})`;
  };

  return (
    <div className="color-picker-container">
      <button
        ref={buttonRef}
        className="color-picker-button"
        onClick={() => setIsOpen(!isOpen)}
        style={{ backgroundColor: getButtonColor() }}
      >
        <span className="color-picker-label">Color</span>
      </button>

      <Popover
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        triggerRef={buttonRef}
        position="top-start"
        className="color-picker-popover"
      >
        <div className="color-picker-content">
          <ColorWheel 
            hue={currentHue} 
            saturation={currentSat} 
            onChange={handleWheelChange} 
            size={200}
          />
        </div>
      </Popover>
    </div>
  );
}
