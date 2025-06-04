import React, { useState } from 'react';
import './GestionarContenidoCurso.css';

// Datos de prueba para los cursos
const MOCK_COURSES_DATA = [
  { id: 'course001', name: 'Matemáticas Avanzadas', description: 'Un curso intensivo sobre cálculo y álgebra lineal.', teacher: 'Prof. Ana García', studentCount: 30, modules: ['Cálculo Diferencial', 'Álgebra Lineal', 'Ecuaciones Diferenciales'] },
  { id: 'course002', name: 'Introducción a la Programación', description: 'Fundamentos de la programación con Python.', teacher: 'Prof. Carlos López', studentCount: 45, modules: ['Variables y Tipos de Datos', 'Estructuras de Control', 'Funciones', 'Programación Orientada a Objetos Básica'] },
  { id: 'course003', name: 'Historia del Arte Moderno', description: 'Un recorrido por los movimientos artísticos desde el siglo XIX.', teacher: 'Prof. Laura Vargas', studentCount: 25, modules: ['Impresionismo', 'Cubismo', 'Surrealismo', 'Arte Pop'] },
];

function ManageCourseContent({ onBack }) { 
  const [currentView, setCurrentView] = useState('menu'); // 'menu', 'viewList', 'editForm'
  const [courses, setCourses] = useState(MOCK_COURSES_DATA);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', modules: '' });
  const [showEditButtonsInList, setShowEditButtonsInList] = useState(false); // Nuevo estado

  const handleViewCourses = () => {
    console.log('Acción: Ver Cursos');
    setShowEditButtonsInList(false); // No mostrar botones de editar
    setCurrentView('viewList');
  };

  const handleShowModifyList = () => {
    console.log('Acción: Mostrar lista para Modificar Curso');
    setShowEditButtonsInList(true); // Mostrar botones de editar
    setCurrentView('viewList'); 
  };

  const handleEditCourse = (course) => {
    setSelectedCourse(course);
    setFormData({
      name: course.name,
      description: course.description,
      modules: course.modules.join(', ') // Convertir array a string para el input
    });
    setCurrentView('editForm');
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = (e) => {
    e.preventDefault();
    console.log('Guardando cambios para el curso:', selectedCourse.id, formData);
    // Aquí iría la lógica para actualizar el curso en `courses` y persistir
    const updatedCourses = courses.map(c => 
      c.id === selectedCourse.id ? { ...c, name: formData.name, description: formData.description, modules: formData.modules.split(',').map(m => m.trim()) } : c
    );
    setCourses(updatedCourses);
    alert(`Cambios guardados para "${formData.name}".`);
    // setShowEditButtonsInList(true); // Asegurarse de que los botones de edición sigan visibles si volvemos a la lista de "modificar"
    setCurrentView('viewList'); 
  };

  const handleBackToMenu = () => {
    setCurrentView('menu');
    setSelectedCourse(null);
    setShowEditButtonsInList(false); // Resetear al volver al menú principal
  };

  const handleBackToList = () => {
    // showEditButtonsInList ya debería tener el valor correcto (true) si venimos de un flujo de edición
    setCurrentView('viewList');
    setSelectedCourse(null);
  }

  if (currentView === 'viewList') {
    return (
      <div className="course-manage-container">
        <button onClick={handleBackToMenu} className="course-manage-back-button">
          Regresar al Menú Principal
        </button>
        <div className="course-manage-content">
          <h1>{showEditButtonsInList ? "Seleccione un Curso para Modificar" : "Lista de Cursos"}</h1>
          {courses.length > 0 ? (
            <ul className="course-list">
              {courses.map(course => (
                <li key={course.id} className="course-list-item">
                  <div>
                    <h3>{course.name}</h3>
                    <p>{course.description}</p>
                    <p><strong>Profesor:</strong> {course.teacher}</p>
                    <p><strong>Módulos:</strong> {course.modules.join(', ')}</p>
                  </div>
                  {showEditButtonsInList && ( // Mostrar botón solo si showEditButtonsInList es true
                    <button onClick={() => handleEditCourse(course)} className="course-edit-button">
                      Editar
                    </button>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p>No hay cursos para mostrar.</p>
          )}
        </div>
      </div>
    );
  }

  if (currentView === 'editForm') {
    return (
      <div className="course-manage-container">
        <button onClick={handleBackToList} className="course-manage-back-button">
          Regresar a la Lista
        </button>
        <div className="course-manage-content">
          <h1>Modificar Curso: {selectedCourse?.name}</h1>
          <form onSubmit={handleSaveChanges} className="course-edit-form">
            <div className="form-group">
              <label htmlFor="name">Nombre del Curso:</label>
              <input type="text" id="name" name="name" value={formData.name} onChange={handleFormChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="description">Descripción:</label>
              <textarea id="description" name="description" value={formData.description} onChange={handleFormChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="modules">Módulos (separados por coma):</label>
              <input type="text" id="modules" name="modules" value={formData.modules} onChange={handleFormChange} />
            </div>
            <button type="submit" className="course-manage-option-button">Guardar Cambios</button>
          </form>
        </div>
      </div>
    );
  }

  // Vista del menú principal
  return (
    <div className="course-manage-container">
      <button onClick={onBack} className="course-manage-back-button">
        Regresar al Panel del Profesor
      </button>
      <div className="course-manage-content">
        <h1>Gestión Contenido de Cursos</h1>
        <div className="course-manage-options">
          <button className="course-manage-option-button" onClick={handleShowModifyList}>
            <i className='bx bxs-edit' ></i> 
            Modificar Contenido de Curso
          </button>
          <button className="course-manage-option-button" onClick={handleViewCourses}>
            <i className='bx bx-list-ul' ></i> 
            Ver Cursos Disponibles
          </button>
        </div>
      </div>
    </div>
  );
}
export default ManageCourseContent;