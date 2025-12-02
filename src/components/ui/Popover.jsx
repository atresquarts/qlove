import React, { useEffect, useRef } from 'react';
import './Popover.css';

export function Popover({ 
  isOpen, 
  onClose, 
  children, 
  triggerRef, 
  position = 'bottom-start',
  className = ''
}) {
  const popoverRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        popoverRef.current && 
        !popoverRef.current.contains(event.target) &&
        (!triggerRef?.current || !triggerRef.current.contains(event.target))
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, triggerRef]);

  if (!isOpen) return null;

  // Simple positioning logic
  const style = {};
  if (triggerRef?.current) {
    const rect = triggerRef.current.getBoundingClientRect();
    if (position === 'bottom-start') {
      style.top = rect.bottom + 8;
      style.left = rect.left;
    } else if (position === 'bottom-end') {
      style.top = rect.bottom + 8;
      style.right = window.innerWidth - rect.right;
    } else if (position === 'top-start') {
      style.bottom = window.innerHeight - rect.top + 8;
      style.left = rect.left;
    }
  }

  return (
    <div 
      className={`popover ${className}`} 
      ref={popoverRef}
      style={style}
    >
      {children}
    </div>
  );
}
