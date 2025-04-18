import React, { useState } from 'react';
import './PasswordRecoveryForm.css'; 
// Importa la imagen desde la carpeta assets
import recoveryIconUrl from '../../assets/logocontrasena.png'; 

function PasswordRecoveryForm({ onBack }) { 
  const [documentNumber, setDocumentNumber] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log('Solicitud de recuperación enviada:');
    console.log('Documento:', documentNumber);
    console.log('Correo:', email);
    alert('Se ha enviado la solicitud de recuperación (simulado).');
  };

  const handleBackClick = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };

  return (
    <div className="recovery-content"> 
      {/* Aplica la imagen importada como estilo inline */}
      <div 
        className="recovery-icon" 
        style={{ backgroundImage: `url(${recoveryIconUrl})` }}
      ></div> 
      <h1>¿Ha olvidado su contraseña?</h1>
      <p>Ingrese su documento y correo electrónico para hacerle el envío de una nueva contraseña.</p>
      
      <form onSubmit={handleSubmit}>
        <div className="recovery-input-group"> 
          <i className='bx bx-id-card'></i>
          <input
            type="number"
            placeholder="Documento"
            value={documentNumber}
            onChange={(e) => setDocumentNumber(e.target.value)}
            required
            id="recovery-document"
          />
        </div>
        <div className="recovery-input-group"> 
          <i className='bx bxs-envelope'></i>
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            id="recovery-email"
          />
        </div>
        <div className="recovery-buttons"> 
          <button type="button" onClick={handleBackClick}>
            Volver
          </button>
          <button type="submit">
            Enviar
          </button>
        </div>
      </form>
    </div>
  );
}

export default PasswordRecoveryForm;