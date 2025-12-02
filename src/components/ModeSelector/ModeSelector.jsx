import './ModeSelector.css';

export function ModeSelector({ currentMode, onModeChange }) {
  const modes = [
    { id: 'lights', label: 'Lights' },
    { id: 'cues', label: 'Cues' },
    { id: 'show', label: 'Show' }
  ];

  return (
    <div className="mode-selector">
      <div className="mode-selector-track">
        {modes.map((mode) => (
          <button
            key={mode.id}
            className={`mode-selector-option ${currentMode === mode.id ? 'active' : ''}`}
            onClick={() => onModeChange(mode.id)}
          >
            {mode.label}
          </button>
        ))}
        <div 
          className="mode-selector-indicator"
          style={{
            transform: `translateX(${modes.findIndex(m => m.id === currentMode) * 100}%)`
          }}
        />
      </div>
    </div>
  );
}
