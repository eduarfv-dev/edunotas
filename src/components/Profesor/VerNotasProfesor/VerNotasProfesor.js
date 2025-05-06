import React, { useState } from 'react';
import './VerNotasProfesor.css';

const allData = {
  subjects: ['Matemáticas', 'Programación Web', 'Bases de Datos'],
  groups: ['Grupo A', 'Grupo B'],
  students: [
    { id: 101, name: 'Ana Gómez', group: 'Grupo A' },
    { id: 102, name: 'Luis Parra', group: 'Grupo B' },
    { id: 103, name: 'Carlos Ruiz', group: 'Grupo A' },
    { id: 104, name: 'Maria Jose', group: 'Grupo B' },
  ],
  grades: {
    '101': { 
      'Matemáticas': [ { period: 1, scores: [4.5, 4.0, 5.0, 4.8], average: 4.6 }, { period: 2, scores: [4.2, 4.3, null, null], average: 4.25 } ],
      'Programación Web': [ { period: 1, scores: [4.8, 4.7, 5.0, 4.9], average: 4.85 }, { period: 2, scores: [4.5, 4.6, null, null], average: 4.55 } ],
    },
    '102': { 
      'Bases de Datos': [ { period: 1, scores: [3.0, 3.5, 4.0, 3.8], average: 3.58 }, { period: 2, scores: [4.0, 4.1, null, null], average: 4.05 } ],
      'Programación Web': [ { period: 1, scores: [4.2, 4.0, 4.1, 4.4], average: 4.18 }, { period: 2, scores: [3.9, 4.0, null, null], average: 3.95 } ],
    },
     '103': { 
      'Matemáticas': [ { period: 1, scores: [4.0, 4.1, 3.9, 4.3], average: 4.08 }, { period: 2, scores: [3.8, null, null, null], average: 3.8 } ],
    }
  }
};


function TeacherGradesView({ onBack }) { 
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(''); 
  const [displayGrades, setDisplayGrades] = useState([]); 

  const studentOptions = allData.students.filter(student => 
    !selectedGroup || student.group === selectedGroup
  );

  const handleSearch = () => {
    if (!selectedSubject || !selectedStudent) {
      alert('Por favor, selecciona al menos una materia y un estudiante.');
      setDisplayGrades([]); 
      return;
    }
    console.log(`Buscando: Materia=${selectedSubject}, Grupo=${selectedGroup || 'Todos'}, Estudiante=${selectedStudent}`);
    
    const studentGradesForSubject = allData.grades[selectedStudent]?.[selectedSubject];
    
    if (studentGradesForSubject) {
        setDisplayGrades(studentGradesForSubject);
    } else {
        console.log('No se encontraron notas para esta combinación.');
        setDisplayGrades([]); 
        alert('No se encontraron calificaciones para la selección actual.');
    }
  };

  return (
    <div className="teacher-grades-display-container"> 
      <button onClick={onBack} className="teacher-grades-back-button">
        Regresar
      </button>

      <div className="teacher-grades-search-container">
        <select 
            name="materia" 
            id="materia" 
            value={selectedSubject} 
            onChange={e => { setSelectedSubject(e.target.value); setDisplayGrades([]); }}>
          <option value="">Materia...</option>
          {allData.subjects.map(sub => <option key={sub} value={sub}>{sub}</option>)}
        </select>
        
        <select 
            name="grupo" 
            id="grupo" 
            value={selectedGroup} 
            onChange={e => { setSelectedGroup(e.target.value); setSelectedStudent(''); setDisplayGrades([]); }}>
          <option value="">Grupo...</option>
           {allData.groups.map(grp => <option key={grp} value={grp}>{grp}</option>)}
        </select>
        
        <select 
            name="estudiante" 
            id="estudiante" 
            value={selectedStudent} 
            onChange={e => { setSelectedStudent(e.target.value); setDisplayGrades([]); }} 
            disabled={!selectedGroup && studentOptions.length > 0} 
            >
          <option value="">Estudiante...</option>
          {studentOptions.map(stu => <option key={stu.id} value={stu.id}>{stu.name}</option>)}
          {studentOptions.length === 0 && <option disabled>Selecciona un grupo primero</option>}
        </select>
        
        <button className="teacher-grades-search-button" onClick={handleSearch}>
            Buscar
        </button>
      </div>
      
      <div className="teacher-grades-table-container"> 
        <h2>Visualización de Calificaciones</h2>
        <table>
          <thead>
            <tr>
              <th>Periodo</th>
              <th>Nota 1</th>
              <th>Nota 2</th>
              <th>Nota 3</th>
              <th>Nota 4</th>
              <th>Promedio</th>
            </tr>
          </thead>
          <tbody>
           {displayGrades.length > 0 ? (
              displayGrades.map((row) => (
                <tr key={row.period}>
                  <td>{row.period}</td>
                  {row.scores.map((score, index) => (
                    <td key={index}>{score ?? ''}</td>
                  ))}
                  <td>{row.average ?? ''}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">Selecciona filtros y haz clic en "Buscar" para ver las notas.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TeacherGradesView;