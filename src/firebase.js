// src/firebase.js

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth"; // <--- AÑADE ESTA LÍNEA

const firebaseConfig = {
    apiKey: "AIzaSyAfqCmeSruCGSPObmCmUpayOtYroHRyZPI",
    authDomain: "proyecto-react-9cbc3.firebaseapp.com",
    projectId: "proyecto-react-9cbc3",
    storageBucket: "proyecto-react-9cbc3.firebasestorage.app",
    messagingSenderId: "206850531114",
    appId: "1:206850531114:web:8cfd6df0f977ca36608853"
  };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app); // <--- AÑADE ESTA LÍNEA para inicializar Auth

export { db, auth }; // <--- MODIFICA ESTA LÍNEA para exportar también 'auth'