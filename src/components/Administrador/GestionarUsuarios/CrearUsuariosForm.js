// src/components/Administrador/GestionarUsuarios/CreateUserForm.js
import React, { useState } from 'react';
import './CrearUsuariosForm.css'; 

// --- AÑADIR gradesList A LAS PROPS ---
function CreateUserForm({ role, onSubmit, onCancel, isLoading, serverError, serverSuccess, gradesList }) { 
// -----------------------------------
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  // --- NUEVO ESTADO PARA EL ID DEL GRADO SELECCIONADO ---
  const [selectedGradeId, setSelectedGradeId] = useState('');
  // ----------------------------------------------------
  const [formError, setFormError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    setFormError(''); 

    if (!email || !password || !confirmPassword || !firstName || !lastName) {
      setFormError('Todos los campos son obligatorios.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setFormError('Ingresa un correo electrónico válido.');
      return;
    }
    if (password.length < 6) {
      setFormError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setFormError('Las contraseñas no coinciden.');
      return;
    }
    // --- VALIDACIÓN PARA ESTUDIANTES: ASEGURAR QUE SE SELECCIONE UN GRADO ---
    if (role === 'student' && !selectedGradeId) {
        setFormError('Debes seleccionar un grado para el estudiante.');
        return;
    }
    // ----------------------------------------------------------------------

    const userData = {
      email,
      password,
      role,
      firstName,
      lastName,
      displayName: `${firstName} ${lastName}`,
      // --- AÑADIR gradeId SI ES ESTUDIANTE ---
      ...(role === 'student' && { gradeId: selectedGradeId })
      // -------------------------------------
    };

    onSubmit(userData);
  };

  const getRoleName = (roleCode) => {
      switch(roleCode) {
          case 'teacher': return 'Profesor';
          case 'student': return 'Estudiante';
          case 'admin': return 'Administrativo';
          default: return 'Usuario';
      }
  }

  return (
    <div className="create-user-form-overlay">
      <div className="create-user-form-container">
        <h2>Crear Nuevo {getRoleName(role)}</h2>
        
        {serverError && <p className="error-message server-feedback-message">{serverError}</p>}
        {serverSuccess && <p className="success-message server-feedback-message">{serverSuccess}</p>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Correo Electrónico:</label>
            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading || !!serverSuccess} />
          </div>
          <div className="form-group">
            <label htmlFor="firstName">Nombres:</label>
            <input type="text" id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required disabled={isLoading || !!serverSuccess} />
          </div>
           <div className="form-group">
            <label htmlFor="lastName">Apellidos:</label>
            <input type="text" id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required disabled={isLoading || !!serverSuccess} />
          </div>
          <div className="form-group">
            <label htmlFor="password">Contraseña:</label>
            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength="6" disabled={isLoading || !!serverSuccess} />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar Contraseña:</label>
            <input type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength="6" disabled={isLoading || !!serverSuccess} />
          </div>

          {/* --- SELECTOR DE GRADO PARA ESTUDIANTES --- */}
          {role === 'student' && (
            <div className="form-group">
              <label htmlFor="gradeId">Grado Asignado:</label>
              <select 
                id="gradeId" 
                value={selectedGradeId} 
                onChange={(e) => setSelectedGradeId(e.target.value)} 
                required 
                disabled={isLoading || !!serverSuccess || !gradesList || gradesList.length === 0}
              >
                <option value="">-- Seleccione un grado --</option>
                {gradesList && gradesList.map(grade => (
                  <option key={grade.id} value={grade.id}>
                    {grade.name} ({grade.shortName || 'N/A'})
                  </option>
                ))}
              </select>
              {(!gradesList || gradesList.length === 0) && !isLoading && !serverSuccess && <small>No hay grados disponibles para asignar.</small>}
            </div>
          )}
          {/* ------------------------------------------- */}

          {formError && <p className="error-message form-error-message">{formError}</p>}

          <div className="form-actions">
            {serverSuccess ? (
              <button type="button" onClick={onCancel} className="submit-button">
                Cerrar
              </button>
            ) : (
              <>
                <button type="button" onClick={onCancel} disabled={isLoading} className="cancel-button">
                  Cancelar
                </button>
                <button type="submit" disabled={isLoading} className="submit-button">
                  {isLoading ? 'Creando...' : 'Crear Usuario'}
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateUserForm;