import React, { useState } from 'react';
import './CrearUsuariosForm.css';

function CreateUserForm({ role, onSubmit, onCancel, isLoading }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
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

    const userData = {
      email,
      password,
      role,
      firstName,
      lastName,
      displayName: `${firstName} ${lastName}`
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
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Correo Electrónico:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="firstName">Nombres:</label>
            <input
              type="text"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
           <div className="form-group">
            <label htmlFor="lastName">Apellidos:</label>
            <input
              type="text"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Contraseña:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength="6"
              disabled={isLoading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar Contraseña:</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength="6"
              disabled={isLoading}
            />
          </div>

          {formError && <p className="error-message form-error-message">{formError}</p>}

          <div className="form-actions">
            <button type="button" onClick={onCancel} disabled={isLoading} className="cancel-button">
              Cancelar
            </button>
            <button type="submit" disabled={isLoading} className="submit-button">
              {isLoading ? 'Creando...' : 'Crear Usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateUserForm;