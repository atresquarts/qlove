/**
 * Generate QLab-compatible code from fixture data
 * 
 * Output format:
 * FIXTURE_NAME.Attribute = value
 * FIXTURE_NAME.Attribute2 = value2
 * ...
 */
export function generateQLabCode(fixture) {
  if (!fixture || !fixture.name || !fixture.attributes) {
    throw new Error('Invalid fixture data');
  }

  const lines = [];
  
  // Generate a line for each attribute
  Object.keys(fixture.attributes).forEach(attributeName => {
    const value = fixture.values[attributeName] || 0;
    lines.push(`${fixture.name}.${attributeName} = ${value}`);
  });

  return lines.join('\n');
}

/**
 * Generate QLab code for multiple fixtures
 */
export function generateQLabCodeForMultiple(fixtures) {
  if (!Array.isArray(fixtures) || fixtures.length === 0) {
    throw new Error('No fixtures provided');
  }

  const sections = fixtures.map(fixture => generateQLabCode(fixture));
  return sections.join('\n\n');
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    
    // Fallback method
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (fallbackErr) {
      console.error('Fallback copy failed:', fallbackErr);
      return false;
    }
  }
}

/**
 * Format fixture data for display
 */
export function formatFixtureInfo(fixture) {
  const info = [];
  
  info.push(`Nombre: ${fixture.name}`);
  info.push(`Canales: ${fixture.channels.start} – ${fixture.channels.end}`);
  
  if (fixture.interface) {
    info.push(`Interfaz: ${fixture.interface}`);
  }
  
  info.push('');
  info.push('Atributos:');
  
  Object.entries(fixture.attributes).forEach(([attr, channel]) => {
    const value = fixture.values[attr] || 0;
    info.push(`  ${attr} (Canal ${channel}): ${value}`);
  });
  
  return info.join('\n');
}
