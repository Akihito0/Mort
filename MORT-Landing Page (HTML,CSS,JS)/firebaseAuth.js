import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBOPMpVKeDiMdU5VNfDUsAX46O6KFrloyE",
  authDomain: "mort-test-60f65.firebaseapp.com",
  projectId: "mort-test-60f65",
  storageBucket: "mort-test-60f65.firebasestorage.app",
  messagingSenderId: "1021989014632",
  appId: "1:1021989014632:web:cdac8d21893278d73ebfdd",
  measurementId: "G-SSHDNFLENQ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// DOM references
const authModal = document.getElementById("authModal");
const loginForm = document.getElementById("login");
const registerForm = document.getElementById("register");
const loginContainer = document.getElementById("loginForm");
const registerContainer = document.getElementById("registerForm");
const loginMessage = document.getElementById("loginMessage");
const registerMessage = document.getElementById("registerMessage");

const openLoginBtn = document.querySelector(".log-in-button");
const openRegisterBtn = document.querySelector(".sign-up-button");
const showLoginBtn = document.getElementById("showLogin");
const showRegisterBtn = document.getElementById("showRegister");

// Show modal & toggle forms

// Log in
openLoginBtn.addEventListener("click", () => {
  authModal.classList.remove("hidden");
  loginContainer.classList.remove("hidden");
  registerContainer.classList.add("hidden");
});

// Register
openRegisterBtn.addEventListener("click", () => {
  authModal.classList.remove("hidden");
  registerContainer.classList.remove("hidden");
  loginContainer.classList.add("hidden");
});

document.querySelector(".get-started-button").addEventListener("click", () => {
  authModal.classList.remove("hidden");
  registerContainer.classList.remove("hidden");
  loginContainer.classList.add("hidden");
});

showLoginBtn.addEventListener("click", () => {
  loginContainer.classList.remove("hidden");
  registerContainer.classList.add("hidden");
});

showRegisterBtn.addEventListener("click", () => {
  registerContainer.classList.remove("hidden");
  loginContainer.classList.add("hidden");
});

// Close modal
document.querySelectorAll(".cancel-button").forEach((btn) =>
  btn.addEventListener("click", () => {
    authModal.classList.add("hidden");
  })
);
window.addEventListener("click", (e) => {
  if (e.target === authModal) {
    authModal.classList.add("hidden");
  }
});

// Login handler
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    loginMessage.textContent = "Login successful!";
    loginMessage.style.color = "green";
    window.location.href = "dashboard.html";// Redirect here!!!
  } catch (error) {
    loginMessage.textContent = "Login failed: " + error.message;
    loginMessage.style.color = "red";
  }
});

// Register handler
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("registerEmail").value;
  const password = document.getElementById("registerPassword").value;

  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    await addDoc(collection(db, "users"), {
      uid: userCred.user.uid,
      email: userCred.user.email,
      registeredAt: new Date()
    });
    registerMessage.textContent = "Registration successful! You can now log in.";
    registerMessage.style.color = "green";

    // Switch to login view after successful signup
    loginContainer.classList.remove("hidden");
    registerContainer.classList.add("hidden");
  } catch (error) {
    registerMessage.textContent = "Registration failed: " + error.message;
    registerMessage.style.color = "red";
  }
});
