// src/App.js
import React, { useState, useEffect } from 'react';
import { db, auth } from './firebase';
import { doc, getDoc } from "firebase/firestore";

import LoginForm from './components/LoginForm/LoginForm';
import PasswordRecoveryForm from './components/LoginForm/FormularioRecuperarClave/FormularioRecuperarClave';
import StudentDashboard from './components/Estudiante/PanelEstudiante/PanelEstudiante';
import GradesView from './components/Estudiante/VerNotasEstudiante/VerNotasEstudiante';
import StudentForum from './components/Estudiante/ForoEstudiante/ForoEstudiante';
import ChatWithTeacher from './components/Estudiante/ChatConProfesor/ChatConProfesor';
import TeacherDashboard from './components/Profesor/PanelProfesor/PanelProfesor';
import TeacherGradesView from './components/Profesor/VerNotasProfesor/VerNotasProfesor';
import RegisterGrades from './components/Profesor/RegistrarNotas/RegistrarNotas';
import ManageCourseContent from './components/Profesor/GestionarContenidoCurso/GestionarContenidoCurso';
import TeacherForum from './components/Profesor/ForoProfesor/ForoProfesor';
import TeacherChatView from './components/Profesor/ChatProfesorVista/ChatProfesorVista';
import AdminDashboard from './components/Administrador/PanelAdmin/PanelAdmin';
import ManageUsers from './components/Administrador/GestionarUsuarios/GestionarUsuarios'; 
import ManageCoursesAdmin from './components/Administrador/GestionarCursosAdmin/GestionarCursosAdmin';
import ReportsAndStats from './components/Administrador/ReportesEstadisticas/ReportesEstadisticas';
import GestionarGradosAdmin from './components/Administrador/GestionarGradosAdmin/GestionarGradosAdmin'; 
// --- NUEVA IMPORTACIÓN PARA EL VISOR DE LOGS ---
import ViewAuditLogs from './components/Administrador/Logs/ViewAuditLogs'; // Asegúrate que esta ruta sea correcta
// ----------------------------------------------
import fondoBackground from './assets/fondo.png';
import { useAccessibility } from './components/Accessibility/AccessibilityContext'; 
import AccessibilityWidget from './components/Accessibility/AccessibilityWidget'; 

const accessibilityToggleButtonStyle = {
  position: 'fixed', bottom: '20px', right: '20px', padding: '10px 15px',
  backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '50px',
  cursor: 'pointer', zIndex: 1001, boxShadow: '0 2px 10px rgba(0,0,0,0.2)', fontSize: '1em',
};

function App() {
  const { fontSize, highContrast, dyslexicFont, highlightLinks } = useAccessibility();
  const [isAccessibilityWidgetVisible, setIsAccessibilityWidgetVisible] = useState(false);
  const [currentView, setCurrentView] = useState('login');
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [viewPayload, setViewPayload] = useState(null);

  const appStyle = {
    minHeight: '100vh', backgroundImage: `url(${fondoBackground})`, backgroundPosition: 'center center',
    backgroundRepeat: 'no-repeat', backgroundSize: 'cover', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', padding: '20px',
  };

  useEffect(() => {
    const body = document.body;
    const accessibilityClasses = ['large-font', 'high-contrast', 'dyslexic-font', 'links-highlighted'];
    accessibilityClasses.forEach(cls => body.classList.remove(cls));
    if (fontSize === 'large') body.classList.add('large-font');
    if (highContrast) body.classList.add('high-contrast');
    if (dyslexicFont) body.classList.add('dyslexic-font');
    if (highlightLinks) body.classList.add('links-highlighted');
  }, [fontSize, highContrast, dyslexicFont, highlightLinks]);

  const toggleAccessibilityWidget = () => setIsAccessibilityWidgetVisible(prev => !prev);

  const handleLoginSuccess = async (authUser) => {
    setIsLoading(true); setAuthError('');
    try {
      const userDocRef = doc(db, "usuarios", authUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const userDetails = { uid: authUser.uid, ...userDocSnap.data() };
        if (userDetails.isDisabled === true) {
          await auth.signOut(); setUserData(null); setAuthError("Tu cuenta ha sido inhabilitada.");
          setCurrentView('login'); setIsLoading(false); return; 
        }
        setUserData(userDetails); 
        if (userDetails.role === 'student') setCurrentView('student');
        else if (userDetails.role === 'teacher') setCurrentView('teacher');
        else if (userDetails.role === 'admin') setCurrentView('admin');
        else { await auth.signOut(); setUserData(null); setAuthError("Rol no reconocido."); setCurrentView('login');}
      } else { await auth.signOut(); setUserData(null); setAuthError("Datos de usuario no encontrados."); setCurrentView('login');}
    } catch (error) { console.error("Error al obtener datos del usuario:", error); setAuthError("Error al cargar información del usuario."); setCurrentView('login'); 
    } finally { setIsLoading(false); }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try { await auth.signOut(); setUserData(null); setCurrentView('login'); setAuthError(''); setViewPayload(null);
    } catch (error) { console.error("Error al cerrar sesión:", error); setAuthError("Error al cerrar sesión.");
    } finally { setIsLoading(false); }
  };

  const navigateTo = (view, payload = null) => {
    setViewPayload(payload);
    setCurrentView(view);
  };

  const renderContent = () => {
    if (isLoading && currentView !== 'login') { 
      return <div style={{ color: 'white', backgroundColor: 'rgba(0,0,0,0.5)', padding: '20px', borderRadius: '8px' }}>Cargando...</div>;
    }
    if (authError && currentView === 'login') {
       return (<div><p style={{color: 'red', backgroundColor: 'rgba(255,255,255,0.8)', padding: '10px', borderRadius: '5px', marginBottom: '15px'}}>{authError}</p>
               <LoginForm onForgotPassword={() => navigateTo('recovery')} onLoginSuccess={handleLoginSuccess} /></div>);
    }
    switch (currentView) {
      case 'login': return <LoginForm onForgotPassword={() => navigateTo('recovery')} onLoginSuccess={handleLoginSuccess} />;
      case 'recovery': return <PasswordRecoveryForm onBack={() => navigateTo('login')} />;
      
      case 'student': return userData ? <StudentDashboard username={userData.displayName || userData.email} onLogout={handleLogout} onNavigateToGrades={() => navigateTo('grades')} onNavigateToForum={() => navigateTo('forum')} onNavigateToChat={() => navigateTo('chat')} /> : null;
      case 'grades': return userData ? <GradesView studentUid={userData.uid} onBack={() => navigateTo('student')} /> : null;
      case 'forum': return <StudentForum user={userData} onBack={() => navigateTo('student')} />;
      case 'chat': return <ChatWithTeacher user={userData} onBack={() => navigateTo('student')} />;
      
      case 'teacher': return userData ? <TeacherDashboard user={userData} onLogout={handleLogout} 
                                            onNavigateToViewGrades={(data) => navigateTo('teacher-grades', data)} 
                                            onNavigateToRegisterGrades={(data) => navigateTo('teacher-register-grades', data)} 
                                            onNavigateToManageCourse={(data) => navigateTo('teacher-manage-course', data)} 
                                            onNavigateToForum={() => navigateTo('teacher-forum')} 
                                            onNavigateToChat={() => navigateTo('teacher-chat')} /> : null;
      case 'teacher-grades': return userData ? <TeacherGradesView {...viewPayload} user={userData} onBack={() => navigateTo('teacher')} /> : null;
      case 'teacher-register-grades': return userData ? <RegisterGrades {...viewPayload} user={userData} onBack={() => navigateTo('teacher')} /> : null;
      case 'teacher-manage-course': return userData ? <ManageCourseContent {...viewPayload} user={userData} onBack={() => navigateTo('teacher')} /> : null;
      case 'teacher-forum': return userData ? <TeacherForum user={userData} onBack={() => navigateTo('teacher')} /> : null;
      case 'teacher-chat': return userData ? <TeacherChatView user={userData} onBack={() => navigateTo('teacher')} /> : null;
      
      case 'admin': return userData ? <AdminDashboard username={userData.displayName || userData.email} onLogout={handleLogout} 
                                          onNavigateToManageUsers={() => navigateTo('admin-manage-users')} 
                                          onNavigateToManageCourses={() => navigateTo('admin-manage-courses')} 
                                          onNavigateToManageGrades={() => navigateTo('admin-manage-grades')} 
                                          onNavigateToReports={() => navigateTo('admin-reports')} /> : null;
      case 'admin-manage-users': return userData && userData.role === 'admin' ? <ManageUsers onBack={() => navigateTo('admin')} /> : null; 
      case 'admin-manage-courses': return userData && userData.role === 'admin' ? <ManageCoursesAdmin onBack={() => navigateTo('admin')} /> : null;
      case 'admin-manage-grades': return userData && userData.role === 'admin' ? <GestionarGradosAdmin onBack={() => navigateTo('admin')} /> : null;
      case 'admin-reports': 
        return userData && userData.role === 'admin' ? (
          <ReportsAndStats 
            onBack={() => navigateTo('admin')} 
            onNavigateToAuditLogs={() => navigateTo('admin-audit-logs')} // <-- Se pasa la función de navegación
            // Aquí puedes añadir otras props de navegación para los otros reportes si es necesario
            // onGenerateStudentReport={() => navigateTo('admin-student-report-view')} 
            // onGenerateGroupReport={() => navigateTo('admin-group-report-view')}
            // onGenerateGlobalReport={() => navigateTo('admin-global-report-view')}
          />
        ) : null;
      // --- NUEVO CASO PARA RENDERIZAR LA VISTA DE LOGS DE AUDITORÍA ---
      case 'admin-audit-logs':
        return userData && userData.role === 'admin' ? <ViewAuditLogs onBack={() => navigateTo('admin-reports')} /> : null;
      // --------------------------------------------------------------
      default: return <LoginForm onForgotPassword={() => navigateTo('recovery')} onLoginSuccess={handleLoginSuccess} />;
    }
  };

  return (
    <div className={`App ${dyslexicFont ? 'dyslexic-font' : ''}`} style={appStyle}>
      {!isAccessibilityWidgetVisible && (<button onClick={toggleAccessibilityWidget} style={accessibilityToggleButtonStyle} title="Accesibilidad">Accesibilidad</button>)}
      {isAccessibilityWidgetVisible && (<AccessibilityWidget onClose={toggleAccessibilityWidget} />)}
      {renderContent()}
    </div>
  );
}
export default App;