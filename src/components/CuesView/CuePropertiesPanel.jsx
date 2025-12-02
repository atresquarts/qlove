import { useState, useEffect, useRef } from 'react';
import { Play, Square, Save } from 'lucide-react';
import { useFixtures } from '../../context/FixtureContext';
import { soundStorage } from '../../utils/sound-storage';

export function CuePropertiesPanel({ cue, onUpdateCue }) {
  const { fixtures, addToast } = useFixtures();
  const [audio, setAudio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingSound, setIsLoadingSound] = useState(false);

  useEffect(() => {
    // Cleanup audio on unmount or cue change
    return () => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, [audio]);

  // Load sound from storage if needed
  useEffect(() => {
    const loadSound = async () => {
      if (cue?.type === 'sound' && cue.soundFile && !cue.soundFile.url) {
        setIsLoadingSound(true);
        try {
          const file = await soundStorage.getSound(cue.id);
          if (file) {
            const url = URL.createObjectURL(file);
            // We update the local cue object in parent via onUpdateCue to attach the URL temporarily?
            // Or just keep it local? Better to keep it local or update parent but avoid circular saves.
            // Let's just use it locally for playback.
            // Actually, handlePlay needs it.
          }
        } catch (err) {
          console.error("Error loading sound:", err);
        } finally {
          setIsLoadingSound(false);
        }
      }
    };
    
    loadSound();
  }, [cue?.id]);

  if (!cue) {
    return (
      <div className="properties-empty">
        <p>Select a cue to view properties</p>
      </div>
    );
  }

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        // Save to IndexedDB
        await soundStorage.saveSound(cue.id, file);
        
        // Update cue with metadata (no URL to avoid large JSON)
        onUpdateCue(cue.id, { 
          soundFile: { 
            name: file.name, 
            type: file.type,
            size: file.size,
            lastModified: file.lastModified
          } 
        });

        // Reset audio
        if (audio) {
          audio.pause();
        }
        setAudio(null);
        setIsPlaying(false);
        addToast('Audio guardado', 'success');
      } catch (err) {
        console.error("Error saving sound:", err);
        addToast('Error al guardar audio', 'error');
      }
    }
  };

  const handlePlay = async () => {
    if (!cue.soundFile) return;

    if (!audio) {
      try {
        // Get from DB
        const file = await soundStorage.getSound(cue.id);
        if (!file) {
          addToast('Archivo de audio no encontrado', 'error');
          return;
        }
        
        const url = URL.createObjectURL(file);
        const newAudio = new Audio(url);
        newAudio.onended = () => setIsPlaying(false);
        setAudio(newAudio);
        newAudio.play();
        setIsPlaying(true);
      } catch (err) {
        console.error("Error playing sound:", err);
        addToast('Error al reproducir audio', 'error');
      }
    } else {
      audio.play();
      setIsPlaying(true);
    }
  };

  const handleStop = () => {
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const handleCaptureDmx = () => {
    // Capture current state of all fixtures
    const currentDmxState = fixtures.map(f => ({
      id: f.id,
      values: { ...f.values }
    }));
    
    onUpdateCue(cue.id, { dmxState: currentDmxState });
    addToast(`Estado capturado: ${fixtures.length} focos`, 'success');
  };

  return (
    <div className="cue-properties">
      <div className="properties-header">
        <h3>{cue.type === 'sound' ? 'Propiedades de Sonido' : 'Propiedades de Luz'}</h3>
      </div>
      
      <div className="properties-content">
        {cue.type === 'sound' && (
          <div className="sound-properties">
            <div className="form-group">
              <label>Archivo de Sonido</label>
              <div className="file-input-wrapper">
                <input type="file" accept="audio/*" onChange={handleFileChange} />
                <span className="file-name">{cue.soundFile ? cue.soundFile.name : 'Ningún archivo seleccionado'}</span>
              </div>
            </div>
            
            <div className="sound-controls">
              <button 
                className={`control-btn ${isPlaying ? 'active' : ''}`} 
                onClick={handlePlay}
                disabled={!cue.soundFile || isLoadingSound}
              >
                <Play size={20} /> {isPlaying ? 'Reproduciendo' : 'Reproducir'}
              </button>
              <button 
                className="control-btn" 
                onClick={handleStop}
                disabled={!cue.soundFile || isLoadingSound}
              >
                <Square size={20} /> Parar
              </button>
            </div>
          </div>
        )}

        {cue.type === 'light' && (
          <div className="light-properties">
            <div className="dmx-state-info">
              <div className="form-group">
                <label>Estado DMX Capturado (JSON)</label>
                <textarea 
                  className="dmx-state-textarea"
                  readOnly
                  value={cue.dmxState ? JSON.stringify(cue.dmxState, null, 2) : 'No hay estado guardado'}
                  style={{ 
                    width: '100%', 
                    height: '200px', 
                    fontFamily: 'monospace', 
                    fontSize: '0.8rem',
                    backgroundColor: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '4px',
                    padding: '8px',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>
            
            <button className="capture-btn" onClick={handleCaptureDmx} style={{ marginTop: '10px' }}>
              <Save size={16} /> Capturar Estado Actual
            </button>
            
            <p className="help-text">
              Esto guardará el estado actual de la vista "Lights" en esta cue.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
