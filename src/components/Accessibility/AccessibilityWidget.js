import React from 'react';
import { useAccessibility } from './AccessibilityContext'; // Ajusta la ruta si es necesario
import './AccessibilityWidget.css';

const AccessibilityWidget = ({ onClose }) => {
  const {
    fontSize,
    setFontSize,
    highContrast,
    setHighContrast,
    dyslexicFont,
    setDyslexicFont,
    highlightLinks,
    setHighlightLinks,
  } = useAccessibility();

  const toggleFontSize = () => {
    setFontSize(fontSize === 'normal' ? 'large' : 'normal');
  };

  return (
    <div className="accessibility-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h2 className="accessibility-title" style={{ margin: 0 }}>Opciones de Accesibilidad</h2>
        <button 
          onClick={onClose} 
          style={{ background: 'transparent', border: '1px solid #ccc', borderRadius:'4px', fontSize: '1em', cursor: 'pointer', color: '#333', padding: '5px 10px' }} 
          title="Cerrar opciones de accesibilidad"
        >
          Cerrar {/* O usa un ícono como × */}
        </button>
      </div>
      <div className="accessibility-widget">
        <button
          onClick={toggleFontSize}
          aria-pressed={fontSize === 'large'}
          className={fontSize === 'large' ? 'active' : ''}
        >
          {fontSize === 'normal' ? 'Aumentar Tamaño de Fuente' : 'Restaurar Tamaño de Fuente'}
        </button>
        <button
          onClick={() => setHighContrast(!highContrast)}
          aria-pressed={highContrast}
          className={highContrast ? 'active' : ''}
        >
          {highContrast ? 'Desactivar Alto Contraste' : 'Activar Alto Contraste'}
        </button>
        <button
          onClick={() => setDyslexicFont(!dyslexicFont)}
          aria-pressed={dyslexicFont}
          className={dyslexicFont ? 'active' : ''}
        >
          {dyslexicFont ? 'Desactivar Fuente para Disléxicos' : 'Activar Fuente para Disléxicos'}
        </button>
        <button
          onClick={() => setHighlightLinks(!highlightLinks)}
          aria-pressed={highlightLinks}
          className={highlightLinks ? 'active' : ''}
        >
          {highlightLinks ? 'Desactivar Resaltado de Enlaces' : 'Activar Resaltado de Enlaces'}
        </button>
      </div>
    </div>
  );
};

export default AccessibilityWidget;