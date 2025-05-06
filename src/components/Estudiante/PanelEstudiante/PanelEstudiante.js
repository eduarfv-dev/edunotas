import React from 'react';
import './PanelEstudiante.css'; 
import userProfileImage from '../../../assets/logousuario.png';

function StudentDashboard({ username, onLogout, onNavigateToGrades, onNavigateToForum, onNavigateToChat }) { 

  const handleViewGrades = () => {
    console.log('Navegando a: Ver Calificaciones');
    if (onNavigateToGrades) {
      onNavigateToGrades(); 
    } else {
      alert('Error: Función de navegación (Grades) no encontrada.');
    }
  };

  const handleForumAccess = () => {
    console.log('Navegando a: Acceso al Foro');
    if (onNavigateToForum) {
        onNavigateToForum(); 
    } else {
        alert('Error: Función de navegación (Forum) no encontrada.');
    }
  };

  const handleChatWithTeacher = () => {
    console.log('Navegando a: Chat con Profesor');
    if (onNavigateToChat) {
        onNavigateToChat(); 
    } else {
        alert('Error: Función de navegación (Chat) no encontrada.');
    }
  };

  return (
    <div className="student-dashboard-container"> 
      <div className="student-profile">
        <img src={userProfileImage} alt="Foto de perfil" />
        <span>Estudiante</span>
      </div>
      <div className="student-header">¡Hey {username}, bienvenido de vuelta!</div>
      <div className="student-title">¿Qué quieres hacer hoy?</div>
      <div className="student-button-group">
        <div className="student-button-option">
          <i className='bx bxs-show'></i>
          <button onClick={handleViewGrades}>VER CALIFICACIONES</button>
        </div>
        <div className="student-button-option">
          <i className='bx bxs-user-voice'></i>
          <button onClick={handleForumAccess}>ACCESO AL FORO ESTUDIANTIL</button> 
        </div>
        <div className="student-button-option">
          <i className='bx bxs-chat'></i>
          <button onClick={handleChatWithTeacher}>CHAT CON PROFESOR</button> 
        </div>
      </div>
      <button className="student-logout-button" onClick={onLogout}>
        CERRAR SESION
      </button>
    </div>
  );
}
export default StudentDashboard;