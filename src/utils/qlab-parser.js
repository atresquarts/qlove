/**
 * Parse QLab OCR text format to extract fixture information
 * 
 * Expected format:
 * FIXTURE NAME
 * 
 * Canales: X – Y
 * Interfaz: ...
 * 
 * Función	Canal
 * Function1	Channel1
 * Function2	Channel2
 * ...
 */
export function parseQLabOCR(text) {
  if (!text || typeof text !== 'string') {
    throw new Error('Invalid input text');
  }

  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
  
  if (lines.length < 3) {
    throw new Error('Texto insuficiente. Asegúrate de incluir nombre, canales y atributos.');
  }

  // Check for new format (Line 2 is "X - Y")
  const isNewFormat = /^\d+\s*-\s*\d+$/.test(lines[1]);

  if (isNewFormat) {
    return parseNewFormat(lines);
  }

  // Standard format parsing
  return parseStandardFormat(lines);
}

function parseNewFormat(lines) {
  // Line 1: Name (remove "v " prefix if present)
  let name = lines[0];
  if (name.toLowerCase().startsWith('v ')) {
    name = name.substring(2).trim();
  }

  // Line 2: Channels "90 - 100"
  const channelParts = lines[1].split('-').map(p => parseInt(p.trim(), 10));
  const channels = {
    start: channelParts[0],
    end: channelParts[1]
  };

  // Line 3: Interface
  const interfaceInfo = lines[2];

  // Line 4+: Attributes (Name, Value, Name, Value...)
  const attributes = {};
  
  for (let i = 3; i < lines.length; i += 2) {
    const attrName = lines[i];
    const attrValue = lines[i + 1];

    if (attrName && attrValue && !isNaN(parseInt(attrValue))) {
      // Use the channel number as the value
      attributes[attrName] = parseInt(attrValue, 10);
    }
  }

  if (Object.keys(attributes).length === 0) {
    throw new Error('No se encontraron atributos en el nuevo formato.');
  }

  return {
    name,
    channels,
    interface: interfaceInfo,
    attributes
  };
}

function parseStandardFormat(lines) {
  // Extract fixture name (first line)
  const name = lines[0];

  // Extract channels
  const channelsLine = lines.find(line => line.toLowerCase().includes('canales:'));
  let channels = { start: 1, end: 1 };
  
  if (channelsLine) {
    const channelMatch = channelsLine.match(/(\d+)\s*[–-]\s*(\d+)/);
    if (channelMatch) {
      channels = {
        start: parseInt(channelMatch[1], 10),
        end: parseInt(channelMatch[2], 10)
      };
    }
  }

  // Extract interface
  const interfaceLine = lines.find(line => line.toLowerCase().includes('interfaz:'));
  let interfaceInfo = '';
  
  if (interfaceLine) {
    interfaceInfo = interfaceLine.replace(/interfaz:/i, '').trim();
  }

  // Extract attributes (function -> channel mapping)
  const attributes = {};
  let inAttributeSection = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if we're in the attribute section
    if (line.toLowerCase().includes('función') && line.toLowerCase().includes('canal')) {
      inAttributeSection = true;
      continue;
    }

    if (inAttributeSection) {
      // Parse attribute lines (format: "Function\tChannel" or "Function  Channel")
      const parts = line.split(/\t+|\s{2,}/);
      
      if (parts.length >= 2) {
        const functionName = parts[0].trim();
        const channelNum = parts[1].trim();
        
        // Skip if it's a header or empty
        if (functionName && channelNum && !isNaN(parseInt(channelNum))) {
          attributes[functionName] = parseInt(channelNum, 10);
        }
      }
    }
  }

  if (Object.keys(attributes).length === 0) {
    // Fallback: try to find lines that look like "AttributeName 123" if standard section not found
    // This handles cases where "Función Canal" header might be missing but format is similar
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        const parts = line.split(/\t+|\s{2,}/);
        if (parts.length >= 2) {
            const name = parts[0].trim();
            const val = parts[1].trim();
            if (name && val && !isNaN(parseInt(val)) && !name.includes(':')) {
                 attributes[name] = parseInt(val, 10);
            }
        }
    }
    
    if (Object.keys(attributes).length === 0) {
        throw new Error('No se encontraron atributos. Verifica el formato del texto.');
    }
  }

  return {
    name,
    channels,
    interface: interfaceInfo,
    attributes
  };
}

/**
 * Validate parsed fixture data
 */
export function validateFixtureData(data) {
  const errors = [];

  if (!data.name || data.name.trim() === '') {
    errors.push('El nombre del foco es requerido');
  }

  if (!data.channels || data.channels.start < 1 || data.channels.end < data.channels.start) {
    errors.push('Los canales son inválidos');
  }

  if (!data.attributes || Object.keys(data.attributes).length === 0) {
    errors.push('Debe haber al menos un atributo');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
