import { Trash2, Save, Settings, Circle, ToggleLeft, Sliders } from 'lucide-react';
import { useState } from 'react';
import { useFixtures } from '../../context/FixtureContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Slider } from '../ui/Slider';
import { ColorPicker } from '../ui/ColorPicker';
import { AttributeWheel } from '../ui/AttributeWheel';
import { AttributeSwitch } from '../ui/AttributeSwitch';
import './PropertiesPanel.css';

export function PropertiesPanel() {
  const { selectedFixtures, selectedFixture, selectedFixtureIds, updateFixtureValue, removeFixture, saveAsPreset, updateFixture, areSelectedSameType } = useFixtures();

  // Use first selected fixture for attribute detection (works for both single and multi-select)
  const referenceFixture = selectedFixture || (selectedFixtures.length > 0 ? selectedFixtures[0] : null);

  // Detect RGB or single Color attribute
  const hasRed = referenceFixture && (Object.keys(referenceFixture.attributes || {}).includes('Red') || Object.keys(referenceFixture.attributes || {}).includes('R'));
  const hasGreen = referenceFixture && (Object.keys(referenceFixture.attributes || {}).includes('Green') || Object.keys(referenceFixture.attributes || {}).includes('G'));
  const hasBlue = referenceFixture && (Object.keys(referenceFixture.attributes || {}).includes('Blue') || Object.keys(referenceFixture.attributes || {}).includes('B'));
  const hasRgb = hasRed && hasGreen && hasBlue;
  const hasColor = referenceFixture && (Object.keys(referenceFixture.attributes || {}).includes('Color') || Object.keys(referenceFixture.attributes || {}).includes('Colores'));

  const rgbValues = hasRgb ? {
    r: referenceFixture.getValue('Red') ?? referenceFixture.getValue('R') ?? 0,
    g: referenceFixture.getValue('Green') ?? referenceFixture.getValue('G') ?? 0,
    b: referenceFixture.getValue('Blue') ?? referenceFixture.getValue('B') ?? 0
  } : null;

  const hueValue = hasColor ? (referenceFixture.getValue('Color') ?? referenceFixture.getValue('Colores')) : null;

  const handleColorChange = (newVals) => {
    if (!referenceFixture) return;
    
    if (newVals.r !== undefined) {
      // RGB mode - update first selected fixture's ID (will apply to all if multi-select)
      updateFixtureValue(referenceFixture.id, 'Red', newVals.r);
      updateFixtureValue(referenceFixture.id, 'Green', newVals.g);
      updateFixtureValue(referenceFixture.id, 'Blue', newVals.b);
    } else if (newVals.hue !== undefined) {
      // Single hue mode
      if (referenceFixture.attributes.Color) {
        updateFixtureValue(referenceFixture.id, 'Color', newVals.hue);
      } else if (referenceFixture.attributes.Colores) {
        updateFixtureValue(referenceFixture.id, 'Colores', newVals.hue);
      }
    }
  };

  const handleTurnOff = () => {
    if (!referenceFixture) return;
    
    if (hasRgb) {
      updateFixtureValue(referenceFixture.id, 'Red', 0);
      updateFixtureValue(referenceFixture.id, 'Green', 0);
      updateFixtureValue(referenceFixture.id, 'Blue', 0);
    } else if (hasColor) {
      if (referenceFixture.attributes.Color) {
        updateFixtureValue(referenceFixture.id, 'Color', 0);
      } else if (referenceFixture.attributes.Colores) {
        updateFixtureValue(referenceFixture.id, 'Colores', 0);
      }
    }
  };
  const [presetName, setPresetName] = useState('');
  const [showPresetInput, setShowPresetInput] = useState(false);

  const isMultiSelect = selectedFixtureIds.length > 1;
  const canEdit = isMultiSelect ? areSelectedSameType() : !!selectedFixture;

  if (selectedFixtureIds.length === 0) {
    return (
      <div className="properties-panel">
        <div className="properties-empty">
          <p>Selecciona un foco</p>
          <p className="text-muted text-sm">para ver sus propiedades</p>
        </div>
      </div>
    );
  }

  if (isMultiSelect && !areSelectedSameType()) {
    return (
      <div className="properties-panel">
        <div className="properties-empty">
          <p>{selectedFixtureIds.length} focos seleccionados</p>
          <p className="text-muted text-sm">Selecciona focos del mismo tipo para editar</p>
        </div>
      </div>
    );
  }

  const handleSavePreset = () => {
    if (presetName.trim()) {
      saveAsPreset(selectedFixture, presetName.trim());
      setPresetName('');
      setShowPresetInput(false);
      alert('Preset guardado correctamente');
    }
  };

  const handleDelete = () => {
    if (confirm(`¿Eliminar "${selectedFixture.name}"?`)) {
      removeFixture(selectedFixture.id);
    }
  };

  const handleNameChange = (e) => {
    if (!referenceFixture) return;
    updateFixture(referenceFixture.id, { name: e.target.value });
  };

  return (
    <div className="properties-panel bottom-panel">
      <div className="properties-header-row">
        <div className="header-left">
          <Input
            value={referenceFixture?.name || ''}
            onChange={handleNameChange}
            placeholder="Nombre del foco"
            className="compact-input"
          />
          
          {referenceFixture && (
            <div className="fixture-meta-compact">
              <span className="meta-item" title="Canales DMX">
                CH {referenceFixture.channels.start}–{referenceFixture.channels.end}
              </span>
              {referenceFixture.interface && (
                <span className="meta-item meta-interface" title="Interfaz">
                  {referenceFixture.interface}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="header-center">
          {(hasRgb || hasColor) && (
            <div className="color-controls-compact">
              {hasRgb && (
                <ColorPicker r={rgbValues.r} g={rgbValues.g} b={rgbValues.b} onChange={handleColorChange} />
              )}
              {hasColor && (
                <ColorPicker hue={hueValue} onChange={handleColorChange} />
              )}
              <Button variant="ghost" size="sm" onClick={handleTurnOff} title="Apagar">
                Apagar
              </Button>
            </div>
          )}
        </div>

        <div className="header-right">
          {!showPresetInput ? (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowPresetInput(true)}
              title="Guardar como Preset"
            >
              <Save size={16} />
            </Button>
          ) : (
            <div className="preset-form-compact">
              <Input
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder="Nombre preset..."
                autoFocus
                className="compact-input preset-input"
              />
              <Button variant="primary" size="sm" onClick={handleSavePreset}>
                <Save size={14} />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => {
                setShowPresetInput(false);
                setPresetName('');
              }}>
                ✕
              </Button>
            </div>
          )}
          
          <Button variant="danger" size="sm" onClick={handleDelete} title="Eliminar">
            <Trash2 size={16} />
          </Button>
        </div>
      </div>

      <div className="properties-attributes-row">
        {Object.entries(selectedFixture.attributes).map(([attr, channel]) => {
          const vizType = selectedFixture.visualizations?.[attr] || 'slider';
          const value = selectedFixture.getValue(attr);
          
          const handleVizChange = () => {
            const types = ['slider', 'wheel', 'switch'];
            const currentIndex = types.indexOf(vizType);
            const nextType = types[(currentIndex + 1) % types.length];
            updateFixture(selectedFixture.id, {
              visualizations: {
                ...selectedFixture.visualizations,
                [attr]: nextType
              }
            });
          };

          const getVizIcon = () => {
            switch(vizType) {
              case 'wheel': return <Circle size={12} />;
              case 'switch': return <ToggleLeft size={12} />;
              default: return <Sliders size={12} />;
            }
          };

          return (
            <div key={attr} className="attribute-cell-compact">
              <div className="attribute-header-compact">
                <span className="attribute-name">{attr}</span>
                <button 
                  className="attribute-viz-toggle-compact" 
                  onClick={handleVizChange}
                  title="Cambiar visualización"
                >
                  {getVizIcon()}
                </button>
              </div>
              
              <div className="attribute-control-compact">
                {vizType === 'wheel' ? (
                  <AttributeWheel
                    value={value}
                    onChange={(val) => updateFixtureValue(selectedFixture.id, attr, val)}
                    size="small"
                  />
                ) : vizType === 'switch' ? (
                  <AttributeSwitch
                    value={value}
                    onChange={(val) => updateFixtureValue(selectedFixture.id, attr, val)}
                    size="small"
                  />
                ) : (
                  <div className="slider-compact-wrapper">
                    <Slider
                      value={value}
                      onChange={(val) => updateFixtureValue(selectedFixture.id, attr, val)}
                      min={0}
                      max={100}
                      step={1}
                      editable={false}
                      vertical={true}
                      height={80}
                    />
                    <span className="attribute-value-text">{value}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
