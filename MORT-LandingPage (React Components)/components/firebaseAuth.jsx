import React, { useState } from "react";
import "../styles/loginStyles.css";
import { auth } from "../firebase/firebaseConfig";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "firebase/auth";

const FirebaseAuth = ({ isLogin, onClose }) => {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showLogin, setShowLogin] = useState(isLogin);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      setMessage("Login successful!");
      window.location.href = "/dashboard";
    } catch (error) {
      setMessage("Login failed: " + error.message);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, registerEmail, registerPassword);
      setMessage("Registration successful! You can now log in.");
      setShowLogin(true);
    } catch (error) {
      setMessage("Registration failed: " + error.message);
    }
  };

  return (
    <div className="modal login-style" onClick={(e) => e.target.classList.contains('modal') && onClose()}>
      <div className="modal-content">
        <div className="form-toggle">
          <button onClick={() => setShowLogin(true)}>Log In</button>
          <button onClick={() => setShowLogin(false)}>Sign Up</button>
        </div>

        {showLogin ? (
          <form onSubmit={handleLogin}>
            <h2>Log In</h2>
            <input type="email" placeholder="Email" required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
            <input type="password" placeholder="Password" required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
            <div className="form-buttons">
              <button type="button" className="cancel-button" onClick={onClose}>Cancel</button>
              <button type="submit" className="submit-button">Confirm</button>
            </div>
            <p>{message}</p>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <h2>Sign Up</h2>
            <input type="email" placeholder="Email" required value={registerEmail} onChange={(e) => setRegisterEmail(e.target.value)} />
            <input type="password" placeholder="Password" required value={registerPassword} onChange={(e) => setRegisterPassword(e.target.value)} />
            <div className="form-buttons">
              <button type="button" className="cancel-button" onClick={onClose}>Cancel</button>
              <button type="submit" className="submit-button">Confirm</button>
            </div>
            <p>{message}</p>
          </form>
        )}
      </div>
    </div>
  );
};

export default FirebaseAuth;
