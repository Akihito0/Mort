import React, { useState } from 'react';

const MixedQuizPlayer = ({ quiz, onClose, showAnswers }) => {
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const current = quiz[index];

  const handleSubmit = () => {
  let isCorrect = false;

  if (current.type === 'multipleChoice') {
    // Compare selected index to correct index
    isCorrect = parseInt(answer) === current.correct;
  } else if (current.type === 'trueFalse') {
    // Compare string (case-insensitive)
    const correct = String(current.options?.[current.correct] || current.correct).trim().toLowerCase();
    const user = String(answer).trim().toLowerCase();
    isCorrect = user === correct;
  } else if (current.type === 'identification') {
    // Compare string (case-insensitive)
    const correct = String(current.correct).trim().toLowerCase();
    const user = String(answer).trim().toLowerCase();
    isCorrect = user === correct;
  }

  if (isCorrect) setScore((prev) => prev + 1);

  if (showAnswers === 'After each item') {
    setShowExplanation(true);
  } else {
    handleNext();
  }
};



  const handleNext = () => {
    if (index + 1 < quiz.length) {
      setIndex(index + 1);
      setAnswer('');
      setShowExplanation(false);
    } else {
      setFinished(true);
    }
  };

  const renderOptions = () => {
    if (current.type === 'multipleChoice') {
      return current.options.map((opt, i) => (
        <label key={i} style={{ display: 'block', margin: '8px 0' }}>
          <input
            type="radio"
            name="option"
            value={i}
            checked={parseInt(answer) === i}
            onChange={() => setAnswer(i.toString())}
            disabled={showExplanation}
          />
          {opt}
        </label>
      ));
    } else if (current.type === 'trueFalse') {
      return ['True', 'False'].map((opt) => (
        <label key={opt} style={{ display: 'block', margin: '8px 0' }}>
          <input
            type="radio"
            name="tf"
            value={opt}
            checked={answer === opt}
            onChange={() => setAnswer(opt)}
            disabled={showExplanation}
          />
          {opt}
        </label>
      ));
    } else {
      // Identification
      return (
        <input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={showExplanation}
          placeholder="Your answer"
          style={{ padding: '0.5rem', width: '100%', marginTop: '1rem' }}
        />
      );
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: '#fff',
          padding: '2rem',
          borderRadius: '10px',
          width: '600px',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <button onClick={onClose} style={{ float: 'right', fontSize: '18px' }}>
          ❌
        </button>

        {finished ? (
          <div style={{ textAlign: 'center' }}>
            <h2>Quiz Completed 🎉</h2>
            <p>
              Your Score: {score}/{quiz.length}
            </p>

            {showAnswers === 'End of quiz' && (
              <div style={{ textAlign: 'left', marginTop: '2rem' }}>
                <h4>📝 Answer Key:</h4>
                <ul>
                  {quiz.map((q, i) => (
                    <li key={i} style={{ marginBottom: '1rem' }}>
                      <strong>Q{i + 1}:</strong> {q.question} <br />
                      <strong>Correct Answer:</strong>{' '}
                      {q.type === 'multipleChoice' || q.type === 'trueFalse'
                        ? q.options?.[q.correct]
                        : q.correct}
                      <br />
                      <strong>Explanation:</strong>{' '}
                      {q.explanation || 'No explanation provided.'}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button onClick={onClose}>Close</button>
          </div>
        ) : (
          <>
            <h3>
              Question {index + 1} of {quiz.length}
            </h3>
            <p>
              <strong>{current.question}</strong>
            </p>

            {renderOptions()}

            {!showExplanation ? (
              <button
                onClick={handleSubmit}
                style={{ marginTop: '1rem' }}
                disabled={answer === ''}
              >
                Submit Answer
              </button>
            ) : (
              <>
                {showAnswers === 'After each item' && (
                  <div
                    style={{
                      backgroundColor: '#f0f0f0',
                      padding: '1rem',
                      borderRadius: '8px',
                      marginTop: '1rem',
                    }}
                  >
                    <strong>Explanation:</strong>
                    <p>{current.explanation || 'No explanation provided.'}</p>
                  </div>
                )}
                <button onClick={handleNext} style={{ marginTop: '1rem' }}>
                  {index + 1 < quiz.length ? 'Next' : 'Finish'}
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MixedQuizPlayer;
