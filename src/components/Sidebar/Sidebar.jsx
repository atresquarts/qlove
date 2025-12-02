import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Plus, Trash2, Package, Copy, ClipboardPaste } from 'lucide-react';
import { useFixtures } from '../../context/FixtureContext';
import { Button } from '../ui/Button';
import { ContextMenu } from '../ui/ContextMenu';
import './Sidebar.css';

export function Sidebar({ onAddFixtureClick, canvasRef }) {
  const { fixtures, selectedFixtureIds, selectFixture, removeFixture, presets, createFromPreset, deletePreset, copyFixtureProperties, pasteFixtureProperties, clipboard } = useFixtures();
  const [activeTab, setActiveTab] = useState('fixtures');
  const [contextMenu, setContextMenu] = useState(null);

  const handleContextMenu = (e, fixtureId) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      fixtureId
    });
  };

  const handleDeleteFixture = (fixtureId, e) => {
    e.stopPropagation();
    if (confirm('¿Eliminar este foco?')) {
      removeFixture(fixtureId);
    }
  };

  const handleDeletePreset = (presetId, e) => {
    e.stopPropagation();
    if (confirm('¿Eliminar este preset?')) {
      deletePreset(presetId);
    }
  };

  const [presetModal, setPresetModal] = useState(null);
  const [channelStart, setChannelStart] = useState('');
  const [channelEnd, setChannelEnd] = useState('');
  const [fixtureName, setFixtureName] = useState('');

  const openPresetModal = (preset) => {
    setPresetModal(preset);
    setFixtureName(preset.name);
    setChannelStart('');
    
    // Calculate channel count from preset attributes
    const attrCount = Object.keys(preset.fixtureData.attributes).length;
    // We don't set end yet, wait for start input
    setChannelEnd('');
  };

  const handleStartChange = (e) => {
    const val = e.target.value;
    setChannelStart(val);
    
    if (val && presetModal) {
      const start = parseInt(val, 10);
      if (!isNaN(start)) {
        // Calculate end based on attribute count
        // Note: attributes might not map 1:1 if some share channels, but usually 1 attr = 1 channel in this context
        // Or we use the original channel count: (max - min + 1)
        const originalChannels = Object.values(presetModal.fixtureData.attributes);
        const count = originalChannels.length > 0 
          ? (Math.max(...originalChannels) - Math.min(...originalChannels) + 1)
          : 1;
          
        setChannelEnd(start + count - 1);
      }
    }
  };

  const applyPreset = () => {
    if (!presetModal) return;
    const start = parseInt(channelStart, 10);
    const end = parseInt(channelEnd, 10);
    
    if (isNaN(start) || isNaN(end) || start > end) {
      alert('Rango de canales inválido');
      return;
    }
    
    createFromPreset(presetModal, { 
      channelRange: { start, end },
      name: fixtureName
    });
    setPresetModal(null);
  };

  const handleUsePreset = (preset) => {
    openPresetModal(preset);
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <Button variant="primary" size="sm" onClick={onAddFixtureClick} className="sidebar-add-btn">
          <Plus size={18} />
          Añadir Foco
        </Button>
      </div>

      <div className="sidebar-tabs">
        <button 
          className={`sidebar-tab ${activeTab === 'fixtures' ? 'active' : ''}`}
          onClick={() => setActiveTab('fixtures')}
        >
          Focos ({fixtures.length})
        </button>
        <button 
          className={`sidebar-tab ${activeTab === 'presets' ? 'active' : ''}`}
          onClick={() => setActiveTab('presets')}
        >
          <Package size={16} />
          Presets ({presets.length})
        </button>
      </div>

      <div className="sidebar-content">
        {activeTab === 'fixtures' && (
          <div className="sidebar-list">
            {fixtures.length === 0 ? (
              <div className="sidebar-empty">
                <p>No hay focos en el mapa</p>
                <p className="text-muted text-sm">Añade un foco para empezar</p>
              </div>
            ) : (
              fixtures.map(fixture => (
                <div
                  key={fixture.id}
                  className={`sidebar-item ${selectedFixtureIds.includes(fixture.id) ? 'selected' : ''}`}
                  onClick={(e) => {
                    const multiSelect = e.metaKey || e.ctrlKey;
                    selectFixture(fixture.id, multiSelect);
                    if (!multiSelect) {
                      canvasRef?.current?.centerOnFixture(fixture.id);
                    }
                  }}
                  onContextMenu={(e) => handleContextMenu(e, fixture.id)}
                >
                  <div className="sidebar-item-icon">💡</div>
                  <div className="sidebar-item-info">
                    <div className="sidebar-item-name">{fixture.name}</div>
                    <div className="sidebar-item-meta">
                      Canales {fixture.channels.start}–{fixture.channels.end}
                    </div>
                  </div>
                  <button
                    className="sidebar-item-delete"
                    onClick={(e) => handleDeleteFixture(fixture.id, e)}
                    title="Eliminar"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'presets' && (
          <div className="sidebar-list">
            {presets.length === 0 ? (
              <div className="sidebar-empty">
                <p>No hay presets guardados</p>
                <p className="text-muted text-sm">Guarda un foco como preset</p>
              </div>
            ) : (
              <>
                {presets.map(preset => (
                  <div
                    key={preset.id}
                    className="sidebar-item"
                    onClick={() => handleUsePreset(preset)}
                  >
                    <div className="sidebar-item-icon">📦</div>
                    <div className="sidebar-item-info">
                      <div className="sidebar-item-name">{preset.name}</div>
                      <div className="sidebar-item-meta">
                        {Object.keys(preset.fixtureData.attributes).length} atributos
                      </div>
                    </div>
                    <button
                      className="sidebar-item-delete"
                      onClick={(e) => handleDeletePreset(preset.id, e)}
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                {presetModal && (
                  <Modal
                    isOpen={true}
                    onClose={() => setPresetModal(null)}
                    title="Nuevo Foco desde Preset"
                    size="sm"
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <label>
                        Nombre:
                        <input
                          type="text"
                          value={fixtureName}
                          onChange={e => setFixtureName(e.target.value)}
                          style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                        />
                      </label>
                      
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <label style={{ flex: 1 }}>
                          Canal Inicio:
                          <input
                            type="number"
                            value={channelStart}
                            onChange={handleStartChange}
                            min="1"
                            style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                          />
                        </label>
                        <label style={{ flex: 1 }}>
                          Canal Fin:
                          <input
                            type="number"
                            value={channelEnd}
                            onChange={e => setChannelEnd(e.target.value)}
                            min="1"
                            style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                          />
                        </label>
                      </div>
                      
                      <div className="text-sm text-muted">
                        Se crearán {Object.keys(presetModal.fixtureData.attributes).length} atributos mapeados secuencialmente.
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                        <Button variant="ghost" onClick={() => setPresetModal(null)}>Cancelar</Button>
                        <Button variant="primary" onClick={applyPreset}>Crear Foco</Button>
                      </div>
                    </div>
                  </Modal>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          options={[
            {
              label: 'Copiar Propiedades',
              icon: <Copy size={16} />,
              onClick: () => copyFixtureProperties(contextMenu.fixtureId)
            },
            {
              label: 'Pegar Propiedades',
              icon: <ClipboardPaste size={16} />,
              disabled: !clipboard,
              onClick: () => pasteFixtureProperties(contextMenu.fixtureId)
            },
            { separator: true },
            {
              label: 'Eliminar',
              icon: <Trash2 size={16} />,
              danger: true,
              onClick: () => removeFixture(contextMenu.fixtureId)
            }
          ]}
        />
      )}
    </div>
  );
}
