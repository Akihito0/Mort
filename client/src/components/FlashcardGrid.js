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
        <div style={{ display: 'flex', gap: '0.5rem' }}>
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
            style={{ flex: 1 }}
          />
          <button className="btn success" onClick={handleRename}>✅</button>
          <button className="btn danger" onClick={() => setIsEditing(false)}>❌</button>
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
