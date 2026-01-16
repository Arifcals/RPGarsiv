import { initializeApp, getApps } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBKnDYzQKn--6kRJJbl42EU4FQuH2-DQto",
  authDomain: "rpgarsiv-d0d27.firebaseapp.com",
  projectId: "rpgarsiv-d0d27",
  storageBucket: "rpgarsiv-d0d27.firebasestorage.app",
  messagingSenderId: "272307713746",
  appId: "1:272307713746:web:03f6fe2012562419575f0b",
  measurementId: "G-DYBSJY023G",
};

// Firebase'i sadece bir kez başlat
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const storage = getStorage(app);

export { storage };
