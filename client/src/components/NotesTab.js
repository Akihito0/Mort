import React, { useState, useEffect } from 'react';
import NoteGrid from './NoteGrid.js';
import QuizPlayer from './QuizPlayer.js';
import FlashcardGrid from './FlashcardGrid.js';
import FlashcardViewer from './FlashcardViewer.js';
import { marked } from 'marked';
import '../styles/NotesTab.css';
import { auth, db, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, setDoc, getDoc } from '../firestore-database/firebase';

function NotesTab({ notes, setNotes, chatContext, setChatContext }) {
  const [viewingNote, setViewingNote] = useState(null);
  const [editingNote, setEditingNote] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [quizHistory, setQuizHistory] = useState(() => {
    const saved = localStorage.getItem('quizHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const [addingNote, setAddingNote] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '', tags: [] });
  const [newNoteTagInput, setNewNoteTagInput] = useState('');
  const [editingNoteTagInput, setEditingNoteTagInput] = useState('');
  const [flashcards, setFlashcards] = useState(() => {
    const saved = localStorage.getItem('flashcards');
    return saved ? JSON.parse(saved) : [];
  });
  const [viewingFlashcardSet, setViewingFlashcardSet] = useState(null);

  // Tag filtering state
  const [selectedTag, setSelectedTag] = useState('all');
  const [allTags, setAllTags] = useState([]);

  // Spotify embed state
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [embedUrl, setEmbedUrl] = useState('https://open.spotify.com/embed/playlist/37i9dQZF1DX3PFzdbtx1Us?utm_source=generator');

  // Extract all unique tags from notes
  useEffect(() => {
    const tags = new Set();
    notes.forEach(note => {
      if (note.tags && Array.isArray(note.tags)) {
        note.tags.forEach(tag => tags.add(tag));
      }
    });
    setAllTags(Array.from(tags).sort());
  }, [notes]);

  // Filter notes based on selected tag
  const filteredNotes = selectedTag === 'all' 
    ? notes 
    : notes.filter(note => note.tags && note.tags.includes(selectedTag));

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
    const user = auth.currentUser;
    if (!user) return alert('You must be logged in to generate flashcards.');

    const displayName = user.displayName || user.uid;

    const res = await fetch('https://reactmort-server.onrender.com/generate-flashcards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: textToUse })
    });
    const data = await res.json();
    if (data.flashcards) {
      try {
        const flashcardSet = {
          title,
          cards: data.flashcards.map((card, index) => ({
            id: Date.now() + index,
            front: card.question,
            back: card.answer
          })),
          created: new Date()
        };

        const flashcardDocRef = doc(db, 'Mort-Notes', displayName, 'Flashcard', title);
        await setDoc(flashcardDocRef, flashcardSet);

        const newSet = {
          id: title,
          ...flashcardSet,
          created: flashcardSet.created.toISOString()
        };

        setFlashcards(prev => [newSet, ...prev]);
        alert('Flashcards saved!');
      } catch (error) {
        console.error('Error saving flashcards:', error);
        alert('Failed to save flashcards.');
      }
      } else {
        alert('Flashcard generation failed.');
      }
  };
  //Load flashcards from localStorage on mount
  useEffect(() => {
  const fetchFlashcards = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const displayName = user.displayName || user.uid;
    const snapshot = await getDocs(collection(db, 'Mort-Notes', displayName, 'Flashcard'));

    const flashcardData = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: doc.id,
        cards: data.cards || [],
        created: data.created?.toDate().toISOString() || null
      };
    });

    setFlashcards(flashcardData);
  };

  fetchFlashcards();
}, []);
  
  // arrange notes
  const formatNoteContent = (text) => {
  return text
    .split('\n')                      
    .map(line => line.trim())         
    .filter(line => line.length > 0)  
    .join('\n\n');                   
};

  // Parse tags from string input
  const parseTags = (tagString) => {
    if (!tagString) return [];
    return tagString
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
      .map(tag => tag.toLowerCase());
  };

  // Handle tag input change
  const handleTagInputChange = (value, isNewNote = true) => {
    if (isNewNote) {
      setNewNoteTagInput(value);
    } else {
      setEditingNoteTagInput(value);
    }
  };

  // Parse tags when saving
  const parseAndSaveTags = (isNewNote = true) => {
    const tagInput = isNewNote ? newNoteTagInput : editingNoteTagInput;
    const tags = tagInput ? parseTags(tagInput) : [];
    
    if (isNewNote) {
      setNewNote({ ...newNote, tags });
    } else {
      setEditingNote({ ...editingNote, tags });
    }
    
    return tags; // Return the parsed tags
  };

  // Load notes from Firestore on mount
  useEffect(() => {
  const fetchNotes = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const displayName = user.displayName || user.uid;
    const snapshot = await getDocs(collection(db, 'Mort-Notes', displayName, 'Notes'));
    
    const notesData = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        content: formatNoteContent(data.content),
        tags: data.tags || []
      };
    });

    setNotes(notesData);
  };

  fetchNotes();
}, []);

  const handleAddNote = async() => {
    if (!newNote.title || !newNote.content) return alert('Title and content are required.');

    // Parse tags before saving
    const parsedTags = parseAndSaveTags(true);

    const user = auth.currentUser;
    if (!user) return;
    const displayName = user.displayName || user.uid;

    try {
    const createdAt = new Date(); // current timestamp
    const docRef = await addDoc(collection(db, 'Mort-Notes', displayName, 'Notes'), {
      title: newNote.title,
      content: newNote.content,
      tags: parsedTags,
      created: createdAt
    });

    const addedNote = {
      id: docRef.id,
      title: newNote.title,
      content: formatNoteContent(newNote.content),
      tags: parsedTags,
      created: createdAt.toISOString()
    };

    setNotes(prev => [...prev, addedNote]);
    setNewNote({ title: '', content: '', tags: [] });
    setNewNoteTagInput('');
    setAddingNote(false);
  } catch (error) {
    console.error('Error adding note:', error);
    alert('Failed to add note.');
  }
  };
  //delete note
   const handleDeleteNote = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this note?');
    if (!confirmDelete) return;

    const user = auth.currentUser;
    if (!user) return;

    const displayName = user.displayName || user.uid;

    try {
      await deleteDoc(doc(db, 'Mort-Notes', displayName, 'Notes', id));
      setNotes(prev => prev.filter(note => note.id !== id));
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Failed to delete note.');
    }
  };

  const handleSpotifySubmit = (e) => {
    e.preventDefault();
    if (!spotifyUrl) return;
    // Extract the type and ID from the Spotify URL
    const match = spotifyUrl.match(/spotify\.com\/(track|playlist|album)\/([a-zA-Z0-9]+)/);
    if (match) {
      const type = match[1];
      const id = match[2];
      setEmbedUrl(`https://open.spotify.com/embed/${type}/${id}?utm_source=generator`);
    } else {
      alert('Please enter a valid Spotify track, playlist, or album link.');
    }
  };

  return (
    <div className="main-container">
      <div className="todo-app">
        <div className="header">
          <h2>Notes</h2>
          <span>{new Date().toLocaleDateString()}</span>
        </div>

        {/* Tag Filter */}
        <div className="tag-filter">
          <label htmlFor="tag-select">Filter by tag:</label>
          <select 
            id="tag-select"
            value={selectedTag} 
            onChange={(e) => setSelectedTag(e.target.value)}
            className="tag-select"
          >
            <option value="all">All Notes ({notes.length})</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>
                {tag} ({notes.filter(note => note.tags && note.tags.includes(tag)).length})
              </option>
            ))}
          </select>
        </div>

        <div className="card">
          <h3>📚 Saved Notes</h3>
          <NoteGrid
            notes={filteredNotes}
            onView={setViewingNote}
            onDelete={handleDeleteNote}
            onReorder={setNotes}
            onUseAsContext={(note) => {
              setChatContext(note);
              alert(`Chat context set to "${note.title}". You can now ask questions about this note in the chatbot!`);
            }}
            onAddNote={() => setAddingNote(true)}
          />
        </div>
      </div>

      <div className="right-panel">
        <div className="task-status">
          <h3>Spotify</h3>
          <form onSubmit={handleSpotifySubmit} style={{ marginBottom: '10px' }}>
            <input
              type="text"
              placeholder="Paste Spotify playlist, song, or album link"
              value={spotifyUrl}
              onChange={e => setSpotifyUrl(e.target.value)}
              style={{ width: '70%', marginRight: '5px' }}
            />
            <button type="submit" className="btn">Set</button>
          </form>
          <div className="spotify-player">
            <iframe
              style={{ borderRadius: '12px' }}
              src={embedUrl}
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
            onDelete={async (id) => {
                const confirmDelete = window.confirm('Are you sure you want to delete this flashcard set?');
                if (!confirmDelete) return;
                
                const user = auth.currentUser;
                if (!user) return;

                const displayName = user.displayName || user.uid;

                try {
                  await deleteDoc(doc(db, 'Mort-Notes', displayName, 'Flashcard', id));
                  const updated = flashcards.filter(card => card.id !== id);
                  setFlashcards(updated);
                } catch (error) {
                  console.error('Error deleting flashcard set:', error);
                  alert('Failed to delete flashcard set.');
                }
              }}
            onRename={async (oldId, newTitle) => {
                const user = auth.currentUser;
                if (!user) return;

                const displayName = user.displayName || user.uid;

                try {
                  const oldRef = doc(db, 'Mort-Notes', displayName, 'Flashcard', oldId);
                  const newRef = doc(db, 'Mort-Notes', displayName, 'Flashcard', newTitle);

                  const oldSnap = await getDoc(oldRef);
                  if (!oldSnap.exists()) return alert('Original flashcard not found.');

                  const oldData = oldSnap.data();

                  await setDoc(newRef, {
                    ...oldData,
                    title: newTitle
                  });

                  await deleteDoc(oldRef);

                  const updated = flashcards.map(set =>
                    set.id === oldId ? { ...set, id: newTitle, title: newTitle } : set
                  );
                  setFlashcards(updated);
                } catch (error) {
                  console.error('Error renaming flashcard set:', error);
                  alert('Failed to rename flashcard set.');
                }
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
              className="note-content"
              dangerouslySetInnerHTML={{
                __html: viewingNote.content.includes('<p>') || viewingNote.content.includes('<table>')
                  ? viewingNote.content
                  : marked.parse(viewingNote.content),
              }}
            />

            <div className="btn-group">
              <button className="btn" onClick={() => {
                setEditingNote(viewingNote);
                setEditingNoteTagInput(viewingNote.tags ? viewingNote.tags.join(', ') : '');
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
              placeholder="Note Title"
            />
            <textarea
              rows={10}
              value={editingNote.content}
              onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
              className="input full"
              placeholder="Write your note..."
            />
            <input
              value={editingNoteTagInput}
              onChange={(e) => handleTagInputChange(e.target.value, false)}
              className="input full"
              placeholder="Tags (comma-separated, e.g., math, science, homework)"
            />
            <div className="btn-group">
              <button className="btn" onClick={async () => { 
                // Parse tags before saving
                const parsedTags = parseAndSaveTags(false);
                
                const user = auth.currentUser;
                if (!user) return; 
                const displayName = user.displayName || user.uid;
                
                // Create updated note with parsed tags
                const updatedNote = {
                  ...editingNote,
                  tags: parsedTags
                };
                
                try {
                    await updateDoc(doc(db, 'Mort-Notes', displayName, 'Notes', editingNote.id), {
                    title: editingNote.title,
                    content: editingNote.content,
                    tags: parsedTags
                });
                    setNotes(prev =>
                      prev.map(note =>
                        note.id === editingNote.id
                          ? { ...updatedNote, content: formatNoteContent(editingNote.content) }
                          : note
                      )
                    );
                    setEditingNote(null);
                    setEditingNoteTagInput('');
                  } catch (error) {
                    console.error('Error updating note:', error);
                    alert('Failed to update note.');
                  }
                }}
            >✅ Save</button>
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
            <input
              placeholder="Tags (comma-separated, e.g., math, science, homework)"
              className="input full"
              value={newNoteTagInput}
              onChange={(e) => handleTagInputChange(e.target.value, true)}
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

    </div>
  );
}

export default NotesTab;
