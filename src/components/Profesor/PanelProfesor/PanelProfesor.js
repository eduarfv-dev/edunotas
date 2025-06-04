// src/components/Profesor/PanelProfesor/PanelProfesor.js
import React, { useState, useEffect, useCallback } from 'react';
import './PanelProfesor.css';
import userProfileImage from '../../../assets/logousuario.png'; 
import { db } from '../../../firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

function TeacherDashboard({
    user, 
    onLogout,
    onNavigateToViewGrades,
    onNavigateToRegisterGrades,
    onNavigateToManageCourse,
    onNavigateToChat,
    onNavigateToForum
 }) {
  const [myCourses, setMyCourses] = useState([]);
  const [allGrades, setAllGrades] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Iniciar cargando
  const [error, setError] = useState('');

  const fetchAllGrades = useCallback(async () => {
    try {
      const q = query(collection(db, "grados"), orderBy("name", "asc"));
      const querySnapshot = await getDocs(q);
      setAllGrades(querySnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() })));
    } catch (err) {
      console.error("Error fetching all grades:", err);
      // Considerar si mostrar un error específico para la carga de grados
    }
  }, []);

  const fetchMyCourses = useCallback(async () => {
    if (!user || !user.uid) {
        setIsLoading(false); // Detener carga si no hay usuario
        setError("No se pudo identificar al profesor.");
        return;
    }
    setIsLoading(true); // Asegurar que se muestre la carga al (re)intentar
    setError('');
    try {
      const coursesRef = collection(db, "cursos");
      const q = query(coursesRef, where("teacherId", "==", user.uid), orderBy("name", "asc"));
      const querySnapshot = await getDocs(q);
      const coursesData = querySnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
      setMyCourses(coursesData);
    } catch (err) {
      console.error("Error fetching teacher's courses:", err);
      setError("No se pudieron cargar tus cursos asignados.");
      setMyCourses([]);
    }
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    // Cargar ambos en paralelo
    Promise.all([fetchAllGrades(), fetchMyCourses()]).catch(err => {
        // Manejar error global si una de las promesas falla y es crítico,
        // aunque ya se manejan errores individuales dentro de cada fetch.
        console.error("Error during initial data fetch for teacher dashboard:", err);
    });
  }, [fetchAllGrades, fetchMyCourses]);
 
  const handleViewGrades = () => {
    if (onNavigateToViewGrades) onNavigateToViewGrades({ courses: myCourses, grades: allGrades });
  };

  const handleRegisterGrades = () => {
    if (onNavigateToRegisterGrades) onNavigateToRegisterGrades({ courses: myCourses, grades: allGrades });
  };

  const handleManageCourse = () => {
    if (onNavigateToManageCourse) onNavigateToManageCourse({ courses: myCourses }); 
  };

  const handleChat = () => {
     if (onNavigateToChat) onNavigateToChat({ courses: myCourses, grades: allGrades });
  };

  const handleForum = () => {
     if (onNavigateToForum) onNavigateToForum();
  };

  if (isLoading) {
    return <div className="loading-container" style={{color: 'white', backgroundColor: 'rgba(0,0,0,0.5)', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>Cargando información del profesor...</div>;
  }

  if (error && myCourses.length === 0) { // Mostrar error solo si es crítico (no hay cursos)
    return <div className="error-container" style={{color: 'red', backgroundColor: 'rgba(255,235,235,0.9)', padding: '20px', borderRadius: '8px', textAlign: 'center'}}>Error: {error} <button onClick={fetchMyCourses} style={{marginTop: '10px'}}>Reintentar</button></div>;
  }

  return (
    <div className="teacher-dashboard-container">
      <div className="teacher-profile">
        <img src={userProfileImage} alt="Foto de perfil" />
        <span>Profesor</span>
      </div>
      <div className="teacher-header">¡Hey {user.displayName || user.email}, bienvenido de vuelta!</div>
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