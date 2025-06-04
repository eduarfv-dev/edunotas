// src/utils/auditLogger.js
import { db, auth } // Asumiendo que exportas 'auth' desde tu firebase.js
from '../firebase'; // Ajusta la ruta a tu archivo de configuración de Firebase
import { collection, addDoc, serverTimestamp, getDoc, doc } from 'firebase/firestore';

const auditLogsCollectionRef = collection(db, "auditLogs");

// Función auxiliar para obtener el rol (puedes expandirla o mejorarla)
async function getCurrentUserRole(uid) {
  if (!uid) return 'ANONYMOUS_OR_SYSTEM';
  try {
    const userDocRef = doc(db, "usuarios", uid);
    const userDocSnap = await getDoc(userDocRef);
    return userDocSnap.exists() ? userDocSnap.data().role : 'UNKNOWN_ROLE';
  } catch (error) {
    console.error("Error fetching user role for audit log:", error);
    return 'ERROR_FETCHING_ROLE';
  }
}

/**
 * Registra un evento de auditoría en Firestore.
 * @param {string} actionType - Un código que describe la acción (ej. USER_CREATED, COURSE_UPDATED).
 * @param {object} eventDetails - Un objeto con detalles adicionales.
 * @param {string} eventDetails.targetEntityType - (Opcional) Tipo de entidad principal afectada (ej. "USUARIO", "CURSO").
 * @param {string} eventDetails.targetEntityId - (Opcional) ID de la entidad principal afectada.
 * @param {string} eventDetails.targetEntityDescription - (Opcional) Descripción de la entidad afectada.
 * @param {object} eventDetails.details - (Opcional) Objeto con más detalles específicos de la acción.
 * @param {string} eventDetails.performedByUserId - (Opcional) UID del usuario que realiza la acción (si no es el usuario actualmente logueado o para acciones de sistema).
 * @param {string} eventDetails.performedByUserDisplayName - (Opcional) Nombre del usuario.
 * @param {string} eventDetails.performedByUserRole - (Opcional) Rol del usuario.
 */
export const logAuditEvent = async (actionType, eventDetails = {}) => {
  try {
    const currentUser = auth.currentUser; // Obtener el usuario autenticado actualmente
    let userIdToLog = 'SYSTEM_OR_UNKNOWN';
    let userDisplayNameToLog = 'N/A';
    let userRoleToLog = 'N/A';

    if (eventDetails.performedByUserId) {
      userIdToLog = eventDetails.performedByUserId;
      userDisplayNameToLog = eventDetails.performedByUserDisplayName || 'N/A';
      userRoleToLog = eventDetails.performedByUserRole || (await getCurrentUserRole(userIdToLog));
    } else if (currentUser) {
      userIdToLog = currentUser.uid;
      userDisplayNameToLog = currentUser.displayName || currentUser.email || 'N/A';
      userRoleToLog = await getCurrentUserRole(currentUser.uid);
    }
    
    const logData = {
      timestamp: serverTimestamp(),
      userId: userIdToLog,
      userDisplayName: userDisplayNameToLog,
      userRole: userRoleToLog,
      actionType: actionType,
      targetEntityType: eventDetails.targetEntityType || null,
      targetEntityId: eventDetails.targetEntityId || null,
      targetEntityDescription: eventDetails.targetEntityDescription || null,
      details: eventDetails.details || {} // Asegurar que details sea un objeto
    };

    await addDoc(auditLogsCollectionRef, logData);
    // console.log("Audit event logged:", actionType, logData); // Descomentar para depuración
  } catch (error) {
    console.error("Error logging audit event:", error, {actionType, eventDetails});
    // Es importante que el logging no rompa la funcionalidad principal.
  }
};