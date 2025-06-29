import React, { useEffect, useState } from 'react';
import { marked } from 'marked';

const NoteCard = ({ note, onView, onDelete, onUseAsContext }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div
      className="note-card"
      onClick={() => onView(note)}
      style={{
        position: 'relative',
        width: '240px',
        height: isMobile ? '120px' : '200px',
        overflow: 'hidden',
        cursor: 'pointer',
        padding: '10px',
        background: 'var(--surface-color)',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}
    >
      <h3 style={{ marginBottom: isMobile ? 0 : '6px' }}>{note.title}</h3>

      {!isMobile && (
        <div
          dangerouslySetInnerHTML={{
            __html: marked.parse(note.content.slice(0, 200) + '...')
          }}
          style={{
            fontSize: '14px',
            lineHeight: '1.4',
            flexGrow: 1,
            overflow: 'hidden'
          }}
        />
      )}

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(note.id);
        }}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'transparent',
          border: 'none',
          color: 'red',
          fontWeight: 'bold',
          fontSize: '16px',
          cursor: 'pointer',
        }}
        title="Delete"
      >
        ×
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onUseAsContext(note);
        }}
        style={{
          position: 'absolute',
          bottom: '10px',
          right: '10px',
          backgroundColor: '#007bff',
          color: 'white',
          fontSize: '12px',
          border: 'none',
          borderRadius: '6px',
          padding: '4px 6px',
          cursor: 'pointer',
        }}
        title="Use as chat context"
      >
        📌
      </button>
    </div>
  );
};

export default NoteCard;
