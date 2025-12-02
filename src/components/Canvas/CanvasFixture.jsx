import { useState, useRef, useEffect } from 'react';
import { Lightbulb } from 'lucide-react';
import { getFixtureColor, isFixtureOff } from '../../utils/fixture-color';
import './CanvasFixture.css';

export function CanvasFixture({ fixture, isSelected, onSelect, onPositionChange }) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const fixtureRef = useRef(null);

  const handleMouseDown = (e) => {
    e.stopPropagation();
    onSelect(e);
    setIsDragging(true);
    setDragStart({
      x: e.clientX - fixture.position.x,
      y: e.clientY - fixture.position.y
    });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      onPositionChange(newX, newY);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  const fixtureColor = getFixtureColor(fixture);
  const isOff = isFixtureOff(fixture);

  return (
    <div
      ref={fixtureRef}
      className={`canvas-fixture ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''} ${isOff ? 'off' : 'on'}`}
      style={{
        left: `${fixture.position.x}px`,
        top: `${fixture.position.y}px`,
        '--fixture-color': fixtureColor || 'transparent'
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="canvas-fixture-icon">
        <Lightbulb size={24} />
      </div>
      <div className="canvas-fixture-label">
        {fixture.name}
      </div>
    </div>
  );
}
