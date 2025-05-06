import React from 'react';
import './GestionarContenidoCurso.css';

function ManageCourseContent({ onBack }) { 

  const handleModifyCourse = () => {
    console.log('Acción: Modificar Curso');
    alert('Funcionalidad "Modificar Curso" no implementada.');
  };

  const handleViewCourses = () => {
     console.log('Acción: Ver Cursos');
    alert('Funcionalidad "Ver Cursos" no implementada.');
  };

  return (
    <div className="course-manage-container">
      <button onClick={onBack} className="course-manage-back-button">
        Regresar
      </button>
      <div className="course-manage-content">
        <h1>Gestión Contenido de Cursos</h1>
        <div className="course-manage-options">
          <button className="course-manage-option-button" onClick={handleModifyCourse}>
            <i className='bx bxs-edit' ></i> 
            Modificar Curso
          </button>
          <button className="course-manage-option-button" onClick={handleViewCourses}>
            <i className='bx bx-list-ul' ></i> 
            Ver Cursos
          </button>
        </div>
      </div>
    </div>
  );
}
export default ManageCourseContent;