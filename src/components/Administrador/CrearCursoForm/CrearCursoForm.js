import React, { useState } from 'react';
import { db } from '../../../firebase';
import { collection, addDoc } from "firebase/firestore";
import './CrearCursoForm.css'; 

function CreateCourseForm({ onCourseCreated, onCancel }) {
  const [courseName, setCourseName] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!courseName.trim()) {
      setError('El nombre del curso es obligatorio.');
      return;
    }

    setIsLoading(true);

    try {
      const docRef = await addDoc(collection(db, "cursos"), {
        name: courseName.trim(),
        description: courseDescription.trim(),
      });
      console.log("Curso creado con ID: ", docRef.id);
      setSuccessMessage(`¡Curso "${courseName}" creado exitosamente!`);
      setCourseName('');
      setCourseDescription('');
    } catch (err) {
      console.error("Error al crear el curso: ", err);
      setError("Error al crear el curso. Inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="create-course-content">
      <h2>Crear Nuevo Curso</h2>
      <form onSubmit={handleSubmit} className="create-course-form">
        <div className="form-group">
          <label htmlFor="courseName">Nombre del Curso:</label>
          <input
            type="text"
            id="courseName"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            placeholder="Ej: Programación Web Básica"
            required
            disabled={isLoading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="courseDescription">Descripción (Opcional):</label>
          <textarea
            id="courseDescription"
            value={courseDescription}
            onChange={(e) => setCourseDescription(e.target.value)}
            rows="4"
            placeholder="Describe brevemente el contenido del curso..."
            disabled={isLoading}
          />
        </div>

        {error && <p className="error-message">{error}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}

        <div className="form-actions">
          <button type="button" onClick={onCancel} disabled={isLoading} className="cancel-button">
            Cancelar
          </button>
          <button type="submit" disabled={isLoading} className="submit-button">
            {isLoading ? 'Creando...' : 'Crear Curso'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateCourseForm;