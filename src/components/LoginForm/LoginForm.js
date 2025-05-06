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
      console.log("Inicio de sesión exitoso con Firebase:", authUser); 
      if (onLoginSuccess) {
        onLoginSuccess(authUser);
      }
    } catch (err) {
      console.error("Error de inicio de sesión Firebase:", err.code, err.message);
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
    <form onSubmit={handleSubmit}>
      <h2>Bienvenido a EDUNOTAS</h2>
      {error && <p className="login-error-message">{error}</p>}
      <div className="input-group">
        <i className='bx bxs-envelope'></i>
        <input
          type="email"
          id="email"
          placeholder="Correo Electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />
      </div>
      <div className="input-group">
        <i className='bx bxs-lock-alt'></i>
        <input
          type="password"
          id="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />
      </div>
      <div className="remember">
        <span/>
        <a
          href="#!"
          onClick={(e) => {
            e.preventDefault();
            if (!loading && onForgotPassword) onForgotPassword();
          }}
        >
          ¿Olvidó su contraseña?
        </a>
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