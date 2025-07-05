import React, { useState } from 'react';
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/LoginRegister.css';

// Firebase imports
import {
  auth,
  db,
  GoogleAuthProvider,
  fetchSignInMethodsForEmail,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  setPersistence,
  browserSessionPersistence,
  doc,
  setDoc
} from '../firestore-database/firebase';

const LoginRegister = () => {
  const [showPassword, setShowPassword] = useState({ login: false, register: false });
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const mode = queryParams.get('mode');

  const [isRegister, setIsRegister] = useState(mode === 'register');

  useEffect(() => {
    setIsRegister(mode === 'register');
  }, [mode]);

  useEffect(() => {
  // Forcefully remove dark mode AND prevent it from being added again
  document.body.classList.remove('dark');
  
}, []);

  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    password: ''
  });

  const handleInput = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      navigate('/dashboard');
    } catch (error) {
      alert("Login Failed: " + error.message);
    }
  };

  //Firebase Google login with Firestore user saving
  const handleGoogleLogin = async (e) => {
  e.preventDefault();
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });

  try {
    await setPersistence(auth, browserSessionPersistence);

    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const existingMethods = await fetchSignInMethodsForEmail(auth, user.email);

    if (
      existingMethods.length > 0 &&
      !existingMethods.includes('google.com')
    ) {
      alert(
        `This email is already registered using another method (e.g., Email & Password). Please log in using that method.`
      );
      return;
    }

    await setDoc(
      doc(db, 'Morts-User', user.uid),
      {
        name: user.displayName?.split(' ')[0] || '',
        surname: user.displayName?.split(' ')[1] || '',
        email: user.email,
        uid: user.uid,
        provider: 'google',
        createdAt: new Date().toISOString(),
      },
      { merge: true }
    );

    navigate('/dashboard');
  } catch (error) {
    if (error.code !== 'auth/popup-closed-by-user') {
      alert('Google Login Failed: ' + error.message);
    }
  }
};


  const handleRegister = async (e) => {
  e.preventDefault();
  const { email, password, name, surname } = formData;

  try {
    const existingMethods = await fetchSignInMethodsForEmail(auth, email);

    if (existingMethods.length > 0) {
      const message =
        existingMethods.includes('google.com')
          ? `This email is already registered using Google Sign-In. Please log in using Google.`
          : `This email is already registered. Please log in instead.`;

      alert(message);
      return;
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await updateProfile(user, {
      displayName: `${name} ${surname}`,
    });

    await setDoc(doc(db, 'Morts-User', user.uid), {
      name,
      surname,
      email,
      uid: user.uid,
      provider: 'email',
      createdAt: new Date().toISOString(),
    });

    alert('Account successfully created! Please log in.');
    setIsRegister(false);
    setFormData({ name: '', surname: '', email: '', password: '' });

  } catch (error) {
    alert('Registration Failed: ' + error.message);
  }
};

  return (
    <div className={`login container grid ${isRegister ? 'active' : ''}`}>
      {/* Login Form */}
      <div className="login__access">
        <h1 className="login__title">Log in to your account.</h1>
        <div className="login__area">
          <form className="login__form" onSubmit={handleLogin}>
            <div className="login__content grid">
              <div className="login__box">
                {/* 🟩 Bind email to formData */}
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
              <div className="login__box">
                {/* 🟩 Bind password to formData */}
                <input
                  type={showPassword.login ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInput}
                  required
                  placeholder=" "
                  className="login__input"
                />
                <label className="login__label">Password</label>
                <i
                  className={`ri-eye${showPassword.login ? '' : '-off'}-fill login__icon login__password`}
                  onClick={() =>
                    setShowPassword((prev) => ({ ...prev, login: !prev.login }))
                  }
                ></i>
              </div>
            </div>
            <button type="button" className="login__forgot" onClick={() => navigate('/forgot-password')}>Forgot your password?</button>
            <button type="submit" className="login__button">Login</button>
          </form>

          <div className="login__social">
            <p className="login__social-title">Or login with</p>
            <div className="login__social-links">
              {/* 🟩 Google sign in button */}
              <button onClick={handleGoogleLogin} type="button" className="login__social-link">
                <img src="/assets/icon-google.svg" className="login__social-img" alt="Google" />
              </button>
              <a href="#" className="login__social-link"><img src="/assets/icon-facebook.svg" className="login__social-img" alt="Facebook" /></a>
              <a href="#" className="login__social-link"><img src="/assets/icon-apple.svg" className="login__social-img" alt="Apple" /></a>
            </div>
          </div>

          <p className="login__switch">
            Don't have an account? <button type="button" onClick={() => setIsRegister(true)}>Create Account</button>
          </p>
        </div>
      </div>

      {/* Register Form */}
      <div className="login__register">
        <h1 className="login__title">Create new account.</h1>
        <div className="login__area">
          <form className="login__form" onSubmit={handleRegister}>
            <div className="login__content grid">
              <div className="login__group grid">
                <div className="login__box">
                  {/* 🟩 Bind name to formData */}
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInput}
                    required
                    placeholder=" "
                    className="login__input"
                  />
                  <label className="login__label">Name</label>
                  <i className="ri-id-card-fill login__icon"></i>
                </div>
                <div className="login__box">
                  {/* 🟩 Bind surname to formData */}
                  <input
                    type="text"
                    name="surname"
                    value={formData.surname}
                    onChange={handleInput}
                    required
                    placeholder=" "
                    className="login__input"
                  />
                  <label className="login__label">Surname</label>
                  <i className="ri-id-card-fill login__icon"></i>
                </div>
              </div>
              <div className="login__box">
                {/* 🟩 Bind email to formData */}
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
              <div className="login__box">
                {/* 🟩 Bind password to formData */}
                <input
                  type={showPassword.register ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInput}
                  required
                  placeholder=" "
                  className="login__input"
                />
                <label className="login__label">Password</label>
                <i
                  className={`ri-eye${showPassword.register ? '' : '-off'}-fill login__icon login__password`}
                  onClick={() =>
                    setShowPassword((prev) => ({ ...prev, register: !prev.register }))
                  }
                ></i>
              </div>
            </div>
            <button type="submit" className="login__button">Create account</button>
          </form>
          <p className="login__switch">
            Already have an account? <button type="button" onClick={() => setIsRegister(false)}>Log In</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginRegister;
