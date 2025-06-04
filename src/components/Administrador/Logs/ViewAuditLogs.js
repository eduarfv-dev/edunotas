// src/components/Administrador/Logs/ViewAuditLogs.js
import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../../../firebase'; 
import { collection, query, orderBy, getDocs, limit, startAfter, Timestamp, where } from 'firebase/firestore';
import './ViewAuditLogs.css'; 

const LOGS_PER_PAGE = 25;
const SHOW_JSON_PLACEHOLDER = "SHOW_JSON_DETAILS"; 

const formatActionType = (actionType) => {
  const actionMap = { 
    USER_CREATED: "Usuario Creado", USER_UPDATED: "Usuario Actualizado",
    USER_DISABLED: "Usuario Inhabilitado", USER_ENABLED: "Usuario Habilitado",
    USER_FIRESTORE_DELETED: "Datos Usuario Eliminados", USER_CREATION_FAILED: "Falló Creación Usuario",
    USER_UPDATE_FAILED: "Falló Actualización Usuario", USER_FIRESTORE_DELETE_FAILED: "Falló Eliminación Datos Usuario",
    USER_DISABLE_FAILED: "Falló Inhabilitación Usuario", USER_ENABLE_FAILED: "Falló Habilitación Usuario",
    COURSE_CREATED: "Curso Creado", COURSE_UPDATED: "Curso Actualizado", COURSE_DELETED: "Curso Eliminado",
    GRADE_GROUP_CREATED: "Grupo/Grado Creado", GRADE_GROUP_UPDATED: "Grupo/Grado Actualizado",
    GRADE_GROUP_DELETED: "Grupo/Grado Eliminado", QUALIFICATIONS_SAVED: "Calificaciones Guardadas",
  };
  return actionMap[actionType] || actionType;
};

const formatEntityType = (entityType) => { 
  if (!entityType) return '-';
  const entityMap = {
    USUARIO: "Usuario", CURSO: "Curso", GRADO: "Grupo/Grado",
    CALIFICACIONES_LOTE: "Lote de Calificaciones",
  };
  return entityMap[entityType] || entityType.charAt(0).toUpperCase() + entityType.slice(1).toLowerCase();
};

const formatLogDetails = (details, actionType) => {
  if (!details || Object.keys(details).length === 0) return '-';
  let formattedString = "";
  try { 
    switch (actionType) {
      case 'USER_CREATED': case 'USER_CREATION_FAILED':
        formattedString = `Rol: ${details.roleCreated || details.formData?.role || 'N/A'}`;
        if (details.assignedGradeId) formattedString += `, Grado ID: ${details.assignedGradeId}`;
        if (details.email) formattedString += `, Email: ${details.email}`;
        if (details.error) formattedString += ` | Error: (${details.errorCode}) ${details.error}`;
        break;
      case 'USER_UPDATED': case 'USER_UPDATE_FAILED':
        if (details.changes && Object.keys(details.changes).length > 0) {
          formattedString = "Cambios: ";
          formattedString += Object.entries(details.changes)
            .map(([key, val]) => `${key} ('${val.from === undefined || val.from === '' ? 'Vacío' : val.from}' -> '${val.to === undefined || val.to === '' ? 'Vacío' : val.to}')`).join('; ');
        } else if (details.error) { formattedString = `Error: ${details.error}`;
        } else { formattedString = "Actualización procesada."; }
        break;
      case 'USER_DISABLED': case 'USER_ENABLED':
        formattedString = `Nuevo estado: ${details.newStatus === true ? 'Inhabilitado' : (details.newStatus === false ? 'Habilitado' : 'N/A') }`;
        break;
      case 'USER_DISABLE_FAILED': case 'USER_ENABLE_FAILED': case 'USER_FIRESTORE_DELETE_FAILED':
          formattedString = `Error: ${details.error || 'Desconocido'}`;
          break;
      case 'QUALIFICATIONS_SAVED':
        formattedString = `Estudiantes: ${details.studentsInContext ?? 'N/A'}. Operaciones: ${details.actualWriteOperations ?? 0}.`;
        if(details.courseId) formattedString += ` Curso ID: ${details.courseId}.`;
        if(details.gradeId) formattedString += ` Grupo ID: ${details.gradeId}.`;
        break;
      default: return SHOW_JSON_PLACEHOLDER; 
    }
  } catch (e) { console.error("Error formatting details:", e, details); return SHOW_JSON_PLACEHOLDER; }
  return formattedString;
};

function ViewAuditLogs({ onBack }) {
  const [auditLogs, setAuditLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastVisibleLog, setLastVisibleLog] = useState(null);
  const [hasMoreLogs, setHasMoreLogs] = useState(true);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [modalContent, setModalContent] = useState('');
  const [filterDate, setFilterDate] = useState(''); 

  const fetchAuditLogs = useCallback(async (loadMore = false) => {
    const dateToFilter = filterDate; // Usar el estado actual de filterDate
    setIsLoading(true); setError('');
    try {
      const logsRef = collection(db, "auditLogs");
      let qConstraints = [orderBy("timestamp", "desc")];
      if (dateToFilter) {
        const selectedDay = new Date(dateToFilter + "T00:00:00"); 
        const startOfDay = Timestamp.fromDate(selectedDay);
        const endOfDayDate = new Date(selectedDay);
        endOfDayDate.setDate(selectedDay.getDate() + 1); 
        const endOfDay = Timestamp.fromDate(endOfDayDate);
        qConstraints.push(where("timestamp", ">=", startOfDay));
        qConstraints.push(where("timestamp", "<", endOfDay));
      }
      if (loadMore && lastVisibleLog) { qConstraints.push(startAfter(lastVisibleLog)); } 
      else { 
        // Si no es loadMore, es una carga nueva (inicial o por cambio de filtro)
        setAuditLogs([]); 
        setLastVisibleLog(null); 
        setHasMoreLogs(true); 
      }
      qConstraints.push(limit(LOGS_PER_PAGE));
      const q = query(logsRef, ...qConstraints);
      const querySnapshot = await getDocs(q);
      const logsData = querySnapshot.docs.map(docSnap => { const data = docSnap.data();
        return { id: docSnap.id, ...data, timestamp: data.timestamp instanceof Timestamp ? data.timestamp.toDate() : new Date() };
      });
      if (querySnapshot.docs.length < LOGS_PER_PAGE) { setHasMoreLogs(false); }
      else { setHasMoreLogs(true); setLastVisibleLog(querySnapshot.docs[querySnapshot.docs.length - 1]); }
      if (loadMore) { setAuditLogs(prevLogs => [...prevLogs, ...logsData]); } 
      else { setAuditLogs(logsData); }
    } catch (err) { 
      console.error("Error fetching audit logs:", err); 
      setError("No se pudieron cargar los registros."); 
      setAuditLogs([]); setHasMoreLogs(false);
    } 
    setIsLoading(false);
  }, [lastVisibleLog, filterDate]); // filterDate es ahora una dependencia

  useEffect(() => {
    fetchAuditLogs(); // Carga cuando el componente monta o filterDate cambia
  }, [filterDate, fetchAuditLogs]); // Se re-ejecuta si filterDate cambia


  const formatTimestamp = (dateObject) => {
    if (!dateObject || !(dateObject instanceof Date)) return 'Fecha inválida';
    return dateObject.toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const handleShowJsonDetails = (detailsObject) => {
    setModalContent(JSON.stringify(detailsObject, null, 2));
    setShowDetailsModal(true);
  };

  const handleFilterDateChange = (e) => {
    setFilterDate(e.target.value);
    // El useEffect se encargará de llamar a fetchAuditLogs con la nueva fecha
  };

  const clearFilter = () => {
    setFilterDate('');
    // El useEffect también se encargará de recargar sin filtro
  };

  return (
    <div className="view-audit-logs-container">
      <button onClick={onBack} className="view-audit-logs-back-button">Regresar a Reportes</button>
      <div className="view-audit-logs-content">
        <h2>Registros de Auditoría</h2>
        <div className="audit-filters">
          <label htmlFor="filterDateInput">Filtrar por Día:</label>
          <input type="date" id="filterDateInput" value={filterDate} onChange={handleFilterDateChange} />
          {filterDate && (<button onClick={clearFilter} className="clear-filter-button">Limpiar Filtro</button>)}
        </div>
        {error && <p className="error-message">{error}</p>}
        {!isLoading && !error && auditLogs.length === 0 && filterDate && (<p className="no-logs-message">No hay registros para la fecha seleccionada.</p>)}
        {!isLoading && !error && auditLogs.length === 0 && !filterDate && (<p className="no-logs-message">No hay registros de auditoría para mostrar.</p>)}
        
        {auditLogs.length > 0 && (
          <div className="audit-logs-table-wrapper">
            <table>
              <thead><tr><th>Fecha y Hora</th><th>Usuario</th><th>Rol</th><th>Acción</th><th>Entidad</th><th>Descripción Entidad</th><th>Detalles</th></tr></thead>
              <tbody>
                {auditLogs.map(log => {
                  const formattedDetail = formatLogDetails(log.details, log.actionType);
                  return (
                    <tr key={log.id}>
                      <td>{formatTimestamp(log.timestamp)}</td>
                      <td>{log.userDisplayName || log.userId || 'N/A'}</td>
                      <td>{log.userRole ? log.userRole.charAt(0).toUpperCase() + log.userRole.slice(1) : 'N/A'}</td>
                      <td>{formatActionType(log.actionType)}</td>
                      <td>{formatEntityType(log.targetEntityType)}</td>
                      <td>{log.targetEntityDescription || '-'}</td>
                      <td>
                        {formattedDetail === SHOW_JSON_PLACEHOLDER ? (
                          Object.keys(log.details || {}).length > 0 ? (
                            <button className="details-json-button" onClick={() => handleShowJsonDetails(log.details)}>Ver JSON</button>
                          ) : '-'
                        ) : ( formattedDetail )}
                      </td>
                    </tr> );
                })}
              </tbody>
            </table>
          </div>
        )}
        {isLoading && auditLogs.length === 0 && <p className="loading-message">Cargando logs...</p>} 
        {isLoading && auditLogs.length > 0 && <p className="loading-message" style={{textAlign: 'center', marginTop: '15px'}}>Cargando más logs...</p>}
        {!isLoading && hasMoreLogs && auditLogs.length > 0 && (
          <button onClick={() => fetchAuditLogs(true)} className="load-more-button" disabled={isLoading}>Cargar Más</button>
        )}
         {!isLoading && !hasMoreLogs && auditLogs.length > 0 && (
            <p className="no-more-logs-message">No hay más registros para mostrar{filterDate ? ` para esta fecha` : ''}.</p>
        )}
      </div>
      {showDetailsModal && (
        <div className="audit-details-modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="audit-details-modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Detalles Técnicos (JSON)</h3>
            <pre className="log-details-pre modal-pre">{modalContent}</pre>
            <button onClick={() => setShowDetailsModal(false)} className="modal-close-button">Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}
export default ViewAuditLogs;