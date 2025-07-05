import React, { useState } from 'react';
import axios from 'axios';
import { marked } from 'marked';
import '../styles/NotesTab.css';

const Summary = ({ text, onSave }) => {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSummarize = async () => {
    if (!text) {
      setSummary('Please upload a PDF first.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('https://reactmort-server.onrender.com/summarize', { text });
      setSummary(response.data.summary);
    } catch (error) {
      console.error('Error summarizing:', error);
      setSummary('An error occurred while summarizing.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h2>AI Summary</h2>
      <button
        className="btn btn-primary"
        onClick={handleSummarize}
        disabled={loading}
        style={{ marginBottom: '1rem' }}
      >
        {loading ? 'Summarizing...' : '📝 Summarize Extracted Text'}
      </button>


      <div>
        <h3>Summary</h3>
        <div
          dangerouslySetInnerHTML={{ __html: marked.parse(summary) }}
          style={{ textAlign: 'left', marginTop: '1rem' }}
        />
        {summary && (
          <button
            className="btn-primary"
            onClick={() => onSave(summary)}
            style={{ marginTop: '1rem' }}
          >
            💾 Save Summary as Note
          </button>

        )}
      </div>
    </div>
  );
};

export default Summary;
