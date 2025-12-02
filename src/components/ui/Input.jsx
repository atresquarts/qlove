import './Input.css';

export function Input({ 
  label, 
  error, 
  className = '', 
  ...props 
}) {
  return (
    <div className={`input-wrapper ${className}`}>
      {label && <label className="input-label">{label}</label>}
      <input className="input" {...props} />
      {error && <span className="input-error">{error}</span>}
    </div>
  );
}
