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
  getDocs,        // Read documents
  addDoc,         // Create documents
  updateDoc,      // Update documents
  deleteDoc,      // Delete documents
  collection,     // Reference a collection
  onSnapshot      // Real-time listener
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
  getDocs,         // export for reading tasks
  addDoc,          // export for adding tasks
  updateDoc,       // export for editing tasks
  deleteDoc,       // export for deleting tasks
  collection,      // export for accessing collections
  onSnapshot       // export for real-time updates
};