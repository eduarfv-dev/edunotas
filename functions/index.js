const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

// Función para obtener todos los cursos
// eslint-disable-next-line no-unused-vars
exports.getCourses = functions.https.onCall(async (data, context) => {
  // Opcional: Verificar si el usuario está autenticado y tiene el rol adecuado
  // if (!context.auth) {
  //   throw new functions.https.HttpsError('unauthenticated', 'La función solo puede ser llamada por usuarios autenticados.');
  // }
  // const userRole = context.auth.token.role; // Asumiendo que tienes un custom claim 'role'
  // if (userRole !== 'admin') {
  //   throw new functions.https.HttpsError('permission-denied', 'No tienes permiso para realizar esta acción.');
  // }

  try {
    const coursesSnapshot = await admin.firestore().collection("cursos").orderBy("name").get();
    const coursesList = coursesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    functions.logger.info("Cursos obtenidos:", coursesList); // Log para depuración
    return { courses: coursesList };
  } catch (error) {
    functions.logger.error("Error al obtener los cursos:", error); // Log para depuración
    throw new functions.https.HttpsError("internal", "Error al obtener los cursos.", error.message);
  }
});

// Función para crear un nuevo curso
// eslint-disable-next-line no-unused-vars
exports.createCourse = functions.https.onCall(async (data, context) => {
  // Opcional: Verificar autenticación y rol de admin
  // if (!context.auth || context.auth.token.role !== 'admin') {
  //   throw new functions.https.HttpsError('permission-denied', 'No tienes permiso para crear cursos.');
  // }

  const { name, description, teacherId } = data;

  if (!name) {
    throw new functions.https.HttpsError("invalid-argument", "El nombre del curso es requerido.");
  }

  try {
    const newCourseRef = await admin.firestore().collection("cursos").add({
      name: name,
      description: description || "",
      teacherId: teacherId || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    functions.logger.info("Curso creado:", newCourseRef.id);
    return { courseId: newCourseRef.id, message: "Curso creado exitosamente." };
  } catch (error) {
    functions.logger.error("Error al crear el curso:", error);
    throw new functions.https.HttpsError("internal", "Error al crear el curso.", error.message);
  }
});

// Función para actualizar un curso existente
// eslint-disable-next-line no-unused-vars
exports.updateCourse = functions.https.onCall(async (data, context) => {
  // Opcional: Verificar autenticación y rol de admin
  // if (!context.auth || context.auth.token.role !== 'admin') {
  //   throw new functions.https.HttpsError('permission-denied', 'No tienes permiso para actualizar cursos.');
  // }

  const { courseId, name, description, teacherId } = data;

  if (!courseId) {
    throw new functions.https.HttpsError("invalid-argument", "El ID del curso es requerido para actualizar.");
  }
  if (!name) {
    throw new functions.https.HttpsError("invalid-argument", "El nombre del curso es requerido.");
  }

  try {
    const courseRef = admin.firestore().collection("cursos").doc(courseId);
    await courseRef.update({
      name: name,
      description: description,
      teacherId: teacherId, // Asegúrate que este campo exista o quieras actualizarlo
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    functions.logger.info("Curso actualizado:", courseId);
    return { message: "Curso actualizado exitosamente." };
  } catch (error) {
    functions.logger.error("Error al actualizar el curso:", courseId, error);
    throw new functions.https.HttpsError("internal", "Error al actualizar el curso.", error.message);
  }
});

// Función para eliminar un curso
// eslint-disable-next-line no-unused-vars
exports.deleteCourse = functions.https.onCall(async (data, context) => {
  // Opcional: Verificar autenticación y rol de admin
  // if (!context.auth || context.auth.token.role !== 'admin') {
  //   throw new functions.https.HttpsError('permission-denied', 'No tienes permiso para eliminar cursos.');
  // }

  const { courseId } = data;

  if (!courseId) {
    throw new functions.https.HttpsError("invalid-argument", "El ID del curso es requerido para eliminar.");
  }

  try {
    await admin.firestore().collection("cursos").doc(courseId).delete();
    functions.logger.info("Curso eliminado:", courseId);
    return { message: "Curso eliminado exitosamente." };
  } catch (error) {
    functions.logger.error("Error al eliminar el curso:", courseId, error);
    throw new functions.https.HttpsError("internal", "Error al eliminar el curso.", error.message);
  }
});
