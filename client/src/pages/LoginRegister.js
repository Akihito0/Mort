import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import '../styles/LoginRegister.css';

const LoginRegister = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState({ login: false, register: false });
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  const handleRegister = (e) => {
    e.preventDefault();
    alert('Account created!');
    setIsRegister(false);
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
                <input type="email" required placeholder=" " className="login__input" />
                <label className="login__label">Email</label>
                <i className="ri-mail-fill login__icon"></i>
              </div>
              <div className="login__box">
                <input
                  type={showPassword.login ? 'text' : 'password'}
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
            <a href="#" className="login__forgot">Forgot your password?</a>
            <button type="submit" className="login__button">Login</button>
          </form>

          <div className="login__social">
            <p className="login__social-title">Or login with</p>
            <div className="login__social-links">
              <a href="#" className="login__social-link"><img src="/assets/icon-google.svg" className="login__social-img" alt="Google" /></a>
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
                  <input type="text" required placeholder=" " className="login__input" />
                  <label className="login__label">Name</label>
                  <i className="ri-id-card-fill login__icon"></i>
                </div>
                <div className="login__box">
                  <input type="text" required placeholder=" " className="login__input" />
                  <label className="login__label">Surname</label>
                  <i className="ri-id-card-fill login__icon"></i>
                </div>
              </div>
              <div className="login__box">
                <input type="email" required placeholder=" " className="login__input" />
                <label className="login__label">Email</label>
                <i className="ri-mail-fill login__icon"></i>
              </div>
              <div className="login__box">
                <input
                  type={showPassword.register ? 'text' : 'password'}
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
