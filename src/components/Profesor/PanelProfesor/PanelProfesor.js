import React from 'react';
import './PanelProfesor.css';
import userProfileImage from '../../../assets/logousuario.png'; 

function TeacherDashboard({
    username,
    onLogout,
    onNavigateToViewGrades,
    onNavigateToRegisterGrades,
    onNavigateToManageCourse,
    onNavigateToChat,
    onNavigateToForum
 }) {

 
  const handleViewGrades = () => {
    if (onNavigateToViewGrades) onNavigateToViewGrades();
    else alert('Funcionalidad "Ver Calificaciones" no implementada.');
  };

  const handleRegisterGrades = () => {
    if (onNavigateToRegisterGrades) onNavigateToRegisterGrades();
    else alert('Funcionalidad "Registro de Calificaciones" no implementada.');
  };

  const handleManageCourse = () => {
    if (onNavigateToManageCourse) onNavigateToManageCourse();
    else alert('Funcionalidad "Gestión Contenido Curso" no implementada.');
  };

  const handleChat = () => {
     if (onNavigateToChat) onNavigateToChat();
    else alert('Funcionalidad "Chat con Estudiantes" no implementada.');
  };

  const handleForum = () => {
     if (onNavigateToForum) onNavigateToForum();
    else alert('Funcionalidad "Foro para Profesores" no implementada.');
  };

  return (
    <div className="teacher-dashboard-container">
      <div className="teacher-profile">
        <img src={userProfileImage} alt="Foto de perfil" />
        <span>Profesor</span>
      </div>
      <div className="teacher-header">¡Hey {username}, bienvenido de vuelta!</div>

      {/* Ya no mostramos la lista de cursos aquí */}

      <div className="teacher-title">¿Qué quieres hacer hoy?</div>
      <div className="teacher-button-group">
        <div className="teacher-left-buttons">
          <button onClick={handleViewGrades}>VER CALIFICACIONES</button>
          <button onClick={handleRegisterGrades}>REGISTRO DE CALIFICACIONES</button>
          <button onClick={handleManageCourse}>GESTION CONTENIDO DE CURSO</button>
        </div>
        <div className="teacher-right-buttons">
          <button onClick={handleChat}>CHAT CON ESTUDIANTES</button>
          <button onClick={handleForum}>FORO PARA PROFESORES</button>
        </div>
      </div>
      <button className="teacher-logout-button" onClick={onLogout}>
        CERRAR SESION
      </button>
    </div>
  );
}
export default TeacherDashboard;