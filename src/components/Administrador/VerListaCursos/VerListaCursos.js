// src/components/Administrador/VerListaCursos/VerListaCursos.js
import React from 'react';
import './VerListaCursos.css'; 

function ViewCoursesList({ courses, isLoading, error, mode, onEditAction, onDeleteAction, profesores, gradesList }) {
  const getTeacherNameById = (teacherId) => {
    if (!profesores || profesores.length === 0 || !teacherId) return 'No asignado'; 
    const teacher = profesores.find(prof => prof.id === teacherId);
    return teacher ? (teacher.displayName || `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim() || teacher.email || 'Profesor Desconocido') : 'Profesor No Encontrado';
  };

  const getAssignedGradeNames = (assignedIds) => {
    if (!assignedIds || assignedIds.length === 0 || !gradesList || gradesList.length === 0) {
      return 'Ninguno';
    }
    const names = assignedIds.map(id => {
      const grade = gradesList.find(g => g.id === id);
      return grade ? (grade.shortName || grade.name) : ''; // Retorna string vacío si no encuentra para filtrar luego
    }).filter(name => name !== '').join(', '); // Filtra los no encontrados y une
    return names || 'Ninguno';
  };

  if (isLoading) { 
    return <div className="view-courses-content"><p className="loading-indicator">Cargando cursos...</p></div>;
  }
  if (error) { 
    return <div className="view-courses-content"><p className="error-message">{error}</p></div>;
  }
  if (!isLoading && !error && courses.length === 0) {
    return <div className="view-courses-content"><p>No hay cursos disponibles para mostrar.</p></div>;
  }

  return (
    <div className="view-courses-content">
      {!isLoading && !error && courses.length > 0 && (
        <div className="courses-table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Nombre del Curso</th>
                <th>Descripción</th>
                <th>Profesor Asignado</th>
                <th>Grados Asignados</th>
                {(mode === 'edit' || mode === 'delete') && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.id}>
                  <td>{course.name || 'Sin Nombre'}</td>
                  <td>{course.description ? `${course.description.substring(0, 70)}${course.description.length > 70 ? '...' : ''}` : '-'}</td>
                  <td>{getTeacherNameById(course.teacherId)}</td>
                  <td>{getAssignedGradeNames(course.assignedGradeIds)}</td>
                  {(mode === 'edit' || mode === 'delete') && (
                    <td>
                      {mode === 'edit' && onEditAction && (
                        <button onClick={() => onEditAction(course)} className="action-button edit-button">Modificar</button>
                      )}
                      {mode === 'delete' && onDeleteAction && (
                        <button onClick={() => onDeleteAction(course)} className="action-button delete-button">Eliminar</button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
export default ViewCoursesList;