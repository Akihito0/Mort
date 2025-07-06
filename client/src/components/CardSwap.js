import React, { useState, useEffect } from 'react';
import '../styles/CardSwap.css';

const CardSwap = () => {
  const [currentCard, setCurrentCard] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const cards = [
    {
      title: "Welcome to MORT",
      description: "Your all-in-one study companion for notes, flashcards, quizzes, and task management.",
      icon: "📚",
      color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    },
    {
      title: "Smart Notes",
      description: "Create, organize, and search through your notes with AI-powered features.",
      icon: "✍️",
      color: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
    },
    {
      title: "Interactive Flashcards",
      description: "Generate flashcards from your notes and study with interactive flip animations.",
      icon: "🗂️",
      color: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
    },
    {
      title: "AI Quiz Generator",
      description: "Automatically create quizzes from your study materials to test your knowledge.",
      icon: "🧠",
      color: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
    },
    {
      title: "Task Management",
      description: "Stay organized with our calendar view and task tracking system.",
      icon: "📅",
      color: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isAnimating) {
        setIsAnimating(true);
        setTimeout(() => {
          setCurrentCard((prev) => (prev + 1) % cards.length);
          setIsAnimating(false);
        }, 300);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [isAnimating, cards.length]);

  const handleCardClick = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentCard((prev) => (prev + 1) % cards.length);
        setIsAnimating(false);
      }, 300);
    }
  };

  return (
    <div className="card-swap-container">
      <div className="card-swap-header">
        <h2>Discover MORT</h2>
        <p>Your ultimate study companion</p>
      </div>
      
      <div 
        className={`card-swap ${isAnimating ? 'animating' : ''}`}
        onClick={handleCardClick}
        style={{ cursor: 'pointer' }}
      >
        <div 
          className="card-swap-content"
          style={{ background: cards[currentCard].color }}
        >
          <div className="card-icon">{cards[currentCard].icon}</div>
          <h3 className="card-title">{cards[currentCard].title}</h3>
          <p className="card-description">{cards[currentCard].description}</p>
        </div>
      </div>

      <div className="card-indicators">
        {cards.map((_, index) => (
          <div
            key={index}
            className={`indicator ${index === currentCard ? 'active' : ''}`}
            onClick={() => {
              if (!isAnimating && index !== currentCard) {
                setIsAnimating(true);
                setTimeout(() => {
                  setCurrentCard(index);
                  setIsAnimating(false);
                }, 300);
              }
            }}
          />
        ))}
      </div>

      <div className="card-swap-footer">
        <p>Click the card to explore more features</p>
      </div>
    </div>
  );
};

export default CardSwap; 