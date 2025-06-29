import React from 'react';
import NoteCard from './NoteCard.js';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const NoteGrid = ({ notes, onView, onDelete, onReorder, onUseAsContext, onAddNote }) => {
  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const reordered = Array.from(notes);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);

    onReorder(reordered);
  };

  return (
    <div style={{ padding: '1rem' }}>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="notes" direction="horizontal">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '1rem',
                alignItems: 'flex-start'
              }}
            >
              {notes.map((note, index) => {
                if (!note || note.id === undefined || note.id === null) return null;
                return (
                  <Draggable key={note.id} draggableId={note.id.toString()} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={{
                          ...provided.draggableProps.style,
                          userSelect: 'none'
                        }}
                      >
                        <NoteCard
                          note={note}
                          onView={onView}
                          onDelete={onDelete}
                          onUseAsContext={onUseAsContext}
                        />
                      </div>
                    )}
                  </Draggable>
                );
              })}

              {/* Add Note Card (not draggable, always at end) */}
              <div
                className="note-card add-card"
                onClick={onAddNote}
              >
                <div className="plus">+</div>
                <p>Add Note</p>
              </div>

              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default NoteGrid;
