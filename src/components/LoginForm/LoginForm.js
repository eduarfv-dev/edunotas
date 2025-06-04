import React, { useState } from 'react';
import { auth } from '../../firebase';
import { signInWithEmailAndPassword } from "firebase/auth";
import './LoginForm.css';

function LoginForm({ onForgotPassword, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const authUser = userCredential.user;
      // console.log("Inicio de sesión exitoso con Firebase:", authUser); 
      if (onLoginSuccess) {
        onLoginSuccess(authUser);
      }
    } catch (err) {
      // console.error("Error de inicio de sesión Firebase:", err.code, err.message);
      let errorMessage = "Error al iniciar sesión. Inténtalo de nuevo.";
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        errorMessage = "Correo o contraseña incorrectos.";
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = "El formato del correo electrónico no es válido.";
      } else if (err.code === 'auth/too-many-requests') {
          errorMessage = "Demasiados intentos fallidos. Intenta más tarde o recupera tu contraseña.";
      } else if (err.code === 'auth/network-request-failed') {
          errorMessage = "Error de red. Verifica tu conexión a internet.";
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} aria-labelledby="login-heading">
      <h1 id="login-heading">Bienvenido a EDUNOTAS</h1>
      
      {error && <p id="login-error-id" className="login-error-message" role="alert">{error}</p>}
      
      <div className="input-group">
        <label htmlFor="email" className="sr-only">Correo Electrónico</label>
        <i className='bx bxs-envelope' aria-hidden="true"></i>
        <input
          type="email"
          id="email"
          placeholder="Correo Electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          aria-required="true"
          disabled={loading}
          aria-describedby={error ? "login-error-id" : undefined}
        />
      </div>
      
      <div className="input-group">
        <label htmlFor="password" className="sr-only">Contraseña</label>
        <i className='bx bxs-lock-alt' aria-hidden="true"></i>
        <input
          type="password"
          id="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          aria-required="true"
          disabled={loading}
          aria-describedby={error ? "login-error-id" : undefined}
        />
      </div>
      
      <div className="remember">
        <span/> 
        <button
          type="button"
          onClick={(e) => {
            if (!loading && onForgotPassword) onForgotPassword();
          }}
          className="forgot-password-link" 
          disabled={loading}
        >
          ¿Olvidó su contraseña?
        </button>
      </div>
      
      <input
        type="submit"
        className="btn-1"
        value={loading ? "Ingresando..." : "Ingresar"}
        disabled={loading}
      />
    </form>
  );
}
export default LoginForm;