import React, { useEffect, useState } from 'react';
import { auth, db, collection, getDocs, deleteDoc, doc, updateDoc, setDoc } from '../firestore-database/firebase';
import '../styles/quizmaker.css';

const SavedQuizzesTab = ({ onClose, onReview }) => {
  const [savedQuizzes, setSavedQuizzes] = useState([]);

  useEffect(() => {
  const fetchSavedQuizzes = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const displayName = user.displayName || user.uid;
    const quizSnapshot = await getDocs(collection(db, 'Mort-Notes', displayName, 'Quizzes'));
    
    const fetched = quizSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })).sort((a, b) => b.timestamp - a.timestamp); // latest first

    setSavedQuizzes(fetched);
  };

  fetchSavedQuizzes();
}, []);


  const updateLocalStorage = (updated) => {
    localStorage.setItem('savedQuizzes', JSON.stringify([...updated].reverse()));
    setSavedQuizzes(updated);
  };

  const handleDelete = async (indexToDelete) => {
  const user = auth.currentUser;
  if (!user) return;

  const confirmDelete = window.confirm('Are you sure you want to delete this quiz?');
  if (!confirmDelete) return;

  const displayName = user.displayName || user.uid;
  const quizToDelete = savedQuizzes[indexToDelete];

  try {
    await deleteDoc(doc(db, 'Mort-Notes', displayName, 'Quizzes', quizToDelete.id));
    const updated = savedQuizzes.filter((_, idx) => idx !== indexToDelete);
    setSavedQuizzes(updated);
  } catch (error) {
    console.error("Error deleting quiz:", error);
    alert("Failed to delete quiz.");
  }
};


  const handleTitleChange = async (index, newTitle) => {
    const user = auth.currentUser;
    if (!user) return;

    const displayName = user.displayName || user.uid;
    const quiz = savedQuizzes[index];

    const safeNewTitle = newTitle.replace(/[.#$[\]/]/g, '-');

    try {
      const oldRef = doc(db, 'Mort-Notes', displayName, 'Quizzes', quiz.id);
      const newRef = doc(db, 'Mort-Notes', displayName, 'Quizzes', safeNewTitle);

      const quizCopy = { ...quiz, title: newTitle };

      await setDoc(newRef, quizCopy); 
      await deleteDoc(oldRef);     

      const updated = [...savedQuizzes];
      updated[index] = { ...quizCopy, id: safeNewTitle };
      setSavedQuizzes(updated);

    } catch (error) {
      console.error("Error updating title:", error);
      alert("❌ Failed to update quiz title.");
    }
  };


  const handleTitleBlur = (index, e) => {
    const newTitle = e.target.innerText.trim();
    if (newTitle) {
      handleTitleChange(index, newTitle);
    }
  };

  return (
    <div className="quiz-player-backdrop">
      <div className="quiz-player-modal">
        <button className="close-btn" onClick={onClose}>❌</button>
        <h2>📚 Saved Quizzes</h2>

        <ul className="saved-quiz-list">
          {savedQuizzes.length === 0 ? (
            <li>No saved quizzes found.</li>
          ) : (
            savedQuizzes.map((q, i) => (
              <li key={i} className="saved-quiz-item">
                <p>
                  <strong>Title:</strong>{' '}
                  <span
                    contentEditable
                    suppressContentEditableWarning
                    className="editable-title"
                    onBlur={(e) => handleTitleBlur(i, e)}
                  >
                    {q.title || `Untitled Quiz ${savedQuizzes.length - i}`}
                  </span>
                </p>
                <p><strong>Date:</strong> {new Date(q.timestamp).toLocaleString()}</p>
                <p><strong>Score:</strong> {Object.values(q.scores).reduce((a, b) => a + b, 0)}</p>
                <div className="quiz-actions">
                  <button onClick={() => onReview(q)}>🔍 Review</button>
                  <button onClick={() => handleDelete(i)}>🗑️ Delete</button>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default SavedQuizzesTab;
