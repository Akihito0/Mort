import React, { useState } from 'react';
import '../styles/quizmaker.css';
import axios from 'axios';
import MixedQuizPlayer from './MixedQuizPlayer.js';


const QuizMakerTab = ({ notes }) => {
  const [topics, setTopics] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [showAnswers, setShowAnswers] = useState("After each item");
  const [questionCount, setQuestionCount] = useState(5);
  const [questionTypes, setQuestionTypes] = useState({
    multipleChoice: false,
    trueFalse: false,
    identification: false,
  });
  const [quiz, setQuiz] = useState(null);

  const toggleTopic = (topic) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

  const handleAddFromNotes = () => {
    if (!notes || notes.length === 0) return alert("No notes available.");
    const choices = notes.map((note) => `${note.title}`);
    const selected = window.prompt(`Select note title to add as topic:\n${choices.join('\n')}`);
    const found = notes.find((note) => note.title === selected);
    if (found) setTopics((prev) => [...prev, { title: found.title, content: found.content }]);
  };

  const handleAddFromPDF = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/pdf';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const formData = new FormData();
      formData.append('pdf', file);

      try {
        const res = await axios.post('https://reactmort-server.onrender.com/upload', formData);
        const content = res.data.text;
        const title = file.name.replace(/\.pdf$/, '');
        setTopics((prev) => [...prev, { title, content }]);
      } catch (err) {
        alert("Failed to extract PDF content.");
      }
    };
    input.click();
  };

  const handleStartQuiz = async () => {
    if (
      selectedTopics.length === 0 ||
      !questionCount ||
      (!questionTypes.multipleChoice &&
        !questionTypes.trueFalse &&
        !questionTypes.identification)
    ) {
      alert("Please complete all fields to start the quiz.");
      return;
    }

    const content = selectedTopics
      .map((t) => topics.find((topic) => topic.title === t)?.content || '')
      .join('\n');

    const selectedTypes = Object.entries(questionTypes)
      .filter(([, v]) => v)
      .map(([k]) => k); // ['multipleChoice', 'trueFalse']

    try {
      const res = await axios.post('https://reactmort-server.onrender.com/custom-quiz', {
        text: content,
        count: Number(questionCount),
        types: selectedTypes,
      });
      setQuiz(res.data.quiz);
    } catch (err) {
      console.error(err);
      alert("Failed to generate quiz.");
    }
  };

  return (
    <div className="quiz-maker-modal">
      <div className="quiz-maker-container">
        <h2>🧠 Quiz Maker</h2>

        <div className="quiz-maker-body">
          <div className="topic-selection">
            <h3>Available Topics</h3>
            <ul>
              {topics.map((topic, i) => (
                <li key={i}>
                  <button
                    className={selectedTopics.includes(topic.title) ? "selected" : ""}
                    onClick={() => toggleTopic(topic.title)}
                  >
                    {selectedTopics.includes(topic.title) ? "✅ " : ""}
                    {topic.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="quiz-settings">
            <h3>Quiz Settings</h3>

            <div className="selected-topics">
              <p><strong>Selected Topics:</strong></p>
              <ul>
                {selectedTopics.length === 0 ? (
                  <li className="no-topics">No topics selected</li>
                ) : (
                  selectedTopics.map((t, i) => (
                    <li key={i}>
                      <span>{t}</span>
                      <button onClick={() => setSelectedTopics(prev => prev.filter(topic => topic !== t))}>✖</button>
                    </li>
                  ))
                )}
              </ul>
            </div>

            <div className="setting-block">
              <label><strong>Number of Questions</strong></label>
              <input
                type="number"
                min="1"
                value={questionCount}
                onChange={(e) => setQuestionCount(e.target.value)}
                placeholder="e.g. 10"
              />
            </div>

            <div className="setting-block">
              <label><strong>Question Types</strong></label>
              <div className="checkboxes-group">
                <label><input type="checkbox" checked={questionTypes.multipleChoice} onChange={() => setQuestionTypes(prev => ({ ...prev, multipleChoice: !prev.multipleChoice }))} /> Multiple Choice</label>
                <label><input type="checkbox" checked={questionTypes.trueFalse} onChange={() => setQuestionTypes(prev => ({ ...prev, trueFalse: !prev.trueFalse }))} /> True or False</label>
                <label><input type="checkbox" checked={questionTypes.identification} onChange={() => setQuestionTypes(prev => ({ ...prev, identification: !prev.identification }))} /> Identification</label>
              </div>
            </div>

            <div className="setting-block">
              <label><strong>Show Answers</strong></label>
              <select value={showAnswers} onChange={(e) => setShowAnswers(e.target.value)}>
                <option>After each item</option>
                <option>End of quiz</option>
                <option>Don't show</option>
              </select>
            </div>

            <button className="start-btn" onClick={handleStartQuiz}>Start Quiz</button>
          </div>
        </div>

        <div className="extra-buttons">
          <button onClick={handleAddFromNotes}>+ Add topic from Notes</button>
          <button onClick={handleAddFromPDF}>+ Add topic from PDF</button>
        </div>
      </div>

      {quiz && <MixedQuizPlayer quiz={quiz} showAnswers={showAnswers} onClose={() => setQuiz(null)} />}

    </div>
  );
};

export default QuizMakerTab;
