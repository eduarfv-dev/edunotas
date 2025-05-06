import React, { useState, useEffect } from 'react';
import { db } from '../../../firebase';
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import './VerListaCursos.css';

function ViewCoursesList({ onBack }) { 
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true);
      setError('');
      try {
        const coursesRef = collection(db, "cursos");
        const q = query(coursesRef, orderBy("name"));
        const querySnapshot = await getDocs(q);
        const coursesList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCourses(coursesList);
        console.log("Cursos encontrados:", coursesList);
      } catch (err) {
        console.error("Error al obtener los cursos: ", err);
        setError("No se pudieron cargar los cursos. Inténtalo de nuevo.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div className="view-courses-content">
      <div className="view-courses-header">
        <h2>Lista de Cursos Existentes</h2>
      </div>

      {isLoading && <p>Cargando cursos...</p>}
      {error && <p className="error-message">{error}</p>}

      {!isLoading && !error && (
        courses.length === 0 ? (
          <p>No hay cursos creados todavía.</p>
        ) : (
          <div className="courses-table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Nombre del Curso</th>
                  <th>Descripción</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course.id}>
                    <td>{course.name}</td>
                    <td>{course.description ? `${course.description.substring(0, 100)}${course.description.length > 100 ? '...' : ''}` : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
}

export default ViewCoursesList;