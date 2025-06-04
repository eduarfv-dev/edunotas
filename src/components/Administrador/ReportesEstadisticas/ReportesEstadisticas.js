// src/components/Administrador/ReportesEstadisticas/ReportsAndStats.js
import React, { useState } from 'react';
import './ReportesEstadisticas.css'; 

// --- DATOS DE PRUEBA RESTAURADOS ---
const MOCK_STUDENT_REPORT = [
    { id: 's1', name: 'Sofía Hernández', grade: '10A', average: 8.5, attendance: '95%' },
    { id: 's2', name: 'Mateo González', grade: '11B', average: 9.1, attendance: '98%' },
    { id: 's3', name: 'Valentina Pérez', grade: '9C', average: 7.9, attendance: '90%' },
];
const MOCK_GROUP_REPORT = [
    { id: 'g1', groupName: 'Grupo 10A', studentCount: 25, averageGrade: 8.2 },
    { id: 'g2', groupName: 'Grupo 11B', studentCount: 22, averageGrade: 8.8 },
];
const MOCK_GLOBAL_REPORT = {
    totalStudents: 150, averageAttendance: '92%',
    overallAverageGrade: 8.1, coursesOffered: 12,
};
const keyToSpanishDisplay = {
    name: 'Nombre', grade: 'Grado', average: 'Promedio', attendance: 'Asistencia',
    groupName: 'Nombre del Grupo', studentCount: 'N° Estudiantes', averageGrade: 'Prom. Calificaciones',
    totalStudents: 'Total Estudiantes', averageAttendance: 'Asistencia Prom.',
    overallAverageGrade: 'Prom. General Global', coursesOffered: 'Cursos Ofrecidos',
};
// --- FIN DATOS DE PRUEBA ---

function ReportsAndStats({ 
    onBack, 
    onNavigateToAuditLogs // Prop para navegar a la vista de logs de auditoría
}) { 
    const [currentView, setCurrentView] = useState('menu'); // 'menu', 'reportView'
    const [reportData, setReportData] = useState(null);
    const [reportTitle, setReportTitle] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    // const [selectedDate, setSelectedDate] = useState(''); // Mantenido si lo necesitas para búsquedas futuras

    const handleGenerateReport = (reportType) => {
        console.log(`Admin: Solicitud para generar reporte - ${reportType}`);
        let dataToShow = null;
        let title = '';

        if (reportType === 'Estudiante') {
            dataToShow = MOCK_STUDENT_REPORT;
            title = 'Reporte por Estudiante';
        } else if (reportType === 'Grupo') {
            dataToShow = MOCK_GROUP_REPORT;
            title = 'Reporte por Grupo';
        } else if (reportType === 'Global') {
            dataToShow = MOCK_GLOBAL_REPORT;
            title = 'Reporte Global';
        }

        setReportData(dataToShow);
        setReportTitle(title);
        setCurrentView('reportView');
        // setSelectedDate(''); 
        setSuccessMessage(''); 
    };

    const handleViewAuditLogs = () => {
        if (onNavigateToAuditLogs) {
            onNavigateToAuditLogs();
        } else {
            alert("Funcionalidad para ver logs de auditoría no implementada.");
        }
    };

    const handleBackToReportMenu = () => {
        setCurrentView('menu');
        setReportData(null);
        setReportTitle('');
        // setSelectedDate('');
        setSuccessMessage('');
    };

    const handleDownloadReport = (dataToDownload, descriptiveName) => {
        console.log(`Simulando descarga a Excel para: ${descriptiveName}`, dataToDownload);
        setSuccessMessage(`Datos de '${descriptiveName}' descargados (simulación).`);
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    if (currentView === 'reportView') {
        return (
            <div className="reports-container">
                <button onClick={handleBackToReportMenu} className="reports-back-button" style={{ marginBottom: '20px' }}>
                    Regresar al Menú de Reportes
                </button>
                <div className="reports-content">
                    <h1 className="report-view-title">{reportTitle}</h1>
                    {successMessage && <p className="success-message" style={{ marginBottom: '15px' }}>{successMessage}</p>}
                    
                    {reportData && reportData.message && <p>{reportData.message}</p>}
                    
                    {reportData && Array.isArray(reportData) && (
                        <ul className="report-data-list">
                            {reportData.map((item, index) => (
                                <li key={item.id || index} className="report-data-item">
                                    <div className="report-item-content">
                                        {item.name && <strong>{item.name}</strong>}
                                        {item.groupName && <strong>{item.groupName}</strong>}
                                        {Object.entries(item).map(([key, value]) => {
                                            if (key !== 'id' && key !== 'name' && key !== 'groupName') {
                                                const displayName = keyToSpanishDisplay[key] || (key.charAt(0).toUpperCase() + key.slice(1));
                                                return <div key={key}>{`${displayName}: ${value}`}</div>;
                                            }
                                            return null;
                                        })}
                                    </div>
                                    <button 
                                        onClick={() => handleDownloadReport(item, item.name || item.groupName || `Elemento ${index + 1}`)}
                                        className="download-excel-button"
                                    >
                                        Descargar Excel
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                    {reportData && !Array.isArray(reportData) && !reportData.message && (
                        <div className="report-data-object-container">
                            <div className="report-data-object">
                                {Object.entries(reportData).map(([key, value]) => {
                                    const displayName = keyToSpanishDisplay[key] || (key.charAt(0).toUpperCase() + key.slice(1));
                                    return <p key={key}><strong>{`${displayName}:`}</strong> {value.toString()}</p>;
                                })}
                            </div>
                            <button 
                                onClick={() => handleDownloadReport(reportData, reportTitle)}
                                className="download-excel-button"
                                style={{ marginTop: '15px' }}
                            >
                                Descargar Excel
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="reports-container">
            <button onClick={onBack} className="reports-back-button">
                Regresar al Panel Principal
            </button>
            <div className="reports-content">
                <h1>REPORTE Y ESTADÍSTICAS</h1>
                <div className="reports-options">
                    <div className="reports-option" onClick={() => handleGenerateReport('Estudiante')}>
                        <i className='bx bxs-user-detail'></i>
                        <button className="reports-option-button">Generar Reporte por Estudiante</button>
                    </div>
                    <div className="reports-option" onClick={() => handleGenerateReport('Grupo')}>
                        <i className='bx bxs-group'></i>
                        <button className="reports-option-button">Generar Reporte por Grupo</button>
                    </div>
                    <div className="reports-option" onClick={() => handleGenerateReport('Global')}>
                        <i className='bx bxs-report'></i>
                        <button className="reports-option-button">Generar Reporte Global</button>
                    </div>
                    {/* --- NUEVO BOTÓN/OPCIÓN PARA VER LOGS DE AUDITORÍA --- */}
                    <div className="reports-option" onClick={handleViewAuditLogs}>
                        <i className='bx bxs-archive'></i> 
                        <button className="reports-option-button">Ver Registros de Auditoría</button>
                    </div>
                    {/* ------------------------------------------------------- */}
                </div>
            </div>
        </div>
    );
}

export default ReportsAndStats;