import React, { useState, useRef, useEffect } from 'react';
import { FiMessageCircle, FiMic, FiSend, FiVolume2, FiVolumeX } from 'react-icons/fi';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

const ChatbotWidget = ({ contextNote, onClearContext }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [chat, setChat] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(document.body.classList.contains('dark'));
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Strip HTML from note content
  const stripHtml = (html) => html.replace(/<[^>]*>/g, '');

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat, loading]);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.body.classList.contains('dark'));
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const speak = (text) => {
    if (isMuted) return;
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Speech Recognition not supported.");

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.continuous = false;
    
    recognition.onstart = () => {
      setIsListening(true);
    };
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      // Automatically send after speech recognition
      handleSend(transcript);
    };
    
    recognition.onerror = (e) => {
      console.error('Speech error:', e);
      setIsListening(false);
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognition.start();
    recognitionRef.current = recognition;
  };

  const handleSend = async (textToSend = null) => {
    let messageText = textToSend !== null ? textToSend : input;
    
    if (!messageText.trim()) return;

    const userMsg = { role: 'user', text: messageText };
    setChat(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const contextText = contextNote ? stripHtml(contextNote.content) : '';
      const promptText = contextNote
        ? `Context: You are helping with a note titled "${contextNote.title}". Here is the note content:\n\n"${contextText}"\n\nBased on this note content, please answer the following question: ${messageText}`
        : messageText;

      console.log("📨 Prompt sent to /chat:", promptText); // DEBUG

      const res = await axios.post('https://reactmort-server.onrender.com/chat', { prompt: promptText });
      const botMsg = { role: 'bot', text: res.data.reply };
      setChat(prev => [...prev, botMsg]);
      speak(res.data.reply);
    } catch (err) {
      const errorMsg = '⚠️ Error from bot.';
      console.error('❌ Chatbot error:', err.message || err);
      setChat(prev => [...prev, { role: 'bot', text: errorMsg }]);
      speak(errorMsg);
    }

    setLoading(false);
  };

  return (
    <div style={{ position: 'fixed', bottom: isOpen ? '0' : '20px', right: '20px', zIndex: 1000 }}>
      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
          }
        `}
      </style>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '50%',
            width: '42px',
            height: '42px',
            fontSize: '16px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
            cursor: 'pointer',
          }}
        >
          <FiMessageCircle size={16} />
        </button>
      )}

      {isOpen && (
        <div
          style={{
            width: '90vw',
            maxWidth: '360px',
            height: window.innerWidth < 768 ? '80vh' : '470px',
            maxHeight: '95vh',
            background: isDarkMode ? '#1e1e1e' : '#fff',
            borderRadius: '10px',
            boxShadow: '0 0 12px rgba(0,0,0,0.2)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            color: isDarkMode ? '#f5f5f5' : '#000',
            touchAction: 'manipulation',
          }}
        >
          {/* Header */}
          <div
            style={{
              background: '#007bff',
              color: '#fff',
              padding: '12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <strong>M.O.R.T. Helper</strong>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => setIsMuted((m) => !m)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  fontSize: '18px',
                  cursor: 'pointer',
                  lineHeight: 1,
                  marginRight: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  padding: 0,
                  height: '28px',
                  width: '28px',
                  justifyContent: 'center',
                }}
                title={isMuted ? 'Unmute TTS' : 'Mute TTS'}
              >
                {isMuted ? <FiVolumeX size={20} style={{ transform: 'none' }} /> : <FiVolume2 size={20} style={{ transform: 'none' }} />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  fontSize: '20px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  lineHeight: 1,
                }}
              >
                X
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              padding: '10px',
              overflowY: 'auto',
              fontSize: '14px',
              background: isDarkMode ? '#2c2c2c' : '#fafafa',
            }}
          >
            {contextNote && (
                              <div style={{
                  background: isDarkMode ? '#2b3b55' : '#eef7ff',
                  padding: '8px 12px',
                  marginBottom: '10px',
                  fontSize: '12px',
                  borderRadius: '6px',
                  border: `2px solid ${isDarkMode ? '#4a90e2' : '#007bff'}`,
                  position: 'relative'
                }}>
                  📌 <strong>Context: {contextNote.title}</strong>
                  <div style={{ fontSize: '11px', marginTop: '2px', opacity: 0.8 }}>
                    Ask questions about this note
                  </div>
                  <div style={{ fontSize: '10px', marginTop: '4px', opacity: 0.7, maxHeight: '60px', overflow: 'hidden' }}>
                    {contextNote.content?.substring(0, 100)}...
                  </div>
                  {onClearContext && (
                    <button
                      onClick={onClearContext}
                      style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        background: 'transparent',
                        border: 'none',
                        color: isDarkMode ? '#ccc' : '#666',
                        fontSize: '14px',
                        cursor: 'pointer',
                        padding: '2px'
                      }}
                      title="Clear context"
                    >
                      ×
                    </button>
                  )}
                </div>
            )}
            {chat.map((msg, i) => (
              <div
                key={i}
                style={{
                  marginBottom: '10px',
                  textAlign: msg.role === 'user' ? 'right' : 'left',
                }}
              >
                <div
                  style={{
                    display: 'inline-block',
                    background: msg.role === 'user'
                      ? (isDarkMode ? '#3b5545' : '#DCF8C6')
                      : (isDarkMode ? '#3a3a3a' : '#e9e9e9'),
                    padding: '8px 12px',
                    borderRadius: '14px',
                    maxWidth: '85%',
                    color: isDarkMode ? '#f0f0f0' : '#000',
                  }}
                >
                  {msg.role === 'bot' ? (
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  ) : (
                    msg.text
                  )}
                </div>
              </div>
            ))}
            {loading && <div>⏳ Typing...</div>}
            <div ref={messagesEndRef} />
          </div>

          {/* Input & Buttons */}
          <div style={{
            padding: '10px',
            borderTop: isDarkMode ? '1px solid #444' : '1px solid #ddd',
            background: isDarkMode ? '#1e1e1e' : '#fff',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              width: '100%',
            }}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask something..."
                style={{
                  flex: 1,
                  padding: '8px',
                  fontSize: '14px',
                  border: isDarkMode ? '1px solid #666' : '1px solid #ccc',
                  borderRadius: '6px',
                  background: isDarkMode ? '#2e2e2e' : '#fff',
                  color: isDarkMode ? '#f5f5f5' : '#000',
                  minWidth: '0',
                  maxWidth: window.innerWidth < 420 ? '80%' : '100%',
                  marginRight: '2px',
                }}
              />

                              <button
                  onClick={startListening}
                  title={isListening ? "Listening..." : "Voice input"}
                  style={{
                    background: isListening ? '#ff4444' : (isDarkMode ? '#444' : '#f1f1f1'),
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    animation: isListening ? 'pulse 1.5s infinite' : 'none',
                  }}
                >
                <FiMic size={16} style={{ transform: 'scaleX(1)' }} />
              </button>

                              <button
                  onClick={() => handleSend()}
                  title="Send"
                style={{
                  background: '#007bff',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <FiSend size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatbotWidget;
