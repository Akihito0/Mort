import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/landing-page-styles.css";

const HEADER_TABS = [
  { id: "HOME", label: "HOME", scrollTo: "top" },
  { id: "SERVICES", label: "SERVICES", scrollTo: "services" },
  { id: "ABOUT", label: "ABOUT US", scrollTo: null }
];

const LandingPage = () => {
  const [activeTab, setActiveTab] = useState("HOME");
  const [indicatorStyle, setIndicatorStyle] = useState({});
  const tabRefs = useRef({});
  const navigate = useNavigate();

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Update indicator position and width based on active tab
    const node = tabRefs.current[activeTab];
    if (node) {
      setIndicatorStyle({
        left: node.offsetLeft,
        width: node.offsetWidth
      });
    }
  }, [activeTab]);

  // Add scroll listener to update active tab based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const servicesSection = document.getElementById("services");
      
      // If at the very top (first 100px), activate HOME
      if (scrollPosition < 100) {
        setActiveTab("HOME");
      }
      // If services section is in view, activate SERVICES
      else if (servicesSection && scrollPosition >= servicesSection.offsetTop - 200) {
        setActiveTab("SERVICES");
      }
      // You can add more conditions for ABOUT section when you create it
    };

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);
    
    // Call once on mount to set initial state
    handleScroll();

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="main">
      <main>
        {/* Header */}
        <div id="top">
          <div className="landing-header">
            <a href="#" className="logo">
              <i className="bx bx-code-alt"></i>
              <div className="logo-name">
                <span>MO</span>RT
              </div>
            </a>
            <div className="center-buttons" style={{ position: "relative" }}>
              {/* Blue ellipse indicator */}
              <div
                className="active-ellipse"
                style={{
                  position: "absolute",
                  bottom: 0,
                  height: 6,
                  borderRadius: 10,
                  background: "#2196f3",
                  transition: "left 0.3s ease, width 0.3s ease", // Enhanced transition
                  ...indicatorStyle,
                  zIndex: 1
                }}
              />
              {HEADER_TABS.map((tab) => (
                <button
                  key={tab.id}
                  className={`landing-button ${tab.id.toLowerCase()}-button ${activeTab === tab.id ? 'active' : ''}`}
                  ref={el => (tabRefs.current[tab.id] = el)}
                  onClick={() => {
                    setActiveTab(tab.id);
                    if (tab.scrollTo) scrollTo(tab.scrollTo);
                  }}
                  style={{ position: "relative", zIndex: 2 }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="right-buttons">
              <button className="landing-button log-in-button" onClick={() => navigate('/login?mode=login')}>Log In</button>
              <button className="landing-button sign-up-button" onClick={() => navigate('/login?mode=register')}>Sign Up</button>
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
            <button className="landing-button get-started-button" onClick={() => navigate('/login?mode=register')}>Get Started</button>
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
          © 2025 MORT (My Online Resource Terminal). All Rights Reserved. Built
          by learners, for learners.
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;