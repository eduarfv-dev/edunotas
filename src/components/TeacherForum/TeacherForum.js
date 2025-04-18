import React, { useState } from 'react';
import './TeacherForum.css'; 

function TeacherForum({ onBack }) { 
  const [searchTerm, setSearchTerm] = useState('');

  const handleNavClick = (section) => {
    console.log(`Profesor navegando a sección del foro: ${section}`);
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
    console.log(`Buscando en foros (Profesor): ${searchTerm}`);
    alert(`Búsqueda de "${searchTerm}" no implementada.`);
  };

  const handleNewTopic = () => {
    console.log('Profesor intentando crear nuevo tema');
    alert('Funcionalidad "Crear nuevo tema" no implementada.');
  };

  return (
    <div className="teacher-forum-container"> 
      <button onClick={onBack} className="teacher-forum-back-button">
        <i className='bx bx-arrow-back' style={{ marginRight: '5px' }}></i> 
        Regresar
      </button>

      <div className="teacher-forum-content">
        <h1 className="teacher-forum-title">Foro para Profesores</h1>
        
        <nav className="teacher-forum-navigation">
          <button onClick={() => handleNavClick('inicio')}>Inicio</button>
          <button onClick={() => handleNavClick('noticias')}>Noticias</button>
          <button onClick={() => handleNavClick('colaboracion')}>Colaboración</button>
          <button onClick={() => handleNavClick('administrar foros')}>Administrar Foros</button>
        </nav>
        
        <div className="teacher-forum-search-section">
          <input 
            type="text" 
            placeholder="Buscar temas o debates" 
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <button onClick={handleSearchSubmit}>Buscar</button>
        </div>
        
        <button className="teacher-forum-new-topic-button" onClick={handleNewTopic}>
          Crear Nuevo Tema de Debate
        </button>
        
        <div className="teacher-forum-table">
          <div className="teacher-forum-table-header">
            <span>Debate</span>
            <span>Comenzado por</span>
            <span>Respuestas</span>
          </div>
          <div className="teacher-forum-placeholder">
            <p>Actualmente no hay debates disponibles en el foro de profesores.</p>
            <p>(Aquí se mostraría la lista de temas)</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeacherForum;