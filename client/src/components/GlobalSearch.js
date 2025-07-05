import React, { useState, useEffect, useRef } from 'react';
import { auth, db, collection, getDocs } from '../firestore-database/firebase';

function GlobalSearch({ onNavigate }) {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const containerRef = useRef(null);

  const user = auth.currentUser;
  const username = user?.displayName || user?.email || 'unknown';

  const fetchAllData = async () => {
    if (!username) return [];

    const notesSnap = await getDocs(collection(db, `Mort-Notes/${username}/Notes`));
    const flashcardSnap = await getDocs(collection(db, `Mort-Notes/${username}/Flashcards`));
    const quizSnap = await getDocs(collection(db, `Mort-Notes/${username}/Quizzes`));
    const taskSnap = await getDocs(collection(db, `Mort-Task/${username}/Task`));

    const notes = notesSnap.docs.map(doc => ({
      id: doc.id,
      title: doc.data().title || doc.id,
      content: doc.data().content || '', // ✅ include content
      type: 'notes',
    }));

    const flashcards = flashcardSnap.docs.map(doc => ({
      id: doc.id,
      title: doc.data().title || doc.id,
      type: 'flashcards',
    }));

    const quizzes = quizSnap.docs.map(doc => ({
      id: doc.id,
      title: doc.data().title || doc.id,
      type: 'quizzes',
    }));

    const tasks = taskSnap.docs.map(doc => ({
      id: doc.id,
      title: doc.data().title || doc.id,
      type: 'tasks',
    }));

    return [...notes, ...flashcards, ...quizzes, ...tasks];
  };

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (!query.trim()) {
        setSearchResults(null);
        return;
      }

      const allData = await fetchAllData();
      const lowerQuery = query.toLowerCase();

      const filtered = allData.filter(item => {
        if (item.type === 'notes') {
          return (
            item.title.toLowerCase().includes(lowerQuery) ||
            item.content.toLowerCase().includes(lowerQuery) // ✅ include content in search
          );
        } else {
          return item.title.toLowerCase().includes(lowerQuery);
        }
      });

      setSearchResults(filtered);
    }, 250);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const handleResultClick = (item) => {
    setQuery('');
    setSearchResults(null);
    onNavigate(item.type, item);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!containerRef.current?.contains(e.target)) {
        setSearchResults(null);
      }
    };
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setSearchResults(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'notes': return 'bx bx-book';
      case 'flashcards': return 'bx bx-collection';
      case 'quizzes': return 'bx bx-edit';
      case 'tasks': return 'bx bx-list-check';
      default: return 'bx bx-file';
    }
  };

  return (
    <div className="global-search-wrapper" ref={containerRef}>
      <form className="global-search-container" onSubmit={(e) => e.preventDefault()}>
        <input
          type="text"
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {searchResults && (
          <button type="button" className="close-search-btn" onClick={() => setSearchResults(null)}>
            <i className="bx bx-x"></i>
          </button>
        )}
        <button type="submit">
          <i className="bx bx-search"></i>
        </button>
        {searchResults && (
          <div className="search-results-panel">
            {['notes', 'flashcards', 'quizzes', 'tasks'].map((type) => {
              const items = searchResults.filter(item => item.type === type);
              if (!items.length) return null;
              return (
                <div key={type}>
                  <h4>{type.charAt(0).toUpperCase() + type.slice(1)}</h4>
                  <ul>
                    {items.map((item) => (
                      <li key={item.id} onClick={() => handleResultClick(item)}>
                        <i className={getIcon(type)}></i>
                        <strong>{item.title}</strong>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </form>
    </div>
  );
}

export default GlobalSearch;
