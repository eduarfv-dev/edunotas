// src/components/Administrador/GestionarGradosAdmin/GestionarGradosAdmin.js
import React, { useState, useEffect, useCallback } from 'react';
import './GestionarGradosAdmin.css';
import { db, auth } from '../../../firebase'; // Asegúrate que auth se exporte desde tu firebase.js
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, serverTimestamp, query, orderBy, where } from "firebase/firestore";
import { logAuditEvent } from '../../../utils/auditLogger'; // Ajusta la ruta si es necesario

const gradosCollectionRef = collection(db, "grados");
const teachersCollectionRef = collection(db, "usuarios"); 

function GestionarGradosAdmin({ onBack }) {
  const [currentView, setCurrentView] = useState('menu'); 
  const [gradesList, setGradesList] = useState([]);
  const [teachersList, setTeachersList] = useState([]); 
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [editingFormData, setEditingFormData] = useState({
    id: '', name: '', shortName: '', level: '', section: '', tutorId: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchTeachers = useCallback(async () => {
    try {
      const q = query(teachersCollectionRef, where("role", "==", "teacher"), orderBy("displayName", "asc"));
      const data = await getDocs(q);
      setTeachersList(data.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() })));
    } catch (err) { console.error("Error fetching teachers:", err); setTeachersList([]); }
  }, []); 

  const fetchGrades = useCallback(async () => {
    setIsLoading(true); setError('');
    try {
      const q = query(gradosCollectionRef, orderBy("name", "asc")); 
      const data = await getDocs(q);
      setGradesList(data.docs.map(docSnap => ({ ...docSnap.data(), id: docSnap.id })));
    } catch (err) { console.error("Error fetching grades:", err); setError('Error al cargar los grados.'); setGradesList([]); }
    setIsLoading(false);
  }, []); 

  useEffect(() => {
    if (['menu', 'view', 'selectToEdit', 'selectToDelete'].includes(currentView)) { fetchGrades(); }
    if (['create', 'editingGradeForm', 'view', 'selectToEdit'].includes(currentView)) { fetchTeachers(); }
  }, [currentView, fetchGrades, fetchTeachers]);

  const clearMessages = () => { setError(''); setSuccessMessage(''); };
  const handleShowCreateForm = () => { clearMessages(); setEditingFormData({ id: '', name: '', shortName: '', level: '', section: '', tutorId: '' }); setCurrentView('create'); };
  const handleShowModifyGradeSelection = () => { clearMessages(); setSelectedGrade(null); setCurrentView('selectToEdit'); };
  const handleShowDeleteGradeSelection = () => { clearMessages(); setCurrentView('selectToDelete'); };
  const handleShowViewGrades = () => { clearMessages(); setCurrentView('view'); };
  const handleBackToMenu = () => { clearMessages(); setSelectedGrade(null); setEditingFormData({ id: '', name: '', shortName: '', level: '', section: '', tutorId: '' }); setCurrentView('menu'); };
  const handleBackToSelectionOrMenu = () => { clearMessages(); setSelectedGrade(null); setEditingFormData({ id: '', name: '', shortName: '', level: '', section: '', tutorId: '' });
    if (currentView === 'editingGradeForm') { setCurrentView('selectToEdit'); } else { setCurrentView('menu'); }
  };
  const handleEditingFormChange = (e) => { const { name, value } = e.target; setEditingFormData(prevData => ({ ...prevData, [name]: value })); };

  const handleGradeCreated = async (newGradeDataFromForm) => {
    setIsLoading(true); clearMessages();
    const adminUser = auth.currentUser;
    let newGradeId = null;
    const dataToSave = { ...newGradeDataFromForm, createdAt: serverTimestamp(), updatedAt: serverTimestamp() };
    try {
      const docRef = await addDoc(gradosCollectionRef, dataToSave);
      newGradeId = docRef.id;
      setSuccessMessage(`Grado "${newGradeDataFromForm.name}" creado.`);
      setCurrentView('menu'); 
      if (adminUser && newGradeId) {
        logAuditEvent('GRADE_GROUP_CREATED', { performedByUserId: adminUser.uid, performedByUserDisplayName: adminUser.displayName || adminUser.email,
          targetEntityType: "GRADO", targetEntityId: newGradeId, targetEntityDescription: `Grado: ${newGradeDataFromForm.name} (${newGradeDataFromForm.shortName || ''})`,
          details: { ...newGradeDataFromForm }});
      }
    } catch (err) {
      console.error("Error creando grado:", err); setError(err.message || 'Error al crear.');
      if (adminUser) {
        logAuditEvent('GRADE_GROUP_CREATION_FAILED', { performedByUserId: adminUser.uid, performedByUserDisplayName: adminUser.displayName || adminUser.email,
          targetEntityType: "GRADO", targetEntityDescription: `Intento crear: ${newGradeDataFromForm.name}`, details: { error: err.message, attemptData: newGradeDataFromForm }});
      }
    }
    setIsLoading(false); setTimeout(() => { setSuccessMessage(''); setError(''); }, 4000);
  };
  
  const handleSelectGradeToEdit = (grade) => {
    clearMessages();
    if (grade && typeof grade === 'object' && grade.id) {
        setSelectedGrade(grade);
        setEditingFormData({ id: grade.id, name: grade.name || '', shortName: grade.shortName || '', level: grade.level || '', section: grade.section || '', tutorId: grade.tutorId || '' });
        setCurrentView('editingGradeForm');
    } else { setError('Se intentó editar un grado inválido.'); }
  };

  const handleSaveEditedGrade = async (e) => {
    e.preventDefault(); clearMessages(); setIsLoading(true);
    const adminUser = auth.currentUser; const gradeId = editingFormData.id;
    if (!gradeId) { setError("ID de grado no encontrado."); setIsLoading(false); return; }
    try {
      const gradeDocRef = doc(db, "grados", gradeId);
      const originalGradeData = gradesList.find(g => g.id === gradeId) || selectedGrade;
      const dataToUpdate = { name: editingFormData.name, shortName: editingFormData.shortName, level: editingFormData.level, section: editingFormData.section, tutorId: editingFormData.tutorId, updatedAt: serverTimestamp() };
      await updateDoc(gradeDocRef, dataToUpdate);
      setSuccessMessage(`Grado "${editingFormData.name}" actualizado.`);
      if (adminUser && originalGradeData) {
        const changedFields = {};
        Object.keys(dataToUpdate).forEach(key => { if (dataToUpdate[key] !== originalGradeData[key] && key !== 'updatedAt') { changedFields[key] = { from: originalGradeData[key] === undefined ? 'N/A' : originalGradeData[key], to: dataToUpdate[key] };}});
        if(Object.keys(changedFields).length > 0){
            logAuditEvent('GRADE_GROUP_UPDATED', { performedByUserId: adminUser.uid, performedByUserDisplayName: adminUser.displayName || adminUser.email,
              targetEntityType: "GRADO", targetEntityId: gradeId, targetEntityDescription: `Grado: ${dataToUpdate.name} (${dataToUpdate.shortName || ''})`, details: { changes: changedFields }});
        }}
      setCurrentView('selectToEdit'); fetchGrades(); 
    } catch (err) {
      console.error("Error actualizando grado:", err); setError(err.message || 'Error al actualizar.');
      if (adminUser) {
        logAuditEvent('GRADE_GROUP_UPDATE_FAILED', { performedByUserId: adminUser.uid, performedByUserDisplayName: adminUser.displayName || adminUser.email,
          targetEntityType: "GRADO", targetEntityId: gradeId, targetEntityDescription: `Intento actualizar: ${editingFormData.name}`, details: { error: err.message, attemptData: editingFormData }});
      }}
    setIsLoading(false); setTimeout(() => { setSuccessMessage(''); setError(''); setSelectedGrade(null); }, 4000); 
  };
  
  const handleConfirmDeleteGrade = useCallback(async (gradeToDelete) => {
    if (window.confirm(`¿Eliminar grado "${gradeToDelete.name} (${gradeToDelete.shortName || ''})"?`)) {
      setIsLoading(true); clearMessages();
      const adminUser = auth.currentUser;
      try {
        await deleteDoc(doc(db, "grados", gradeToDelete.id));        
        setSuccessMessage(`Grado "${gradeToDelete.name}" eliminado.`);
        if (adminUser) {
          logAuditEvent('GRADE_GROUP_DELETED', { performedByUserId: adminUser.uid, performedByUserDisplayName: adminUser.displayName || adminUser.email,
            targetEntityType: "GRADO", targetEntityId: gradeToDelete.id, targetEntityDescription: `Grado: ${gradeToDelete.name} (${gradeToDelete.shortName || ''})`,
            details: { name: gradeToDelete.name, shortName: gradeToDelete.shortName, level: gradeToDelete.level, section: gradeToDelete.section, tutorId: gradeToDelete.tutorId || null }});
        }
        if (currentView === 'selectToDelete') { fetchGrades(); } else { setCurrentView('menu'); }
      } catch (err) {
        console.error("Error eliminando grado:", err); setError(err.message || 'Error al eliminar.');
        if (adminUser) {
          logAuditEvent('GRADE_GROUP_DELETE_FAILED', { performedByUserId: adminUser.uid, performedByUserDisplayName: adminUser.displayName || adminUser.email,
            targetEntityType: "GRADO", targetEntityId: gradeToDelete.id, targetEntityDescription: `Intento eliminar: ${gradeToDelete.name}`, details: { error: err.message }});
        }
      }
      setIsLoading(false); setTimeout(() => {setSuccessMessage(''); setError('');}, 4000);
    }
  }, [currentView, fetchGrades, clearMessages]);

  // --- JSX de Retorno (idéntico al que ya tenías y te gustaba el diseño) ---
  return (
    <div className="manage-grades-container">
      {currentView === 'menu' && !isLoading && ( <button onClick={onBack} className="manage-grades-back-button" style={{marginBottom: '20px', alignSelf: 'flex-start'}}>Regresar al Panel Admin</button> )}
      { ['create', 'view', 'selectToEdit', 'selectToDelete'].includes(currentView) && !isLoading && ( <button onClick={handleBackToMenu} className="manage-grades-back-button" style={{marginBottom: '20px', alignSelf: 'flex-start'}}>Regresar al Menú de Grados</button> )}
      {currentView === 'editingGradeForm' && !isLoading && ( <button onClick={handleBackToSelectionOrMenu} className="manage-grades-back-button" style={{marginBottom: '20px', alignSelf: 'flex-start'}}>Regresar a Selección</button> )}
      {isLoading && <div className="loading-indicator">Cargando...</div>}
      {!isLoading && error && <div className="error-message">{error} <button onClick={clearMessages} className="close-message-button">X</button></div>}
      {!isLoading && successMessage && <div className="success-message">{successMessage} <button onClick={clearMessages} className="close-message-button">X</button></div>}
      {currentView === 'menu' && !isLoading && (
        <><div className="manage-grades-content"><h1>Gestión de Grados</h1><div className="admin-button-group">
          <div className="admin-button-with-icon" onClick={handleShowCreateForm}><i className='bx bxs-add-to-queue'></i><button>CREAR GRADO</button></div>
          <div className="admin-button-with-icon" onClick={handleShowModifyGradeSelection}><i className='bx bxs-edit-alt'></i><button>MODIFICAR GRADO</button></div>
          <div className="admin-button-with-icon" onClick={handleShowDeleteGradeSelection}><i className='bx bx-trash-alt'></i><button>BORRAR GRADO</button></div>
          <div className="admin-button-with-icon" onClick={handleShowViewGrades}><i className='bx bxs-detail'></i><button>VER GRADOS</button></div>
        </div></div></>)}
      {currentView === 'create' && (
        <div className="create-grade-form-container"><h2>Crear Nuevo Grado</h2>
          <form onSubmit={(e) => { e.preventDefault(); const formData = { name: e.target.name.value, shortName: e.target.shortName.value, level: e.target.level.value, section: e.target.section.value, tutorId: e.target.tutorId.value,}; handleGradeCreated(formData);}} className="grade-form">
              <div className="form-group"><label htmlFor="createGradeName">Nombre:</label><input type="text" id="createGradeName" name="name" required disabled={isLoading} /></div>
              <div className="form-group"><label htmlFor="createGradeShortName">Nombre Corto:</label><input type="text" id="createGradeShortName" name="shortName" required disabled={isLoading} /></div>
              <div className="form-group"><label htmlFor="createGradeLevel">Nivel:</label><input type="text" id="createGradeLevel" name="level" disabled={isLoading} /></div>
              <div className="form-group"><label htmlFor="createGradeSection">Sección:</label><input type="text" id="createGradeSection" name="section" disabled={isLoading} /></div>
              <div className="form-group"><label htmlFor="createTutorId">Tutor (Opcional):</label>
                  <select id="createTutorId" name="tutorId" defaultValue="" disabled={isLoading || teachersList.length === 0}>
                      <option value="">-- Sin tutor --</option>
                      {teachersList.map(p => (<option key={p.id} value={p.id}>{p.displayName || `${p.firstName} ${p.lastName}`} ({p.email})</option>))}
                  </select>{teachersList.length === 0 && !isLoading && <small>No hay profesores.</small>}</div>
              <div className="form-actions">
                  <button type="submit" className="submit-button" disabled={isLoading}>{isLoading ? 'Creando...' : 'Crear Grado'}</button>
                  <button type="button" onClick={handleBackToMenu} className="cancel-button" disabled={isLoading}>Cancelar</button>
              </div>
          </form></div>)}
      {(currentView === 'view' || currentView === 'selectToEdit' || currentView === 'selectToDelete') && !isLoading && (
        <div className="view-grades-list-container"><h2>{currentView === 'view' ? 'Lista de Grados' : currentView === 'selectToEdit' ? 'Modificar Grado' : 'Eliminar Grado'}</h2>
            {gradesList.length > 0 ? (<ul className="grades-list"> 
                    {gradesList.map(grade => (<li key={grade.id} className="grade-list-item">
                            <span>{grade.name} ({grade.shortName || 'N/A'}) {grade.level && `- ${grade.level}`}{grade.section && ` / ${grade.section}`}</span>
                            {grade.tutorId && teachersList.find(t => t.id === grade.tutorId) && <span className="tutor-info">Tutor: {teachersList.find(t => t.id === grade.tutorId)?.displayName || 'N/A'}</span>}
                            <div className="grade-actions">
                                {currentView === 'selectToEdit' && (<button onClick={() => handleSelectGradeToEdit(grade)} disabled={isLoading} className="edit-button">Modificar</button>)}
                                {currentView === 'selectToDelete' && (<button onClick={() => handleConfirmDeleteGrade(grade)} disabled={isLoading} className="delete-button">Eliminar</button>)}
                            </div></li>))}</ul>) 
            : (<p>No hay grados.</p>)}</div>)}
      {currentView === 'editingGradeForm' && selectedGrade && (
        <div className="edit-grade-form-container"><h2>Modificando Grado: {selectedGrade.name}</h2>
          <form onSubmit={handleSaveEditedGrade} className="grade-form">
            <div className="form-group"><label htmlFor="editGradeName">Nombre:</label><input type="text" id="editGradeName" name="name" value={editingFormData.name} onChange={handleEditingFormChange} required disabled={isLoading} /></div>
            <div className="form-group"><label htmlFor="editGradeShortName">Nombre Corto:</label><input type="text" id="editGradeShortName" name="shortName" value={editingFormData.shortName} onChange={handleEditingFormChange} required disabled={isLoading} /></div>
            <div className="form-group"><label htmlFor="editGradeLevel">Nivel:</label><input type="text" id="editGradeLevel" name="level" value={editingFormData.level} onChange={handleEditingFormChange} disabled={isLoading} /></div>
            <div className="form-group"><label htmlFor="editGradeSection">Sección:</label><input type="text" id="editGradeSection" name="section" value={editingFormData.section} onChange={handleEditingFormChange} disabled={isLoading} /></div>
            <div className="form-group"><label htmlFor="editTutorId">Tutor (Opcional):</label>
              <select id="editTutorId" name="tutorId" value={editingFormData.tutorId} onChange={handleEditingFormChange} disabled={isLoading || teachersList.length === 0}>
                <option value="">-- Sin tutor --</option>
                {teachersList.map(p => (<option key={p.id} value={p.id}>{p.displayName || `${p.firstName} ${p.lastName}`} ({p.email})</option>))}
              </select>{teachersList.length === 0 && !isLoading && <small>No hay profesores.</small>}</div>
            <div className="form-actions">
              <button type="submit" className="submit-button" disabled={isLoading}>{isLoading ? 'Guardando...' : 'Guardar'}</button>
              <button type="button" onClick={handleBackToSelectionOrMenu} className="cancel-button" disabled={isLoading}>Cancelar</button>
            </div>
          </form></div>)}
    </div>
  );
}
export default GestionarGradosAdmin;