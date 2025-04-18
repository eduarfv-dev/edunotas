import React, { useState } from 'react';
import CreateUserForm from './CreateUserForm';
import { functions } from '../../firebase';
import { httpsCallable } from "firebase/functions";
import './ManageUsers.css';

function ManageUsers({ onBack }) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [roleToCreate, setRoleToCreate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleModifyUsers = (userType) => {
    console.log(`Admin: Modificar ${userType}`);
    alert(`Funcionalidad "Modificar ${userType}" no implementada.`);
    setError('');
    setSuccessMessage('');
  };

  const handleShowCreateForm = (role) => {
    setRoleToCreate(role);
    setShowCreateForm(true);
    setError('');
    setSuccessMessage('');
  };

  const handleCloseCreateForm = () => {
    setShowCreateForm(false);
    setRoleToCreate('');
  };

  const handleCreateUser = async (userData) => {
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const createUserFunction = httpsCallable(functions, 'createUser');
      const result = await createUserFunction(userData);

      if (result.data.success) {
        setSuccessMessage(`Usuario ${userData.role} creado: ${userData.email}`);
        handleCloseCreateForm();
      } else {
        throw new Error(result.data.error || 'Error desconocido al crear usuario.');
      }

    } catch (err) {
      console.error("Error al llamar a la función createUser:", err);
      setError(err.message || 'Error al crear el usuario.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="manage-users-container">
      <button onClick={onBack} className="manage-users-back-button">
        Regresar
      </button>

      <div className="manage-users-header">
        <h1>Gestión de Usuarios</h1>
      </div>

      {isLoading && <p className="loading-message">Procesando...</p>}
      {error && <p className="error-message">{error}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}

      <div className="manage-users-content">
        <div className="manage-users-modify-section">
          <h2>Seleccione usuarios a modificar:</h2>
          <ul>
            <li onClick={() => handleModifyUsers('profesores')}>
              Profesores <span className="manage-users-icon">✎</span>
            </li>
            <li onClick={() => handleModifyUsers('estudiantes')}>
              Estudiantes <span className="manage-users-icon">✎</span>
            </li>
            <li onClick={() => handleModifyUsers('administrativos')}>
              Administrativos <span className="manage-users-icon">✎</span>
            </li>
          </ul>
        </div>
        <div className="manage-users-create-section">
          <h2>Seleccione usuarios a crear:</h2>
          <ul>
            <li onClick={() => handleShowCreateForm('teacher')}>
              Profesores <span className="manage-users-icon">+</span>
            </li>
            <li onClick={() => handleShowCreateForm('student')}>
              Estudiantes <span className="manage-users-icon">+</span>
            </li>
            <li onClick={() => handleShowCreateForm('admin')}>
              Administrativos <span className="manage-users-icon">+</span>
            </li>
          </ul>
        </div>
      </div>

      {showCreateForm && (
        <CreateUserForm
          role={roleToCreate}
          onSubmit={handleCreateUser}
          onCancel={handleCloseCreateForm}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}

export default ManageUsers;