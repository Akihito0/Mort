import React, { useState } from 'react';
import '../styles/quizmaker.css';

const MixedQuizPlayer = ({ quiz, onClose, showAnswers }) => {
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState(null); // index or string
  const [showExplanation, setShowExplanation] = useState(false);
  const [finished, setFinished] = useState(false);

  const [scores, setScores] = useState({
    multipleChoice: 0,
    trueFalse: 0,
    identification: 0,
  });

  const current = quiz[index];

  const handleNext = () => {
    if (index + 1 < quiz.length) {
      setIndex(index + 1);
      setAnswer(null);
      setShowExplanation(false);
    } else {
      setFinished(true);
    }
  };

  const handleOptionClick = (selected) => {
    let isCorrect = false;

    if (current.type === 'multipleChoice' || current.type === 'trueFalse') {
      isCorrect = selected === current.correct;
    } else if (current.type === 'identification') {
      const correct = String(current.correct).trim().toLowerCase();
      const user = String(selected).trim().toLowerCase();
      isCorrect = user === correct;
    }

    if (isCorrect) {
      setScores((prev) => ({
        ...prev,
        [current.type]: prev[current.type] + (current.type === 'identification' ? 2 : 1),
      }));
    }

    setAnswer(selected);
    if (showAnswers === 'After each item') {
      setShowExplanation(true);
    } else {
      handleNext();
    }
  };

  const renderOptions = () => {
    const getBtnClass = (i) => {
      if (!showExplanation) return 'quiz-option-btn';
      if (i === current.correct) return 'quiz-option-btn correct';
      if (i === answer && i !== current.correct) return 'quiz-option-btn wrong';
      return 'quiz-option-btn';
    };

    if (current.type === 'multipleChoice') {
      return current.options.map((opt, i) => (
        <button
          key={i}
          className={getBtnClass(i)}
          onClick={() => !showExplanation && handleOptionClick(i)}
          disabled={showExplanation}
        >
          {opt}
        </button>
      ));
    } else if (current.type === 'trueFalse') {
      const tfOptions = ['True', 'False'];
      return tfOptions.map((opt, i) => (
        <button
          key={i}
          className={getBtnClass(i)}
          onClick={() => !showExplanation && handleOptionClick(i)}
          disabled={showExplanation}
        >
          {opt}
        </button>
      ));
    } else {
      return (
        <>
          <input
            type="text"
            className="quiz-input"
            value={typeof answer === 'string' ? answer : ''}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={showExplanation}
            placeholder="Your answer"
          />
          {!showExplanation && (
            <button
              className="quiz-submit"
              onClick={() => handleOptionClick(answer)}
              disabled={!answer || answer.trim() === ''}
            >
              Submit Answer
            </button>
          )}
        </>
      );
    }
  };

  const totalScore = scores.multipleChoice + scores.trueFalse + scores.identification;

  return (
    <div className="quiz-player-backdrop">
      <div className="quiz-player-modal">
        <button className="close-btn" onClick={onClose}>❌</button>

        {finished ? (
          <div className="quiz-finish">
            <h2>Quiz Completed 🎉</h2>
            <p>Total Score: {totalScore}</p>
            <ul className="score-breakdown">
              <li>📘 Multiple Choice: {scores.multipleChoice}</li>
              <li>🔍 True/False: {scores.trueFalse}</li>
              <li>✏️ Identification: {scores.identification}</li>
            </ul>

            {showAnswers === 'End of quiz' && (
              <div className="quiz-answer-key">
                <h4>📝 Answer Key:</h4>
                <ul>
                  {quiz.map((q, i) => (
                    <li key={i}>
                      <strong>Q{i + 1}:</strong> {q.question}<br />
                      <strong>Correct Answer:</strong>{' '}
                      {q.type === 'multipleChoice' || q.type === 'trueFalse'
                        ? (q.options?.[q.correct] ?? ['True', 'False'][q.correct])
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

            {showExplanation && (
              <>
                <div className="quiz-answer">
                  <strong>Correct Answer:</strong>
                  <p>
                    {current.type === 'multipleChoice' || current.type === 'trueFalse'
                      ? (current.options?.[current.correct] ?? ['True', 'False'][current.correct])
                      : current.correct}
                  </p>
                  <strong>Explanation:</strong>
                  <p>{current.explanation || 'No explanation provided.'}</p>
                </div>

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
