import React, { useState } from 'react';
import './ForoEstudiante.css'; 

function StudentForum({ onBack }) { 
  const [searchTerm, setSearchTerm] = useState('');

  const handleNavClick = (section) => {
    console.log(`Navegando a sección del foro: ${section}`);
    alert(`Funcionalidad "${section}" no implementada.`);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault(); 
    if (!searchTerm.trim()) {
        alert("Por favor ingrese un término de búsqueda.");
        return;
    }
    console.log(`Buscando en foros: ${searchTerm}`);
    alert(`Búsqueda de "${searchTerm}" no implementada.`);
  };

  const handleNewTopic = () => {
    console.log('Intentando crear nuevo tema');
    alert('Funcionalidad "Crear nuevo tema" no implementada.');
  };

  return (
    <div className="forum-view-container"> 
      <button onClick={onBack} className="forum-back-button">
        <i className='bx bx-arrow-back' style={{ marginRight: '5px' }}></i> 
        Regresar
      </button>

      <div className="forum-content">
        <h1 className="forum-title">Foro Estudiantil</h1>
        
        <nav className="forum-navigation">
          <button onClick={() => handleNavClick('inicio')}>Inicio</button>
          <button onClick={() => handleNavClick('noticias')}>Noticias</button>
          <button onClick={() => handleNavClick('biblioteca')}>Biblioteca</button>
          <button onClick={() => handleNavClick('grupos de estudio')}>Grupos de Estudio</button>
        </nav>
        
        <div className="forum-search-section">
          <input 
            type="text" 
            placeholder="Buscar temas o debates" 
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <button onClick={handleSearchSubmit}>Buscar</button>
        </div>
        
        <button className="forum-new-topic-button" onClick={handleNewTopic}>
          Crear Nuevo Tema de Debate
        </button>
        
        <div className="forum-table">
          <div className="forum-table-header">
            <span>Debate</span>
            <span>Comenzado por</span>
            <span>Respuestas</span>
          </div>
          <div className="forum-placeholder">
            <p>Actualmente no hay debates disponibles.</p>
            <p>(Aquí se mostraría la lista de temas)</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentForum;