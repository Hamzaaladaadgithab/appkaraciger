import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAnPuGN6e18T2Ej6tiGHnhLVEJTmjGoyWM",
  authDomain: "karacigerapp.firebaseapp.com",
  projectId: "karacigerapp",
  storageBucket: "karacigerapp.firebasestorage.app",
  messagingSenderId: "375273561656",
  appId: "1:375273561656:web:9c4d41b024119914c110cd",
  measurementId: "G-MBNX9C4ZZT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
