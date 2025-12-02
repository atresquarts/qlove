import { useState } from 'react';
import { GripVertical, MoreVertical, Lightbulb, Volume2, Play, Trash2, Copy, Square } from 'lucide-react';
import { ContextMenu } from '../ui/ContextMenu';

export function CueList({ cues, selectedCueId, activeCueId, onSelectCue, onReorderCues, onUpdateCue, onDeleteCue, onDuplicateCue, onExecuteCue }) {
  const [draggedItemIndex, setDraggedItemIndex] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);

  const handleDragStart = (e, index) => {
    setDraggedItemIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // Transparent drag image or custom
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    if (draggedItemIndex === null) return;

    const newCues = [...cues];
    const [draggedItem] = newCues.splice(draggedItemIndex, 1);
    newCues.splice(index, 0, draggedItem);

    onReorderCues(newCues);
    setDraggedItemIndex(null);
  };

  const handleContextMenu = (e, cueId) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, cueId });
  };

  const handleActionClick = (e, cueId) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setContextMenu({ x: rect.left, y: rect.bottom, cueId });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const getContextMenuOptions = (cueId) => [
    {
      label: 'Duplicate',
      icon: <Copy size={14} />,
      onClick: () => onDuplicateCue(cueId)
    },
    {
      label: 'Delete',
      icon: <Trash2 size={14} />,
      danger: true,
      onClick: () => onDeleteCue(cueId)
    }
  ];

  return (
    <div className="cue-list-container">
      <div className="cue-list-header">
        <div className="col-grip"></div>
        <div className="col-number">#</div>
        <div className="col-play-header"></div>
        <div className="col-type"></div>
        <div className="col-color">Color</div>
        <div className="col-name">Name</div>
        <div className="col-action">Action</div>
      </div>
      <div className="cue-list-body">
        {cues.map((cue, index) => (
          <div 
            key={cue.id}
            className={`cue-row ${selectedCueId === cue.id ? 'selected' : ''} ${activeCueId === cue.id ? 'active-cue' : ''}`}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            onClick={() => onSelectCue(cue.id)}
            onContextMenu={(e) => handleContextMenu(e, cue.id)}
          >
            <div className="col-grip">
              <GripVertical size={14} className="drag-handle" />
            </div>
            <div className="col-number">{cue.number}</div>
            <div className="col-play-btn">
              <button 
                className={`mini-play-btn ${activeCueId === cue.id ? 'playing' : ''}`}
                onClick={(e) => { e.stopPropagation(); onExecuteCue(cue.id); }}
                title="Play Cue"
              >
                {activeCueId === cue.id ? <Square size={10} fill="currentColor" /> : <Play size={10} fill="currentColor" />}
              </button>
            </div>
            <div className="col-type">
              {cue.type === 'light' ? (
                <Lightbulb size={16} className="icon-light" />
              ) : (
                <Volume2 size={16} className="icon-sound" />
              )}
            </div>
            <div className="col-color">
              <input 
                type="color" 
                value={cue.color} 
                onChange={(e) => onUpdateCue(cue.id, { color: e.target.value })}
                onClick={(e) => e.stopPropagation()} 
              />
            </div>
            <div className="col-name">
              <input 
                type="text" 
                value={cue.name}
                onChange={(e) => onUpdateCue(cue.id, { name: e.target.value })}
                onClick={(e) => e.stopPropagation()} 
                className="cue-name-input"
              />
            </div>
            <div className="col-action">
              <button 
                className="action-btn"
                onClick={(e) => handleActionClick(e, cue.id)}
              >
                <MoreVertical size={14} />
              </button>
            </div>
          </div>
        ))}
        {cues.length === 0 && (
          <div className="empty-state">
            No cues yet. Add a Sound or Light cue to get started.
          </div>
        )}
      </div>

      {contextMenu && (
        <ContextMenu 
          x={contextMenu.x} 
          y={contextMenu.y} 
          options={getContextMenuOptions(contextMenu.cueId)} 
          onClose={handleCloseContextMenu} 
        />
      )}
    </div>
  );
}
