import React, { useState, useEffect } from 'react';

const QuizPlayer = ({ quiz, onFinish, onClose }) => {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [percentage, setPercentage] = useState(0);

  const isDark = document.body.classList.contains('dark');
  const question = quiz[index];

  const handleOptionClick = (i) => {
    if (showAnswer) return;
    setSelected(i);
    setShowAnswer(true);
  };

  const handleNext = () => {
    const isCorrect = selected === question.correct;
    const updatedScore = isCorrect ? score + 1 : score;
    setScore(updatedScore);

    if (index + 1 < quiz.length) {
      setIndex(index + 1);
      setSelected(null);
      setShowAnswer(false);
    } else {
      setFinalScore(updatedScore);
      const percent = Math.round((updatedScore / quiz.length) * 100);
      setPercentage(percent);
      setShowResult(true);
    }
  };

  useEffect(() => {
    if (showResult && onFinish) {
      onFinish({
        score: finalScore,
        total: quiz.length,
        title: quiz.title || 'Untitled Quiz',
        date: new Date().toLocaleString(),
      });
    }
  }, [showResult]);

  const handleQuit = () => {
    const confirmExit = window.confirm("Are you sure you want to quit the quiz?");
    if (confirmExit) {
      onClose();
    }
  };

  const getOptionBg = (i) => {
    if (!showAnswer) return isDark ? '#333' : '#eee';
    if (i === question.correct) return '#4CAF50';
    if (i === selected) return '#F44336';
    return isDark ? '#444' : '#eee';
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        position: 'relative',
        background: isDark ? '#1e1e2f' : '#fff',
        color: isDark ? '#f1f1f1' : '#000',
        padding: '2rem',
        borderRadius: '10px',
        width: '600px',
        maxHeight: '90vh',
        overflowY: 'auto',
        textAlign: 'center',
        boxShadow: isDark ? '0 0 10px #00bcd4' : '0 4px 12px rgba(0,0,0,0.2)'
      }}>
        <button
          onClick={handleQuit}
          className="btn danger"
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'transparent',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: isDark ? '#ccc' : '#888'
          }}
          aria-label="Close Quiz"
        >
          ❌
        </button>

        {showResult ? (
          <div>
            <h2>Quiz Completed 🎉</h2>
            <div style={{
              position: 'relative',
              width: '150px',
              height: '150px',
              borderRadius: '50%',
              background: `conic-gradient(#4CAF50 0% ${percentage}%, ${isDark ? '#555' : '#eee'} ${percentage}% 100%)`,
              margin: '1rem auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{
                position: 'absolute',
                fontSize: '24px',
                fontWeight: 'bold',
                color: isDark ? '#fff' : '#333'
              }}>
                {finalScore}/{quiz.length}
              </div>
            </div>
            <button className="btn btn-primary" onClick={onClose}>❌ Close</button>
          </div>
        ) : (
          <>
            <h2>Question {index + 1} of {quiz.length}</h2>
            <p style={{ fontSize: '18px', marginBottom: '1.5rem' }}>{question.question}</p>

            {question.options.map((option, i) => (
              <button
                key={i}
                onClick={() => handleOptionClick(i)}
                className="btn"
                style={{
                  display: 'block',
                  width: '100%',
                  margin: '0.5rem 0',
                  backgroundColor: getOptionBg(i),
                  color: isDark ? '#f1f1f1' : '#000',
                  cursor: showAnswer ? 'default' : 'pointer'
                }}
              >
                {option}
              </button>
            ))}

            {showAnswer && question.explanation && (
              <div style={{
                marginTop: '1rem',
                backgroundColor: isDark ? '#333' : '#f0f0f0',
                padding: '1rem',
                borderRadius: '8px',
                textAlign: 'left'
              }}>
                <strong>Explanation:</strong>
                <p>{question.explanation || "No explanation provided."}</p>
              </div>
            )}

            {showAnswer && (
              <button className="btn btn-primary" onClick={handleNext} style={{ marginTop: '1rem' }}>
                {index + 1 < quiz.length ? 'Next' : 'Finish'}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default QuizPlayer;
