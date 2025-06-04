// src/components/Profesor/RegistrarNotas/RegistrarNotas.js
import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../../../firebase';
import { collection, query, where, getDocs, orderBy, writeBatch, doc, serverTimestamp, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import './RegistrarNotas.css';

const ASSIGNMENT_NAMES = ["Nota 1", "Nota 2", "Nota 3", "Nota 4"];

function RegisterGrades({ user, courses: teacherCourses, grades: allGradesData, onBack }) {
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedGradeId, setSelectedGradeId] = useState('');
  const [availableGradesForCourse, setAvailableGradesForCourse] = useState([]);
  const [studentsData, setStudentsData] = useState([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [studentsError, setStudentsError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState({ error: null, success: null });
  const [showPostSaveActions, setShowPostSaveActions] = useState(false);

  useEffect(() => {
    if (selectedCourseId && teacherCourses && teacherCourses.length > 0 && allGradesData && allGradesData.length > 0) {
      const course = teacherCourses.find(c => c.id === selectedCourseId);
      if (course && course.assignedGradeIds) {
        const filteredGrades = allGradesData.filter(g => course.assignedGradeIds.includes(g.id));
        setAvailableGradesForCourse(filteredGrades);
      } else { setAvailableGradesForCourse([]); }
      setSelectedGradeId(''); setStudentsData([]); setShowPostSaveActions(false);
    } else {
      setAvailableGradesForCourse([]); setSelectedGradeId(''); setStudentsData([]); setShowPostSaveActions(false);
    }
  }, [selectedCourseId, teacherCourses, allGradesData]);

  const loadStudentsAndTheirGrades = useCallback(async () => {
    if (!selectedCourseId || !selectedGradeId || !user || !user.uid) {
      setStudentsData([]); setStudentsError(null); return;
    }
    setIsLoadingStudents(true); setStudentsError(null); setSaveStatus({ error: null, success: null }); setShowPostSaveActions(false);
    try {
      const studentsQuery = query(collection(db, "usuarios"), where("role", "==", "student"), where("gradeId", "==", selectedGradeId), orderBy("lastName", "asc"));
      const studentsSnapshot = await getDocs(studentsQuery);
      const studentsList = studentsSnapshot.docs.map(docSnap => {
        const studentDocData = docSnap.data();
        return { id: docSnap.id, firstName: studentDocData.firstName || '', lastName: studentDocData.lastName || '',
          displayName: studentDocData.displayName || `${studentDocData.firstName || ''} ${studentDocData.lastName || ''}`.trim(),
          gradesInput: {}, existingGradeDocs: {}, observation: studentDocData.observation || '', originalObservation: studentDocData.observation || '',
        };});
      if (studentsList.length === 0) { setStudentsData([]); setIsLoadingStudents(false); return; }
      const studentsWithGrades = await Promise.all(studentsList.map(async (student) => {
        const studentGradesQuery = query(collection(db, "grades"), where("studentId", "==", student.id), where("courseId", "==", selectedCourseId));
        const gradesSnapshot = await getDocs(studentGradesQuery);
        const existingGradeDocs = {}; const gradesInput = {};
        gradesSnapshot.forEach(gradeDoc => { const gradeData = gradeDoc.data(); if (ASSIGNMENT_NAMES.includes(gradeData.assignmentName)) { existingGradeDocs[gradeData.assignmentName] = { id: gradeDoc.id, ...gradeData };}});
        ASSIGNMENT_NAMES.forEach((name, index) => { gradesInput[`nota${index}`] = existingGradeDocs[name]?.score?.toString() ?? ''; });
        return { ...student, gradesInput, existingGradeDocs };
      }));
      setStudentsData(studentsWithGrades);
    } catch (err) { console.error("Error loading students/grades:", err); setStudentsError("Error al cargar datos."); setStudentsData([]);
    } finally { setIsLoadingStudents(false); }
  }, [selectedCourseId, selectedGradeId, user]);

  useEffect(() => { if (selectedCourseId && selectedGradeId) {loadStudentsAndTheirGrades();} else {setStudentsData([]);}}, [selectedCourseId, selectedGradeId, loadStudentsAndTheirGrades]);

  const handleGradeChange = (studentId, gradeKey, value) => {
    setStudentsData(prevData => prevData.map(student => student.id === studentId ? { ...student, gradesInput: { ...student.gradesInput, [gradeKey]: value } } : student));
    setSaveStatus({ error: null, success: null }); setShowPostSaveActions(false);
  };
  const handleObservationChange = (studentId, value) => {
    setStudentsData(prevData => prevData.map(student => student.id === studentId ? { ...student, observation: value } : student));
    setSaveStatus({ error: null, success: null }); setShowPostSaveActions(false);
  };
  
  const handleClear = () => {
     setStudentsData(prevData =>
      prevData.map(s => {
          const clearedGradesInput = {};
          // Corregido: el segundo parámetro de forEach es el índice
          ASSIGNMENT_NAMES.forEach((name, index) => { 
              clearedGradesInput[`nota${index}`] = ''; 
          });
          return { ...s, gradesInput: clearedGradesInput, observation: s.originalObservation };
      })
    );
     setSaveStatus({ error: null, success: null }); 
     setShowPostSaveActions(false);
  };

  const handleSave = async () => {
    if (!selectedCourseId || !selectedGradeId || !user || !user.uid) { setSaveStatus({ error: "Seleccione curso y grado.", success: null }); return; }
    if (studentsData.length === 0) { setSaveStatus({ error: "No hay estudiantes.", success: null }); return; }
    setIsSaving(true); setSaveStatus({ error: null, success: null }); setShowPostSaveActions(false);
    const batch = writeBatch(db); let operationsCount = 0;
    try {
      for (const student of studentsData) {
        if (!student.id) continue;
        for (let i = 0; i < ASSIGNMENT_NAMES.length; i++) {
          const assignmentName = ASSIGNMENT_NAMES[i]; const gradeKey = `nota${i}`;
          const inputValue = student.gradesInput[gradeKey]; const existingGradeData = student.existingGradeDocs[assignmentName];
          const score = parseFloat(inputValue);
          if (inputValue !== '' && inputValue !== null && inputValue !== undefined) {
            if (!isNaN(score) && score >= 0 && score <= 5) { 
              if (existingGradeData) { if (existingGradeData.score !== score) { batch.update(doc(db, "grades", existingGradeData.id), { score: score, recordedAt: serverTimestamp() }); operationsCount++; }}
              else { batch.set(doc(collection(db, "grades")), { studentId: student.id, courseId: selectedCourseId, gradeId: selectedGradeId, teacherId: user.uid, assignmentName: assignmentName, score: score, recordedAt: serverTimestamp()}); operationsCount++; }
            } else { console.warn(`Valor inválido ${inputValue} for ${student.displayName} - ${assignmentName}.`);}
          } else { if (existingGradeData) { batch.delete(doc(db, "grades", existingGradeData.id)); operationsCount++; } }
        }
        if (student.observation !== student.originalObservation) { batch.update(doc(db, "usuarios", student.id), { observation: student.observation || "", updatedAt: serverTimestamp() }); operationsCount++; }}
      if (operationsCount > 0) {
        await batch.commit(); setSaveStatus({ error: null, success: "¡Calificaciones guardadas exitosamente!" });
        setShowPostSaveActions(true); 
        loadStudentsAndTheirGrades(); 
      } else { setSaveStatus({ error: null, success: "No hubo cambios para guardar." }); setShowPostSaveActions(false);
        setTimeout(() => setSaveStatus(prev => ({ ...prev, success: null })), 3000); 
      }
    } catch (error) { console.error("Error al guardar:", error); setSaveStatus({ error: "Error al guardar los cambios.", success: null }); setShowPostSaveActions(false);
    } finally { setIsSaving(false); }
  };

  const handleContinueEditing = () => { setShowPostSaveActions(false); setSaveStatus({ error: null, success: null }); };
  const handleExitAfterSave = () => { setShowPostSaveActions(false); onBack(); };
  const calculateAverage = (gradesInput) => {const g=Object.values(gradesInput).map(v=>parseFloat(v)).filter(n=>!isNaN(n)&&n>=0&&n<=5);return g.length===0?'':(g.reduce((a,c)=>a+c,0)/g.length).toFixed(1);};

  return (
    <div className="register-grades-container">
      <button onClick={onBack} className="register-grades-back-button">Regresar</button>
      <div className="register-grades-sidebar">
        <label htmlFor="course-select">Curso:</label>
        <select id="course-select" value={selectedCourseId} onChange={(e) => setSelectedCourseId(e.target.value)} disabled={!teacherCourses || teacherCourses.length === 0 || isLoadingStudents || isSaving}>
          <option value="">Selecciona un curso...</option>
          {teacherCourses && teacherCourses.map(course => <option key={course.id} value={course.id}>{course.name}</option>)}
        </select>
        {teacherCourses && teacherCourses.length === 0 && !isLoadingStudents && <p>No tienes cursos.</p>}
        {selectedCourseId && (
          <>
            <label htmlFor="grade-select" style={{marginTop: '15px'}}>Grupo/Grado:</label>
            <select id="grade-select" value={selectedGradeId} onChange={(e) => setSelectedGradeId(e.target.value)} disabled={availableGradesForCourse.length === 0 || isLoadingStudents || isSaving}>
              <option value="">Selecciona un grupo...</option>
              {availableGradesForCourse.map(grade => (<option key={grade.id} value={grade.id}>{grade.shortName || grade.name}</option>))}
            </select>
            {availableGradesForCourse.length === 0 && !isLoadingStudents && <p>No hay grupos.</p>}
          </>
        )}
      </div>
      <div className="register-grades-main-content">
        <h1>Registro de Calificaciones</h1>
         {isLoadingStudents && <p className="loading-message">Cargando estudiantes...</p>}
         {studentsError && <p className="error-message">{studentsError}</p>}
        <div className='register-grades-table-wrapper'>
            <table>
            <thead><tr><th>Apellidos</th><th>Nombres</th>{ASSIGNMENT_NAMES.map(name => <th key={name}>{name}</th>)}<th>Promedio</th><th>Observaciones</th></tr></thead>
            <tbody>
                {!isLoadingStudents && studentsData.length > 0 ? (
                    studentsData.map((student) => (
                        <tr key={student.id}>
                        <td>{student.lastName}</td><td>{student.firstName}</td>
                        {ASSIGNMENT_NAMES.map((name, index) => {
                            const gradeKey = `nota${index}`;
                            return (<td key={gradeKey}><input type="number" min="0" max="5" step="0.1" value={student.gradesInput?.[gradeKey] ?? ''} onChange={(e) => handleGradeChange(student.id, gradeKey, e.target.value)} disabled={isSaving} className="grade-input" /></td>);
                         })}
                        <td>{calculateAverage(student.gradesInput)}</td>
                        <td><input type="text" value={student.observation} onChange={(e) => handleObservationChange(student.id, e.target.value)} disabled={isSaving} className="observation-input" /></td>
                        </tr>
                    ))
                    ) : ( !isLoadingStudents && !studentsError && (<tr><td colSpan={ASSIGNMENT_NAMES.length + 3 + 1}>{selectedCourseId && selectedGradeId ? "No hay estudiantes en este grupo." : "Selecciona curso y grupo."}</td></tr>) )}
                </tbody>
            </table>
        </div>
        {!isLoadingStudents && studentsData.length > 0 && (
            <div className="register-grades-buttons">
                {!showPostSaveActions && saveStatus.error && <p className="error-message status-message">{saveStatus.error}</p>}
                {!showPostSaveActions && saveStatus.success && saveStatus.success === "No hubo cambios para guardar." && 
                    <p className="success-message status-message">{saveStatus.success}</p>
                }
                {showPostSaveActions ? (
                  <div className="post-save-actions">
                    <p className="success-message status-message">{saveStatus.success}</p>
                    <div className="button-group">
                        <button onClick={handleContinueEditing} className="continue-editing-button">Realizar más cambios</button>
                        <button onClick={handleExitAfterSave} className="exit-button">Salir</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <button className="register-grades-clear-button" onClick={handleClear} disabled={isSaving}>Limpiar Notas</button>
                    <button className="register-grades-save-button" onClick={handleSave} disabled={isSaving}>{isSaving ? 'Guardando...' : 'Guardar Cambios'}</button>
                  </>
                )}
            </div>
        )}
      </div>
    </div>
  );
}
export default RegisterGrades;