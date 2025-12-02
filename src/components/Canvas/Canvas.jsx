import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useFixtures } from '../../context/FixtureContext';
import { CanvasFixture } from './CanvasFixture';
import { Maximize2 } from 'lucide-react';
import './Canvas.css';

export const Canvas = forwardRef((props, ref) => {
  const { fixtures, selectedFixtureIds, selectFixture, updateFixturePosition } = useFixtures();
  const canvasRef = useRef(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Handle mouse wheel for zoom
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY * -0.001;
    const newZoom = Math.min(Math.max(0.75, zoom + delta), 1.5);
    setZoom(newZoom);
  };

  // Handle zoom slider change
  const handleZoomChange = (e) => {
    setZoom(parseFloat(e.target.value));
  };

  // Center and fit all fixtures
  const handleCenterView = () => {
    if (fixtures.length === 0) {
      setPan({ x: 0, y: 0 });
      setZoom(1);
      return;
    }

    // Calculate bounding box of all fixtures
    const positions = fixtures.map(f => f.position);
    const minX = Math.min(...positions.map(p => p.x));
    const maxX = Math.max(...positions.map(p => p.x));
    const minY = Math.min(...positions.map(p => p.y));
    const maxY = Math.max(...positions.map(p => p.y));

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    
    const width = maxX - minX;
    const height = maxY - minY;

    const canvas = canvasRef.current;
    if (canvas) {
      // Set zoom to 100% as requested
      const newZoom = 1;
      setZoom(newZoom);
      
      // Center the view on the fixtures
      setPan({
        x: canvas.clientWidth / 2 - centerX * newZoom,
        y: canvas.clientHeight / 2 - centerY * newZoom
      });
    }
  };

  // Center on a specific fixture
  const centerOnFixture = (fixtureId) => {
    const fixture = fixtures.find(f => f.id === fixtureId);
    if (!fixture || !canvasRef.current) return;

    const canvas = canvasRef.current;
    
    // Set zoom to 100% when centering on a fixture
    setZoom(1);
    
    setPan({
      x: canvas.clientWidth / 2 - fixture.position.x * 1, // Use zoom 1
      y: canvas.clientHeight / 2 - fixture.position.y * 1
    });
  };

  // Expose centerOnFixture to parent components
  useImperativeHandle(ref, () => ({
    centerOnFixture
  }));

  // Handle canvas click (deselect)
  const handleCanvasClick = (e) => {
    if (e.target === canvasRef.current) {
      selectFixture(null, false);
    }
  };

  // Handle pan start
  const handleMouseDown = (e) => {
    if (e.target === canvasRef.current || e.target.classList.contains('canvas-content')) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  // Handle pan move
  const handleMouseMove = (e) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    }
  };

  // Handle pan end
  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Add event listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('wheel', handleWheel, { passive: false });
      return () => {
        canvas.removeEventListener('wheel', handleWheel);
      };
    }
  }, [zoom]);

  useEffect(() => {
    if (isPanning) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isPanning, panStart, pan]);

  return (
    <div 
      ref={canvasRef}
      className={`canvas ${isPanning ? 'panning' : ''}`}
      onClick={handleCanvasClick}
      onMouseDown={handleMouseDown}
    >
      <div 
        className="canvas-content"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`
        }}
      >
        {/* Grid background */}
        <div className="canvas-grid" />
        
        {/* Fixtures */}
        {fixtures.map(fixture => (
          <CanvasFixture
            key={fixture.id}
            fixture={fixture}
            isSelected={selectedFixtureIds.includes(fixture.id)}
            onSelect={(e) => {
              const multiSelect = e?.metaKey || e?.ctrlKey;
              selectFixture(fixture.id, multiSelect);
            }}
            onPositionChange={(x, y) => updateFixturePosition(fixture.id, x, y)}
          />
        ))}
      </div>

      {/* Controls */}
      <div className="canvas-controls">
        <div className="canvas-control-group">
          <label className="canvas-control-label">Zoom: {Math.round(zoom * 100)}%</label>
          <input
            type="range"
            min="0.75"
            max="1.5"
            step="0.05"
            value={zoom}
            onChange={handleZoomChange}
            className="canvas-zoom-slider"
          />
        </div>
        <button onClick={handleCenterView} className="canvas-center-btn" title="Centrar vista">
          <Maximize2 size={18} />
        </button>
      </div>
    </div>
  );
});
