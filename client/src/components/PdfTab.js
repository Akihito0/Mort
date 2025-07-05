import React, { useState, useRef } from 'react';
import Summary from './Summary';
import ChatbotWidget from './ChatbotWidget';
import QuizPlayer from './QuizPlayer';
import '../styles/NotesTab.css'; // ✅ Correct path
import { auth, db, collection, addDoc } from '../firestore-database/firebase'; // ✅ Firebase

const PdfTab = () => {
  const [file, setFile] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [chatContext, setChatContext] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [quizScore, setQuizScore] = useState(null);
  const dropRef = useRef(null);
  const [showFullText, setShowFullText] = useState(false);

  const handleUpload = async (uploadFile = file) => {
    if (!uploadFile) return alert('Please upload a file.');

    const formData = new FormData();

    let endpoint = '';
    if (uploadFile.type === 'application/pdf') {
      formData.append('pdf', uploadFile);
      endpoint = '/upload';
    } else if (uploadFile.name.endsWith('.docx')) {
      formData.append('file', uploadFile);
      endpoint = '/upload-docx';
    } else if (uploadFile.name.endsWith('.pptx')) {
      formData.append('file', uploadFile);
      endpoint = '/upload-pptx';
    } else if (uploadFile.type.startsWith('image/')) {
      formData.append('file', uploadFile);
      endpoint = '/upload-image';
    } else {
      return alert('Unsupported file type.');
    }

    try {
      const res = await fetch(`https://reactmort-server.onrender.com${endpoint}`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data?.text) {
        setExtractedText(data.text);
      } else {
        alert('Failed to extract text.');
      }
    } catch (err) {
      alert('Error uploading file.');
    }
  };

  const generateQuiz = async (textToUse) => {
    const res = await fetch('https://reactmort-server.onrender.com/generate-quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: textToUse }),
    });

    const data = await res.json();
    if (data.quiz) {
      setQuiz(data.quiz);
      setQuizScore(null);
    } else {
      alert('Quiz generation failed.');
    }
  };

  const handleSaveNote = async (text) => {
    const user = auth.currentUser;
    if (!user) return alert('You must be logged in to save notes.');

    const displayName = user.displayName || user.uid;
    const noteData = {
      title: `Note ${new Date().toLocaleString()}`,
      content: text,
      createdAt: new Date(),
    };

    try {
      await addDoc(collection(db, 'Mort-Notes', displayName, 'Notes'), noteData);
      alert('Note saved to Firebase!');
      setExtractedText('');
    } catch (err) {
      console.error(err);
      alert('Failed to save note.');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      handleUpload(droppedFile);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    dropRef.current.classList.add('drag-over');
  };

  const handleDragLeave = () => {
    dropRef.current.classList.remove('drag-over');
  };

  return (
    <div className="pdf-tab">
      <div className="header">
        <h1>Text Extractor</h1>
      </div>

      <div
        ref={dropRef}
        className="upload-box"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <label htmlFor="pdfInput" className="upload-btn">
          Upload a File <span className="upload-icon">📤</span>
        </label>
        <p className="upload-hint">
          or<br />Drag & drop PDF, DOCX, PPTX, or Image
        </p>
        <input
          id="pdfInput"
          type="file"
          accept=".pdf,.docx,.pptx,image/*"
          onChange={(e) => {
            setFile(e.target.files[0]);
            handleUpload(e.target.files[0]);
          }}
          hidden
        />
      </div>

      {extractedText && (
        <div className="summary-card">
          <div className="summary-header">
            <h3>Extracted Summary</h3>
            <button className="btn btn-primary" onClick={() => handleSaveNote(extractedText)}>
              + Add to Notes
            </button>
          </div>
          <div className="summary-text">
            <strong>Summary Result</strong>
            <div className="formatted-text-wrapper">
            <div
              className="formatted-text"
              dangerouslySetInnerHTML={{
                __html: showFullText
                  ? extractedText
                  : extractedText.split('</p>').slice(0, 2).join('</p>') + '</p>',
              }}
            />
          </div>
            {extractedText.split('</p>').length > 3 && (
              <button
                className="btn-secondary"
                onClick={() => setShowFullText(!showFullText)}
                style={{ marginTop: '0.5rem' }}
              >
                {showFullText ? 'Show Less ▲' : 'Show More ▼'}
              </button>
            )}
          </div>
          <div className="btn-group" style={{ marginTop: '1rem' }}>
            <button className="btn" onClick={() => handleSaveNote(extractedText)}>
              💾 Save as Note
            </button>
            <button className="btn" onClick={() => generateQuiz(extractedText)}>
              🧠 Generate Quiz
            </button>
          </div>

          <div style={{ marginTop: '2rem' }}>
            <Summary text={extractedText} onSave={(summary) => handleSaveNote(summary)} />
          </div>
        </div>
      )}

      {quiz && (
        <div className="modal-backdrop">
          <QuizPlayer
            quiz={quiz}
            onFinish={(score, total) => {
              setQuizScore({ score, total });
              setQuiz(null);
            }}
            onClose={() => setQuiz(null)}
          />
        </div>
      )}

      {quizScore && (
        <div className="quiz-score">
          <h2>✅ Quiz Completed</h2>
          <p>Your Score: {quizScore.score} / {quizScore.total}</p>
        </div>
      )}

      <div className="chatbot-float">
        <ChatbotWidget contextNote={chatContext} />
      </div>
    </div>
  );
};

export default PdfTab;
