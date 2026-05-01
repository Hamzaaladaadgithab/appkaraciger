import { initializeApp, getApps, getApp } from 'firebase/app';
// @ts-ignore
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase services
let auth: any;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} catch {
  auth = getAuth(app);
}

export { auth };

// Firebase'in WebChannel'ı, 'global.Image' objesini görürse sorunlu Image Beacon yöntemini dener.
// expo-three bu objeyi sahte (polyfill) olarak yarattığı için çökme yaşanır.
// Firestore'u başlatırken bu objeyi anlık olarak saklayarak Firebase'i standart bağlantıya zorluyoruz.
const tempImage = global.Image;
global.Image = undefined as any;

export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true
});

// İşlem bitince expo-three'nin kullanabilmesi için geri yüklüyoruz
global.Image = tempImage;

