import React, { useState } from 'react';
import { db, auth } from './firebase';
import { doc, getDoc } from "firebase/firestore";
import LoginForm from './components/LoginForm/LoginForm';
import PasswordRecoveryForm from './components/PasswordRecoveryForm/PasswordRecoveryForm';
import StudentDashboard from './components/StudentDashboard/StudentDashboard';
import GradesView from './components/GradesView/GradesView';
import TeacherGradesView from './components/TeacherGradesView/TeacherGradesView';
import StudentForum from './components/StudentForum/StudentForum';
import ChatWithTeacher from './components/ChatWithTeacher/ChatWithTeacher';
import TeacherChatView from './components/TeacherChatView/TeacherChatView';
import TeacherDashboard from './components/TeacherDashboard/TeacherDashboard';
import RegisterGrades from './components/RegisterGrades/RegisterGrades';
import ManageCourseContent from './components/ManageCourseContent/ManageCourseContent';
import TeacherForum from './components/TeacherForum/TeacherForum';
import AdminDashboard from './components/AdminDashboard/AdminDashboard';
import ManageUsers from './components/ManageUsers/ManageUsers';
import ManageCoursesAdmin from './components/ManageCoursesAdmin/ManageCoursesAdmin';
import ReportsAndStats from './components/ReportsAndStats/ReportsAndStats';
import fondoBackground from './assets/fondo.png';
// import { signOut } from "firebase/auth";

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
    if (!authUser || !authUser.uid) {
      console.error("handleLoginSuccess llamado sin un usuario de autenticación válido.");
      setAuthError("Error interno al procesar el inicio de sesión.");
      return;
    }
    setIsLoading(true);
    setAuthError('');
    console.log("Usuario autenticado por Firebase:", authUser.uid, authUser.email);

    try {
      const userDocRef = doc(db, "usuarios", authUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const firestoreUserData = userDocSnap.data();
        console.log("Datos de Firestore encontrados:", firestoreUserData);

        const completeUserData = {
          uid: authUser.uid,
          email: authUser.email || firestoreUserData.email,
          role: firestoreUserData.role || null,
          displayName: firestoreUserData.displayName || authUser.email,
        };

        if (!completeUserData.role) {
             console.error(`¡El usuario ${authUser.uid} no tiene un campo 'role' definido en Firestore!`);
             setAuthError("Error: No se pudo determinar el rol del usuario. Contacte al administrador.");
             // await auth.signOut();
             setCurrentView('login');
             setIsLoading(false);
             return;
        }

        setUserData(completeUserData);

        const role = completeUserData.role;
        if (role === 'student') {
          setCurrentView('student');
        } else if (role === 'teacher') {
          setCurrentView('teacher');
        } else if (role === 'admin') {
          setCurrentView('admin');
        } else {
          console.warn(`Rol desconocido en Firestore para el usuario ${authUser.uid}: ${role}`);
          setAuthError("Rol de usuario no reconocido.");
          // await auth.signOut();
          setCurrentView('login');
        }

      } else {
        console.error(`¡No se encontraron datos en Firestore para el usuario autenticado ${authUser.uid}! Asegúrate de que el ID del documento en 'usuarios' coincida con el UID de Authentication.`);
        setAuthError("Error: Su cuenta existe pero no está registrada correctamente en la plataforma. Contacte al administrador.");
        // await auth.signOut();
        setCurrentView('login');
      }

    } catch (error) {
      console.error("Error al obtener datos del usuario desde Firestore:", error);
      setAuthError("Ocurrió un error inesperado al cargar los datos del usuario.");
      // await auth.signOut();
      setCurrentView('login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    console.log("Cerrando sesión...");
    setUserData(null);
    setCurrentView('login');
    setAuthError('');
    try {
      await auth.signOut();
      console.log("Usuario deslogueado de Firebase Auth.");
    } catch (error) {
      console.error("Error al desloguear de Firebase Auth:", error);
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
        return <GradesView onBack={showStudentDashboard} />;
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
                            onNavigateToChat={showTeacherChat}
                            onNavigateToForum={showTeacherForum}
                            /> : null;
      case 'teacher-grades':
          return <TeacherGradesView onBack={showTeacherDashboard} />;
      case 'teacher-register-grades':
          return userData ? <RegisterGrades
                                teacherUid={userData.uid}
                                onBack={showTeacherDashboard}
                                /> : null;
      case 'teacher-manage-course':
          return <ManageCourseContent onBack={showTeacherDashboard} />;
      case 'teacher-chat':
          return <TeacherChatView onBack={showTeacherDashboard} />;
      case 'teacher-forum':
          return <TeacherForum onBack={showTeacherDashboard} />;

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
        console.warn("Vista desconocida o estado inválido, volviendo a login:", currentView);
        setUserData(null);
        setCurrentView('login');
        return <LoginForm onForgotPassword={showRecoveryForm} onLoginSuccess={handleLoginSuccess}/>;
    }
  };

  return (
    <div className="App" style={appStyle}>
      {renderContent()}
    </div>
  );
}

export default App;