import React, { useState } from 'react';
import './GestionarCursosAdmin.css';
import CreateCourseForm from '../CrearCursoForm/CrearCursoForm';
import ViewCoursesList from '../VerListaCursos/VerListaCursos';

function ManageCoursesAdmin({ onBack }) {
  const [currentView, setCurrentView] = useState('menu');

  const handleCreateCourse = () => {
      console.log('Admin: Navegando a Crear Curso');
      setCurrentView('create');
  };
  const handleModifyCourse = () => {
      console.log('Admin: Modificar Curso');
      alert('Funcionalidad "Modificar Curso" no implementada.');
  };
  const handleDeleteCourse = () => {
      console.log('Admin: Borrar Curso');
      alert('Funcionalidad "Borrar Curso" no implementada.');
  };
  const handleViewCourses = () => {
      console.log('Admin: Navegando a Ver Cursos');
      setCurrentView('view');
  };

  const handleBackToMenu = () => {
    setCurrentView('menu');
  };

  return (
    <div className="manage-courses-container">
      <button onClick={onBack} className="manage-courses-back-button">
        Regresar
      </button>

      {currentView === 'menu' && (
        <div className="manage-courses-content">
          <h1>Gestión de Cursos y su Contenido</h1>
          <div className="manage-courses-options">
            <div className="manage-courses-option">
              <i className='bx bxs-book-add'></i>
              <button className="manage-courses-option-button" onClick={handleCreateCourse}>
                  Crear Curso
              </button>
            </div>
            <div className="manage-courses-option">
              <i className='bx bxs-book-reader'></i>
              <button className="manage-courses-option-button" onClick={handleModifyCourse}>
                  Modificar Curso
              </button>
            </div>
            <div className="manage-courses-option">
              <i className='bx bxs-book'></i>
              <button className="manage-courses-option-button" onClick={handleDeleteCourse}>
                  Borrar Curso
              </button>
            </div>
            <div className="manage-courses-option">
              <i className='bx bxs-book-content'></i>
              <button className="manage-courses-option-button" onClick={handleViewCourses}>
                  Ver Cursos
              </button>
            </div>
          </div>
        </div>
      )}

      {currentView === 'create' && (
        <CreateCourseForm onCourseCreated={handleBackToMenu} onCancel={handleBackToMenu} />
      )}

      {currentView === 'view' && (
        <ViewCoursesList onBack={handleBackToMenu} />
      )}
    </div>
  );
}
export default ManageCoursesAdmin;