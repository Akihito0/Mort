import React, { useState } from 'react';
import '../styles/quizmaker.css';

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
      isCorrect = parseInt(answer) === current.correct;
    } else if (current.type === 'trueFalse') {
      const correct = String(current.options?.[current.correct] || current.correct).trim().toLowerCase();
      const user = String(answer).trim().toLowerCase();
      isCorrect = user === correct;
    } else if (current.type === 'identification') {
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
        <label key={i} className="quiz-option">
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
        <label key={opt} className="quiz-option">
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
      return (
        <input
          type="text"
          className="quiz-input"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={showExplanation}
          placeholder="Your answer"
        />
      );
    }
  };

  return (
    <div className="quiz-player-backdrop">
      <div className="quiz-player-modal">
        <button className="close-btn" onClick={onClose}>❌</button>

        {finished ? (
          <div className="quiz-finish">
            <h2>Quiz Completed 🎉</h2>
            <p>Your Score: {score}/{quiz.length}</p>

            {showAnswers === 'End of quiz' && (
              <div className="quiz-answer-key">
                <h4>📝 Answer Key:</h4>
                <ul>
                  {quiz.map((q, i) => (
                    <li key={i}>
                      <strong>Q{i + 1}:</strong> {q.question}<br />
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

            <button className="quiz-next" onClick={onClose}>Close</button>
          </div>
        ) : (
          <>
            <h3>Question {index + 1} of {quiz.length}</h3>
            <p><strong>{current.question}</strong></p>

            {renderOptions()}

            {!showExplanation ? (
              <button
                className="quiz-submit"
                onClick={handleSubmit}
                disabled={answer === ''}
              >
                Submit Answer
              </button>
            ) : (
              <>
                {showAnswers === 'After each item' && (
                  <div className="quiz-answer">
                    <strong>Explanation:</strong>
                    <p>{current.explanation || 'No explanation provided.'}</p>
                  </div>
                )}
                <button className="quiz-next" onClick={handleNext}>
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
