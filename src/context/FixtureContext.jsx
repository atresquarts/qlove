import { createContext, useContext, useState, useEffect } from 'react';
import { Fixture } from '../models/Fixture';
import { dmxService } from '../services/dmx-service';
import { createDMXUniverse } from '../utils/dmx-converter';
import { rgbToHue, hueToRgb } from '../utils/fixture-color';
import { useMapManager } from './MapManagerContext';

import { DEFAULT_PRESETS } from '../constants/defaultPresets';

const FixtureContext = createContext(null);

export function FixtureProvider({ children, mapId }) {
  const { activeMap, updateActiveMap } = useMapManager();
  
  const [fixtures, setFixtures] = useState([]);
  const [selectedFixtureIds, setSelectedFixtureIds] = useState([]);
  const [configName, setConfigName] = useState('Sin nombre');
  const [presets, setPresets] = useState([]);
  
  // Clipboard state
  const [clipboard, setClipboard] = useState(null);
  
  // DMX state
  const [dmxConnected, setDmxConnected] = useState(false);
  const [dmxDevice, setDmxDevice] = useState(null);
  
  // Toast notifications
  const [toasts, setToasts] = useState([]);

  // Sync state with active map
  useEffect(() => {
    if (activeMap) {
      setFixtures(activeMap.fixtures.map(f => Fixture.fromJSON(f)));
      setConfigName(activeMap.name);
      
      // Load presets from map or defaults
      if (activeMap.presets && activeMap.presets.length > 0) {
        setPresets(activeMap.presets);
      } else {
        setPresets(DEFAULT_PRESETS);
      }
    }
  }, [activeMap]);

  // Reset selection when map changes
  useEffect(() => {
    setSelectedFixtureIds([]);
  }, [activeMap?.id]);

  // Save fixtures to active map
  const saveFixtures = (newFixtures) => {
    setFixtures(newFixtures);
    updateActiveMap({
      fixtures: newFixtures.map(f => f.toJSON())
    });
  };

  // Save presets to active map
  const savePresets = (newPresets) => {
    setPresets(newPresets);
    updateActiveMap({
      presets: newPresets
    });
  };

  // Toast functions
  const addToast = (message, type = 'info', duration = 3000) => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, message, type, duration }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // DMX functions
  const connectDMX = async () => {
    try {
      await dmxService.connect();
      const status = dmxService.getStatus();
      setDmxConnected(status.isConnected);
      setDmxDevice(status.device);
      addToast('DMX conectado correctamente', 'success');
    } catch (error) {
      console.error('Error connecting DMX:', error);
      addToast(error.message, 'error');
      throw error;
    }
  };

  const disconnectDMX = async () => {
    try {
      await dmxService.disconnect();
      setDmxConnected(false);
      setDmxDevice(null);
      addToast('DMX desconectado', 'info');
    } catch (error) {
      console.error('Error disconnecting DMX:', error);
      addToast('Error al desconectar DMX', 'error');
      throw error;
    }
  };

  const sendToDMX = async () => {
    if (!dmxConnected) {
      addToast('DMX no está conectado', 'warning');
      return;
    }

    if (fixtures.length === 0) {
      addToast('No hay focos para enviar', 'warning');
      return;
    }

    try {
      // Create DMX universe from fixtures
      const universe = createDMXUniverse(fixtures);
      
      // Send to DMX controller
      await dmxService.sendUniverse(universe);
      
      addToast(`Enviado a DMX: ${fixtures.length} foco(s)`, 'success');
    } catch (error) {
      console.error('Error sending to DMX:', error);
      addToast(error.message, 'error');
      
      // If device disconnected, update state
      if (error.message.includes('desconectado')) {
        setDmxConnected(false);
        setDmxDevice(null);
      }
      
      throw error;
    }
  };

  // Add fixture
  const addFixture = (fixtureData) => {
    const newFixture = new Fixture(fixtureData);
    const newFixtures = [...fixtures, newFixture];
    saveFixtures(newFixtures);
    setSelectedFixtureIds([newFixture.id]);
    return newFixture;
  };

  // Remove fixture
  const removeFixture = (fixtureId) => {
    const newFixtures = fixtures.filter(f => f.id !== fixtureId);
    saveFixtures(newFixtures);
    if (selectedFixtureIds.includes(fixtureId)) {
      setSelectedFixtureIds(selectedFixtureIds.filter(id => id !== fixtureId));
    }
  };

  // Select fixture(s)
  const selectFixture = (fixtureId, multiSelect = false) => {
    // Handle deselect all
    if (fixtureId === null) {
      setSelectedFixtureIds([]);
      return;
    }
    
    if (multiSelect) {
      if (selectedFixtureIds.includes(fixtureId)) {
        // Deselect if already selected
        setSelectedFixtureIds(selectedFixtureIds.filter(id => id !== fixtureId));
      } else {
        // Add to selection
        setSelectedFixtureIds([...selectedFixtureIds, fixtureId]);
      }
    } else {
      // Single selection
      setSelectedFixtureIds([fixtureId]);
    }
  };

  // Check if all selected fixtures have the same attribute names (compatible types)
  const areSelectedSameType = () => {
    if (selectedFixtureIds.length === 0) return false;
    const selectedFixtures = fixtures.filter(f => selectedFixtureIds.includes(f.id));
    if (selectedFixtures.length === 0) return false;
    
    const firstFixture = selectedFixtures[0];
    const firstAttrs = Object.keys(firstFixture.attributes).sort().join(',');
    
    return selectedFixtures.every(f => {
      const attrs = Object.keys(f.attributes).sort().join(',');
      return attrs === firstAttrs;
    });
  };

  // Update fixture
  const updateFixture = (fixtureId, updates) => {
    const newFixtures = fixtures.map(f => {
      if (f.id === fixtureId) {
        return new Fixture({ ...f.toJSON(), ...updates });
      }
      return f;
    });
    saveFixtures(newFixtures);
  };

  // Update fixture position
  const updateFixturePosition = (fixtureId, x, y) => {
    const newFixtures = fixtures.map(f => {
      if (f.id === fixtureId) {
        const updated = new Fixture(f.toJSON());
        updated.setPosition(x, y);
        return updated;
      }
      return f;
    });
    saveFixtures(newFixtures);
  };

  // Update fixture value - applies to all selected fixtures
  const updateFixtureValue = (fixtureId, attribute, value) => {
    const idsToUpdate = selectedFixtureIds.length > 1 ? selectedFixtureIds : [fixtureId];
    const newFixtures = fixtures.map(f => {
      if (idsToUpdate.includes(f.id)) {
        const updated = new Fixture(f.toJSON());
        updated.setValue(attribute, value);
        return updated;
      }
      return f;
    });
    saveFixtures(newFixtures);
  };

  // Get selected fixture(s)
  const selectedFixtures = fixtures.filter(f => selectedFixtureIds.includes(f.id));
  const selectedFixture = selectedFixtures.length === 1 ? selectedFixtures[0] : null;

  // Save as preset
  const saveAsPreset = (fixture, presetName) => {
    const preset = {
      id: crypto.randomUUID(),
      name: presetName,
      fixtureData: {
        name: fixture.name,
        channels: fixture.channels,
        interface: fixture.interface,
        attributes: fixture.attributes,
        values: fixture.values
      }
    };
    const newPresets = [...presets, preset];
    savePresets(newPresets);
    return preset;
  };

  // Delete preset
  const deletePreset = (presetId) => {
    const newPresets = presets.filter(p => p.id !== presetId);
    savePresets(newPresets);
  };

  // Create fixture from preset
  // Create fixture from preset
  const createFromPreset = (preset, options = {}) => {
    const { channelRange, name } = options;
    const fixtureData = { ...preset.fixtureData };
    
    // Override name if provided
    if (name) {
      fixtureData.name = name;
    }

    // If channel range is provided, map attributes to new channels
    if (channelRange) {
      fixtureData.channels = channelRange;
      
      // Get attributes and sort by original channel number
      const sortedAttributes = Object.entries(fixtureData.attributes)
        .sort(([, channelA], [, channelB]) => channelA - channelB);
      
      // Create new attributes map with re-assigned channels
      const newAttributes = {};
      let currentChannel = channelRange.start;
      
      sortedAttributes.forEach(([attrName]) => {
        // Assign sequentially starting from channelRange.start
        // We trust the user's range or just fill sequentially
        if (currentChannel <= channelRange.end) {
          newAttributes[attrName] = currentChannel;
          currentChannel++;
        } else {
          // If range is too small, we still assign a channel to avoid losing the attribute
          // Ideally the UI prevents this, but here we ensure data integrity
          newAttributes[attrName] = currentChannel;
          currentChannel++;
        }
      });
      
      fixtureData.attributes = newAttributes;
    }
    
    return addFixture(fixtureData);
  };

  // Clear all fixtures
  const clearAllFixtures = () => {
    saveFixtures([]);
    setSelectedFixtureIds([]);
  };

  // Save configuration (renaming map)
  const saveConfiguration = (name) => {
    setConfigName(name);
    updateActiveMap({ name });
  };

  // Load configuration (legacy support or import)
  const loadConfiguration = (configData) => {
    try {
      const parsed = JSON.parse(configData);
      const importedFixtures = parsed.fixtures.map(f => Fixture.fromJSON(f));
      
      // Update active map with imported data
      updateActiveMap({
        name: parsed.name || 'Configuración cargada',
        fixtures: importedFixtures.map(f => f.toJSON())
      });
      
      setFixtures(importedFixtures);
      setConfigName(parsed.name || 'Configuración cargada');
      setSelectedFixtureIds([]);
    } catch (err) {
      console.error('Error loading configuration:', err);
      throw new Error('Formato de configuración inválido');
    }
  };

  // Export configuration
  const exportConfiguration = () => {
    return JSON.stringify({
      name: configName,
      fixtures: fixtures.map(f => f.toJSON()),
      exportedAt: new Date().toISOString()
    }, null, 2);
  };

  // Copy fixture properties
  const copyFixtureProperties = (fixtureId) => {
    const fixture = fixtures.find(f => f.id === fixtureId);
    if (fixture) {
      setClipboard({
        attributes: fixture.attributes,
        values: fixture.values
      });
      addToast('Propiedades copiadas', 'success');
    }
  };

  // Paste fixture properties
  const pasteFixtureProperties = (targetId) => {
    if (!clipboard) return;

    const targetFixture = fixtures.find(f => f.id === targetId);
    if (!targetFixture) return;

    const newValues = { ...targetFixture.values };
    let pastedCount = 0;

    // Helper to check if attribute exists in object keys (case insensitive or exact)
    const hasAttr = (obj, attr) => Object.keys(obj).some(k => k === attr);

    // 1. Direct attribute matching
    Object.keys(targetFixture.attributes).forEach(attr => {
      if (clipboard.values[attr] !== undefined) {
        newValues[attr] = clipboard.values[attr];
        pastedCount++;
      }
    });

    // 2. Smart Color Mapping
    const targetAttrs = targetFixture.attributes;
    const sourceAttrs = clipboard.attributes;
    const sourceValues = clipboard.values;

    // Check source type
    const sourceHasRGB = (hasAttr(sourceAttrs, 'Red') || hasAttr(sourceAttrs, 'R')) && 
                         (hasAttr(sourceAttrs, 'Green') || hasAttr(sourceAttrs, 'G')) && 
                         (hasAttr(sourceAttrs, 'Blue') || hasAttr(sourceAttrs, 'B'));
    
    const sourceHasColor = hasAttr(sourceAttrs, 'Color') || hasAttr(sourceAttrs, 'Colores');

    // Check target type
    const targetHasRGB = (hasAttr(targetAttrs, 'Red') || hasAttr(targetAttrs, 'R')) && 
                         (hasAttr(targetAttrs, 'Green') || hasAttr(targetAttrs, 'G')) && 
                         (hasAttr(targetAttrs, 'Blue') || hasAttr(targetAttrs, 'B'));
    
    const targetHasColor = hasAttr(targetAttrs, 'Color') || hasAttr(targetAttrs, 'Colores');

    // RGB (Source) -> Color/Colores (Target)
    if (sourceHasRGB && targetHasColor) {
      const r = sourceValues['Red'] ?? sourceValues['R'] ?? 0;
      const g = sourceValues['Green'] ?? sourceValues['G'] ?? 0;
      const b = sourceValues['Blue'] ?? sourceValues['B'] ?? 0;
      
      const hue = rgbToHue(r, g, b);
      
      if (hasAttr(targetAttrs, 'Color')) newValues['Color'] = hue;
      if (hasAttr(targetAttrs, 'Colores')) newValues['Colores'] = hue;
      pastedCount++;
    }

    // Color/Colores (Source) -> RGB (Target)
    if (sourceHasColor && targetHasRGB) {
      const hue = sourceValues['Color'] ?? sourceValues['Colores'] ?? 0;
      const { r, g, b } = hueToRgb(hue);
      
      if (hasAttr(targetAttrs, 'Red')) newValues['Red'] = r;
      if (hasAttr(targetAttrs, 'R')) newValues['R'] = r;
      if (hasAttr(targetAttrs, 'Green')) newValues['Green'] = g;
      if (hasAttr(targetAttrs, 'G')) newValues['G'] = g;
      if (hasAttr(targetAttrs, 'Blue')) newValues['Blue'] = b;
      if (hasAttr(targetAttrs, 'B')) newValues['B'] = b;
      pastedCount++;
    }

    if (pastedCount > 0) {
      updateFixture(targetId, { values: newValues });
      addToast('Propiedades pegadas', 'success');
    } else {
      addToast('No hay atributos compatibles', 'warning');
    }
  };

  // Update multiple fixtures efficiently
  const updateFixtures = (updatesList) => {
    // updatesList: [{ id, updates }, ...]
    const updatesMap = new Map(updatesList.map(u => [u.id, u.updates]));
    
    const newFixtures = fixtures.map(f => {
      if (updatesMap.has(f.id)) {
        return new Fixture({ ...f.toJSON(), ...updatesMap.get(f.id) });
      }
      return f;
    });
    
    saveFixtures(newFixtures);
  };

  const value = {
    fixtures,
    selectedFixtures,
    selectedFixture,
    selectedFixtureIds,
    configName,
    presets,
    dmxConnected,
    dmxDevice,
    toasts,
    addFixture,
    removeFixture,
    updateFixture,
    updateFixtures,
    updateFixturePosition,
    updateFixtureValue,
    selectFixture,
    areSelectedSameType,
    clipboard,
    copyFixtureProperties,
    pasteFixtureProperties,
    deletePreset,
    createFromPreset,
    saveAsPreset,
    clearAllFixtures,
    saveConfiguration,
    loadConfiguration,
    exportConfiguration,
    connectDMX,
    disconnectDMX,
    sendToDMX,
    addToast,
    removeToast
  };

  return (
    <FixtureContext.Provider value={value}>
      {children}
    </FixtureContext.Provider>
  );
}

export function useFixtures() {
  const context = useContext(FixtureContext);
  if (!context) {
    throw new Error('useFixtures must be used within FixtureProvider');
  }
  return context;
}
