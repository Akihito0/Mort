import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/LoginRegister.css';

// Firebase imports
import {
  auth,
  sendPasswordResetEmail,
  collection,
  query,
  where,
  getDocs,
  db
} from '../firestore-database/firebase';

const ForgotPassword = () => {
  const [formData, setFormData] = useState({
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Remove dark mode
    document.body.classList.remove('dark');
  }, []);

  const handleInput = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSendResetEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Check if user exists in Firestore by querying the email field
      const usersQuery = query(
        collection(db, "Morts-User"), 
        where("email", "==", formData.email)
      );
      const querySnapshot = await getDocs(usersQuery);
      
      if (querySnapshot.empty) {
        alert("No account found with this email address.");
        setLoading(false);
        return;
      }

      // Send password reset email using Firebase Auth
      await sendPasswordResetEmail(auth, formData.email);
      
      setEmailSent(true);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        alert("No account found with this email address.");
      } else if (error.code === 'auth/invalid-email') {
        alert("Invalid email address.");
      } else {
        alert("Error sending password reset email: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-form">
        <h1 className="login__title">
          {emailSent ? "Email Sent!" : "Reset your password"}
        </h1>
        <p className="login__subtitle">
          {emailSent 
            ? `We've sent a password reset link to ${formData.email}. Check your email and follow the instructions to reset your password.`
            : "Enter your email address and we'll send you a password reset link"
          }
        </p>
        <div className="login__area">
          {!emailSent ? (
            <form className="login__form" onSubmit={handleSendResetEmail}>
              <div className="login__content grid">
                <div className="login__box">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInput}
                    required
                    placeholder=" "
                    className="login__input"
                  />
                  <label className="login__label">Email</label>
                  <i className="ri-mail-fill login__icon"></i>
                </div>
              </div>
              <button type="submit" className="login__button" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          ) : (
            <div className="login__form">
              <div className="login__content grid">
                <p style={{ textAlign: 'center', color: 'var(--text-color)', marginBottom: '1rem' }}>
                  Didn't receive the email? Check your spam folder or try again.
                </p>
                <button 
                  type="button" 
                  className="login__button"
                  onClick={() => {
                    setEmailSent(false);
                    setFormData({ email: '' });
                  }}
                >
                  Send Another Email
                </button>
              </div>
            </div>
          )}
          <p className="login__switch">
            Remember your password? <button type="button" onClick={() => navigate('/login')}>Back to Login</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
