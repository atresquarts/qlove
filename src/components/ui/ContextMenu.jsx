import { useEffect, useRef } from 'react';
import './ContextMenu.css';

export function ContextMenu({ x, y, options, onClose }) {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div 
      ref={menuRef}
      className="context-menu"
      style={{ top: y, left: x }}
    >
      {options.map((option, index) => (
        <div 
          key={index} 
          className={`context-menu-item ${option.disabled ? 'disabled' : ''} ${option.danger ? 'danger' : ''} ${option.separator ? 'separator' : ''}`}
          onClick={() => {
            if (!option.disabled && !option.separator) {
              option.onClick();
              onClose();
            }
          }}
        >
          {!option.separator && (
            <>
              {option.icon && <span className="context-menu-icon">{option.icon}</span>}
              {option.label}
            </>
          )}
        </div>
      ))}
    </div>
  );
}
