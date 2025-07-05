import React, { useState } from 'react';
import '../styles/FlashcardViewer.css';

const FlashcardViewer = ({ set, onClose }) => {
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const card = set.cards[current];

  return (
    <div className="modal-backdrop">
      <div className="modal flashcard-modal">
        <button className="btn danger close-btn" onClick={onClose}>❌</button>
        <h2>{set.title}</h2>

        <div
          className={`flashcard ${flipped ? 'flipped' : ''}`}
          onClick={() => setFlipped(!flipped)}
        >
          <div className="flashcard-inner">
            <div className="flashcard-front">
              <div className="flashcard-content">{card.front}</div>
            </div>
            <div className="flashcard-back">
              <div className="flashcard-content">{card.back}</div>
            </div>
          </div>
        </div>

        <div className="flashcard-nav">
          <button
            className="btn"
            disabled={current === 0}
            onClick={() => {
              setFlipped(false);
              setCurrent(prev => prev - 1);
            }}
          >
            ◀️ Prev
          </button>

          <span className="card-counter">{current + 1} / {set.cards.length}</span>

          <button
            className="btn"
            disabled={current === set.cards.length - 1}
            onClick={() => {
              setFlipped(false);
              setCurrent(prev => prev + 1);
            }}
          >
            Next ▶️
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlashcardViewer;
