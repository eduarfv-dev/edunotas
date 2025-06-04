// src/components/Administrador/GestionarCursosAdmin/ManageCoursesAdmin.js
import React, { useState, useEffect, useCallback } from 'react';
import './GestionarCursosAdmin.css';
import CreateCourseForm from '../CrearCursoForm/CrearCursoForm';
import ViewCoursesList from '../VerListaCursos/VerListaCursos';
import { db, auth } from '../../../firebase'; 
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, serverTimestamp, query, orderBy, where } from "firebase/firestore";
import { logAuditEvent } from '../../../utils/auditLogger'; 

const coursesCollectionRef = collection(db, "cursos");
const teachersCollectionRef = collection(db, "usuarios");
const gradosCollectionRef = collection(db, "grados");

function ManageCoursesAdmin({ onBack }) {
  const [currentView, setCurrentView] = useState('menu');
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [editingFormData, setEditingFormData] = useState({ 
    id: '', name: '', description: '', teacherId: '', assignedGradeIds: [] 
  });
  const [teachersList, setTeachersList] = useState([]);
  const [gradesList, setGradesList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchTeachers = useCallback(async () => {
    try {
      const q = query(teachersCollectionRef, where("role", "==", "teacher"), orderBy("displayName", "asc"));
      const data = await getDocs(q);
      setTeachersList(data.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() })));
    } catch (err) { console.error("Error fetching teachers:", err); setTeachersList([]);}
  }, []);

  const fetchGrades = useCallback(async () => {
    try {
      const q = query(gradosCollectionRef, orderBy("name", "asc"));
      const data = await getDocs(q);
      setGradesList(data.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() })));
    } catch (err) { console.error("Error fetching grades:", err); setGradesList([]);}
  }, []);

  const fetchCourses = useCallback(async () => {
    setIsLoading(true); setError('');
    try {
      const q = query(coursesCollectionRef, orderBy("createdAt", "desc"));
      const data = await getDocs(q);
      setCourses(data.docs.map(docSnap => ({ ...docSnap.data(), id: docSnap.id })));
    } catch (err) { console.error("Error fetching courses:", err); setError('Error al cargar cursos.'); setCourses([]);}
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (['menu', 'view', 'selectToEdit', 'selectToDelete'].includes(currentView)) {
      fetchCourses();
      if (currentView === 'view' || currentView === 'selectToEdit') { fetchGrades(); }
    }
    if (['create', 'editingCourseForm'].includes(currentView)) {
      fetchTeachers(); fetchGrades();
    }
    if (['view', 'selectToEdit', 'selectToDelete'].includes(currentView)) { fetchTeachers(); }
  }, [currentView, fetchCourses, fetchTeachers, fetchGrades]);

  const clearMessages = () => { setError(''); setSuccessMessage(''); };
  const handleShowCreateForm = () => { clearMessages(); setEditingFormData({ id: '', name: '', description: '', teacherId: '', assignedGradeIds: [] }); setCurrentView('create'); };
  const handleShowModifyCourseSelection = () => { clearMessages(); setSelectedCourse(null); setEditingFormData({ id: '', name: '', description: '', teacherId: '', assignedGradeIds: [] }); setCurrentView('selectToEdit'); };
  const handleShowDeleteCourseSelection = () => { clearMessages(); setCurrentView('selectToDelete'); };
  const handleShowViewCourses = () => { clearMessages(); setCurrentView('view'); };
  const handleBackToMenu = () => { clearMessages(); setSelectedCourse(null); setEditingFormData({ id: '', name: '', description: '', teacherId: '', assignedGradeIds: [] }); setCurrentView('menu'); };
  const handleBackToSelectionOrMenu = () => { clearMessages(); setSelectedCourse(null); setEditingFormData({ id: '', name: '', description: '', teacherId: '', assignedGradeIds: [] });
    if (currentView === 'editingCourseForm') { setCurrentView('selectToEdit'); } else { setCurrentView('menu'); }
  };
  const handleEditingFormChange = (e) => { const { name, value } = e.target; setEditingFormData(prevData => ({ ...prevData, [name]: value })); };
  const handleAssignedGradesChange = (selectedOptions) => { const selectedIds = Array.from(selectedOptions).map(option => option.value); setEditingFormData(prevData => ({ ...prevData, assignedGradeIds: selectedIds })); };

  const handleCourseCreated = async (newCourseDataWithGrades) => {
    setIsLoading(true); clearMessages();
    const adminUser = auth.currentUser;
    let newCourseId = null;
    try {
      const courseDataToSave = { ...newCourseDataWithGrades, createdAt: serverTimestamp(), updatedAt: serverTimestamp() };
      const docRef = await addDoc(coursesCollectionRef, courseDataToSave);
      newCourseId = docRef.id;
      setSuccessMessage(`Curso "${newCourseDataWithGrades.name}" creado.`);
      setCurrentView('menu');
      if (adminUser && newCourseId) {
        logAuditEvent('COURSE_CREATED', { performedByUserId: adminUser.uid, performedByUserDisplayName: adminUser.displayName || adminUser.email,
          targetEntityType: "CURSO", targetEntityId: newCourseId, targetEntityDescription: `Curso: ${newCourseDataWithGrades.name}`,
          details: { name: newCourseDataWithGrades.name, teacherId: newCourseDataWithGrades.teacherId, assignedGradeIds: newCourseDataWithGrades.assignedGradeIds || [] }}); // Asegurar array
      }
    } catch (err) {
      console.error("Error creando curso:", err); setError(err.message || 'Error al crear.');
      if (adminUser) {
        logAuditEvent('COURSE_CREATION_FAILED', { performedByUserId: adminUser.uid, performedByUserDisplayName: adminUser.displayName || adminUser.email,
          targetEntityType: "CURSO", targetEntityDescription: `Intento crear: ${newCourseDataWithGrades.name}`, details: { error: err.message, attemptData: newCourseDataWithGrades }});
      }
    }
    setIsLoading(false); setTimeout(() => {setSuccessMessage(''); setError('')}, 4000);
  };

  const handleSelectCourseToEdit = (course) => {
    clearMessages();
    if (course && typeof course === 'object' && course.id) {
      setSelectedCourse(course);
      setEditingFormData({ id: course.id, name: course.name || '', description: course.description || '', teacherId: course.teacherId || '', assignedGradeIds: course.assignedGradeIds || [] });
      setCurrentView('editingCourseForm');
    } else { setError('Se intentó editar un curso inválido.'); }
  };

  const handleSaveEditedCourse = async (e) => {
    e.preventDefault(); clearMessages(); setIsLoading(true);
    const adminUser = auth.currentUser; const courseId = editingFormData.id;
    if (!courseId) { setError("ID de curso no encontrado."); setIsLoading(false); return; }
    if (!editingFormData.teacherId) { setError('Debe seleccionar un profesor.'); setIsLoading(false); return; }
    try {
      const courseDocRef = doc(db, "cursos", courseId);
      const originalCourseData = courses.find(c => c.id === courseId) || selectedCourse; 
      const dataToUpdate = { name: editingFormData.name, description: editingFormData.description, teacherId: editingFormData.teacherId,
        assignedGradeIds: editingFormData.assignedGradeIds || [], updatedAt: serverTimestamp() };
      await updateDoc(courseDocRef, dataToUpdate);
      setSuccessMessage(`Curso "${editingFormData.name}" actualizado.`);
      if (adminUser && originalCourseData) {
        const changedFields = {};
        Object.keys(dataToUpdate).forEach(key => {
          let originalValue = originalCourseData[key]; let newValue = dataToUpdate[key];
          if (Array.isArray(originalValue) && Array.isArray(newValue)) { originalValue = JSON.stringify([...originalValue].sort()); newValue = JSON.stringify([...newValue].sort()); }
          if (newValue !== originalValue && key !== 'updatedAt') { changedFields[key] = { from: JSON.stringify(originalCourseData[key]), to: JSON.stringify(dataToUpdate[key]) };}});
        if(Object.keys(changedFields).length > 0){
            logAuditEvent('COURSE_UPDATED', { performedByUserId: adminUser.uid, performedByUserDisplayName: adminUser.displayName || adminUser.email,
              targetEntityType: "CURSO", targetEntityId: courseId, targetEntityDescription: `Curso: ${dataToUpdate.name}`, details: { changes: changedFields }});
        }}
      setCurrentView('selectToEdit'); fetchCourses();
    } catch (err) {
      console.error("Error actualizando curso:", err); setError(err.message || 'Error al actualizar.');
      if (adminUser) {
        logAuditEvent('COURSE_UPDATE_FAILED', { performedByUserId: adminUser.uid, performedByUserDisplayName: adminUser.displayName || adminUser.email,
          targetEntityType: "CURSO", targetEntityId: courseId, targetEntityDescription: `Intento actualizar: ${editingFormData.name}`, details: { error: err.message, attemptData: editingFormData }});
      }}
    setIsLoading(false); setTimeout(() => { setSuccessMessage(''); setError(''); setSelectedCourse(null); }, 4000);
  };

  const handleConfirmDeleteCourse = useCallback(async (courseToDelete) => {
    if (window.confirm(`¿Eliminar el curso "${courseToDelete.name}"?`)) {
      setIsLoading(true); clearMessages();
      const adminUser = auth.currentUser;
      try {
        await deleteDoc(doc(db, "cursos", courseToDelete.id));
        setSuccessMessage(`Curso "${courseToDelete.name}" eliminado.`);
        if (adminUser) {
          logAuditEvent('COURSE_DELETED', {
            performedByUserId: adminUser.uid, 
            performedByUserDisplayName: adminUser.displayName || adminUser.email,
            targetEntityType: "CURSO", 
            targetEntityId: courseToDelete.id,
            targetEntityDescription: `Curso: ${courseToDelete.name}`,
            details: { 
              name: courseToDelete.name, 
              teacherId: courseToDelete.teacherId || null, // Asegurar null si es undefined
              assignedGradeIds: courseToDelete.assignedGradeIds || [] // Usar array vacío si es undefined
            }
          });
        }
        fetchCourses();
      } catch (err) {
        console.error("Error eliminando curso:", err); setError(err.message || 'Error al eliminar.');
        if (adminUser) {
          logAuditEvent('COURSE_DELETE_FAILED', {
            performedByUserId: adminUser.uid, performedByUserDisplayName: adminUser.displayName || adminUser.email,
            targetEntityType: "CURSO", targetEntityId: courseToDelete.id,
            targetEntityDescription: `Intento eliminar: ${courseToDelete.name}`, details: { error: err.message }});
        }
      }
      setIsLoading(false); setTimeout(() => {setSuccessMessage(''); setError('');}, 4000);
    }
  }, [fetchCourses, clearMessages]);

  return (
    <div className="manage-courses-container">
      {currentView === 'menu' && !isLoading && ( <button onClick={onBack} className="manage-courses-back-button" style={{marginBottom: '20px', alignSelf: 'flex-start'}}>Regresar al Panel Admin</button> )}
      { ['create', 'view', 'selectToEdit', 'selectToDelete'].includes(currentView) && !isLoading && ( <button onClick={handleBackToMenu} className="manage-courses-back-button" style={{marginBottom: '20px', alignSelf: 'flex-start'}}>Regresar al Menú de Cursos</button> )}
      {currentView === 'editingCourseForm' && !isLoading && ( <button onClick={handleBackToSelectionOrMenu} className="manage-courses-back-button" style={{marginBottom: '20px', alignSelf: 'flex-start'}}>Regresar a Selección</button> )}
      {isLoading && <div className="loading-indicator">Cargando...</div>}
      {!isLoading && error && <div className="error-message">{error} <button onClick={clearMessages} className="close-message-button">X</button></div>}
      {!isLoading && successMessage && <div className="success-message">{successMessage} <button onClick={clearMessages} className="close-message-button">X</button></div>}
      {currentView === 'menu' && !isLoading && ( <><div className="manage-courses-content"><h1>Gestión de Cursos y su Contenido</h1><div className="manage-courses-options">
          <div className="manage-courses-option"><i className='bx bxs-book-add'></i><button className="manage-courses-option-button" onClick={handleShowCreateForm}>Crear Curso</button></div>
          <div className="manage-courses-option"><i className='bx bxs-edit'></i><button className="manage-courses-option-button" onClick={handleShowModifyCourseSelection}>Modificar Curso</button></div>
          <div className="manage-courses-option"><i className='bx bx-trash'></i><button className="manage-courses-option-button" onClick={handleShowDeleteCourseSelection}>Borrar Curso</button></div>
          <div className="manage-courses-option"><i className='bx bxs-book-content'></i><button className="manage-courses-option-button" onClick={handleShowViewCourses}>Ver Cursos</button></div>
        </div></div></> )}
      {currentView === 'create' && ( <CreateCourseForm onCourseCreated={handleCourseCreated} onCancel={handleBackToMenu} profesores={teachersList} gradesList={gradesList} isLoading={isLoading} /> )}
      {(currentView === 'view' || currentView === 'selectToEdit' || currentView === 'selectToDelete') && !isLoading && (
        <ViewCoursesList courses={courses} isLoading={isLoading} profesores={teachersList} gradesList={gradesList}
            mode={currentView === 'view' ? 'view' : currentView === 'selectToEdit' ? 'edit' : 'delete'}
            onEditAction={currentView === 'selectToEdit' ? handleSelectCourseToEdit : undefined}
            onDeleteAction={currentView === 'selectToDelete' ? handleConfirmDeleteCourse : undefined} /> )}
      {currentView === 'editingCourseForm' && selectedCourse && (
        <div className="edit-course-form-container"><h2>Modificando Curso: {selectedCourse.name}</h2>
          <form onSubmit={handleSaveEditedCourse} className="course-form">
            <div className="form-group"><label htmlFor="editCourseName">Nombre:</label><input type="text" id="editCourseName" name="name" value={editingFormData.name} onChange={handleEditingFormChange} required disabled={isLoading}/></div>
            <div className="form-group"><label htmlFor="editCourseDescription">Descripción:</label><textarea id="editCourseDescription" name="description" value={editingFormData.description} onChange={handleEditingFormChange} rows="4" disabled={isLoading}/></div>
            <div className="form-group"><label htmlFor="editTeacherId">Profesor:</label>
              <select id="editTeacherId" name="teacherId" value={editingFormData.teacherId} onChange={handleEditingFormChange} required disabled={isLoading || teachersList.length === 0}>
                <option value="" disabled>Seleccione profesor</option>
                {teachersList.map(p => (<option key={p.id} value={p.id}>{p.displayName || `${p.firstName} ${p.lastName}`} ({p.email})</option>))}
              </select>{teachersList.length === 0 && !isLoading && <small>No hay profesores.</small>}</div>
            <div className="form-group"><label htmlFor="editAssignedGrades">Grados (Ctrl+Click):</label>
              <select id="editAssignedGrades" name="assignedGradeIds" multiple value={editingFormData.assignedGradeIds} onChange={(e) => handleAssignedGradesChange(e.target.selectedOptions)} disabled={isLoading || gradesList.length === 0} className="multi-select-grades" size={gradesList.length > 5 ? 5 : gradesList.length || 1}>
                {gradesList.map(g => (<option key={g.id} value={g.id}>{g.name} ({g.shortName || 'N/A'})</option>))}
              </select>{gradesList.length === 0 && !isLoading && <small>No hay grados.</small>}</div>
            <div className="form-actions">
              <button type="submit" className="submit-button" disabled={isLoading}>{isLoading ? 'Guardando...' : 'Guardar'}</button>
              <button type="button" onClick={handleBackToSelectionOrMenu} className="cancel-button" disabled={isLoading}>Cancelar</button>
            </div>
          </form>
        </div> )}
    </div>
  );
}
export default ManageCoursesAdmin;