import React, { useState } from 'react';
import './ReportesEstadisticas.css'; 

function ReportsAndStats({ onBack }) { 
    const [selectedDate, setSelectedDate] = useState('');

    const handleGenerateReport = (reportType) => {
        console.log(`Admin: Generando reporte - ${reportType}`);
        alert(`Funcionalidad "Generar Reporte por ${reportType}" no implementada.`);
    };

    const handleDateChange = (e) => {
        setSelectedDate(e.target.value);
        console.log("Fecha seleccionada:", e.target.value);
    };

    const handleSearch = () => {
        if (!selectedDate) {
            alert("Por favor, seleccione una fecha para buscar.");
            return;
        }
        console.log(`Admin: Buscando reportes para fecha: ${selectedDate}`);
        alert(`Funcionalidad "Buscar" con fecha ${selectedDate} no implementada.`);
    };

    const handleClear = () => {
        console.log('Admin: Limpiando fecha');
        setSelectedDate('');
        alert('Fecha limpiada (funcionalidad de limpieza de reporte no implementada).');
    };

    return (
        <div className="reports-container">
            <button onClick={onBack} className="reports-back-button">
                Regresar
            </button>

            <div className="reports-content">
                <h1>REPORTE Y ESTADISTICAS</h1>
                
                <div className="reports-options">
                    <div className="reports-option">
                        <i className='bx bxs-graduation'></i>
                        <button 
                            className="reports-option-button" 
                            onClick={() => handleGenerateReport('Estudiante')}
                        >
                            Generar Reporte por Estudiante
                        </button>
                    </div>
                    <div className="reports-option">
                        <i className='bx bxs-group'></i>
                        <button 
                            className="reports-option-button" 
                            onClick={() => handleGenerateReport('Grupo')}
                        >
                            Generar Reporte por Grupo
                        </button>
                    </div>
                    <div className="reports-option">
                        <i className='bx bxs-report'></i>
                        <button 
                            className="reports-option-button" 
                            onClick={() => handleGenerateReport('Global')}
                        >
                            Generar Reporte Global
                        </button>
                    </div>
                </div>
                
                <div className="reports-actions">
                    <input 
                        type="date" 
                        className="reports-date-picker"
                        value={selectedDate}
                        onChange={handleDateChange}
                    />
                    <button className="reports-action-button" onClick={handleSearch}>
                        Buscar
                    </button>
                    <button className="reports-action-button" onClick={handleClear}>
                        Limpiar
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ReportsAndStats;