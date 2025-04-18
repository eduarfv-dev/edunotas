import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

const firebaseConfig = {
    apiKey: "AIzaSyAfqCmeSruCGSPObmCmUpayOtYroHRyZPI", // Reemplaza si usas variables de entorno
    authDomain: "proyecto-react-9cbc3.firebaseapp.com",
    projectId: "proyecto-react-9cbc3",
    storageBucket: "proyecto-react-9cbc3.firebasestorage.app",
    messagingSenderId: "206850531114",
    appId: "1:206850531114:web:8cfd6df0f977ca36608853"
  };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const functions = getFunctions(app); // Puedes especificar la región si es necesario, ej: getFunctions(app, 'us-central1');

// Conecta a los emuladores SOLO si estamos en localhost
if (window.location.hostname === "localhost") {
  console.warn("MODO LOCAL: Conectando a Firebase Emulators...");
  // Usa los puertos por defecto o los que configuraste
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
    console.log("Firestore Emulator conectado en puerto 8080");
  } catch (e) { console.error("Error conectando Firestore Emulator:", e); }
  try {
    // Nota: Para Auth, el protocolo http:// es importante
    connectAuthEmulator(auth, 'http://localhost:9099');
    console.log("Auth Emulator conectado en puerto 9099");
  } catch (e) { console.error("Error conectando Auth Emulator:", e); }
  try {
    connectFunctionsEmulator(functions, 'localhost', 5001);
    console.log("Functions Emulator conectado en puerto 5001");
  } catch (e) { console.error("Error conectando Functions Emulator:", e); }
}

export { db, auth, functions };