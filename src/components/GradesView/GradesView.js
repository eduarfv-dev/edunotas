import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, where, getDocs, doc, getDoc, orderBy, Timestamp } from "firebase/firestore";
import './GradesView.css';

function GradesView({ studentUid, onBack }) {

  const [grades, setGrades] = useState([]);
  const [courseNames, setCourseNames] = useState({});
  const [averageGrade, setAverageGrade] = useState(null);
  const [courseAverages, setCourseAverages] = useState({}); // <-- NUEVO ESTADO PARA PROMEDIOS POR CURSO
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
      setCourseAverages({}); // Reiniciar promedios por curso
      console.log(`Buscando notas para el estudiante UID: ${studentUid}`);

      try {
        const gradesRef = collection(db, "grades");
        const q = query(
            gradesRef,
            where("studentId", "==", studentUid),
            orderBy("gradeDate", "desc") // Puedes ajustar el orden si prefieres
        );
        const gradesSnapshot = await getDocs(q);

        const fetchedGrades = [];
        const courseIdsToFetch = new Set();
        const gradesByCourse = {}; // Para agrupar notas por curso

        gradesSnapshot.forEach((doc) => {
          const gradeData = { id: doc.id, ...doc.data() };
          // Asegúrate de que 'observation' se obtiene. Si no existe, será undefined.
          fetchedGrades.push(gradeData);
          if (gradeData.courseId) {
            courseIdsToFetch.add(gradeData.courseId);
            // Agrupar notas por curso
            if (!gradesByCourse[gradeData.courseId]) {
              gradesByCourse[gradeData.courseId] = [];
            }
            gradesByCourse[gradeData.courseId].push(gradeData);
          }
        });

        console.log("Notas encontradas:", fetchedGrades);

        // --- Calcular Promedio General ---
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
        // --- Fin Calcular Promedio General ---

        // --- Calcular Promedios por Curso ---
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
            calculatedCourseAverages[courseId] = 'N/A'; // O 0, o como prefieras manejarlo
          }
        }
        setCourseAverages(calculatedCourseAverages);
        console.log("Promedios por curso calculados:", calculatedCourseAverages);
        // --- Fin Calcular Promedios por Curso ---


        // --- Obtener Nombres de Cursos ---
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
        // --- Fin Obtener Nombres de Cursos ---

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
    // Usamos las clases CSS en lugar de styles.container y styles.backButton
    return (
      <div className="grades-display-container"> {/* Cambiado de styles.container */}
        <div className="grades-content"> {/* Añadido contenedor para centrar contenido */}
            <h2>Mis Calificaciones</h2>
            <p>Cargando calificaciones...</p>
        </div>
        <button onClick={onBack} className="grades-back-button">{"< Regresar"}</button> {/* Cambiado de styles.backButton */}
      </div>
    );
  }

  if (error) {
     // Usamos las clases CSS
    return (
      <div className="grades-display-container"> {/* Cambiado de styles.container */}
         <div className="grades-content"> {/* Añadido contenedor */}
            <h2>Mis Calificaciones</h2>
            <p style={{ color: 'red' }}>{error}</p> {/* Mantenemos el color rojo para el error */}
         </div>
        <button onClick={onBack} className="grades-back-button">{"< Regresar"}</button> {/* Cambiado de styles.backButton */}
      </div>
    );
  }

  // Usamos las clases CSS para el contenedor principal, botón, tabla, etc.
  return (
    <div className="grades-display-container"> {/* Cambiado de styles.container */}
      <button onClick={onBack} className="grades-back-button">{"< Regresar"}</button> {/* Cambiado de styles.backButton */}
      <div className="grades-content"> {/* Contenedor para el contenido principal */}
          <h2>Mis Calificaciones</h2>

          {/* --- Mostrar Promedio General --- */}
          {averageGrade !== null && (
            <p style={{ fontWeight: 'bold', marginBottom: '5px', fontSize: '1.1em' }}>
              Promedio General: {averageGrade}
            </p>
          )}
          {/* --- Fin Mostrar Promedio General --- */}

          {/* --- Mostrar Promedios por Curso --- */}
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
          {/* --- Fin Mostrar Promedios por Curso --- */}


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
                    <th>Observación</th> {/* <-- NUEVA COLUMNA */}
                    <th>Fecha Registro</th>
                  </tr>
                </thead>
                <tbody>
                  {grades.map((grade) => (
                    <tr key={grade.id}>
                      <td>{courseNames[grade.courseId] || 'Cargando...'}</td>
                      <td>{grade.assignmentName}</td>
                      <td>{grade.score}</td>
                      <td>{grade.observation || '-'}</td> {/* <-- MOSTRAR OBSERVACIÓN */}
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