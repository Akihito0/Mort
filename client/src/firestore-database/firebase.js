// src/firestore-database/firebase.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  setPersistence,
  browserSessionPersistence,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  collection,
  onSnapshot
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDGbdqTqALsXvs4tm98yL4-lEvsK00ssKw",
  authDomain: "morts-database.firebaseapp.com",
  projectId: "morts-database",
  storageBucket: "morts-database.firebasestorage.app",
  messagingSenderId: "981455480366",
  appId: "1:981455480366:web:fa82e61c7b7e50a25161bf",
  measurementId: "G-B8FHH4PGXM"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export {
  auth,
  db,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  setPersistence,
  browserSessionPersistence,
  doc,
  setDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  collection,
  onSnapshot
};
