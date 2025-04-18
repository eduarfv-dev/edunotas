import React from 'react';
import './ManageUsers.css'; 

function ManageUsers({ onBack }) { 

  const handleModifyUsers = (userType) => {
      console.log(`Admin: Modificar ${userType}`);
      alert(`Funcionalidad "Modificar ${userType}" no implementada.`);
  };

  const handleCreateUsers = (userType) => {
       console.log(`Admin: Crear ${userType}`);
      alert(`Funcionalidad "Crear ${userType}" no implementada.`);
  };

  return (
    <div className="manage-users-container">
      <button onClick={onBack} className="manage-users-back-button">
        Regresar
      </button>
      
      <div className="manage-users-header">
        <h1>Gestión de Usuarios</h1>
      </div>

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
            <li onClick={() => handleCreateUsers('profesores')}>
              Profesores <span className="manage-users-icon">+</span>
            </li>
            <li onClick={() => handleCreateUsers('estudiantes')}>
              Estudiantes <span className="manage-users-icon">+</span>
            </li>
            <li onClick={() => handleCreateUsers('administrativos')}>
              Administrativos <span className="manage-users-icon">+</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ManageUsers;