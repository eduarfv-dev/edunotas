import React, { useState, useEffect } from 'react';
import './GradesView.css'; 

function GradesView({ onBack, subjectGradesData }) { 
  const [selectedSubject, setSelectedSubject] = useState(''); 
  const [filteredGrades, setFilteredGrades] = useState([]); 

  const subjectOptions = ['Matemáticas', 'Programación Web', 'Bases de Datos', 'Inglés']; 

  useEffect(() => {
     if (!selectedSubject && subjectGradesData) {
         setFilteredGrades(subjectGradesData); 
     } else {
         setFilteredGrades([]); 
         if(selectedSubject){
            console.log(`Simulando búsqueda para: ${selectedSubject}`);
            // Si quisieras mostrar un alert al seleccionar, podrías hacerlo aquí
            // alert(`Búsqueda para ${selectedSubject} no implementada.`);
         }
     }
  }, [selectedSubject, subjectGradesData]); 
  
  // handleSearch ya no existe

  return (
    <div className="grades-display-container"> 
      <button onClick={onBack} className="grades-back-button">
        <i className='bx bx-arrow-back' style={{ marginRight: '5px' }}></i> 
        Regresar
      </button>

      <div className="grades-content">
        <h2>Visualización de Calificaciones</h2>

        <div className="grades-search-container">
          <select 
            name="materia" 
            id="materia" 
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            <option value="">Selecciona materia...</option>
            {subjectOptions.map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
          {/* Botón buscar sigue comentado (o eliminado) */}
          {/* <button className="grades-search-button" onClick={handleSearch}>Buscar</button> */}
        </div>

        <div className="grades-table-wrapper"> 
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
              {filteredGrades.length > 0 ? (
                filteredGrades.map((row) => (
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
                  <td colSpan="6">{selectedSubject ? 'No hay datos para esta materia.' : 'Selecciona una materia para ver las notas.'}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default GradesView;