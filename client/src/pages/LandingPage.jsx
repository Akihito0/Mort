import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/landing-page-styles.css";
import "../styles/loginStyles.css";

const LandingPage = () => {

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const navigate = useNavigate();

  return (
    <div className="main">
      <main>
        {/* Header */}
        <div id="top">
          <div className="header">
            <a href="#" className="logo">
              <i className="bx bx-code-alt"></i>
              <div className="logo-name">
                <span>MO</span>RT
              </div>
            </a>
            <div className="center-buttons">
              <button className="home-button" onClick={() => scrollTo("top")}>HOME</button>
              <button className="services-button" onClick={() => scrollTo("services")}>SERVICES</button>
              <button className="about-us-button">ABOUT US</button>
            </div>
            <div className="right-buttons">

              <button className="log-in-button" onClick={() => navigate('/login?mode=login')}>Log In</button>
              <button className="sign-up-button" onClick={() => navigate('/login?mode=register')}>Sign Up</button>

            </div>
          </div>
        </div>

        {/* Get Started Section */}
        <div className="page1">
          <div className="blur-container">
            <p className="start-learning-with">
              Start Learning with MORT Today. Empower your learning journey with
              AI-driven tools.
            </p>
            
            <button className="get-started-button" onClick={() => navigate('/login?mode=register')}>Get Started</button>

          </div>
        </div>

        {/* Discover Section */}
        <div id="services" className="page2">
          <div className="side-by-side">
            <div className="text-content">
              <p className="discover">
                DISCOVER HOW MORT CAN TRANSFORM YOUR STUDY ROUTINE.
              </p>
            </div>
            <div className="image-content">
              <img src="/images/pen-and-book.png" alt="pen and book" />
            </div>
          </div>

          <div className="side-by-side">
            <div className="image-content">
              <img src="/images/to-do-list.png" alt="To Do List" />
            </div>
            <div className="text-content">
              <h4>To-Do List</h4>
              <p>
                Stay on top of your day with our interactive to-do list. Easily
                add tasks, set deadlines, and check them off as you go for
                satisfying progress.
              </p>
            </div>
          </div>

          <div className="side-by-side">
            <div className="text-content">
              <h4>PDF Upload & Text Extraction</h4>
              <p>
                Transform physical documents into digital gold with our PDF
                scanner and summarizer. Quickly scan and get AI-powered
                summaries of your most important information.
              </p>
            </div>
            <div className="image-content">
              <img
                src="/images/pdf-extraction.png"
                alt="PDF Upload & Text Extraction"
              />
            </div>
          </div>

          <div className="side-by-side">
            <div className="image-content">
              <img src="/images/quiz-maker.png" alt="Quiz Maker" />
            </div>
            <div className="text-content">
              <h4>Quiz Maker</h4>
              <p>
                Create custom quizzes in minutes with our intuitive quiz maker.
                Perfect for studying, teaching, or just testing your knowledge
                on any topic.
              </p>
            </div>
          </div>

          <div className="side-by-side">
            <div className="text-content">
              <h4>Notes</h4>
              <p>
                Capture and organize your thoughts effortlessly with our
                interactive notes. Write, format, and link ideas in a way that
                truly works for you.
              </p>
            </div>
            <div className="image-content">
              <img src="/images/notes.png" alt="Notes" />
            </div>
          </div>

          <div className="side-by-side">
            <div className="image-content">
              <img src="/images/mort-helper.png" alt="MORT HELPER" />
            </div>
            <div className="text-content">
              <h4>Integrated with Gemini</h4>
              <p>
                Get instant answers and assistance whenever you need it with our
                AI chatbot (powered by Gemini). Your smart companion for quick
                queries and helpful insights.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer>
        <p>
          <span className="about">About</span>
          <span className="span"> | </span>
          <span className="about">Contact</span>
          <span className="span"> | </span>
          <span className="about">Privacy Policy</span>
          <span className="span"> | </span>
          <span className="about">Terms of Service</span>
          <span> </span>
        </p>
        <p>
          © 2025 MORT (My Online Resource Terminal). All Rights Reserved. Built
          by learners, for learners.
        </p>
      </footer>

    </div>
  );
};

export default LandingPage;
