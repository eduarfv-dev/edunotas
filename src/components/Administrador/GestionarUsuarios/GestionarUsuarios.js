// src/components/Administrador/GestionarUsuarios/ManageUsers.js
import React, { useState, useEffect, useCallback } from 'react';
import './GestionarUsuarios.css'; 
import CreateUserForm from './CrearUsuariosForm'; 
import { db, auth } from '../../../firebase'; 
import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp, setDoc, deleteDoc, orderBy } from "firebase/firestore";
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { logAuditEvent } from '../../../utils/auditLogger'; // Ajusta la ruta si es necesario

const gradosCollectionRef = collection(db, "grados");

function ManageUsers({ onBack }) {
  const [currentView, setCurrentView] = useState('menu'); 
  const [roleToCreate, setRoleToCreate] = useState('');
  const [usersFromDB, setUsersFromDB] = useState([]); 
  const [filteredUsers, setFilteredUsers] = useState([]); 
  const [userTypeForModificationTitle, setUserTypeForModificationTitle] = useState(''); 
  const [editingUser, setEditingUser] = useState(null); 
  const [editingUserFormData, setEditingUserFormData] = useState({}); 
  const [searchTerm, setSearchTerm] = useState('');
  const [gradesList, setGradesList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchGrades = useCallback(async () => {
    try {
      const q = query(gradosCollectionRef, orderBy("name", "asc"));
      const querySnapshot = await getDocs(q);
      setGradesList(querySnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() })));
    } catch (err) { console.error("Error fetching grades: ", err); setGradesList([]); }
  }, []);

  const fetchUsersByRole = useCallback(async (roleKeyForFirestore) => {
    if (!roleKeyForFirestore) { setUsersFromDB([]); setFilteredUsers([]); return; }
    setIsLoading(true); setError('');
    try {
      const usersCollectionRef = collection(db, "usuarios");
      const q = query(usersCollectionRef, where("role", "==", roleKeyForFirestore), orderBy("displayName", "asc"));
      const querySnapshot = await getDocs(q);
      const usersList = querySnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
      setUsersFromDB(usersList); setFilteredUsers(usersList); 
    } catch (err) {
      console.error(`Error fetching ${userTypeForModificationTitle}s: `, err);
      setError(`Error al cargar ${userTypeForModificationTitle.toLowerCase()}.`);
      setUsersFromDB([]); setFilteredUsers([]);
    }
    setIsLoading(false);
  }, [userTypeForModificationTitle]);

  useEffect(() => {
    if (currentView === 'listUsersToModify' && userTypeForModificationTitle) {
      let roleKey = '';
      if (userTypeForModificationTitle === 'Profesores') roleKey = 'teacher';
      else if (userTypeForModificationTitle === 'Estudiantes') { roleKey = 'student'; fetchGrades(); }
      else if (userTypeForModificationTitle === 'Administrativos') roleKey = 'admin';
      if (roleKey) { fetchUsersByRole(roleKey); }
    }
    if ((currentView === 'createForm' && roleToCreate === 'student') || 
        (currentView === 'editingUserForm' && editingUser?.role === 'student')) {
      fetchGrades();
    }
  }, [currentView, userTypeForModificationTitle, fetchUsersByRole, fetchGrades, roleToCreate, editingUser]);

  useEffect(() => {
    if (currentView === 'listUsersToModify') {
      if (searchTerm.trim() === '') { setFilteredUsers(usersFromDB); } 
      else {
        const lowercasedFilter = searchTerm.toLowerCase();
        const filteredData = usersFromDB.filter(user => {
          const gradeName = user.role === 'student' && user.gradeId && gradesList.length > 0 ? gradesList.find(g => g.id === user.gradeId)?.name || '' : user.grade || '';
          return (user.displayName?.toLowerCase().includes(lowercasedFilter)) || (user.firstName?.toLowerCase().includes(lowercasedFilter)) || 
                 (user.lastName?.toLowerCase().includes(lowercasedFilter)) || (user.email?.toLowerCase().includes(lowercasedFilter)) ||
                 (user.subject && user.role === 'teacher' && user.subject.toLowerCase().includes(lowercasedFilter)) ||
                 (gradeName && user.role === 'student' && gradeName.toLowerCase().includes(lowercasedFilter)) ||
                 (user.department && user.role === 'admin' && user.department.toLowerCase().includes(lowercasedFilter));
        });
        setFilteredUsers(filteredData);
      }
    }
  }, [searchTerm, usersFromDB, currentView, gradesList]);

  const handleModifyUsers = (userTypeKey) => { 
    let typeTitle = '';
    if (userTypeKey === 'profesores') typeTitle = 'Profesores';
    else if (userTypeKey === 'estudiantes') typeTitle = 'Estudiantes';
    else if (userTypeKey === 'administrativos') typeTitle = 'Administrativos';
    setUserTypeForModificationTitle(typeTitle); setCurrentView('listUsersToModify');
    setSearchTerm(''); setError(''); setSuccessMessage('');
  };
  const handleShowCreateForm = (role) => { setRoleToCreate(role); setCurrentView('createForm'); setError(''); setSuccessMessage(''); };
  const handleBackToUserMenu = () => { setCurrentView('menu'); setUsersFromDB([]); setFilteredUsers([]); setUserTypeForModificationTitle(''); setEditingUser(null); setEditingUserFormData({}); setSearchTerm(''); setError(''); setSuccessMessage(''); };
  const handleShowEditUserForm = (userToEdit) => {
    setEditingUser(userToEdit);
    setEditingUserFormData({ id: userToEdit.id, email: userToEdit.email || '', firstName: userToEdit.firstName || '', lastName: userToEdit.lastName || '', displayName: userToEdit.displayName || '', role: userToEdit.role, 
        subject: userToEdit.role === 'teacher' ? userToEdit.subject || '' : undefined,
        gradeId: userToEdit.role === 'student' ? userToEdit.gradeId || '' : undefined, 
        age: userToEdit.role === 'student' ? userToEdit.age || '' : undefined,
        department: userToEdit.role === 'admin' ? userToEdit.department || '' : undefined,
        isDisabled: userToEdit.isDisabled || false });
    setCurrentView('editingUserForm'); setError(''); setSuccessMessage('');
  };
  
  const handleCreateUserSubmitFirebase = async (userDataFromForm) => {
    setIsLoading(true); setError(''); setSuccessMessage('');  
    let createdUserId = null; const adminUser = auth.currentUser; 
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, userDataFromForm.email, userDataFromForm.password);
      createdUserId = userCredential.user.uid; 
      const userDocRef = doc(db, "usuarios", createdUserId);
      const dataToSave = { uid: createdUserId, email: userDataFromForm.email, role: userDataFromForm.role, firstName: userDataFromForm.firstName, lastName: userDataFromForm.lastName, displayName: userDataFromForm.displayName, isDisabled: false, createdAt: serverTimestamp(),
        ...(userDataFromForm.role === 'teacher' && { subject: '' }),
        ...(userDataFromForm.role === 'student' && { gradeId: userDataFromForm.gradeId || '', age: null }),
        ...(userDataFromForm.role === 'admin' && { department: '' }),};
      await setDoc(userDocRef, dataToSave);
      setSuccessMessage(`Usuario ${userDataFromForm.displayName} (${userDataFromForm.role}) creado.`);
      if (adminUser) {
        logAuditEvent('USER_CREATED', { performedByUserId: adminUser.uid, performedByUserDisplayName: adminUser.displayName || adminUser.email,
          targetEntityType: "USUARIO", targetEntityId: createdUserId, targetEntityDescription: `Email: ${userDataFromForm.email}, Rol: ${userDataFromForm.role}`,
          details: { roleCreated: userDataFromForm.role, email: userDataFromForm.email, name: userDataFromForm.displayName, ...(userDataFromForm.role === 'student' && { assignedGradeId: userDataFromForm.gradeId }) }});
      }
    } catch (err) { 
      let msg = "Error al crear usuario."; if (err.code === 'auth/email-already-in-use') msg = 'Correo ya registrado.'; else if (err.code === 'auth/weak-password') msg = 'Contraseña débil.'; else if (err.code === 'auth/invalid-email') msg = 'Correo inválido.'; else if (err.code === 'permission-denied') msg = 'Sin permisos.'; setError(msg);
      if (adminUser) { logAuditEvent('USER_CREATION_FAILED', { performedByUserId: adminUser.uid, performedByUserDisplayName: adminUser.displayName || adminUser.email, targetEntityType: "USUARIO", targetEntityDescription: `Intento: ${userDataFromForm.email}, Rol: ${userDataFromForm.role}`, details: { error: err.message, errorCode: err.code, formData: { email: userDataFromForm.email, role: userDataFromForm.role } }});}
    } finally { setIsLoading(false); }
  };
  
  const handleEditingUserFormChange = (e) => { const { name, value, type, checked } = e.target; setEditingUserFormData(prevData => ({ ...prevData, [name]: type === 'checkbox' ? checked : value }));};

  const handleSaveEditedUser = async (e) => {
    e.preventDefault(); setIsLoading(true); setError(''); setSuccessMessage('');
    const adminUser = auth.currentUser;
    if (!editingUserFormData.id) { setError("ID de usuario no encontrado."); setIsLoading(false); return; }
    try {
      const userDocRef = doc(db, "usuarios", editingUserFormData.id);
      const originalUserData = usersFromDB.find(u => u.id === editingUserFormData.id) || editingUser; 
      const dataToUpdate = {
        firstName: editingUserFormData.firstName, lastName: editingUserFormData.lastName,
        displayName: `${editingUserFormData.firstName} ${editingUserFormData.lastName}`, 
        updatedAt: serverTimestamp(),
        ...(editingUser.role === 'teacher' && { subject: editingUserFormData.subject || '' }),
        ...(editingUser.role === 'student' && { gradeId: editingUserFormData.gradeId || '', age: editingUserFormData.age ? Number(editingUserFormData.age) : null }),
        ...(editingUser.role === 'admin' && { department: editingUserFormData.department || '' }),
      };
      await updateDoc(userDocRef, dataToUpdate);
      setSuccessMessage(`Usuario ${dataToUpdate.displayName} actualizado.`);
      if (adminUser) {
        const changedFields = {};
        Object.keys(dataToUpdate).forEach(key => { if (dataToUpdate[key] !== originalUserData[key] && key !== 'updatedAt') { changedFields[key] = { from: originalUserData[key] === undefined ? 'N/A' : originalUserData[key], to: dataToUpdate[key] };}});
        logAuditEvent('USER_UPDATED', { performedByUserId: adminUser.uid, performedByUserDisplayName: adminUser.displayName || adminUser.email,
          targetEntityType: "USUARIO", targetEntityId: editingUserFormData.id, targetEntityDescription: `Usuario: ${dataToUpdate.displayName} (Rol: ${editingUser.role})`,
          details: { changes: changedFields }});
      }
      let roleKeyForRefresh = editingUser.role; 
      if (roleKeyForRefresh) fetchUsersByRole(roleKeyForRefresh); 
      setTimeout(() => { setSuccessMessage(''); setCurrentView('listUsersToModify'); setEditingUser(null); }, 2000); 
    } catch (err) {
      setError(err.message || 'Error al guardar.');
      if (adminUser) {
        logAuditEvent('USER_UPDATE_FAILED', { performedByUserId: adminUser.uid, performedByUserDisplayName: adminUser.displayName || adminUser.email,
            targetEntityType: "USUARIO", targetEntityId: editingUserFormData.id, targetEntityDescription: `Usuario: ${editingUserFormData.displayName}`,
            details: { error: err.message, attemptData: editingUserFormData }});
      }
    } finally { setIsLoading(false); }
  };

  const handleDeleteUserFirestore = async (userIdToDelete, userName) => {
    if (window.confirm(`¿Eliminar datos de "${userName}" de Firestore? (No afecta Autenticación)`)) {
      setIsLoading(true); setError(''); setSuccessMessage('');
      const adminUser = auth.currentUser;
      const userToDeleteData = usersFromDB.find(u => u.id === userIdToDelete); // Para loguear más info

      try {
        await deleteDoc(doc(db, "usuarios", userIdToDelete));
        setSuccessMessage(`Datos de "${userName}" eliminados de Firestore.`);
        if (adminUser) {
          logAuditEvent('USER_FIRESTORE_DELETED', { performedByUserId: adminUser.uid, performedByUserDisplayName: adminUser.displayName || adminUser.email,
            targetEntityType: "USUARIO", targetEntityId: userIdToDelete, targetEntityDescription: `Usuario: ${userName} (Rol: ${userToDeleteData?.role || 'N/A'})`});
        }
        // Inferir rol para recargar la lista correcta
        let roleKeyForRefresh = userToDeleteData?.role;
        if (!roleKeyForRefresh && userTypeForModificationTitle) {
            if (userTypeForModificationTitle === 'Profesores') roleKeyForRefresh = 'teacher';
            else if (userTypeForModificationTitle === 'Estudiantes') roleKeyForRefresh = 'student';
            else if (userTypeForModificationTitle === 'Administrativos') roleKeyForRefresh = 'admin';
        }
        if (roleKeyForRefresh) fetchUsersByRole(roleKeyForRefresh); else handleBackToUserMenu();

      } catch (err) {
        setError(`Error al eliminar: ${err.message}`);
        if (adminUser) {
          logAuditEvent('USER_FIRESTORE_DELETE_FAILED', { performedByUserId: adminUser.uid, performedByUserDisplayName: adminUser.displayName || adminUser.email,
            targetEntityType: "USUARIO", targetEntityId: userIdToDelete, targetEntityDescription: `Usuario: ${userName}`, details: { error: err.message }});
        }
      } finally { setIsLoading(false); setTimeout(() => { setSuccessMessage(''); setError(''); }, 3000); }
    }
  };

  const handleToggleUserDisabledStatus = async (userToToggle) => {
    const newDisabledStatus = !(userToToggle.isDisabled || false); 
    const actionText = newDisabledStatus ? "inhabilitar" : "habilitar";
    if (window.confirm(`¿${actionText} al usuario "${userToToggle.displayName}"?`)) {
      setIsLoading(true); setError(''); setSuccessMessage('');
      const adminUser = auth.currentUser;
      try {
        const userDocRef = doc(db, "usuarios", userToToggle.id);
        await updateDoc(userDocRef, { isDisabled: newDisabledStatus, updatedAt: serverTimestamp() });
        setSuccessMessage(`Usuario "${userToToggle.displayName}" ${newDisabledStatus ? "inhabilitado" : "habilitado"}.`);
        if (adminUser) {
          logAuditEvent(newDisabledStatus ? 'USER_DISABLED' : 'USER_ENABLED', { performedByUserId: adminUser.uid, performedByUserDisplayName: adminUser.displayName || adminUser.email,
            targetEntityType: "USUARIO", targetEntityId: userToToggle.id, targetEntityDescription: `Usuario: ${userToToggle.displayName} (Rol: ${userToToggle.role})`,
            details: { newStatus: newDisabledStatus }});
        }
        setUsersFromDB(prevUsers => prevUsers.map(u => u.id === userToToggle.id ? { ...u, isDisabled: newDisabledStatus } : u));
        setFilteredUsers(prevUsers => prevUsers.map(u => u.id === userToToggle.id ? { ...u, isDisabled: newDisabledStatus } : u));
      } catch (err) {
        setError(`Error al ${actionText}: ${err.message}`);
        if (adminUser) {
          logAuditEvent(newDisabledStatus ? 'USER_DISABLE_FAILED' : 'USER_ENABLE_FAILED', { performedByUserId: adminUser.uid, performedByUserDisplayName: adminUser.displayName || adminUser.email,
            targetEntityType: "USUARIO", targetEntityId: userToToggle.id, targetEntityDescription: `Usuario: ${userToToggle.displayName}`, details: { error: err.message }});
        }
      } finally { setIsLoading(false); setTimeout(() => { setSuccessMessage(''); setError(''); }, 3000); }
    }
  };

  if (currentView === 'createForm') {
    return <CreateUserForm role={roleToCreate} onSubmit={handleCreateUserSubmitFirebase} onCancel={handleBackToUserMenu} 
                           isLoading={isLoading} serverError={error} serverSuccess={successMessage} 
                           gradesList={roleToCreate === 'student' ? gradesList : []} />;
  }

  if (currentView === 'listUsersToModify') {
    return (
      <div className="manage-users-container view-user-list">
        <button onClick={handleBackToUserMenu} className="manage-users-back-button subview-back-button">Regresar al Menú</button>
        <h2>{userTypeForModificationTitle}</h2>
        <input type="text" placeholder={`Buscar en ${userTypeForModificationTitle.toLowerCase()}...`}
          value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="user-search-input" />
        {isLoading && <p className="loading-message">Cargando...</p>}
        {error && !isLoading && <p className="error-message">{error}</p>} 
        {successMessage && !isLoading && <p className="success-message">{successMessage}</p>}
        {!isLoading && !error && filteredUsers.length === 0 && (<p className="no-users-message">No hay {userTypeForModificationTitle.toLowerCase()} para mostrar {searchTerm ? `que coincidan con "${searchTerm}"` : ''}.</p>)}
        {!isLoading && !error && filteredUsers.length > 0 && (
          <ul className="user-list-modify">
            {filteredUsers.map(user => {
              const gradeName = user.role === 'student' && user.gradeId && gradesList.length > 0 ? gradesList.find(g => g.id === user.gradeId)?.name || 'S/G' : (user.grade || '');
              return (
                <li key={user.id} className={`user-list-item-modify ${user.isDisabled ? 'user-disabled' : ''}`}>
                  <div className="user-info">
                    <strong>{user.displayName || `${user.firstName} ${user.lastName}`}</strong> 
                    <span>({user.email}) {user.isDisabled && <span className="disabled-tag">(Inhab.)</span>}</span>
                    {user.role === 'teacher' && user.subject && <span className="user-detail">M: {user.subject}</span>}
                    {user.role === 'student' && gradeName && <span className="user-detail">G: {gradeName}</span>}
                    {user.role === 'admin' && user.department && <span className="user-detail">Dpto: {user.department}</span>}
                  </div>
                  <div className="user-actions-buttons">
                    <button onClick={() => handleShowEditUserForm(user)} className="edit-button">Editar</button>
                    <button onClick={() => handleToggleUserDisabledStatus(user)} className={`toggle-disable-button ${user.isDisabled ? 'enable-button' : 'disable-button'}`}>{user.isDisabled ? 'Habilitar' : 'Inhab.'}</button>
                    <button onClick={() => handleDeleteUserFirestore(user.id, user.displayName || `${user.firstName} ${user.lastName}`)} className="delete-button">Eliminar</button>
                  </div>
                </li>);
            })}
          </ul>
        )}
      </div>);
  }

  if (currentView === 'editingUserForm' && editingUser) {
    return (
        <div className="manage-users-container view-edit-form">
          <button onClick={() => { setCurrentView('listUsersToModify'); setError(''); setSuccessMessage('');}} className="manage-users-back-button subview-back-button">Regresar a Lista</button>
          <h2>Editando: {editingUserFormData.displayName || `${editingUserFormData.firstName} ${editingUserFormData.lastName}`}</h2>
          <form onSubmit={handleSaveEditedUser} className="user-edit-form-actual">
            <div className="form-group"><label htmlFor="firstName">Nombres:</label><input type="text" id="firstName" name="firstName" value={editingUserFormData.firstName || ''} onChange={handleEditingUserFormChange} required /></div>
            <div className="form-group"><label htmlFor="lastName">Apellidos:</label><input type="text" id="lastName" name="lastName" value={editingUserFormData.lastName || ''} onChange={handleEditingUserFormChange} required /></div>
            <div className="form-group"><label htmlFor="email">Email: <span className="field-note">(No editable)</span></label><input type="email" id="email" name="email" value={editingUserFormData.email || ''}  disabled /></div>
            {editingUser.role === 'teacher' && (<div className="form-group"><label htmlFor="subject">Materia:</label><input type="text" id="subject" name="subject" value={editingUserFormData.subject || ''} onChange={handleEditingUserFormChange} /></div>)}
            {editingUser.role === 'student' && (<>
                <div className="form-group"><label htmlFor="gradeId">Grado:</label>
                  <select id="gradeId" name="gradeId" value={editingUserFormData.gradeId || ''} onChange={handleEditingUserFormChange} disabled={isLoading || gradesList.length === 0}>
                    <option value="">-- Seleccione --</option>
                    {gradesList.map(grade => (<option key={grade.id} value={grade.id}>{grade.name} ({grade.shortName || 'N/A'})</option>))}
                  </select>{gradesList.length === 0 && !isLoading && <small>No hay grados.</small>}</div>
                <div className="form-group"><label htmlFor="age">Edad:</label><input type="number" id="age" name="age" value={editingUserFormData.age || ''} onChange={handleEditingUserFormChange} /></div></>)}
            {editingUser.role === 'admin' && (<div className="form-group"><label htmlFor="department">Departamento:</label><input type="text" id="department" name="department" value={editingUserFormData.department || ''} onChange={handleEditingUserFormChange} /></div>)}
            <div className="form-actions">
              <button type="submit" className="submit-button" disabled={isLoading}>{isLoading ? 'Guardando...' : 'Guardar'}</button>
              <button type="button" onClick={() => { setCurrentView('listUsersToModify'); setError(''); setSuccessMessage('');}} className="cancel-button" disabled={isLoading}>Cancelar</button>
            </div>
            {error && <p className="error-message form-feedback-message">{error}</p>}
            {successMessage && <p className="success-message form-feedback-message">{successMessage}</p>}
          </form>
        </div>);
  }

  return (
    <div className="manage-users-container">
      <button onClick={onBack} className="manage-users-back-button" id="backToPanelButton">Regresar al Panel</button>
      <div className="manage-users-header"><h1>Gestión de Usuarios</h1></div>
      <div className="manage-users-content">
        <div className="manage-users-modify-section">
          <h2>Modificar usuarios:</h2>
          <ul>
            <li onClick={() => handleModifyUsers('profesores')}>Profesores <span className="manage-users-icon">✎</span></li>
            <li onClick={() => handleModifyUsers('estudiantes')}>Estudiantes <span className="manage-users-icon">✎</span></li>
            <li onClick={() => handleModifyUsers('administrativos')}>Administrativos <span className="manage-users-icon">✎</span></li>
          </ul>
        </div>
        <div className="manage-users-create-section">
          <h2>Crear usuarios:</h2>
          <ul>
            <li onClick={() => handleShowCreateForm('teacher')}>Profesores <span className="manage-users-icon">+</span></li>
            <li onClick={() => handleShowCreateForm('student')}>Estudiantes <span className="manage-users-icon">+</span></li>
            <li onClick={() => handleShowCreateForm('admin')}>Administrativos <span className="manage-users-icon">+</span></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
export default ManageUsers;