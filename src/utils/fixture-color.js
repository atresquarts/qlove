/**
 * Get the color of a fixture based on its RGB or Color attributes
 * Returns a hex color string or null if the fixture is off
 */
export function getFixtureColor(fixture) {
  if (!fixture || !fixture.attributes) return null;

  const attrs = fixture.attributes;
  const values = fixture.values || {};

  // Check for RGB attributes (Red/R, Green/G, Blue/B)
  const hasRed = 'Red' in attrs || 'R' in attrs;
  const hasGreen = 'Green' in attrs || 'G' in attrs;
  const hasBlue = 'Blue' in attrs || 'B' in attrs;

  if (hasRed && hasGreen && hasBlue) {
    const r = values.Red ?? values.R ?? 0;
    const g = values.Green ?? values.G ?? 0;
    const b = values.Blue ?? values.B ?? 0;

    // If all values are 0, fixture is off
    if (r === 0 && g === 0 && b === 0) return null;

    // Convert 0-100 to 0-255
    const r255 = Math.round(r * 2.55);
    const g255 = Math.round(g * 2.55);
    const b255 = Math.round(b * 2.55);

    return `rgb(${r255}, ${g255}, ${b255})`;
  }

  // Check for single Color/Colores attribute (hue-based)
  const hasColor = 'Color' in attrs || 'Colores' in attrs;
  if (hasColor) {
    const hue = values.Color ?? values.Colores ?? 0;
    
    // If hue is 0, fixture is off
    if (hue === 0) return null;

    // Convert hue (0-100) to HSL (0-360)
    const hslHue = hue * 3.6;
    return `hsl(${hslHue}, 100%, 50%)`;
  }

  // No color attributes found
  return null;
}

/**
 * Check if a fixture is off (all color values at 0)
 */
export function isFixtureOff(fixture) {
  return getFixtureColor(fixture) === null;
}

/**
 * Convert RGB (0-100) to Hue (0-100)
 */
export function rgbToHue(r, g, b) {
  r /= 100;
  g /= 100;
  b /= 100;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;

  if (max === min) {
    h = 0; // achromatic
  } else {
    const d = max - min;
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return Math.round(h * 100);
}

/**
 * Convert Hue (0-100) to RGB (0-100)
 */
export function hueToRgb(h) {
  // Assuming full saturation and lightness for simplicity, as we just map to primary colors
  const s = 1;
  const l = 0.5;
  
  h /= 100; // 0-1

  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return {
    r: Math.round(r * 100),
    g: Math.round(g * 100),
    b: Math.round(b * 100)
  };
}
