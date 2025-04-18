import React from 'react';
import './ManageCoursesAdmin.css'; 

function ManageCoursesAdmin({ onBack }) { 

  const handleCreateCourse = () => {
      console.log('Admin: Crear Curso');
      alert('Funcionalidad "Crear Curso" no implementada.');
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
      console.log('Admin: Ver Cursos');
      alert('Funcionalidad "Ver Cursos" no implementada.');
  };

  return (
    <div className="manage-courses-container">
      <button onClick={onBack} className="manage-courses-back-button">
        Regresar
      </button>
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
    </div>
  );
}
export default ManageCoursesAdmin;