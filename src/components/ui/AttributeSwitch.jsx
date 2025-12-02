import React from 'react';
import './AttributeSwitch.css';

export function AttributeSwitch({ value, onChange, label }) {
  const isOn = value >= 50;

  const toggle = () => {
    onChange(isOn ? 0 : 100);
  };

  return (
    <div className="attribute-switch-container">
      <div className="attribute-label" title={label}>{label}</div>
      <button 
        className={`attribute-switch ${isOn ? 'on' : 'off'}`}
        onClick={toggle}
        type="button"
      >
        <div className="switch-handle"></div>
      </button>
      <div className="attribute-value">{isOn ? 'ON' : 'OFF'}</div>
    </div>
  );
}
