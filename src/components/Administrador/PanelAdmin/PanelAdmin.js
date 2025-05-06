import React from 'react';
import './PanelAdmin.css';
import logousuario from '../../../assets/logousuario.png'; 

function AdminDashboard({ 
    username, 
    onLogout,
    onNavigateToManageUsers, 
    onNavigateToManageCourses, 
    onNavigateToReports 
}) {

  const handleManageUsers = () => { 
    if(onNavigateToManageUsers) onNavigateToManageUsers(); 
    else alert('Funcionalidad "Gestión de Usuarios" no implementada.');
  };

  const handleManageCourses = () => { 
    if(onNavigateToManageCourses) onNavigateToManageCourses(); 
    else alert('Funcionalidad "Gestión de Cursos" no implementada.');
  };

  const handleReports = () => { 
     if(onNavigateToReports) onNavigateToReports(); 
    else alert('Funcionalidad "Reportes y Estadísticas" no implementada.');
  };

  return (
    <div className="admin-dashboard-container"> 
      <div className="admin-profile">
        <img src={logousuario} alt="Foto de perfil" />
        <span>Administrador</span> 
      </div>

      <div className="admin-header">¡Hey {username}, bienvenido de vuelta!</div>
      <div className="admin-title">¿Qué quieres hacer hoy?</div>
      
      <div className="admin-button-group">
        <div className="admin-button-with-icon">
          <i className='bx bxs-group'></i>
          <button onClick={handleManageUsers}>GESTION DE USUARIOS</button> 
        </div>
        <div className="admin-button-with-icon">
          <i className='bx bxs-book-open'></i>
          <button onClick={handleManageCourses}>GESTION DE CURSOS Y SU CONTENIDO</button> 
        </div>
        <div className="admin-button-with-icon">
          <i className='bx bxs-bar-chart-alt-2'></i>
          <button onClick={handleReports}>REPORTES Y ESTADISTICAS</button> 
        </div>
      </div>
      
      <button className="admin-logout-button" onClick={onLogout}>
        CERRAR SESION
      </button>
    </div>
  );
}

export default AdminDashboard;