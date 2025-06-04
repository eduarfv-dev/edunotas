// AdminDashboard.js
import React from 'react';
import './PanelAdmin.css';
import logousuario from '../../../assets/logousuario.png'; 

function AdminDashboard({ 
    username, 
    onLogout,
    onNavigateToManageUsers, 
    onNavigateToManageCourses, 
    onNavigateToReports,
    onNavigateToManageGrades // <--- NUEVA PROP para la navegación a Gestión de Grados
}) {

  const handleManageUsers = () => { 
    if(onNavigateToManageUsers) onNavigateToManageUsers(); 
    else alert('Funcionalidad "Gestión de Usuarios" no implementada.');
  };

  const handleManageCourses = () => { 
    if(onNavigateToManageCourses) onNavigateToManageCourses(); 
    else alert('Funcionalidad "Gestión de Cursos" no implementada.');
  };

  // NUEVO HANDLER para Gestión de Grados
  const handleManageGrades = () => {
    if(onNavigateToManageGrades) onNavigateToManageGrades();
    else alert('Funcionalidad "Gestión de Grados" no implementada.');
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
          <i className='bx bxs-group'></i> {/* Ícono para Gestión de Usuarios */}
          <button onClick={handleManageUsers}>GESTIÓN DE USUARIOS</button> 
        </div>
        <div className="admin-button-with-icon">
          <i className='bx bxs-book-open'></i> {/* Ícono para Gestión de Cursos */}
          <button onClick={handleManageCourses}>GESTIÓN DE CURSOS Y SU CONTENIDO</button> 
        </div>

        {/* ====== NUEVO BOTÓN PARA GESTIÓN DE GRADOS ====== */}
        <div className="admin-button-with-icon">
          <i className='bx bxs-graduation'></i> {/* Ícono sugerido para Grados (BoxIcons) */}
          <button onClick={handleManageGrades}>GESTIÓN DE GRADOS</button>
        </div>
        {/* =============================================== */}

        <div className="admin-button-with-icon">
          <i className='bx bxs-bar-chart-alt-2'></i> {/* Ícono para Reportes */}
          <button onClick={handleReports}>REPORTES Y ESTADÍSTICAS</button> 
        </div>
      </div>
      
      <button className="admin-logout-button" onClick={onLogout}>
        CERRAR SESION
      </button>
    </div>
  );
}

export default AdminDashboard;