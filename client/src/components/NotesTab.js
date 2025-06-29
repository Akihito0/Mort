// NotesTab.js
import React, { useState, useEffect } from 'react';
import ChatbotWidget from './ChatbotWidget.js';
import NoteGrid from './NoteGrid.js';
import QuizPlayer from './QuizPlayer.js';
import FlashcardGrid from './FlashcardGrid.js';
import FlashcardViewer from './FlashcardViewer.js';
import { marked } from 'marked';
import '../styles/NotesTab.css';

function NotesTab({ notes, setNotes }) {
  const [viewingNote, setViewingNote] = useState(null);
  const [editingNote, setEditingNote] = useState(null);
  const [chatContext, setChatContext] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [quizHistory, setQuizHistory] = useState(() => {
    const saved = localStorage.getItem('quizHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const [addingNote, setAddingNote] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [flashcards, setFlashcards] = useState(() => {
    const saved = localStorage.getItem('flashcards');
    return saved ? JSON.parse(saved) : [];
  });
  const [viewingFlashcardSet, setViewingFlashcardSet] = useState(null);

  const generateQuiz = async (textToUse) => {
    const res = await fetch('https://reactmort-server.onrender.com/generate-quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: textToUse })
    });
    const data = await res.json();
    if (data.quiz) {
      setQuiz(data.quiz);
    } else {
      alert('Quiz generation failed.');
    }
  };

  const generateFlashcards = async (textToUse, title) => {
    const res = await fetch('https://reactmort-server.onrender.com/generate-flashcards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: textToUse })
    });
    const data = await res.json();
    if (data.flashcards) {
      const flashcardSet = {
        id: Date.now(),
        title,
        cards: data.flashcards.map((card, index) => ({
          id: Date.now() + index,
          front: card.question,
          back: card.answer
        }))
      };
      const updated = [flashcardSet, ...flashcards];
      setFlashcards(updated);
      localStorage.setItem('flashcards', JSON.stringify(updated));
      alert('Flashcards saved!');
    } else {
      alert('Flashcard generation failed.');
    }
  };

  const handleAddNote = () => {
    if (!newNote.title || !newNote.content) return alert('Title and content are required.');
    const newEntry = { id: Date.now(), ...newNote };
    setNotes(prev => [...prev, newEntry]);
    setNewNote({ title: '', content: '' });
    setAddingNote(false);
  };

  return (
    <div className="main-container">
      <div className="todo-app">
        <div className="header">
          <h2>Notes</h2>
          <span>{new Date().toLocaleDateString()}</span>
        </div>

        <div className="card">
          <h3>📚 Saved Notes</h3>
          <NoteGrid
            notes={notes}
            onView={setViewingNote}
            onDelete={(id) => setNotes(prev => prev.filter(note => note.id !== id))}
            onReorder={setNotes}
            onUseAsContext={(note) => {
              setChatContext(note);
              alert(`Chat context set to "${note.title}"`);
            }}
            onAddNote={() => setAddingNote(true)}
          />
        </div>
      </div>

      <div className="right-panel">
        <div className="task-status">
          <h3>Spotify</h3>
          <div className="spotify-player">
            <iframe
              style={{ borderRadius: '12px' }}
              src="https://open.spotify.com/embed/playlist/37i9dQZF1DX3PFzdbtx1Us?utm_source=generator"
              width="100%"
              height="152"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              title="spotify-player"
            ></iframe>
          </div>
        </div>

        <div className="completed-tasks">
          <h3>Saved Flashcards</h3>
          <FlashcardGrid
            flashcards={flashcards}
            onOpen={setViewingFlashcardSet}
            onDelete={(id) => {
              const updated = flashcards.filter(card => card.id !== id);
              setFlashcards(updated);
              localStorage.setItem('flashcards', JSON.stringify(updated));
            }}
            onRename={(id, newTitle) => {
              const updated = flashcards.map(set =>
                set.id === id ? { ...set, title: newTitle } : set
              );
              setFlashcards(updated);
              localStorage.setItem('flashcards', JSON.stringify(updated));
            }}
          />
        </div>
      </div>

      {viewingNote && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-header">
              <h2>{viewingNote.title}</h2>
              <button
                onClick={() => setViewingNote(null)}
                className="close-btn"
                aria-label="Close Note"
              >
                ❌
              </button>
            </div>
            <div
              dangerouslySetInnerHTML={{ __html: marked.parse(viewingNote.content) }}
              className="note-content"
            />

            <div className="btn-group">
              <button className="btn" onClick={() => {
                setEditingNote(viewingNote);
                setViewingNote(null);
              }}>✏️ Edit</button>
              <button className="btn" onClick={() => generateQuiz(viewingNote.content)}>🧠 Quiz</button>
              <button className="btn" onClick={() => generateFlashcards(viewingNote.content, viewingNote.title)}>🗂 Flashcards</button>
            </div>
          </div>
        </div>
      )}

      {editingNote && (
        <div className="modal-backdrop">
          <div className="modal">
            <h2>Edit Note</h2>
            <input
              value={editingNote.title}
              onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
              className="input full"
            />
            <textarea
              rows={10}
              value={editingNote.content}
              onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
              className="input full"
            />
            <div className="btn-group">
              <button className="btn" onClick={() => {
                setNotes(prev => prev.map(note => note.id === editingNote.id ? editingNote : note));
                setEditingNote(null);
              }}>✅ Save</button>
              <button className="btn danger" onClick={() => setEditingNote(null)}>❌ Cancel</button>
            </div>
          </div>
        </div>
      )}

      {addingNote && (
        <div className="modal-backdrop">
          <div className="modal">
            <h2>Add New Note</h2>
            <input
              placeholder="Note Title"
              className="input full"
              value={newNote.title}
              onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
            />
            <textarea
              rows={10}
              placeholder="Write your note..."
              className="input full"
              value={newNote.content}
              onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
            />
            <div className="btn-group">
              <button className="btn" onClick={handleAddNote}>✅ Add</button>
              <button className="btn danger" onClick={() => setAddingNote(false)}>❌ Cancel</button>
            </div>
          </div>
        </div>
      )}

      {quiz && (
        <div className="modal-backdrop">
          <QuizPlayer
            quiz={quiz}
            onFinish={({ score, total, title, date }) => {
              const result = { id: Date.now(), score, total, title, date };
              const updated = [result, ...quizHistory];
              setQuizHistory(updated);
              localStorage.setItem('quizHistory', JSON.stringify(updated));
            }}
            onClose={() => setQuiz(null)}
          />
        </div>
      )}

      {viewingFlashcardSet && (
        <FlashcardViewer
          set={viewingFlashcardSet}
          onClose={() => setViewingFlashcardSet(null)}
        />
      )}

      <ChatbotWidget contextNote={chatContext} />
    </div>
  );
}

export default NotesTab;
