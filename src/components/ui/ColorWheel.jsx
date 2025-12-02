import React, { useRef, useEffect, useState } from 'react';
import './ColorWheel.css';

export function ColorWheel({ hue, saturation = 100, onChange, size = 200 }) {
  const canvasRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const radius = size / 2;
    const centerX = radius;
    const centerY = radius;

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // Draw Hue Wheel
    for (let i = 0; i < 360; i++) {
      const startAngle = (i - 90) * Math.PI / 180;
      const endAngle = (i + 1 - 90) * Math.PI / 180;
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      
      ctx.fillStyle = `hsl(${i}, 100%, 50%)`;
      ctx.fill();
    }

    // Draw Saturation Gradient (White center to Transparent)
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fill();

    // Draw Selection Marker
    if (hue !== undefined) {
      const angleRad = (hue - 90) * Math.PI / 180;
      const dist = (saturation / 100) * radius;
      const markerX = centerX + Math.cos(angleRad) * dist;
      const markerY = centerY + Math.sin(angleRad) * dist;

      ctx.beginPath();
      ctx.arc(markerX, markerY, 6, 0, 2 * Math.PI);
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(markerX, markerY, 5, 0, 2 * Math.PI);
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }, [hue, saturation, size]);

  const handleInteraction = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const radius = size / 2;
    const centerX = radius;
    const centerY = radius;
    
    const dx = x - centerX;
    const dy = y - centerY;
    
    let angle = Math.atan2(dy, dx) * 180 / Math.PI + 90;
    if (angle < 0) angle += 360;
    
    const dist = Math.sqrt(dx * dx + dy * dy);
    const sat = Math.min(100, (dist / radius) * 100);
    
    onChange({ hue: Math.round(angle), saturation: Math.round(sat) });
  };

  const onMouseDown = (e) => {
    setIsDragging(true);
    handleInteraction(e);
  };

  const onMouseMove = (e) => {
    if (isDragging) {
      handleInteraction(e);
    }
  };

  const onMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDragging]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className="color-wheel"
      onMouseDown={onMouseDown}
    />
  );
}
