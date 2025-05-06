import React, { useState, useEffect } from 'react';
import { db } from '../../../firebase';
import { collection, query, where, getDocs, doc, getDoc, orderBy, Timestamp } from "firebase/firestore";
import './VerNotasEstudiante.css';

function GradesView({ studentUid, onBack }) {

  const [grades, setGrades] = useState([]);
  const [courseNames, setCourseNames] = useState({});
  const [averageGrade, setAverageGrade] = useState(null);
  const [courseAverages, setCourseAverages] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!studentUid) {
      setError("No se pudo identificar al estudiante.");
      setIsLoading(false);
      return;
    }

    const fetchGradesAndCourses = async () => {
      setIsLoading(true);
      setError(null);
      setAverageGrade(null);
      setCourseAverages({});
      console.log(`Buscando notas para el estudiante UID: ${studentUid}`);

      try {
        const gradesRef = collection(db, "grades");
        const q = query(
            gradesRef,
            where("studentId", "==", studentUid),
            orderBy("gradeDate", "desc")
        );
        const gradesSnapshot = await getDocs(q);

        const fetchedGrades = [];
        const courseIdsToFetch = new Set();
        const gradesByCourse = {};

        gradesSnapshot.forEach((doc) => {
          const gradeData = { id: doc.id, ...doc.data() };
          fetchedGrades.push(gradeData);
          if (gradeData.courseId) {
            courseIdsToFetch.add(gradeData.courseId);
            if (!gradesByCourse[gradeData.courseId]) {
              gradesByCourse[gradeData.courseId] = [];
            }
            gradesByCourse[gradeData.courseId].push(gradeData);
          }
        });

        console.log("Notas encontradas:", fetchedGrades);

        if (fetchedGrades.length > 0) {
          let sum = 0;
          let count = 0;
          fetchedGrades.forEach(grade => {
            const score = parseFloat(grade.score);
            if (!isNaN(score)) {
              sum += score;
              count++;
            } else {
              console.warn(`La nota con ID ${grade.id} no es un número válido:`, grade.score);
            }
          });
          if (count > 0) {
            const avg = sum / count;
            setAverageGrade(avg.toFixed(2));
            console.log(`Promedio general calculado: ${avg.toFixed(2)}`);
          } else {
             setAverageGrade(0);
          }
        } else {
            setAverageGrade(0);
        }

        const calculatedCourseAverages = {};
        for (const courseId in gradesByCourse) {
          let courseSum = 0;
          let courseCount = 0;
          gradesByCourse[courseId].forEach(grade => {
            const score = parseFloat(grade.score);
            if (!isNaN(score)) {
              courseSum += score;
              courseCount++;
            }
          });
          if (courseCount > 0) {
            calculatedCourseAverages[courseId] = (courseSum / courseCount).toFixed(2);
          } else {
            calculatedCourseAverages[courseId] = 'N/A';
          }
        }
        setCourseAverages(calculatedCourseAverages);
        console.log("Promedios por curso calculados:", calculatedCourseAverages);

        let namesMap = {};
        if (courseIdsToFetch.size > 0) {
          console.log("Buscando nombres para los cursos IDs:", Array.from(courseIdsToFetch));
          const coursePromises = Array.from(courseIdsToFetch).map(id => getDoc(doc(db, "cursos", id)));
          const courseDocs = await Promise.all(coursePromises);

          courseDocs.forEach(docSnap => {
            if (docSnap.exists()) {
              namesMap[docSnap.id] = docSnap.data().name || `Curso (ID: ${docSnap.id.substring(0,4)}...)`;
            } else {
              console.warn(`No se encontró el curso con ID: ${docSnap.id}`);
              namesMap[docSnap.id] = `Curso Desconocido (ID: ${docSnap.id.substring(0,4)}...)`;
            }
          });
          console.log("Nombres de cursos mapeados:", namesMap);
          setCourseNames(namesMap);
        }

        setGrades(fetchedGrades);

      } catch (err) {
        console.error("Error al buscar notas o cursos:", err);
        if (err.code === 'permission-denied') {
             setError("No tienes permiso para ver estas calificaciones. Verifica las reglas de seguridad.");
        } else {
            setError("Error al cargar las calificaciones.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchGradesAndCourses();

  }, [studentUid]);

  const formatDate = (timestamp) => {
    if (timestamp instanceof Timestamp) {
      return timestamp.toDate().toLocaleDateString();
    }
    return 'Fecha no disponible';
  };

  if (isLoading) {
    return (
      <div className="grades-display-container">
        <div className="grades-content">
            <h2>Mis Calificaciones</h2>
            <p>Cargando calificaciones...</p>
        </div>
        <button onClick={onBack} className="grades-back-button">{"< Regresar"}</button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="grades-display-container">
         <div className="grades-content">
            <h2>Mis Calificaciones</h2>
            <p style={{ color: 'red' }}>{error}</p>
         </div>
        <button onClick={onBack} className="grades-back-button">{"< Regresar"}</button>
      </div>
    );
  }

  return (
    <div className="grades-display-container">
      <button onClick={onBack} className="grades-back-button">{"< Regresar"}</button>
      <div className="grades-content">
          <h2>Mis Calificaciones</h2>

          {averageGrade !== null && (
            <p style={{ fontWeight: 'bold', marginBottom: '5px', fontSize: '1.1em' }}>
              Promedio General: {averageGrade}
            </p>
          )}

          {Object.keys(courseAverages).length > 0 && (
            <div style={{ marginBottom: '20px', width: '100%', borderTop: '1px solid #eee', paddingTop: '15px', marginTop: '15px' }}>
              <h4 style={{ marginBottom: '10px' }}>Promedios por Curso:</h4>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {Object.entries(courseAverages).map(([courseId, avg]) => (
                  <li key={courseId} style={{ marginBottom: '5px' }}>
                    <strong>{courseNames[courseId] || `Curso ID: ${courseId.substring(0,4)}...`}:</strong> {avg}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {grades.length === 0 ? (
            <p>Aún no tienes calificaciones registradas.</p>
          ) : (
            <div className="grades-table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Curso</th>
                    <th>Tarea/Evaluación</th>
                    <th>Nota</th>
                    <th>Observación</th>
                    <th>Fecha Registro</th>
                  </tr>
                </thead>
                <tbody>
                  {grades.map((grade) => (
                    <tr key={grade.id}>
                      <td>{courseNames[grade.courseId] || 'Cargando...'}</td>
                      <td>{grade.assignmentName}</td>
                      <td>{grade.score}</td>
                      <td>{grade.observation || '-'}</td>
                      <td>{formatDate(grade.gradeDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>
    </div>
  );
}

export default GradesView;