import { useState, useRef, useEffect } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { FixtureProvider, useFixtures } from './context/FixtureContext';
import { MapManagerProvider, useMapManager } from './context/MapManagerContext';
import { TopBar } from './components/TopBar/TopBar';
import { Sidebar } from './components/Sidebar/Sidebar';
import { Canvas } from './components/Canvas/Canvas';
import { PropertiesPanel } from './components/PropertiesPanel/PropertiesPanel';
import { ImportModal } from './components/ImportModal/ImportModal';
import { ExportModal } from './components/ExportModal/ExportModal';
import { WorkInProgress } from './components/WorkInProgress/WorkInProgress';
import { CuesView } from './components/CuesView/CuesView';
import { ToastContainer } from './components/ui/Toast';
import './App.css';

function AppContent() {
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [currentMode, setCurrentMode] = useState('lights');
  const { toasts, removeToast } = useFixtures();
  const { activeMapId, panelWidths, updatePanelWidth } = useMapManager();
  const canvasRef = useRef(null);
  
  const [showLayers, setShowLayers] = useState(true);
  const topBarRef = useRef(null);
  
  const [propertiesPanelHeight, setPropertiesPanelHeight] = useState(30); // percentage
  const [isResizing, setIsResizing] = useState(false);
  const [isPropertiesCollapsed, setIsPropertiesCollapsed] = useState(false);

  const handleToggleLayers = () => {
    setShowLayers(prev => !prev);
  };

  const handleModeChange = (mode) => {
    setCurrentMode(mode);
  };

  const handleResizeStart = (e) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e) => {
      const appMain = document.querySelector('.app-main');
      if (!appMain) return;

      const rect = appMain.getBoundingClientRect();
      const mouseY = e.clientY - rect.top;
      const totalHeight = rect.height;
      
      // Calculate percentage from bottom (inverted)
      const percentageFromBottom = ((totalHeight - mouseY) / totalHeight) * 100;
      
      // Clamp between 20% and 60%
      const clampedPercentage = Math.max(20, Math.min(60, percentageFromBottom));
      setPropertiesPanelHeight(clampedPercentage);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  return (
    <div className="app">
      <div ref={topBarRef}>
        <TopBar 
          onImportClick={() => setShowImportModal(true)}
          onExportClick={() => setShowExportModal(true)}
          onLayersClick={handleToggleLayers}
          currentMode={currentMode}
          onModeChange={handleModeChange}
        />
      </div>
      
      {currentMode === 'lights' ? (
        <div className="app-main" style={{ position: 'relative' }}>
          <div className="workspace-area" style={{ flex: isPropertiesCollapsed ? '1 1 100%' : `1 1 ${100 - propertiesPanelHeight}%` }}>
            {showLayers && (
              <div className="layers-popover-container">
                <Sidebar onAddFixtureClick={() => setShowImportModal(true)} canvasRef={canvasRef} />
              </div>
            )}
            
            <Canvas ref={canvasRef} />
          </div>
          
          {!isPropertiesCollapsed && (
            <div 
              className="resize-handle-horizontal" 
              onMouseDown={handleResizeStart}
              style={{ cursor: isResizing ? 'ns-resize' : 'ns-resize' }}
            >
              <div className="resize-handle-line"></div>
            </div>
          )}
          
          <button
            className="properties-toggle-tab"
            onClick={() => setIsPropertiesCollapsed(!isPropertiesCollapsed)}
            title={isPropertiesCollapsed ? "Mostrar propiedades" : "Ocultar propiedades"}
            style={{ 
              bottom: isPropertiesCollapsed ? '0' : `${propertiesPanelHeight}%`,
              marginBottom: isPropertiesCollapsed ? '0' : '8px'
            }}
          >
            {isPropertiesCollapsed ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          <div style={{ 
            height: isPropertiesCollapsed ? '0' : `${propertiesPanelHeight}%`, 
            minHeight: isPropertiesCollapsed ? '0' : '180px', 
            display: 'flex', 
            flexDirection: 'column',
            overflow: 'hidden',
            transition: 'height 0.3s ease, min-height 0.3s ease'
          }}>
            <PropertiesPanel />
          </div>
        </div>
      ) : currentMode === 'cues' ? (
        <CuesView />
      ) : (
        <WorkInProgress 
          title="Show Mode"
          description="Modo de actuación con una interfaz a prueba de errores para ejecutar tus shows en vivo. Próximamente disponible."
        />
      )}

      <ImportModal 
        isOpen={showImportModal} 
        onClose={() => setShowImportModal(false)} 
      />
      
      <ExportModal 
        isOpen={showExportModal} 
        onClose={() => setShowExportModal(false)} 
      />

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

function App() {
  return (
    <MapManagerProvider>
      <AppWithMap />
    </MapManagerProvider>
  );
}

function AppWithMap() {
  const { activeMapId } = useMapManager();
  
  // Re-mount FixtureProvider when map changes to ensure clean state
  return (
    <FixtureProvider key={activeMapId} mapId={activeMapId}>
      <AppContent />
    </FixtureProvider>
  );
}

export default App;
