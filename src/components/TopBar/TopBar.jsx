import { useState, useRef } from 'react';
import { FileCode, Layers, Save } from 'lucide-react';
import { Button } from '../ui/Button';
import { DMXControl } from '../DMXControl/DMXControl';
import { ProjectSelector } from '../ProjectSelector/ProjectSelector';
import { ModeSelector } from '../ModeSelector/ModeSelector';
import { useMapManager } from '../../context/MapManagerContext';
import './TopBar.css';

export function TopBar({ onImportClick, onExportClick, onLayersClick, currentMode, onModeChange }) {
  const { isDirty, saveProject } = useMapManager();
  return (
    <div className="topbar">
      <div className="topbar-left">
        <div className="topbar-logo">
          <div className="topbar-logo-icon">
            <img src="/icon.svg" alt="QLove Logo" style={{ width: '100%', height: '100%' }} />
          </div>
          <h1 className="topbar-title">QLove</h1>
        </div>
      </div>

      <div className="topbar-center">
        <ModeSelector currentMode={currentMode} onModeChange={onModeChange} />
      </div>

      <div className="topbar-right">
        <ProjectSelector />
        <DMXControl />
        <Button 
          variant={isDirty ? "danger" : "outline"} 
          size="icon" 
          onClick={saveProject} 
          title={isDirty ? "Guardar cambios pendientes" : "Guardar proyecto"}
          className={isDirty ? "save-btn-dirty" : ""}
        >
          <Save size={20} />
        </Button>
        <Button variant="outline" size="icon" onClick={onExportClick} title="Exportar">
          <FileCode size={20} />
        </Button>
        <Button variant="outline" size="icon" onClick={onLayersClick} title="Capas / Focos">
          <Layers size={20} />
        </Button>
      </div>
    </div>
  );
}
