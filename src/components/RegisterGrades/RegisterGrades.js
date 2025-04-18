import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../../firebase';
import { collection, query, where, getDocs, doc, getDoc, Timestamp, writeBatch } from "firebase/firestore";
import './RegisterGrades.css';

const ASSIGNMENT_NAMES = ["Nota 1", "Nota 2", "Nota 3"];

function RegisterGrades({ teacherUid, onBack }) {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [coursesError, setCoursesError] = useState(null);

  const [studentsData, setStudentsData] = useState([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [studentsError, setStudentsError] = useState(null);

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState({ error: null, success: null });

  useEffect(() => {
    if (!teacherUid) {
      setCoursesError("No se pudo identificar al profesor.");
      return;
    }
    setIsLoadingCourses(true);
    setCoursesError(null);
    const q = query(collection(db, "cursos"), where("teacherId", "==", teacherUid));
    getDocs(q)
      .then(querySnapshot => {
        const fetchedCourses = [];
        querySnapshot.forEach((doc) => fetchedCourses.push({ id: doc.id, ...doc.data() }));
        setCourses(fetchedCourses);
      })
      .catch(err => {
        console.error("Error fetching courses:", err);
        setCoursesError("No se pudieron cargar los cursos asignados.");
      })
      .finally(() => setIsLoadingCourses(false));
  }, [teacherUid]);

  const loadStudentsAndGrades = useCallback(async (courseId) => {
    if (!teacherUid) {
      setStudentsError("No se puede cargar información sin identificar al profesor.");
      setIsLoadingStudents(false);
      setStudentsData([]);
      return;
    }
    if (!courseId) {
      setStudentsData([]);
      setIsLoadingStudents(false);
      return;
    }

    setIsLoadingStudents(true);
    setStudentsError(null);
    setStudentsData([]);
    setSaveStatus({ error: null, success: null });

    try {
      const courseDocRef = doc(db, "cursos", courseId);
      const courseDocSnap = await getDoc(courseDocRef);

      if (!courseDocSnap.exists()) {
        throw new Error("Documento del curso no encontrado.");
      }

      const courseData = courseDocSnap.data();
      const studentIds = courseData.studentIds || [];

      if (studentIds.length === 0) {
         setIsLoadingStudents(false);
         return;
      }

      const studentPromises = studentIds.map(id => getDoc(doc(db, "usuarios", id)));
      const studentDocs = await Promise.all(studentPromises);
      const validStudentDocs = studentDocs.filter(snap => snap.exists());

      if(validStudentDocs.length === 0) {
           setIsLoadingStudents(false);
           return;
      }

      const gradesQuery = query(
        collection(db, "grades"),
        where("courseId", "==", courseId),
        where("teacherId", "==", teacherUid),
        where("studentId", "in", studentIds)
      );

      const gradesSnapshot = await getDocs(gradesQuery);
      const existingGradesMap = new Map();
      gradesSnapshot.forEach(gradeDoc => {
        const gradeData = gradeDoc.data();
        if (!existingGradesMap.has(gradeData.studentId)) {
          existingGradesMap.set(gradeData.studentId, {});
        }
        existingGradesMap.get(gradeData.studentId)[gradeData.assignmentName] = { id: gradeDoc.id, score: gradeData.score };
      });

      const initialStudentsData = validStudentDocs.map(userDoc => {
          const studentId = userDoc.id;
          const userData = userDoc.data();
          const gradesInput = {};
          const existingStudentGrades = existingGradesMap.get(studentId) || {};

          ASSIGNMENT_NAMES.forEach((name, index) => {
              gradesInput[`nota${index}`] = existingStudentGrades[name]?.score ?? '';
          });

          // Carga la observación actual y guarda la original para comparación
          const currentObservation = userData.observation || ''; // Ajusta 'observation' si el campo se llama diferente

          return {
              id: studentId,
              lastName: userData.lastName || '',
              firstName: userData.firstName || userData.displayName || studentId,
              gradesInput: gradesInput,
              observations: currentObservation, // Para el input
              originalObservation: currentObservation, // Para comparar al guardar
              existingGrades: existingStudentGrades
          };
      });

      setStudentsData(initialStudentsData);

    } catch (err) {
      console.error("Error loading students/grades:", err);
      if (err.code === 'permission-denied') {
          setStudentsError("Error de permisos al cargar datos. Verifica las reglas de Firestore.");
      } else if (err.code === 'failed-precondition' && err.message.includes('index')) {
          setStudentsError("Se necesita un índice en Firestore. Revisa la consola del navegador para el enlace.");
      } else {
          setStudentsError("Error al cargar datos de estudiantes o notas.");
      }
    } finally {
      setIsLoadingStudents(false);
    }
  }, [teacherUid]);

  useEffect(() => {
    loadStudentsAndGrades(selectedCourseId);
  }, [selectedCourseId, loadStudentsAndGrades]);


  const handleGradeChange = (studentId, gradeKey, value) => {
    setStudentsData(prevData =>
      prevData.map(student => {
        if (student.id === studentId) {
          return {
            ...student,
            gradesInput: {
              ...student.gradesInput,
              [gradeKey]: value
            }
          };
        }
        return student;
      })
    );
    setSaveStatus({ error: null, success: null });
  };

  const handleObservationChange = (studentId, value) => {
     setStudentsData(prevData =>
      prevData.map(student =>
        student.id === studentId ? { ...student, observations: value } : student
      )
    );
     setSaveStatus({ error: null, success: null });
  };

  const handleClear = () => {
     setStudentsData(prevData =>
      prevData.map(s => {
          const clearedGradesInput = {};
          ASSIGNMENT_NAMES.forEach((name, index) => {
              clearedGradesInput[`nota${index}`] = '';
          });
          return {
              ...s,
              gradesInput: clearedGradesInput,
              observations: s.originalObservation, // Restaura la observación original al limpiar
          };
      })
    );
     setSaveStatus({ error: null, success: null });
  };

  const handleSave = async () => {
    if (!selectedCourseId || !teacherUid) {
        setSaveStatus({ error: "Falta información del curso o del profesor.", success: null });
        return;
    }
    if (studentsData.length === 0) {
        setSaveStatus({ error: "No hay datos de estudiantes para guardar.", success: null });
        return;
    }

    setIsSaving(true);
    setSaveStatus({ error: null, success: null });
    const batch = writeBatch(db);
    let operationsCount = 0;

    try {
      for (const student of studentsData) {
        if (!student.id) {
            console.warn("Intentando guardar notas para estudiante sin ID:", student);
            continue;
        }

        // Guardar/Actualizar NOTAS
        for (let i = 0; i < ASSIGNMENT_NAMES.length; i++) {
          const gradeKey = `nota${i}`;
          const assignmentName = ASSIGNMENT_NAMES[i];
          const gradeValue = student.gradesInput[gradeKey];
          const existingGradeData = student.existingGrades[assignmentName];

          if (gradeValue !== '' && gradeValue !== null && gradeValue !== undefined) {
            const score = parseFloat(gradeValue);

            if (!isNaN(score) && score >= 0 && score <= 5) {
              const gradePayload = {
                courseId: selectedCourseId,
                studentId: student.id,
                teacherId: teacherUid,
                assignmentName: assignmentName,
                score: score,
                gradeDate: Timestamp.fromDate(new Date())
              };

              if (existingGradeData) {
                // Actualiza si existe Y el valor es válido (incluye si no cambió pero se guardó)
                const gradeDocRef = doc(db, "grades", existingGradeData.id);
                batch.update(gradeDocRef, gradePayload);
                operationsCount++;
              } else {
                // Crea si no existe Y el valor es válido
                const newGradeDocRef = doc(collection(db, "grades"));
                batch.set(newGradeDocRef, gradePayload);
                operationsCount++;
              }
            } else {
                 console.warn(`Valor inválido o fuera de rango para ${student.id} - ${assignmentName}: ${gradeValue}. No guardado.`);
            }
          } else if (existingGradeData) {
             // Opcional: Si el input se vació, se podría borrar la nota existente
             // console.log(`Input vacío para ${student.id} - ${assignmentName}. Nota existente no se borra.`);
             // Para borrar: batch.delete(doc(db, "grades", existingGradeData.id)); operationsCount++;
          }
        } // Fin del bucle de notas

        // Guardar/Actualizar OBSERVACIONES
        if (student.observations !== student.originalObservation) {
            if (student.id) {
                const studentDocRef = doc(db, "usuarios", student.id);
                batch.update(studentDocRef, {
                    observation: student.observations // Ajusta 'observation' si el campo es diferente
                });
                operationsCount++;
            } else {
                 console.warn("Intentando guardar observación para estudiante sin ID:", student);
            }
        } // Fin de la lógica de observaciones

      } // Fin del bucle de estudiantes

      if (operationsCount > 0) {
          await batch.commit();
          setSaveStatus({ error: null, success: `¡${operationsCount} operación(es) guardada(s) exitosamente!` });
          loadStudentsAndGrades(selectedCourseId); // Recarga datos para reflejar cambios
      } else {
          setSaveStatus({ error: null, success: "No hubo cambios para guardar." });
      }

    } catch (error) {
       console.error("Error saving data:", error);
       if (error.code === 'permission-denied') {
           setSaveStatus({ error: "Error de permisos al guardar. Verifica las reglas de Firestore.", success: null });
       } else {
           setSaveStatus({ error: "Error al guardar los cambios.", success: null });
       }
    } finally {
       setIsSaving(false);
    }
  };

  const calculateAverage = (gradesInput) => {
      const validGrades = Object.values(gradesInput)
          .map(val => parseFloat(val))
          .filter(num => !isNaN(num));
      if (validGrades.length === 0) return '';
      const sum = validGrades.reduce((acc, grade) => acc + grade, 0);
      return (sum / validGrades.length).toFixed(1);
  }

  return (
    <div className="register-grades-container">
      <button onClick={onBack} className="register-grades-back-button">
        Regresar
      </button>

      <div className="register-grades-sidebar">
        <label htmlFor="course-select">Curso:</label>
        {isLoadingCourses && <p>Cargando cursos...</p>}
        {coursesError && <p className="error-message">{coursesError}</p>}
        <select
            id="course-select"
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            disabled={isLoadingCourses || courses.length === 0}
            >
          <option value="">Selecciona un curso...</option>
          {courses.map(course => <option key={course.id} value={course.id}>{course.name}</option>)}
        </select>
         {!isLoadingCourses && courses.length === 0 && !coursesError && <p>No tienes cursos asignados.</p>}
      </div>

      <div className="register-grades-main-content">
        <h1>Registro de Calificaciones</h1>
         {isLoadingStudents && <p>Cargando estudiantes...</p>}
         {studentsError && <p className="error-message">{studentsError}</p>}

        <div className='register-grades-table-wrapper'>
            <table>
            <thead>
                <tr>
                <th>Apellidos</th>
                <th>Nombres</th>
                {ASSIGNMENT_NAMES.map(name => <th key={name}>{name}</th>)}
                <th>Promedio</th>
                <th>Observaciones</th>
                </tr>
            </thead>
            <tbody>
                {!isLoadingStudents && studentsData.length > 0 ? (
                    studentsData.map((student) => (
                        <tr key={student.id}>
                        <td>{student.lastName}</td>
                        <td>{student.firstName}</td>
                        {ASSIGNMENT_NAMES.map((name, index) => {
                            const gradeKey = `nota${index}`;
                            return (
                                <td key={gradeKey}>
                                    <input
                                        type="number"
                                        min="0"
                                        max="5"
                                        step="0.1"
                                        value={student.gradesInput?.[gradeKey] ?? ''}
                                        onChange={(e) => handleGradeChange(student.id, gradeKey, e.target.value)}
                                        disabled={isSaving}
                                        className="grade-input"
                                    />
                                </td>
                            );
                         })}
                        <td>{calculateAverage(student.gradesInput)}</td>
                        <td>
                            <input
                                type="text"
                                value={student.observations}
                                onChange={(e) => handleObservationChange(student.id, e.target.value)}
                                disabled={isSaving}
                                className="observation-input"
                            />
                        </td>
                        </tr>
                    ))
                    ) : (
                     !isLoadingStudents && !studentsError && (
                         <tr>
                            <td colSpan={ASSIGNMENT_NAMES.length + 3}>
                                {selectedCourseId ? "No hay estudiantes inscritos en este curso." : "Selecciona un curso para cargar estudiantes."}
                            </td>
                        </tr>
                     )
                    )}
                </tbody>
            </table>
        </div>
        {!isLoadingStudents && studentsData.length > 0 && (
            <div className="register-grades-buttons">
                {saveStatus.error && <p className="error-message status-message">{saveStatus.error}</p>}
                {saveStatus.success && <p className="success-message status-message">{saveStatus.success}</p>}
                <button className="register-grades-clear-button" onClick={handleClear} disabled={isSaving}>
                    Limpiar Notas
                </button>
                <button className="register-grades-save-button" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
            </div>
        )}
      </div>
    </div>
  );
}

export default RegisterGrades;