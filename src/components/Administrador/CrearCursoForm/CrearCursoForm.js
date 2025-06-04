// src/components/Administrador/CrearCursoForm/CrearCursoForm.js
import React, { useState } from 'react';
import './CrearCursoForm.css'; 

function CreateCourseForm({ onCourseCreated, onCancel, profesores, gradesList, isLoading: parentIsLoading }) {
  const [courseName, setCourseName] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [selectedGradeIds, setSelectedGradeIds] = useState([]); 
  const [formError, setFormError] = useState(''); 

  const handleSubmit = (e) => { 
    e.preventDefault();
    setFormError(''); 
    if (!courseName.trim()) {
      setFormError('El nombre del curso es obligatorio.'); return;
    }
    if (!selectedTeacherId) {
      setFormError('Debe seleccionar un profesor para el curso.'); return;
    }
    // if (selectedGradeIds.length === 0) { // Validación opcional
    //   setFormError('Debe seleccionar al menos un grado.'); return;
    // }
    
    const nuevoCursoData = {
      name: courseName.trim(),
      description: courseDescription.trim(),
      teacherId: selectedTeacherId,
      assignedGradeIds: selectedGradeIds 
    };
    onCourseCreated(nuevoCursoData); 
  };

  const handleGradesSelectionChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
    setSelectedGradeIds(selectedOptions);
  };

  return (
    <div className="create-course-content"> 
      <h2>Crear Nuevo Curso</h2>
      <form onSubmit={handleSubmit} className="course-form"> 
        <div className="form-group">
          <label htmlFor="courseName">Nombre del Curso:</label>
          <input type="text" id="courseName" value={courseName} onChange={(e) => setCourseName(e.target.value)} placeholder="Ej: Programación Web Básica" required disabled={parentIsLoading} />
        </div>
        <div className="form-group">
          <label htmlFor="courseDescription">Descripción (Opcional):</label>
          <textarea id="courseDescription" value={courseDescription} onChange={(e) => setCourseDescription(e.target.value)} rows="4" placeholder="Describe brevemente el contenido del curso..." disabled={parentIsLoading} />
        </div>
        <div className="form-group">
          <label htmlFor="selectedTeacherId">Profesor Asignado:</label>
          <select id="selectedTeacherId" name="teacherId" value={selectedTeacherId} onChange={(e) => setSelectedTeacherId(e.target.value)} required disabled={parentIsLoading || !profesores || profesores.length === 0}>
            <option value="" disabled>Seleccione un profesor...</option>
            {profesores && profesores.map(profesor => (
              <option key={profesor.id} value={profesor.id}>
                {profesor.displayName || `${profesor.firstName || ''} ${profesor.lastName || ''}`.trim()} ({profesor.email})
              </option>
            ))}
             {(!profesores || profesores.length === 0) && <option value="" disabled>Cargando o no hay profesores...</option>}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="assignedGrades">Grados Asignados (Ctrl+Click o Cmd+Click para múltiple):</label>
          <select id="assignedGrades" multiple value={selectedGradeIds} onChange={handleGradesSelectionChange} disabled={parentIsLoading || !gradesList || gradesList.length === 0} className="multi-select-grades" size={gradesList && gradesList.length > 5 ? 5 : (gradesList?.length || 1)}>
            {gradesList && gradesList.map(grade => (
              <option key={grade.id} value={grade.id}>
                {grade.name} ({grade.shortName || 'N/A'})
              </option>
            ))}
          </select>
          {(!gradesList || gradesList.length === 0) && !parentIsLoading && (
            <small>No hay grados disponibles para asignar.</small>
          )}
        </div>
        {formError && <p className="error-message">{formError}</p>}
        <div className="form-actions">
          <button type="button" onClick={onCancel} disabled={parentIsLoading} className="cancel-button">Cancelar</button>
          <button type="submit" disabled={parentIsLoading} className="submit-button">
            {parentIsLoading ? 'Creando...' : 'Crear Curso'}
          </button>
        </div>
      </form>
    </div>
  );
}
export default CreateCourseForm;