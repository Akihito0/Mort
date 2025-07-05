import React, { useState, useEffect } from 'react';
import { auth, db, setDoc, doc } from '../firestore-database/firebase';
import '../styles/quizmaker.css';

const MixedQuizPlayer = ({ quiz, onClose, showAnswers, isReviewMode = false }) => {
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [finished, setFinished] = useState(false);

  const [scores, setScores] = useState({
    multipleChoice: 0,
    trueFalse: 0,
    identification: 0,
  });

  const current = quiz[index];
  const totalScore = scores.multipleChoice + scores.trueFalse + scores.identification;

  useEffect(() => {
    if (isReviewMode) setShowExplanation(true);
  }, [index, isReviewMode]);

  useEffect(() => {
    if (finished && isReviewMode) onClose();
  }, [finished, isReviewMode, onClose]);

  const handleNext = () => {
    if (index + 1 < quiz.length) {
      setIndex(index + 1);
      setAnswer(null);
      setShowExplanation(isReviewMode);
    } else {
      setFinished(true);
    }
  };

  const handleOptionClick = (selected) => {
    quiz[index].userAnswer = selected;
    if (isReviewMode) return;

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
    const userAnswer = isReviewMode ? current.userAnswer : answer;

    const getBtnClass = (i) => {
      const isCorrect = i === current.correct;

      // Normalize string answer to index
      const userAnswerIndex = typeof userAnswer === 'string'
        ? current.options?.indexOf(userAnswer)
        : userAnswer;

      if (!showExplanation && !isReviewMode) return 'quiz-option-btn';
      if (i === current.correct) return 'quiz-option-btn correct';
      if (userAnswerIndex === i && !isCorrect) return 'quiz-option-btn wrong';
      return 'quiz-option-btn';
    };

    if (current.type === 'multipleChoice') {
      return current.options?.map((opt, i) => (
        <button
          key={i}
          className={getBtnClass(i)}
          onClick={() => !showExplanation && !isReviewMode && handleOptionClick(i)}
          disabled={showExplanation || isReviewMode}
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
          onClick={() => !showExplanation && !isReviewMode && handleOptionClick(i)}
          disabled={showExplanation || isReviewMode}
        >
          {opt}
        </button>
      ));
    } else {
      const inputValue = isReviewMode
        ? (current.userAnswer || '')
        : (typeof answer === 'string' ? answer : '');

      return (
        <>
          <input
            type="text"
            className="quiz-input"
            value={inputValue}
            disabled={showExplanation || isReviewMode}
            placeholder="Your answer"
            onChange={(e) => setAnswer(e.target.value)}
          />
          {!showExplanation && !isReviewMode && (
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

  const handleSaveQuiz = async () => {
    const user = auth.currentUser;
    if (!user) return alert('❌ You must be logged in to save quizzes.');
    if (!user.displayName) return alert('❌ You must set a display name to save quizzes.');

    const displayName = user.displayName;

    let title = prompt("Enter a title for this quiz:", "My Quiz");
    if (!title) title = `Quiz taken on ${new Date().toLocaleString()}`;
    const safeTitle = title.replace(/[.#$[\]/]/g, '-');

    const completedQuiz = quiz.map((q, i) => ({
      question: q.question,
      userAnswer: q.userAnswer !== undefined ? q.userAnswer : (i === index ? answer : null),
      correct: q.correct,
      options: q.options || null,
      explanation: q.explanation || 'No explanation provided.',
      type: q.type,
    }));

    const saved = {
      title,
      timestamp: Date.now(),
      scores,
      showAnswers,
      quiz: completedQuiz,
    };

    try {
      await setDoc(doc(db, 'Mort-Notes', displayName, 'Quizzes', safeTitle), saved);
      alert("✅ Quiz saved to Firestore!");
      onClose();
    } catch (error) {
      console.error("Error saving quiz:", error);
      alert("❌ Failed to save quiz.");
    }
  };

  return (
    <div className="quiz-player-backdrop">
      <div className="quiz-player-modal">
        <button className="close-btn" onClick={onClose}>❌</button>

        {finished ? (
          !isReviewMode && (
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
                        {q.type === 'multipleChoice'
                          ? q.options?.[q.correct]
                          : q.type === 'trueFalse'
                          ? ['True', 'False'][q.correct]
                          : q.correct}
                        <br />
                        <strong>Explanation:</strong>{' '}
                        {q.explanation || 'No explanation provided.'}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <button className="quiz-save" onClick={handleSaveQuiz}>💾 Save Quiz</button>
              <button className="quiz-next" onClick={onClose}>Close</button>
            </div>
          )
        ) : (
          <>
            <h3>Question {index + 1} of {quiz.length}</h3>
            <p><strong>{current.question}</strong></p>

            {renderOptions()}

            {showExplanation && (
              <>
                <div className="quiz-answer">
                  {current.userAnswer !== undefined && (
                    <>
                      <strong>Your Answer:</strong>
                      <p>
                        {current.type === 'multipleChoice'
                          ? (typeof current.userAnswer === 'number'
                              ? current.options?.[current.userAnswer]
                              : current.userAnswer)
                          : current.type === 'trueFalse'
                          ? (typeof current.userAnswer === 'number'
                              ? ['True', 'False'][current.userAnswer]
                              : current.userAnswer)
                          : current.userAnswer}
                      </p>
                      <strong>Correct Answer:</strong>
                      <p>
                        {current.type === 'multipleChoice'
                          ? current.options?.[current.correct]
                          : current.type === 'trueFalse'
                          ? ['True', 'False'][current.correct]
                          : current.correct}
                      </p>
                    </>
                  )}
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
