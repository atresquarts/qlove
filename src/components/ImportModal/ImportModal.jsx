import { useState, useRef } from 'react';
import { Upload, FileText, FileJson, AlertCircle } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { parseQLabOCR, validateFixtureData } from '../../utils/qlab-parser';
import { useFixtures } from '../../context/FixtureContext';
import { useMapManager } from '../../context/MapManagerContext';
import './ImportModal.css';

export function ImportModal({ isOpen, onClose }) {
  const { addFixture } = useFixtures();
  const { importMaps } = useMapManager();
  
  const [activeTab, setActiveTab] = useState('ocr'); // 'ocr' or 'json'
  const [ocrText, setOcrText] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const fileInputRef = useRef(null);

  // OCR Logic
  const handleParse = () => {
    try {
      setError('');
      const data = parseQLabOCR(ocrText);
      const validation = validateFixtureData(data);
      
      if (!validation.valid) {
        setError(validation.errors.join(', '));
        return;
      }

      setParsedData(data);
    } catch (err) {
      setError(err.message);
      setParsedData(null);
    }
  };

  const handleImportOCR = () => {
    if (parsedData) {
      addFixture(parsedData);
      handleClose();
    }
  };

  // JSON Import Logic
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target.result;
        importMaps(content, true); // true = replace active map if single map import
        setSuccessMsg('Importación completada correctamente');
        setTimeout(() => {
          handleClose();
        }, 1500);
      } catch (err) {
        setError(err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleClose = () => {
    setOcrText('');
    setParsedData(null);
    setError('');
    setSuccessMsg('');
    setActiveTab('ocr');
    if (fileInputRef.current) fileInputRef.current.value = '';
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Importar" size="lg">
      <div className="import-modal">
        <div className="import-tabs">
          <button 
            className={`import-tab ${activeTab === 'ocr' ? 'active' : ''}`}
            onClick={() => setActiveTab('ocr')}
          >
            <FileText size={16} />
            Texto OCR QLab
          </button>
          <button 
            className={`import-tab ${activeTab === 'json' ? 'active' : ''}`}
            onClick={() => setActiveTab('json')}
          >
            <FileJson size={16} />
            Copia de Seguridad (JSON)
          </button>
        </div>

        {activeTab === 'ocr' && (
          <>
            <div className="import-section">
              <label className="import-label">
                Pega el texto OCR de QLab
              </label>
              <textarea
                className="import-textarea"
                value={ocrText}
                onChange={(e) => setOcrText(e.target.value)}
                placeholder={`v BICHITO 2
90 - 100
USB - ENTTEC DMX USB PRO - EN346284, Universe 0
Rotación
90
...`}
                rows={12}
              />
              {error && <div className="import-error">{error}</div>}
            </div>

            {parsedData && (
              <div className="import-preview">
                <h4 className="import-preview-title">Vista Previa</h4>
                <div className="import-preview-content">
                  <div className="import-preview-item">
                    <strong>Nombre:</strong> {parsedData.name}
                  </div>
                  <div className="import-preview-item">
                    <strong>Canales:</strong> {parsedData.channels.start} – {parsedData.channels.end}
                  </div>
                  {parsedData.interface && (
                    <div className="import-preview-item">
                      <strong>Interfaz:</strong> {parsedData.interface}
                    </div>
                  )}
                  <div className="import-preview-item">
                    <strong>Atributos:</strong> {Object.keys(parsedData.attributes).length}
                  </div>
                </div>
              </div>
            )}

            <div className="import-actions">
              {!parsedData ? (
                <>
                  <Button variant="primary" onClick={handleParse} disabled={!ocrText.trim()}>
                    Analizar Texto
                  </Button>
                  <Button variant="ghost" onClick={handleClose}>
                    Cancelar
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="success" onClick={handleImportOCR}>
                    Importar Foco
                  </Button>
                  <Button variant="ghost" onClick={() => setParsedData(null)}>
                    Editar
                  </Button>
                </>
              )}
            </div>
          </>
        )}

        {activeTab === 'json' && (
          <div className="import-content">
            <div className="import-upload-area" onClick={() => fileInputRef.current?.click()}>
              <Upload size={48} className="import-upload-icon" />
              <h3>Sube tu archivo JSON</h3>
              <p className="text-muted">Haz clic para seleccionar un archivo de copia de seguridad</p>
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json"
                style={{ display: 'none' }}
              />
            </div>

            {error && (
              <div className="import-error-box">
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="import-success-box">
                <Check size={20} />
                <span>{successMsg}</span>
              </div>
            )}

            <div className="import-info">
              <p className="text-sm text-muted">
                Puedes importar un solo mapa (reemplazará al actual) o una copia completa de todos los mapas.
              </p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
