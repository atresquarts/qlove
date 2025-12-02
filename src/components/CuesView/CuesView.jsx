import { useState, useEffect, useRef } from 'react';
import { ChevronUp, ChevronDown, Play, Square } from 'lucide-react';
import { CueList } from './CueList';
import { CuePropertiesPanel } from './CuePropertiesPanel';
import { useFixtures } from '../../context/FixtureContext';
import { useMapManager } from '../../context/MapManagerContext';
import { soundStorage } from '../../utils/sound-storage';
import './CuesView.css';

export function CuesView() {
  const { updateFixture, updateFixtures } = useFixtures();
  const { activeMap, updateActiveMap } = useMapManager();
  
  // Use cues from active map, fallback to empty array
  const cues = activeMap?.cues || [];
  
  const [selectedCueId, setSelectedCueId] = useState(null);
  const [activeCueId, setActiveCueId] = useState(null);
  
  // Audio ref for playback
  const activeAudioRef = useRef(null);
  
  // Layout state
  const [propertiesPanelHeight, setPropertiesPanelHeight] = useState(30);
  const [isResizing, setIsResizing] = useState(false);
  const [isPropertiesCollapsed, setIsPropertiesCollapsed] = useState(false);

  const handleResizeStart = (e) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e) => {
      const appMain = document.querySelector('.cues-view');
      if (!appMain) return;

      const rect = appMain.getBoundingClientRect();
      const mouseY = e.clientY - rect.top;
      const totalHeight = rect.height;
      
      const percentageFromBottom = ((totalHeight - mouseY) / totalHeight) * 100;
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

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
      }
    };
  }, []);

  const handleAddCue = (type) => {
    const newCue = {
      id: crypto.randomUUID(),
      number: cues.length + 1,
      name: `New ${type} Cue`,
      type,
      color: '#333333',
      action: 'stop', // default action
      // Type specific
      soundFile: null,
      dmxState: null
    };
    const newCues = [...cues, newCue];
    updateActiveMap({ cues: newCues });
    setSelectedCueId(newCue.id);
  };

  const handleUpdateCue = (id, updates) => {
    const newCues = cues.map(c => c.id === id ? { ...c, ...updates } : c);
    updateActiveMap({ cues: newCues });
  };

  const handleDeleteCue = (id) => {
    const filteredCues = cues.filter(c => c.id !== id);
    // Renumber cues
    const renumbered = filteredCues.map((c, i) => ({ ...c, number: i + 1 }));
    updateActiveMap({ cues: renumbered });
    
    if (selectedCueId === id) {
      setSelectedCueId(null);
    }
    if (activeCueId === id) {
      handleStopAll();
    }
  };

  const handleDuplicateCue = (id) => {
    const cueToDuplicate = cues.find(c => c.id === id);
    if (!cueToDuplicate) return;

    const newCue = {
      ...cueToDuplicate,
      id: crypto.randomUUID(),
      name: `${cueToDuplicate.name} Copy`,
      number: cues.length + 1 // Temporary, will be renumbered
    };

    const index = cues.findIndex(c => c.id === id);
    const newCues = [...cues];
    newCues.splice(index + 1, 0, newCue);
    
    // Renumber
    const renumbered = newCues.map((c, i) => ({ ...c, number: i + 1 }));
    updateActiveMap({ cues: renumbered });
    setSelectedCueId(newCue.id);
  };

  const handleReorderCues = (newCues) => {
    const renumbered = newCues.map((c, i) => ({ ...c, number: i + 1 }));
    updateActiveMap({ cues: renumbered });
  };

  const handleExecuteCue = (cueId) => {
    const cue = cues.find(c => c.id === cueId);
    if (!cue) return;

    // Stop previous audio if any
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current.currentTime = 0;
    }

    if (cue.type === 'sound' && cue.soundFile) {
      soundStorage.getSound(cue.id).then(file => {
        if (file) {
          const url = URL.createObjectURL(file);
          const audio = new Audio(url);
          activeAudioRef.current = audio;
          audio.onended = () => setActiveCueId(null);
          audio.play().catch(e => console.error("Audio playback failed:", e));
        } else {
          console.error("Audio file not found in storage");
        }
      }).catch(err => console.error("Error loading audio for cue:", err));
    } else if (cue.type === 'light' && cue.dmxState) {
      // Optimize with bulk update
      const updates = cue.dmxState.map(savedFixture => ({
        id: savedFixture.id,
        updates: { values: savedFixture.values }
      }));
      updateFixtures(updates);
    }
    
    setActiveCueId(cueId);
    // Also select it to follow along?
    setSelectedCueId(cueId);
  };

  const handleStopAll = () => {
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current.currentTime = 0;
    }
    setActiveCueId(null);
  };

  const handleGo = () => {
    if (!selectedCueId && cues.length > 0) {
      handleExecuteCue(cues[0].id);
      return;
    }
    
    // Execute selected
    if (selectedCueId) {
      handleExecuteCue(selectedCueId);
      
      // Move selection to next cue
      const currentIndex = cues.findIndex(c => c.id === selectedCueId);
      if (currentIndex < cues.length - 1) {
        setSelectedCueId(cues[currentIndex + 1].id);
      }
    }
  };

  const selectedCue = cues.find(c => c.id === selectedCueId);

  return (
    <div className="cues-view" style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="cues-workspace" style={{ flex: isPropertiesCollapsed ? '1 1 100%' : `1 1 ${100 - propertiesPanelHeight}%`, overflow: 'hidden' }}>
        <div className="cues-toolbar">
          <button className="toolbar-btn primary" onClick={handleGo}>
            <Play size={16} fill="currentColor" /> GO
          </button>
          <button className="toolbar-btn" onClick={handleStopAll}>
            <Square size={16} fill="currentColor" /> STOP
          </button>
          <div className="toolbar-divider"></div>
          <button className="toolbar-btn" onClick={() => handleAddCue('sound')}>+ Sound Cue</button>
          <button className="toolbar-btn" onClick={() => handleAddCue('light')}>+ Light Cue</button>
        </div>
        <CueList 
          cues={cues} 
          selectedCueId={selectedCueId}
          activeCueId={activeCueId}
          onSelectCue={setSelectedCueId}
          onReorderCues={handleReorderCues}
          onUpdateCue={handleUpdateCue}
          onDeleteCue={handleDeleteCue}
          onDuplicateCue={handleDuplicateCue}
          onExecuteCue={handleExecuteCue}
        />
      </div>

      {!isPropertiesCollapsed && (
        <div 
          className="resize-handle-horizontal" 
          onMouseDown={handleResizeStart}
          style={{ cursor: 'ns-resize' }}
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
        transition: 'height 0.3s ease, min-height 0.3s ease',
        borderTop: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-secondary)'
      }}>
        <CuePropertiesPanel 
          cue={selectedCue} 
          onUpdateCue={handleUpdateCue}
        />
      </div>
    </div>
  );
}
