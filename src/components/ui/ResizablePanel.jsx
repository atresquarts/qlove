import { useState, useRef, useEffect } from 'react';
import './ResizablePanel.css';

export function ResizablePanel({ 
  children, 
  side = 'left', // 'left' or 'right'
  minWidth = 200,
  maxWidth = 600,
  width,
  onResize
}) {
  const [isResizing, setIsResizing] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e) => {
      if (!panelRef.current) return;

      const containerWidth = window.innerWidth;
      let newWidth;

      if (side === 'left') {
        newWidth = e.clientX;
      } else {
        newWidth = containerWidth - e.clientX;
      }

      // Clamp width between min and max
      newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
      
      if (onResize) {
        onResize(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, side, minWidth, maxWidth, onResize]);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsResizing(true);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  return (
    <div 
      ref={panelRef}
      className={`resizable-panel resizable-panel-${side}`}
      style={{ width: `${width}px` }}
    >
      {children}
      <div 
        className={`resize-handle resize-handle-${side} ${isResizing ? 'resizing' : ''}`}
        onMouseDown={handleMouseDown}
      >
        <div className="resize-handle-indicator" />
      </div>
    </div>
  );
}
