import React, { useState, useEffect } from 'react';
import './ForoEstudiante.css'; // Asegúrate que la ruta al CSS es correcta

// --- DATOS DE PRUEBA PARA EL FORO DE ESTUDIANTES ---
const MOCK_STUDENT_FORUM_TOPICS = [
  // Categoría: general
  { id: 'st_topic001', title: 'Dudas sobre la Tarea de Cálculo', category: 'general', startedBy: 'Ana Pérez (Estudiante)', repliesCount: 7, lastActivity: 'Hoy, 02:30 PM' },
  { id: 'st_topic002', title: 'Recursos para el Examen de Programación', category: 'general', startedBy: 'Carlos Ruiz (Estudiante)', repliesCount: 12, lastActivity: 'Ayer, 11:00 AM' },
  { id: 'st_topic003', title: 'Aclaración del Prof. López sobre Proyecto Final', category: 'general', startedBy: 'Prof. López', repliesCount: 3, lastActivity: 'Hace 2 días' },

  // Categoría: anuncios
  { id: 'st_anuncio001', title: 'Cambio de Aula para Clase de Historia', category: 'anuncios', startedBy: 'Secretaría Académica', repliesCount: 0, lastActivity: 'Hoy, 09:00 AM' },
  { id: 'st_anuncio002', title: 'Recordatorio: Entrega de Ensayo Próximo Lunes', category: 'anuncios', startedBy: 'Prof. Vega', repliesCount: 1, lastActivity: 'Ayer, 05:00 PM' },

  // Categoría: grupos_estudio
  { id: 'st_grupo001', title: 'Grupo de Estudio para Física Moderna', category: 'grupos_estudio', startedBy: 'Laura Gómez (Estudiante)', repliesCount: 5, lastActivity: 'Hace 3 horas' },
  { id: 'st_grupo002', title: '¿Alguien para repasar Álgebra Lineal los viernes?', category: 'grupos_estudio', startedBy: 'Juan Díaz (Estudiante)', repliesCount: 2, lastActivity: 'Hoy, 10:15 AM' },
];
// --- FIN DE DATOS DE PRUEBA ---

function StudentForum({ onBack }) { // Cambiado el nombre del componente a StudentForum
  const [searchTerm, setSearchTerm] = useState('');
  const [topics, setTopics] = useState(MOCK_STUDENT_FORUM_TOPICS);
  const [displayedTopics, setDisplayedTopics] = useState([]);
  const [activeNav, setActiveNav] = useState('general'); // Sección inicial por defecto

  useEffect(() => {
    handleNavClick(activeNav, true); // Carga inicial
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topics]);

  useEffect(() => {
    let currentCategoryTopics;
    if (activeNav) {
      currentCategoryTopics = topics.filter(topic => topic.category === activeNav);
    } else {
      currentCategoryTopics = topics; // Si no hay nav activa, mostrar todos (o definir un comportamiento)
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
    if (!isInitialLoad) {
      console.log(`Estudiante navegando a sección del foro: ${section}`);
    }
    setActiveNav(section);
    setSearchTerm('');
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
    console.log('Estudiante intentando crear nuevo tema');
    const newTopicTitle = prompt("Ingrese el título de su nuevo tema/pregunta:");
    if (newTopicTitle && newTopicTitle.trim() !== "") {
      const currentCategory = activeNav || 'general'; // Usar categoría activa o 'general' por defecto

      const newTopic = {
        id: `st_topic${Date.now()}`,
        title: newTopicTitle.trim(),
        category: currentCategory,
        startedBy: "Estudiante Actual", // Debería ser el nombre del estudiante logueado
        repliesCount: 0,
        lastActivity: "Recién creado"
      };
      setTopics(prevTopics => [newTopic, ...prevTopics]);
      alert(`Tema "${newTopic.title}" creado en la sección "${currentCategory}".`);
    }
  };

  return (
    <div className="forum-view-container"> {/* Usando clases de ForoEstudiante.css */}
      <button onClick={onBack} className="forum-back-button">
        <i className='bx bx-arrow-back' style={{ marginRight: '5px' }}></i>
        Regresar
      </button>

      <div className="forum-content">
        <h1 className="forum-title">Foro Estudiantil</h1>

        <nav className="forum-navigation">
          <button onClick={() => handleNavClick('general')} className={activeNav === 'general' ? 'active' : ''}>General</button>
          <button onClick={() => handleNavClick('anuncios')} className={activeNav === 'anuncios' ? 'active' : ''}>Anuncios</button>
          <button onClick={() => handleNavClick('grupos_estudio')} className={activeNav === 'grupos_estudio' ? 'active' : ''}>Grupos de Estudio</button>
          {/* Puedes añadir más categorías aquí si es necesario */}
        </nav>

        <div className="forum-search-section">
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '10px', width: '100%', justifyContent: 'center' }}>
            <input
              type="text"
              placeholder={`Buscar en "${activeNav}"...`}
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <button type="submit">Buscar</button>
          </form>
        </div>

        <button
          className="forum-new-topic-button"
          onClick={handleNewTopic}
        >
          Iniciar Nueva Discusión
        </button>

        <div className="forum-table">
          <div className="forum-table-header">
            <span>Tema/Discusión</span>
            <span>Iniciado por</span>
            <span>Respuestas</span>
            <span>Última Actividad</span>
          </div>
          {displayedTopics.length > 0 ? (
            displayedTopics.map(topic => (
              <div key={topic.id} className="forum-table-row">
                <span className="forum-topic-title">{topic.title}</span>
                <span>{topic.startedBy}</span>
                <span>{topic.repliesCount}</span>
                <span>{topic.lastActivity}</span>
              </div>
            ))
          ) : (
            <div className="forum-placeholder">
              <p>
                {searchTerm.trim() !== ''
                  ? `No se encontraron temas para "${searchTerm}" en la sección "${activeNav}".`
                  : `Actualmente no hay discusiones disponibles en la sección "${activeNav}".`
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentForum;