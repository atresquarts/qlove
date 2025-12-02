import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const MapManagerContext = createContext(null);

const STORAGE_KEY = 'qlove_maps_v2';
const LEGACY_FIXTURES_KEY = 'qlove_fixtures';
const LEGACY_CONFIG_KEY = 'qlove_config_name';

// Default panel widths
const DEFAULT_SIDEBAR_WIDTH = 300;
const DEFAULT_PROPERTIES_WIDTH = 320;

export function MapManagerProvider({ children }) {
  const [maps, setMaps] = useState({});
  const [activeMapId, setActiveMapId] = useState(null);
  const [panelWidths, setPanelWidths] = useState({
    sidebar: DEFAULT_SIDEBAR_WIDTH,
    properties: DEFAULT_PROPERTIES_WIDTH
  });
  
  const [isDirty, setIsDirty] = useState(false);

  // Initialize: Load from localStorage or migrate legacy data
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      
      if (savedData) {
        // Load existing multi-map data
        const parsed = JSON.parse(savedData);
        setMaps(parsed.maps || {});
        setActiveMapId(parsed.activeMapId || null);
        setPanelWidths(parsed.panelWidths || {
          sidebar: DEFAULT_SIDEBAR_WIDTH,
          properties: DEFAULT_PROPERTIES_WIDTH
        });
      } else {
        // Check for legacy data and migrate
        const legacyFixtures = localStorage.getItem(LEGACY_FIXTURES_KEY);
        const legacyConfigName = localStorage.getItem(LEGACY_CONFIG_KEY);
        
        if (legacyFixtures) {
          // Migrate legacy data to new structure
          const mapId = crypto.randomUUID();
          const newMap = {
            id: mapId,
            name: legacyConfigName || 'Mapa 1',
            fixtures: JSON.parse(legacyFixtures),
            cues: [], // Initialize cues
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          setMaps({ [mapId]: newMap });
          setActiveMapId(mapId);
          
          console.log('✅ Migrated legacy data to new multi-map structure');
          
          // Clean up legacy keys
          localStorage.removeItem(LEGACY_FIXTURES_KEY);
          localStorage.removeItem(LEGACY_CONFIG_KEY);
          localStorage.removeItem('qlove_presets'); 
        } else {
          // No data at all, create default map
          const mapId = crypto.randomUUID();
          const defaultMap = {
            id: mapId,
            name: 'Mapa 1',
            fixtures: [],
            presets: [],
            cues: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          setMaps({ [mapId]: defaultMap });
          setActiveMapId(mapId);
        }
      }
    } catch (err) {
      console.error('Error loading maps:', err);
      // Create default map on error
      const mapId = crypto.randomUUID();
      const defaultMap = {
        id: mapId,
        name: 'Mapa 1',
        fixtures: [],
        presets: [],
        cues: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setMaps({ [mapId]: defaultMap });
      setActiveMapId(mapId);
    }
  }, []);

  // Manual Save Project
  const saveProject = useCallback(() => {
    if (Object.keys(maps).length > 0) {
      try {
        const dataToSave = {
          maps,
          activeMapId,
          panelWidths,
          version: 2,
          savedAt: new Date().toISOString()
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
        setIsDirty(false);
        console.log('Project saved successfully');
        return true;
      } catch (err) {
        console.error('Error saving maps:', err);
        return false;
      }
    }
    return false;
  }, [maps, activeMapId, panelWidths]);

  // Auto-save disabled as per user request for manual save button with dirty state
  // useEffect(() => {
  //   if (Object.keys(maps).length > 0) {
  //       saveProject();
  //   }
  // }, [maps, activeMapId, panelWidths]);

  // Get active map
  const activeMap = activeMapId ? maps[activeMapId] : null;

  // Create new map
  const createMap = (name) => {
    const mapId = crypto.randomUUID();
    const newMap = {
      id: mapId,
      name: name || `Mapa ${Object.keys(maps).length + 1}`,
      fixtures: [],
      presets: [],
      cues: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setMaps(prev => ({ ...prev, [mapId]: newMap }));
    setActiveMapId(mapId);
    setIsDirty(true);
    return newMap;
  };

  // Delete map
  const deleteMap = (mapId) => {
    if (Object.keys(maps).length <= 1) {
      throw new Error('No puedes eliminar el último mapa');
    }

    const newMaps = { ...maps };
    delete newMaps[mapId];
    setMaps(newMaps);
    setIsDirty(true);

    // If deleted map was active, switch to first available map
    if (activeMapId === mapId) {
      const firstMapId = Object.keys(newMaps)[0];
      setActiveMapId(firstMapId);
    }
  };

  // Rename map
  const renameMap = (mapId, newName) => {
    setMaps(prev => ({
      ...prev,
      [mapId]: {
        ...prev[mapId],
        name: newName,
        updatedAt: new Date().toISOString()
      }
    }));
    setIsDirty(true);
  };

  // Duplicate map
  const duplicateMap = (mapId) => {
    const mapToDuplicate = maps[mapId];
    if (!mapToDuplicate) return;

    const newMapId = crypto.randomUUID();
    const newMap = {
      ...mapToDuplicate,
      id: newMapId,
      name: `${mapToDuplicate.name} (copia)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setMaps(prev => ({ ...prev, [newMapId]: newMap }));
    setActiveMapId(newMapId);
    setIsDirty(true);
    return newMap;
  };

  // Switch active map
  const switchMap = (mapId) => {
    if (maps[mapId]) {
      setActiveMapId(mapId);
    }
  };

  // Update map data (fixtures, presets, cues)
  const updateMapData = (mapId, updates) => {
    setMaps(prev => ({
      ...prev,
      [mapId]: {
        ...prev[mapId],
        ...updates,
        updatedAt: new Date().toISOString()
      }
    }));
    setIsDirty(true);
  };

  // Update active map data
  const updateActiveMap = (updates) => {
    if (activeMapId) {
      updateMapData(activeMapId, updates);
    }
  };

  // Update panel width
  const updatePanelWidth = (panel, width) => {
    setPanelWidths(prev => ({
      ...prev,
      [panel]: width
    }));
    // Panel width changes don't necessarily need to be "dirty" but let's save them
    // For now, let's NOT mark dirty for UI changes, only data changes
  };

  // Export single map
  const exportMap = (mapId) => {
    const map = maps[mapId];
    if (!map) return null;

    return JSON.stringify({
      type: 'qlove-single-map',
      version: 2,
      map: {
        name: map.name,
        fixtures: map.fixtures,
        presets: map.presets || [],
        cues: map.cues || []
      },
      exportedAt: new Date().toISOString()
    }, null, 2);
  };

  // Export all maps
  const exportAllMaps = () => {
    return JSON.stringify({
      type: 'qlove-all-maps',
      version: 2,
      maps: Object.values(maps).map(map => ({
        name: map.name,
        fixtures: map.fixtures,
        presets: map.presets || [],
        cues: map.cues || []
      })),
      exportedAt: new Date().toISOString()
    }, null, 2);
  };

  // Import map(s)
  const importMaps = (jsonData, replaceActive = false) => {
    try {
      const parsed = JSON.parse(jsonData);

      if (parsed.type === 'qlove-single-map') {
        // Import single map
        if (replaceActive && activeMapId) {
          // Replace current map
          updateMapData(activeMapId, {
            name: parsed.map.name,
            fixtures: parsed.map.fixtures,
            presets: parsed.map.presets || [],
            cues: parsed.map.cues || []
          });
        } else {
          // Create new map
          const mapId = crypto.randomUUID();
          const newMap = {
            id: mapId,
            name: parsed.map.name,
            fixtures: parsed.map.fixtures,
            presets: parsed.map.presets || [],
            cues: parsed.map.cues || [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          setMaps(prev => ({ ...prev, [mapId]: newMap }));
          setActiveMapId(mapId);
        }
      } else if (parsed.type === 'qlove-all-maps') {
        // Import all maps (replace everything)
        const newMaps = {};
        let firstMapId = null;

        parsed.maps.forEach((mapData, index) => {
          const mapId = crypto.randomUUID();
          if (index === 0) firstMapId = mapId;

          newMaps[mapId] = {
            id: mapId,
            name: mapData.name,
            fixtures: mapData.fixtures,
            presets: mapData.presets || [],
            cues: mapData.cues || [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
        });

        setMaps(newMaps);
        setActiveMapId(firstMapId);
      } else {
        throw new Error('Formato de archivo no reconocido');
      }

      setIsDirty(true); // Imported data is unsaved until persisted
      return true;
    } catch (err) {
      console.error('Error importing maps:', err);
      throw new Error('Error al importar: formato inválido');
    }
  };

  const value = {
    maps,
    activeMapId,
    activeMap,
    panelWidths,
    isDirty,
    saveProject,
    createMap,
    deleteMap,
    renameMap,
    duplicateMap,
    switchMap,
    updateMapData,
    updateActiveMap,
    updatePanelWidth,
    exportMap,
    exportAllMaps,
    importMaps
  };

  return (
    <MapManagerContext.Provider value={value}>
      {children}
    </MapManagerContext.Provider>
  );
}

export function useMapManager() {
  const context = useContext(MapManagerContext);
  if (!context) {
    throw new Error('useMapManager must be used within MapManagerProvider');
  }
  return context;
}
