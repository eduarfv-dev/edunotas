import React, { useState, useEffect } from 'react';
import { db } from '../../firebase'; 
import { collection, query, where, getDocs, doc, getDoc, orderBy, Timestamp } from "firebase/firestore";
function GradesView({ studentUid, onBack }) {

  const [grades, setGrades] = useState([]);
  const [courseNames, setCourseNames] = useState({}); 
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

        gradesSnapshot.forEach((doc) => {
          const gradeData = { id: doc.id, ...doc.data() };
          fetchedGrades.push(gradeData);
          if (gradeData.courseId) {
            courseIdsToFetch.add(gradeData.courseId);
          }
        });

        console.log("Notas encontradas:", fetchedGrades);

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
      <div className="grades-view-container" style={styles.container}>
        <h2>Mis Calificaciones</h2>
        <p>Cargando calificaciones...</p>
        <button onClick={onBack} style={styles.backButton}>{"< Regresar"}</button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="grades-view-container" style={styles.container}>
        <h2>Mis Calificaciones</h2>
        <p style={{ color: 'red' }}>{error}</p>
        <button onClick={onBack} style={styles.backButton}>{"< Regresar"}</button>
      </div>
    );
  }

  return (
    <div className="grades-view-container" style={styles.container}>
      <button onClick={onBack} style={styles.backButton}>{"< Regresar"}</button>
      <h2>Mis Calificaciones</h2>

      {grades.length === 0 ? (
        <p>Aún no tienes calificaciones registradas.</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Curso</th>
              <th style={styles.th}>Tarea/Evaluación</th>
              <th style={styles.th}>Nota</th>
              <th style={styles.th}>Fecha Registro</th>
            </tr>
          </thead>
          <tbody>
            {grades.map((grade) => (
              <tr key={grade.id}>
                <td style={styles.td}>{courseNames[grade.courseId] || 'Cargando...'}</td>
                <td style={styles.td}>{grade.assignmentName}</td>
                <td style={styles.td}>{grade.score}</td>
                <td style={styles.td}>{formatDate(grade.gradeDate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: '30px',
    borderRadius: '10px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    width: '80%',
    maxWidth: '800px',
    margin: '20px auto',
    position: 'relative'
  },
  backButton: {
    position: 'absolute',
    top: '15px',
    left: '15px',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    color: '#007bff',
    textDecoration: 'underline',
    fontSize: '0.9em'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '20px',
  },
  th: {
    borderBottom: '2px solid #dee2e6',
    padding: '12px',
    textAlign: 'left',
    backgroundColor: '#f8f9fa'
  },
  td: {
    borderBottom: '1px solid #dee2e6',
    padding: '12px',
    textAlign: 'left',
  }
};

export default GradesView;