import React, { useState, useEffect } from 'react';
import './ForoProfesor.css';

// --- INICIO DE DATOS DE PRUEBA ---
const MOCK_FORUM_TOPICS = [
  // Categoría: inicio
  { id: 'topic001', title: 'Estrategias de Evaluación Innovadoras', category: 'inicio', startedBy: 'Prof. L. Vega', repliesCount: 15, lastActivity: 'Ayer, 10:30 AM' },
  { id: 'topic002', title: 'Uso de IA en la Planificación de Clases', category: 'inicio', startedBy: 'Prof. M. Ríos', repliesCount: 8, lastActivity: 'Hace 2 días' },
  { id: 'topic003', title: 'Debate General: El Futuro de la Educación Presencial', category: 'inicio', startedBy: 'Prof. S. Torres', repliesCount: 25, lastActivity: 'Hoy, 08:00 AM' },

  // Categoría: noticias
  { id: 'news001', title: 'Nuevas Directrices Curriculares para 2025', category: 'noticias', startedBy: 'Dirección Académica', repliesCount: 3, lastActivity: 'Hoy, 11:00 AM' },
  { id: 'news002', title: 'Convocatoria para Proyectos de Innovación Docente', category: 'noticias', startedBy: 'Coordinación TIC', repliesCount: 7, lastActivity: 'Ayer, 04:30 PM' },
  { id: 'news003', title: 'Resultados Encuesta de Satisfacción Docente', category: 'noticias', startedBy: 'Comité de Calidad', repliesCount: 1, lastActivity: 'Hace 3 días' },

  // Categoría: colaboracion
  { id: 'collab001', title: 'Proyecto Colaborativo: Feria de Ciencias Interescolar', category: 'colaboracion', startedBy: 'Prof. A. Costa', repliesCount: 12, lastActivity: 'Ayer, 02:00 PM' },
  { id: 'collab002', title: 'Buscamos Colaboradores para Taller de Robótica Educativa', category: 'colaboracion', startedBy: 'Prof. J. Núñez', repliesCount: 6, lastActivity: 'Hace 4 horas' },
  { id: 'collab003', title: 'Intercambio de Material Didáctico para Asignatura de Historia', category: 'colaboracion', startedBy: 'Prof. M. Ríos', repliesCount: 9, lastActivity: 'Hoy, 09:45 AM' },
  
  // Más temas generales que podrían aparecer en 'inicio' o si no hay filtro
  { id: 'topic004', title: 'Recursos Digitales para Matemáticas', category: 'inicio', startedBy: 'Prof. J. Núñez', repliesCount: 5, lastActivity: 'Semana pasada' },
  { id: 'topic005', title: 'Debate: ¿Deberían las tareas ser opcionales?', category: 'inicio', startedBy: 'Prof. S. Torres', repliesCount: 35, lastActivity: 'Ayer, 03:45 PM' },
];
// --- FIN DE DATOS DE PRUEBA ---

function TeacherForum({ onBack }) { 
  const [searchTerm, setSearchTerm] = useState('');
  const [topics, setTopics] = useState(MOCK_FORUM_TOPICS);
  const [displayedTopics, setDisplayedTopics] = useState([]); // Inicialmente vacío, se llenará en useEffect
  const [activeNav, setActiveNav] = useState('inicio');

  useEffect(() => {
    // Cargar temas iniciales para la sección activa ('inicio' por defecto)
    handleNavClick(activeNav, true); // true para indicar que es la carga inicial
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topics]); // Solo se ejecuta cuando 'topics' cambia (ej. al crear nuevo tema)

  useEffect(() => {
    // Filtrar temas basados en el término de búsqueda y la categoría activa
    let currentCategoryTopics;
    if (activeNav === 'inicio') {
      // Considerar si 'inicio' muestra todos o solo los de categoría 'inicio'
      // Por ahora, filtramos por categoría 'inicio'
      currentCategoryTopics = topics.filter(topic => topic.category === 'inicio');
    } else if (activeNav !== 'administrar foros') {
      currentCategoryTopics = topics.filter(topic => topic.category === activeNav);
    } else {
      currentCategoryTopics = []; // No hay temas para 'administrar foros'
    }

    if (searchTerm.trim() === '') {
      setDisplayedTopics(currentCategoryTopics);
    } else {
      const filteredBySearch = currentCategoryTopics.filter(topic => 
        topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        topic.startedBy.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setDisplayedTopics(filteredBySearch);
    }
  }, [searchTerm, topics, activeNav]);

  const handleNavClick = (section, isInitialLoad = false) => {
    if (!isInitialLoad) { // Solo loguear si es un clic real del usuario
        console.log(`Profesor navegando a sección del foro: ${section}`);
    }
    setActiveNav(section);
    setSearchTerm(''); // Limpiar búsqueda al cambiar de sección

    // Ya no mostramos una alerta para 'administrar foros'.
    // El useEffect y el renderizado condicional se encargarán de mostrar el mensaje apropiado.
    // if (section === 'administrar foros') {
    //     alert(`Funcionalidad "${section}" no implementada.`);
    //     setDisplayedTopics([]); // Limpiar temas para esta sección
    //     return; // Ya no es necesario este return temprano
    // }
    
    // El useEffect [searchTerm, topics, activeNav] se encargará de actualizar displayedTopics.
    // Si section es 'administrar foros', el useEffect ya establece currentCategoryTopics = []
    // y el JSX renderiza el mensaje "La gestión de foros no está implementada en esta vista."
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault(); 
    if (displayedTopics.length === 0 && searchTerm.trim() !== '') {
        alert(`No se encontraron temas para "${searchTerm}" en la sección "${activeNav}".`);
    }
  };

  const handleNewTopic = () => {
    console.log('Profesor intentando crear nuevo tema');
    const newTopicTitle = prompt("Ingrese el título del nuevo tema:");
    if (newTopicTitle && newTopicTitle.trim() !== "") {
      // Determinar la categoría del nuevo tema. Por defecto, 'inicio' o la activa.
      // Para simplificar, lo añadiremos a la categoría activa si no es 'administrar foros'
      const currentCategory = (activeNav !== 'administrar foros' && activeNav !== 'inicio') ? activeNav : 'inicio';

      const newTopic = {
        id: `topic${Date.now()}`,
        title: newTopicTitle.trim(),
        category: currentCategory, // Asignar categoría
        startedBy: "Prof. Actual", 
        repliesCount: 0,
        lastActivity: "Recién creado"
      };
      setTopics(prevTopics => [newTopic, ...prevTopics]);
      alert(`Tema "${newTopic.title}" creado en la sección "${currentCategory}".`);
      // No es necesario llamar a setDisplayedTopics aquí, el useEffect lo hará.
    }
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
          <button onClick={() => handleNavClick('inicio')} className={activeNav === 'inicio' ? 'active' : ''}>Inicio</button>
          <button onClick={() => handleNavClick('noticias')} className={activeNav === 'noticias' ? 'active' : ''}>Noticias</button>
          <button onClick={() => handleNavClick('colaboracion')} className={activeNav === 'colaboracion' ? 'active' : ''}>Colaboración</button>
          {/* <button onClick={() => handleNavClick('administrar foros')} className={activeNav === 'administrar foros' ? 'active' : ''}>Administrar Foros</button> */}
        </nav>
        
        <div className="teacher-forum-search-section">
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '10px', width: '100%', justifyContent: 'center' }}>
            <input 
              type="text" 
              placeholder={`Buscar en "${activeNav}"...`}
              value={searchTerm}
              onChange={handleSearchChange}
              disabled={activeNav === 'administrar foros'} // Deshabilitar búsqueda en admin
            />
            <button type="submit" disabled={activeNav === 'administrar foros'}>Buscar</button>
          </form>
        </div>
        
        <button 
          className="teacher-forum-new-topic-button" 
          onClick={handleNewTopic}
          disabled={activeNav === 'administrar foros'} // Deshabilitar nuevo tema en admin
        >
          Crear Nuevo Tema de Debate
        </button>
        
        <div className="teacher-forum-table">
          <div className="teacher-forum-table-header">
            <span>Debate</span>
            <span>Comenzado por</span>
            <span>Respuestas</span>
            <span>Última Actividad</span> 
          </div>
          {displayedTopics.length > 0 ? (
            displayedTopics.map(topic => (
              <div key={topic.id} className="teacher-forum-table-row">
                <span className="teacher-forum-topic-title">{topic.title}</span>
                <span>{topic.startedBy}</span>
                <span>{topic.repliesCount}</span>
                <span>{topic.lastActivity}</span>
              </div>
            ))
          ) : (
            <div className="teacher-forum-placeholder">
              <p>
                {activeNav === 'administrar foros' 
                  ? 'La gestión de foros no está implementada en esta vista.'
                  : searchTerm.trim() !== '' 
                    ? `No se encontraron temas para "${searchTerm}" en la sección "${activeNav}".` 
                    : `Actualmente no hay debates disponibles en la sección "${activeNav}".`
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TeacherForum;