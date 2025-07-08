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
        width: '100%',
        maxWidth: '240px',
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

      {/* Tags Display */}
      {note.tags && note.tags.length > 0 && (
        <div className="note-tags" style={{ marginTop: '8px' }}>
          {note.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="tag"
              style={{
                display: 'inline-block',
                backgroundColor: '#e3f2fd',
                color: '#1976d2',
                fontSize: '10px',
                padding: '2px 6px',
                borderRadius: '12px',
                marginRight: '4px',
                marginBottom: '2px',
                fontWeight: '500'
              }}
            >
              {tag}
            </span>
          ))}
          {note.tags.length > 3 && (
            <span
              style={{
                display: 'inline-block',
                backgroundColor: '#f5f5f5',
                color: '#666',
                fontSize: '10px',
                padding: '2px 6px',
                borderRadius: '12px',
                fontWeight: '500'
              }}
            >
              +{note.tags.length - 3}
            </span>
          )}
        </div>
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
