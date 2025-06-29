import React, { useState } from 'react';

const FlashcardSetCard = ({ set, onDelete, onOpen, onRename }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempTitle, setTempTitle] = useState(set.title);

  const handleRename = () => {
    if (tempTitle.trim() === '') return;
    onRename(set.id, tempTitle.trim());
    setIsEditing(false);
  };

  return (
    <div className="note-card" key={set.id}>
      {isEditing ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            flexWrap: 'nowrap',
            width: '100%',
            maxWidth: '100%',
            overflow: 'hidden'
          }}
        >
          <input
            type="text"
            value={tempTitle}
            onChange={(e) => setTempTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRename();
              else if (e.key === 'Escape') {
                setIsEditing(false);
                setTempTitle(set.title); // reset
              }
            }}
            autoFocus
            className="input"
            style={{
              flex: '1 1 auto',
              minWidth: 0
            }}
          />
          <button
            className="btn success"
            onClick={handleRename}
            style={{
              flex: '0 0 auto',
              padding: '6px 8px',
              fontSize: '1rem'
            }}
          >
            ✅
          </button>
          <button
            className="btn danger"
            onClick={() => setIsEditing(false)}
            style={{
              flex: '0 0 auto',
              padding: '6px 8px',
              fontSize: '1rem'
            }}
          >
            ❌
          </button>
        </div>
      ) : (
        <>
          <h3 onClick={() => setIsEditing(true)} style={{ cursor: 'pointer' }} title="Click to rename">
            {set.title}
          </h3>
          <p>{set.cards?.length || 0} cards</p>
          <div className="btn-group">
            <button className="btn" onClick={() => onOpen(set)}>📖 Open</button>
            <button className="btn danger" onClick={() => onDelete(set.id)}>🗑 Delete</button>
          </div>
        </>
      )}
    </div>
  );
};

const FlashcardGrid = ({ flashcards, onDelete, onOpen, onRename }) => {
  if (!flashcards || !flashcards.length) {
    return <p>No flashcards saved yet.</p>;
  }

  return (
    <div className="note-grid">
      {flashcards.map(set => (
        <FlashcardSetCard
          key={set.id}
          set={set}
          onOpen={onOpen}
          onDelete={onDelete}
          onRename={onRename}
        />
      ))}
    </div>
  );
};

export default FlashcardGrid;
