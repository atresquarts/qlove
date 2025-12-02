import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Plus, Trash2, Copy, Edit2, Check, X } from 'lucide-react';
import { useMapManager } from '../../context/MapManagerContext';
import { Button } from '../ui/Button';
import './ProjectSelector.css';

export function ProjectSelector() {
  const { 
    maps, 
    activeMapId, 
    activeMap, 
    switchMap, 
    createMap, 
    deleteMap, 
    renameMap, 
    duplicateMap 
  } = useMapManager();
  
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setEditingId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  const handleCreateMap = () => {
    createMap();
    setIsOpen(false);
  };

  const handleStartEdit = (e, map) => {
    e.stopPropagation();
    setEditingId(map.id);
    setEditName(map.name);
  };

  const handleSaveEdit = (e) => {
    e.stopPropagation();
    if (editName.trim()) {
      renameMap(editingId, editName.trim());
    }
    setEditingId(null);
  };

  const handleCancelEdit = (e) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const handleDelete = (e, mapId) => {
    e.stopPropagation();
    if (confirm('¿Estás seguro de que quieres eliminar este proyecto?')) {
      deleteMap(mapId);
      if (Object.keys(maps).length <= 1) {
        setIsOpen(false);
      }
    }
  };

  const handleDuplicate = (e, mapId) => {
    e.stopPropagation();
    duplicateMap(mapId);
    setIsOpen(false);
  };

  const handleSelect = (mapId) => {
    if (editingId) return;
    switchMap(mapId);
    setIsOpen(false);
  };

  if (!activeMap) return null;

  return (
    <div className="project-selector" ref={dropdownRef}>
      <button 
        className={`project-selector-trigger ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="project-selector-label">Proyecto:</span>
        <span className="project-selector-value">{activeMap.name}</span>
        <ChevronDown size={16} className="project-selector-icon" />
      </button>

      {isOpen && (
        <div className="project-selector-dropdown">
          <div className="project-selector-list">
            {Object.values(maps).map(map => (
              <div 
                key={map.id} 
                className={`project-selector-item ${map.id === activeMapId ? 'active' : ''}`}
                onClick={() => handleSelect(map.id)}
              >
                {editingId === map.id ? (
                  <div className="project-selector-edit" onClick={e => e.stopPropagation()}>
                    <input
                      ref={inputRef}
                      type="text"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleSaveEdit(e);
                        if (e.key === 'Escape') handleCancelEdit(e);
                      }}
                      className="project-selector-input"
                    />
                    <button className="project-selector-action save" onClick={handleSaveEdit}>
                      <Check size={14} />
                    </button>
                    <button className="project-selector-action cancel" onClick={handleCancelEdit}>
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="project-selector-name">{map.name}</span>
                    <div className="project-selector-actions">
                      <button 
                        className="project-selector-action" 
                        onClick={(e) => handleStartEdit(e, map)}
                        title="Renombrar"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        className="project-selector-action" 
                        onClick={(e) => handleDuplicate(e, map.id)}
                        title="Duplicar"
                      >
                        <Copy size={14} />
                      </button>
                      {Object.keys(maps).length > 1 && (
                        <button 
                          className="project-selector-action delete" 
                          onClick={(e) => handleDelete(e, map.id)}
                          title="Eliminar"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
          <div className="project-selector-footer">
            <Button 
              variant="ghost" 
              size="sm" 
              className="project-selector-create"
              onClick={handleCreateMap}
            >
              <Plus size={16} />
              Nuevo Proyecto
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
