import React from 'react';
import './ChatProfesorVista.css'; 

function TeacherChatView({ onBack }) { 
  return (
    <div className="teacher-chat-container">
      <button onClick={onBack} className="teacher-chat-back-button">
        Regresar
      </button>
      <div className="teacher-chat-content">
        <h1>Chat con Estudiantes</h1>
        <div className="teacher-chat-placeholder">
            <p>Funcionalidad de chat con estudiantes aún no implementada.</p>
            <p>(Aquí se mostraría la lista de chats o estudiantes).</p>
        </div>
      </div>
    </div>
  );
}
export default TeacherChatView;