// functions/index.js
const functions = require("firebase-functions");
const admin = require("firebase-admin");

try {
  admin.initializeApp();
} catch (e) {
  console.log("Admin SDK ya inicializado");
}

exports.createUser = functions.https.onCall(async (data, context) => {

  if (!context.auth) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "El usuario debe estar autenticado.",
    );
  }

  const callerUid = context.auth.uid;
  let callerDoc;
  try {
       callerDoc = await admin.firestore()
         .collection("usuarios").doc(callerUid).get();
  } catch(error){
       console.error("Error fetching caller document:", error);
       throw new functions.https.HttpsError(
        "internal",
        "Error al verificar permisos.",
       );
  }


  if (!callerDoc.exists || callerDoc.data().role !== "admin") {
    throw new functions.https.HttpsError(
        "permission-denied",
        "Permiso denegado. Solo administradores.",
    );
  }

  const {email, password, role, firstName, lastName, displayName} = data;
  if (!email || !password || !role || !firstName || !lastName) {
    throw new functions.https.HttpsError(
        "invalid-argument",
        "Faltan datos requeridos.",
    );
  }

  const validRoles = ["student", "teacher", "admin"];
  if (!validRoles.includes(role)) {
    throw new functions.https.HttpsError(
        "invalid-argument",
        `Rol inválido: ${role}.`,
    );
  }

  let newUserRecord;
  try {
    newUserRecord = await admin.auth().createUser({
      email: email,
      password: password,
      displayName: displayName || `${firstName} ${lastName}`,
    });
    console.log("Usuario creado en Auth:", newUserRecord.uid);
  } catch (error) {
    console.error("Error creando usuario en Auth:", error);
    if (error.code === "auth/email-already-exists") {
      throw new functions.https.HttpsError(
          "already-exists",
          "El correo ya está en uso.",
      );
    } else if (error.code === "auth/invalid-password") {
      throw new functions.https.HttpsError(
          "invalid-argument",
          "La contraseña debe tener al menos 6 caracteres.",
      );
    }
    throw new functions.https.HttpsError(
        "internal",
        "Error en Firebase Authentication.",
    );
  }

  try {
    const userDocRef = admin.firestore()
        .collection("usuarios").doc(newUserRecord.uid);

    await userDocRef.set({
      email: email,
      role: role,
      firstName: firstName,
      lastName: lastName,
      displayName: displayName || `${firstName} ${lastName}`,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log("Documento creado en Firestore:", newUserRecord.uid);
  } catch (error) {
    console.error("Error creando documento en Firestore:", error);
    // Considera borrar el usuario de Auth si falla Firestore
    // await admin.auth().deleteUser(newUserRecord.uid).catch(err => console.error("Failed to delete user from Auth after Firestore failure:", err));
    throw new functions.https.HttpsError(
        "internal",
        "Error al guardar datos del usuario en base de datos.",
    );
  }

  return {success: true, userId: newUserRecord.uid};
});
