import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // No necesitas connectFirestoreEmulator
import { getAuth } from "firebase/auth";             // No necesitas connectAuthEmulator
import { getFunctions } from "firebase/functions"; // No necesitas connectFunctionsEmulator

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
const functions = getFunctions(app); 
export { db, auth, functions };