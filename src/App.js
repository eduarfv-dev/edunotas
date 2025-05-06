import React, { useState } from 'react';
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

import fondoBackground from './assets/fondo.png';

function App() {
  const [currentView, setCurrentView] = useState('login');
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const appStyle = {
    minHeight: '100vh',
    backgroundImage: `url(${fondoBackground})`,
    backgroundPosition: 'center center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px'
  };

  const handleLoginSuccess = async (authUser) => {
    setIsLoading(true);
    setAuthError('');
    try {
      console.log("Usuario autenticado:", authUser.uid);
      const userDocRef = doc(db, "usuarios", authUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userDetails = { uid: authUser.uid, ...userDocSnap.data() };
        setUserData(userDetails);
        console.log("Datos del usuario:", userDetails);

        if (userDetails.role === 'student') {
          setCurrentView('student');
        } else if (userDetails.role === 'teacher') {
          setCurrentView('teacher');
        } else if (userDetails.role === 'admin') {
          setCurrentView('admin');
        } else {
          console.error("Rol de usuario desconocido:", userDetails.role);
          setAuthError("Rol de usuario no reconocido. Contacte al administrador.");
          setCurrentView('login');
        }
      } else {
        console.error("No se encontró el documento del usuario en Firestore.");
        setAuthError("No se pudieron cargar los datos del usuario. Contacte al administrador.");
        setCurrentView('login');
      }
    } catch (error) {
      console.error("Error al obtener datos del usuario:", error);
      setAuthError("Error al cargar la información del usuario.");
      setCurrentView('login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await auth.signOut(); 
      setUserData(null);
      setCurrentView('login');
      setAuthError('');
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      setAuthError("Error al cerrar sesión. Inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const showRecoveryForm = () => setCurrentView('recovery');
  const showLoginForm = () => setCurrentView('login');
  const showStudentDashboard = () => setCurrentView('student');
  const showStudentGrades = () => setCurrentView('grades');
  const showStudentForum = () => setCurrentView('forum');
  const showStudentChat = () => setCurrentView('chat');
  const showTeacherDashboard = () => setCurrentView('teacher');
  const showTeacherViewGrades = () => setCurrentView('teacher-grades');
  const showTeacherRegisterGrades = () => setCurrentView('teacher-register-grades');
  const showTeacherManageCourse = () => setCurrentView('teacher-manage-course');
  const showTeacherForum = () => setCurrentView('teacher-forum');
  const showTeacherChat = () => setCurrentView('teacher-chat');
  const showAdminDashboard = () => setCurrentView('admin');
  const showManageUsers = () => setCurrentView('admin-manage-users');
  const showManageCoursesAdmin = () => setCurrentView('admin-manage-courses'); 
  const showReports = () => setCurrentView('admin-reports');

  const renderContent = () => {
    if (isLoading) {
      return <div style={{ color: 'white', backgroundColor: 'rgba(0,0,0,0.5)', padding: '20px', borderRadius: '8px' }}>Cargando datos del usuario...</div>;
    }

    if (authError && currentView === 'login') {
       return (
           <div>
               <p style={{color: 'red', backgroundColor: 'rgba(255,255,255,0.8)', padding: '10px', borderRadius: '5px', marginBottom: '15px'}}>{authError}</p>
               <LoginForm onForgotPassword={showRecoveryForm} onLoginSuccess={handleLoginSuccess} />
           </div>
       );
    }

    switch (currentView) {
      case 'login':
        return <LoginForm onForgotPassword={showRecoveryForm} onLoginSuccess={handleLoginSuccess} />;
      case 'recovery':
        return <PasswordRecoveryForm onBack={showLoginForm} />; 

      case 'student':
        return userData ? <StudentDashboard username={userData.displayName || userData.email} onLogout={handleLogout} onNavigateToGrades={showStudentGrades} onNavigateToForum={showStudentForum} onNavigateToChat={showStudentChat} /> : null;
      case 'grades':
        return userData ? <GradesView
                              studentUid={userData.uid} 
                              onBack={showStudentDashboard}
                              /> : null;
      case 'forum':
        return <StudentForum onBack={showStudentDashboard} />;
      case 'chat':
        return <ChatWithTeacher onBack={showStudentDashboard} />;

      case 'teacher':
         return userData ? <TeacherDashboard
                            username={userData.displayName || userData.email}
                            onLogout={handleLogout}
                            onNavigateToViewGrades={showTeacherViewGrades}
                            onNavigateToRegisterGrades={showTeacherRegisterGrades}
                            onNavigateToManageCourse={showTeacherManageCourse}
                            onNavigateToForum={showTeacherForum}
                            onNavigateToChat={showTeacherChat}
                          /> : null;
      case 'teacher-grades':
        return <TeacherGradesView onBack={showTeacherDashboard} />;
      case 'teacher-register-grades':
        return <RegisterGrades onBack={showTeacherDashboard} />;
      case 'teacher-manage-course':
        return <ManageCourseContent onBack={showTeacherDashboard} />;
      case 'teacher-forum':
        return <TeacherForum onBack={showTeacherDashboard} />;
      case 'teacher-chat':
        return <TeacherChatView onBack={showTeacherDashboard} />;
      
      case 'admin':
        return userData ? <AdminDashboard
                            username={userData.displayName || userData.email}
                            onLogout={handleLogout}
                            onNavigateToManageUsers={showManageUsers}
                            onNavigateToManageCourses={showManageCoursesAdmin} 
                            onNavigateToReports={showReports}
                          /> : null;
      case 'admin-manage-users':
        return <ManageUsers onBack={showAdminDashboard} />;
      case 'admin-manage-courses':
        return <ManageCoursesAdmin onBack={showAdminDashboard} />; 
      case 'admin-reports':
        return <ReportsAndStats onBack={showAdminDashboard} />;
      default:
        return <LoginForm onForgotPassword={showRecoveryForm} onLoginSuccess={handleLoginSuccess} />;
    }
  };

  return (
    <div style={appStyle}>
      {renderContent()}
    </div>
  );
}

export default App;
