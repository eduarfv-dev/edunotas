# EDUNOTAS - Plataforma de Notas Escolares

Plataforma web para la gestión de calificaciones escolares, Permite la interacción de tres roles: Administrador, Profesor y Estudiante.

## Descripción

EDUNOTAS es una aplicación construida con React.js que se conecta a servicios de Firebase para la autenticación de usuarios, almacenamiento de datos (Firestore) y despliegue (Hosting).

## Características Principales (Implementadas / En Desarrollo)

*   Autenticación de usuarios por correo y contraseña (Firebase Auth).
*   Sistema de roles (Administrador, Profesor, Estudiante) leído desde Firestore.
*   Redirección a dashboards específicos según el rol.
*   **[Profesor]** Registro/Actualización de calificaciones ("Nota 1", "Nota 2", "Nota 3") para estudiantes en cursos asignados (Firestore).
*   **[Profesor]** Visualización de cursos asignados (Leído desde Firestore).
*   **[Profesor]** Visualización de estudiantes inscritos por curso (Leído desde Firestore).
*   **[Estudiante]** Dashboard básico.
*   **[Admin]** Dashboard básico.
*   (Funcionalidades como Ver Notas (Estudiante/Profesor), Gestión de Usuarios/Cursos (Admin), Chat, Foro están planificadas o en desarrollo).

## Tecnologías Utilizadas

*   **Frontend:** React.js (v19+)
*   **Backend & Infraestructura:** Firebase
    *   Firebase Authentication (Email/Password)
    *   Firebase Firestore (Base de Datos NoSQL)
    *   Firebase Hosting (Despliegue Web)
*   **Estilos:** CSS Básico
*   **Build Tool:** Create React App (react-scripts v5+)
*   **Gestor de Paquetes:** npm
*   **Control de Versiones:** Git / GitHub

## Requisitos Previos

*   **Node.js:** Versión LTS reciente (v18 o v20 recomendado). Verificar con `node -v`. (Configuración de OpenSSL manejada en `package.json`).
*   **npm:** Incluido con Node.js (`npm -v`).
*   **Firebase CLI:** Necesario para desplegar. Instalar globalmente: `npm install -g firebase-tools`.

## Instalación

1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/eduarfv-dev/edunotas.git
    ```
2.  **Navegar a la carpeta del proyecto:**
    ```bash
    cd programasena 
    ```
3.  **Instalar dependencias:**
    ```bash
    npm install
    ```

## Configuración de Firebase

1.  **Crear/Usar Proyecto Firebase:** Necesitas un proyecto en [https://console.firebase.google.com/](https://console.firebase.google.com/).
2.  **Registrar Aplicación Web:** Dentro del proyecto Firebase -> Configuración del proyecto (⚙️) -> General -> Tus apps -> Añadir aplicación -> Web (`</>`).
3.  **Obtener Configuración SDK:** Copia el objeto `firebaseConfig` que te proporciona Firebase después de registrar la app.
4.  **Crear Archivo `.env`:**
    *   En la **raíz** de tu proyecto clonado, crea un archivo llamado `.env`.
    *   **IMPORTANTE:** Asegúrate de que `.env` esté listado en tu archivo `.gitignore`.
    *   Pega tu configuración en `.env` usando el prefijo `REACT_APP_`:
      ```plaintext
      # .env
      REACT_APP_FIREBASE_API_KEY=TU_API_KEY_AQUI
      REACT_APP_FIREBASE_AUTH_DOMAIN=TU_AUTH_DOMAIN_AQUI
      REACT_APP_FIREBASE_PROJECT_ID=TU_PROJECT_ID_AQUI
      REACT_APP_FIREBASE_STORAGE_BUCKET=TU_STORAGE_BUCKET_AQUI
      REACT_APP_FIREBASE_MESSAGING_SENDER_ID=TU_MESSAGING_SENDER_ID_AQUI
      REACT_APP_FIREBASE_APP_ID=TU_APP_ID_AQUI
      # REACT_APP_FIREBASE_MEASUREMENT_ID=TU_MEASUREMENT_ID_AQUI (Opcional)
      ```
    *   *(El archivo `src/firebase.js` ya está configurado para leer estas variables).*
5.  **Configurar Servicios Firebase:**
    *   **Authentication:** Habilita "Correo electrónico/Contraseña". Crea usuarios de prueba (admin, profesor, estudiante) con correos y contraseñas. Anota sus UIDs.
    *   **Firestore:** Crea la base de datos.
        *   Crea la colección `usuarios`. Añade documentos para cada usuario de Auth, usando su **UID como ID del documento** y asegurándote de incluir un campo `role` (`admin`, `teacher`, `student`) y `displayName` (o `firstName`/`lastName`).
        *   Crea la colección `cursos`. Añade documentos de curso, asegurándote de incluir `teacherId` (UID del profesor) y `studentIds` (array con UIDs de estudiantes).
        *   Configura las **Reglas de Seguridad** (puedes usar las "equilibradas" que te proporcioné).
        *   La colección `grades` se creará automáticamente al guardar la primera nota.

## Ejecución (Modo Desarrollo)

1.  Asegúrate de tener el archivo `.env` configurado en la raíz.
2.  Ejecuta en la terminal desde la raíz del proyecto:
    ```bash
    npm start
    ```
3.  La aplicación se abrirá en `http://localhost:3000`.

## Build (Producción)

```bash
npm run build
Los archivos optimizados se generan en la carpeta build.
Despliegue (Firebase Hosting)
Inicia Sesión en Firebase (si es necesario):
firebase login
Inicializa Firebase Hosting (si es la primera vez en esta carpeta):
firebase init hosting
Selecciona tu proyecto Firebase.
Directorio público: build.
Configura como SPA: Yes.
GitHub: No.
Genera el Build de Producción (si hiciste cambios):
npm run build
Despliega:
firebase deploy --only hosting.
La URL de despliegue será mostrada al finalizar.
Licencia
Este proyecto está bajo la Licencia MIT. Ver el archivo LICENSE para más detalles.