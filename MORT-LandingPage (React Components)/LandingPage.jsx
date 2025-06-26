import React, { useState } from "react";
import "../styles/landing-page-styles.css";
import "../styles/loginStyles.css";
import logo from "../assets/logo.png";
import tempDisplay from "../assets/tempDisplay.jfif";
import FirebaseAuth from "../components/firebaseAuth";

const Landing = () => {
  const [showModal, setShowModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  const openLogin = () => {
    setIsLogin(true);
    setShowModal(true);
  };

  const openRegister = () => {
    setIsLogin(false);
    setShowModal(true);
  };

  return (
    <div className="main">
      <main>
        {/* Header */}
        <div className="header">
          <img src={logo} className="logo" alt="MORT Logo" />
          <button className="log-in-button" onClick={openLogin}>LOG IN</button>
          <button className="sign-up-button" onClick={openRegister}>SIGN UP</button>
        </div>

        {/* Get Started */}
        <div className="page1">
          <p className="start-learning-with">
            Start Learning with MORT Today. Empower your learning journey with AI-driven tools.
          </p>
          <button className="get-started-button" onClick={openRegister}>Get Started</button>
        </div>

        {/* Discover */}
        <div className="page2">
          <p className="discover">DISCOVER HOW MORT CAN TRANSFORM YOUR STUDY ROUTINE.</p>
          <img src={tempDisplay} className="temp-display" alt="MORT preview" />
        </div>
      </main>

      {/* Footer */}
      <footer>
        <p>
          <span className="about">About</span>
          <span className="span"> | </span>
          <span className="about">Contact</span>
          <span className="span"> | </span>
          <span className="about">Privacy Policy</span>
          <span className="span"> | </span>
          <span className="about">Terms of Service</span>
        </p>
        <p>© 2025 MORT (My Online Resource Terminal). All Rights Reserved. Built by learners, for learners.</p>
      </footer>

      {/* Auth Modal */}
      {showModal && (
        <FirebaseAuth
          isLogin={isLogin}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default Landing;
