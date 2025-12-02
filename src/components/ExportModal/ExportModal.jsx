import { useState } from 'react';
import { Copy, Check, Download, FileJson, FileCode } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { generateQLabCodeForMultiple } from '../../utils/qlab-generator';
import { copyToClipboard } from '../../utils/qlab-generator';
import { useFixtures } from '../../context/FixtureContext';
import { useMapManager } from '../../context/MapManagerContext';
import './ExportModal.css';

export function ExportModal({ isOpen, onClose }) {
  const { fixtures, selectedFixture } = useFixtures();
  const { activeMap, exportMap, exportAllMaps } = useMapManager();
  
  const [activeTab, setActiveTab] = useState('qlab'); // 'qlab' or 'json'
  const [exportMode, setExportMode] = useState('all'); // 'all', 'selected', 'map', 'all-maps'
  const [copied, setCopied] = useState(false);

  // QLab Code Logic
  const fixturesToExport = exportMode === 'selected' && selectedFixture 
    ? [selectedFixture] 
    : fixtures;

  const generatedCode = fixturesToExport.length > 0 
    ? generateQLabCodeForMultiple(fixturesToExport)
    : '';

  const handleCopy = async () => {
    const success = await copyToClipboard(generatedCode);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // JSON Export Logic
  const handleDownloadJson = () => {
    let jsonData = '';
    let filename = 'qlove-export.json';

    if (exportMode === 'all-maps') {
      jsonData = exportAllMaps();
      filename = `qlove-backup-${new Date().toISOString().slice(0, 10)}.json`;
    } else {
      jsonData = exportMap(activeMap.id);
      filename = `${activeMap.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    }

    if (!jsonData) return;

    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClose = () => {
    setCopied(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Exportar" size="lg">
      <div className="export-modal">
        <div className="export-tabs">
          <button 
            className={`export-tab ${activeTab === 'qlab' ? 'active' : ''}`}
            onClick={() => setActiveTab('qlab')}
          >
            <FileCode size={16} />
            Código QLab
          </button>
          <button 
            className={`export-tab ${activeTab === 'json' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('json');
              setExportMode('map');
            }}
          >
            <FileJson size={16} />
            Copia de Seguridad (JSON)
          </button>
        </div>

        {activeTab === 'qlab' && (
          <div className="export-content">
            {fixtures.length === 0 ? (
              <div className="export-empty">
                <p>No hay focos para exportar</p>
                <p className="text-muted text-sm">Añade focos al mapa primero</p>
              </div>
            ) : (
              <>
                <div className="export-options">
                  <label className="export-option">
                    <input
                      type="radio"
                      name="qlabExportMode"
                      value="all"
                      checked={exportMode === 'all'}
                      onChange={() => setExportMode('all')}
                    />
                    <span>Todos los focos ({fixtures.length})</span>
                  </label>
                  <label className="export-option">
                    <input
                      type="radio"
                      name="qlabExportMode"
                      value="selected"
                      checked={exportMode === 'selected'}
                      onChange={() => setExportMode('selected')}
                      disabled={!selectedFixture}
                    />
                    <span>Solo el foco seleccionado</span>
                  </label>
                </div>

                <div className="export-code-wrapper">
                  <div className="export-code-header">
                    <span className="export-code-title">Código generado</span>
                    <Button 
                      variant={copied ? 'success' : 'secondary'} 
                      size="sm" 
                      onClick={handleCopy}
                    >
                      {copied ? (
                        <>
                          <Check size={16} />
                          Copiado
                        </>
                      ) : (
                        <>
                          <Copy size={16} />
                          Copiar
                        </>
                      )}
                    </Button>
                  </div>
                  <pre className="export-code">
                    <code>{generatedCode}</code>
                  </pre>
                </div>

                <div className="export-info">
                  <p className="text-sm text-muted">
                    💡 Copia este código y pégalo en QLab para configurar tus focos
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'json' && (
          <div className="export-content">
            <div className="export-options">
              <label className="export-option">
                <input
                  type="radio"
                  name="jsonExportMode"
                  value="map"
                  checked={exportMode === 'map'}
                  onChange={() => setExportMode('map')}
                />
                <span>Mapa actual ({activeMap?.name})</span>
              </label>
              <label className="export-option">
                <input
                  type="radio"
                  name="jsonExportMode"
                  value="all-maps"
                  checked={exportMode === 'all-maps'}
                  onChange={() => setExportMode('all-maps')}
                />
                <span>Todos los mapas (Copia completa)</span>
              </label>
            </div>

            <div className="export-actions">
              <Button variant="primary" onClick={handleDownloadJson} className="w-full">
                <Download size={18} />
                Descargar JSON
              </Button>
            </div>

            <div className="export-info">
              <p className="text-sm text-muted">
                Este archivo JSON contiene toda la configuración y puede ser importado más tarde para restaurar tus mapas.
              </p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
