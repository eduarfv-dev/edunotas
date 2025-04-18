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
    if (!teacherUid) return;
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
        setCoursesError("No se pudieron cargar los cursos.");
      })
      .finally(() => setIsLoadingCourses(false));
  }, [teacherUid]);

  const loadStudentsAndGrades = useCallback(async (courseId) => {
    if (!courseId) {
      setStudentsData([]);
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

          return {
              lastName: userData.lastName || '',
              firstName: userData.firstName || userData.displayName || studentId,
              gradesInput: gradesInput,
              observations: '',
              existingGrades: existingStudentGrades
          };
      });

      setStudentsData(initialStudentsData);

    } catch (err) {
      console.error("Error loading students/grades:", err);
      setStudentsError("Error al cargar datos de estudiantes o notas.");
    } finally {
      setIsLoadingStudents(false);
    }
  }, []);

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
              [gradeKey]: value === '' ? '' : value
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
              observations: '',
          };
      })
    );
     setSaveStatus({ error: null, success: null });
  };

  const handleSave = async () => {
    if (!selectedCourseId) return;
    setIsSaving(true);
    setSaveStatus({ error: null, success: null });
    const batch = writeBatch(db);

    try {
      for (const student of studentsData) {
        for (let i = 0; i < ASSIGNMENT_NAMES.length; i++) {
          const gradeKey = `nota${i}`;
          const assignmentName = ASSIGNMENT_NAMES[i];
          const gradeValue = student.gradesInput[gradeKey];
          const existingGradeData = student.existingGrades[assignmentName];

          if (gradeValue !== '' && gradeValue !== null && gradeValue !== undefined) {
            const score = parseFloat(gradeValue);
            if (!isNaN(score)) {
              const gradePayload = {
                courseId: selectedCourseId,
                studentId: student.id,
                teacherId: teacherUid,
                assignmentName: assignmentName,
                score: score,
                gradeDate: Timestamp.fromDate(new Date())
              };

              if (existingGradeData) {
                const gradeDocRef = doc(db, "grades", existingGradeData.id);
                batch.update(gradeDocRef, gradePayload);
              } else {
                const newGradeDocRef = doc(collection(db, "grades"));
                batch.set(newGradeDocRef, gradePayload);
              }
            } else {
               console.warn(`Valor inválido para ${student.id} - ${assignmentName}: ${gradeValue}`);
            }
          }
        }
      }

      await batch.commit();
      setSaveStatus({ error: null, success: "¡Calificaciones guardadas exitosamente!" });
      loadStudentsAndGrades(selectedCourseId);

    } catch (error) {
       console.error("Error saving grades:", error);
       setSaveStatus({ error: "Error al guardar las calificaciones.", success: null });
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
        {isLoadingCourses && <p>Cargando...</p>}
        {coursesError && <p style={{color:'red'}}>{coursesError}</p>}
        <select
            id="course-select"
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            disabled={isLoadingCourses || courses.length === 0}
            >
          <option value="">Selecciona...</option>
          {courses.map(course => <option key={course.id} value={course.id}>{course.name}</option>)}
        </select>
         {!isLoadingCourses && courses.length === 0 && !coursesError && <p>No hay cursos.</p>}
      </div>

      <div className="register-grades-main-content">
        <h1>Registro de Calificaciones</h1>
         {isLoadingStudents && <p>Cargando estudiantes...</p>}
         {studentsError && <p style={{color:'red'}}>{studentsError}</p>}

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
                        {/* *** VERIFICA ESTOS CAMPOS *** */}
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
                                        value={student.gradesInput[gradeKey]}
                                        onChange={(e) => handleGradeChange(student.id, gradeKey, e.target.value)}
                                        disabled={isSaving}
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
                            />
                        </td>
                        </tr>
                    ))
                    ) : (
                     !isLoadingStudents && !studentsError && (
                         <tr>
                            <td colSpan={ASSIGNMENT_NAMES.length + 3}>
                                {selectedCourseId ? "No hay estudiantes en este curso." : "Selecciona un curso para ver estudiantes."}
                            </td>
                        </tr>
                     )
                    )}
                </tbody>
            </table>
        </div>
        {!isLoadingStudents && studentsData.length > 0 && (
            <div className="register-grades-buttons">
                {saveStatus.error && <p style={{ color: 'red', flexBasis: '100%' }}>{saveStatus.error}</p>}
                {saveStatus.success && <p style={{ color: 'green', flexBasis: '100%' }}>{saveStatus.success}</p>}
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