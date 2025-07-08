const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const multer = require('multer');
require('dotenv').config();

const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

// PDF Upload Endpoint
const upload = multer({ storage: multer.memoryStorage() });

app.post('/upload', upload.single('pdf'), async (req, res) => {
const pdfParse = require('pdf-parse');
try {
  const pdfData = await pdfParse(req.file.buffer); // use buffer from memory
  res.json({ text: pdfData.text });
} catch (err) {
  console.error(err);
  res.status(500).json({ error: 'Failed to extract PDF text' });
}
});


// GEMINI SUMMARY ENDPOINT
app.post('/summarize', async (req, res) => {
  const { text } = req.body;
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  try {
    const model = genAI.getGenerativeModel({model: 'models/gemini-1.5-flash'});

    const result = await model.generateContent(
  `You're a smart and helpful study assistant. Convert the following academic text into detailed, structured study notes.

- Use bullet points and headings where appropriate.
- Simplify complex terms into plain language.
- Include important definitions, examples, and explanations.
- Keep the tone academic but student-friendly.

Text to convert:
${text}`
);

    const response = await result.response;
    const summary = response.text();

    res.json({ summary });
  } catch (error) {
    console.error('Gemini Error:', error.message);
    res.status(500).json({ error: 'Failed to summarize text with Gemini.' });
  }
});

app.get('/', (req, res) => {
res.send('🚀 Server is live!');
});



app.post('/chat', async (req, res) => {
  const { prompt } = req.body;
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  try {
    const model = genAI.getGenerativeModel({ model: 'models/gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const reply = await result.response.text();
    res.json({ reply });
  } catch (err) {
    console.error('Chatbot Error:', err.message);
    res.status(500).json({ reply: 'Sorry, I couldn’t answer that.' });
  }
});
// QUIZ GENERATION ENDPOINT
app.post('/generate-quiz', async (req, res) => {
const { text } = req.body;

if (!text || text.trim().length === 0) {
  return res.status(400).json({ error: 'No content provided.' });
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

try {
  const model = genAI.getGenerativeModel({ model: 'models/gemini-1.5-flash' });

  const prompt = `
You're a study assistant. Generate 5 multiple-choice questions from the following content.

Each question object must include:
- "question": string
- "options": array of 4 strings
- "correct": integer (0–3) for the correct answer
- "explanation": a helpful string explaining why the correct answer is correct

Only respond with a valid JSON array of 5 question objects. No extra commentary.

Content:
${text}
`;

  const result = await model.generateContent(prompt);
  const responseText = await result.response.text();

  // Try extracting clean JSON
  const jsonStart = responseText.indexOf('[');
  const jsonEnd = responseText.lastIndexOf(']') + 1;
  const cleanJson = responseText.slice(jsonStart, jsonEnd);

  const quiz = JSON.parse(cleanJson);

  // Double check explanations exist
  const quizWithExplanations = quiz.map(q => ({
    ...q,
    explanation: q.explanation || "No explanation provided."
  }));

  res.json({ quiz: quizWithExplanations });
} catch (err) {
  console.error('❌ Quiz generation error:', err.message || err);
  res.status(500).json({ error: 'Failed to generate quiz. Try with simpler or shorter text.' });
}
});

app.listen(PORT, () => {
console.log(`✅ Server running on port ${PORT}`);
});
// ADVANCED QUIZ GENERATION ENDPOINT
app.post('/custom-quiz', async (req, res) => {
const { text, count, types } = req.body;

if (!text || !count || !types || types.length === 0) {
  return res.status(400).json({ error: 'Missing required fields: text, count, or types' });
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

try {
  const model = genAI.getGenerativeModel({ model: 'models/gemini-1.5-flash' });

  // Build prompt dynamically
  const typeInstructions = types.map(type => {
    switch (type) {
      case 'multipleChoice': return 'multiple-choice';
      case 'trueFalse': return 'true or false';
      case 'identification': return 'identification';
      default: return '';
    }
  }).join(', ');

 const prompt = `
    You are a quiz generator. Based on the following academic content, generate exactly ${count} quiz questions.

    Only include the following types of questions: ${typeInstructions}.
    Do NOT include any question types outside of these.

    Each question must include:
    - "question": the question text
    - "type": either "multipleChoice", "trueFalse", or "identification"
    - "options": array of options (only for multipleChoice and trueFalse)
    - "correct": the correct answer (index for MCQ/TF, string for ID)
    - "explanation": a brief explanation for the answer

    ⚠️ VERY IMPORTANT: Only return a valid JSON array of exactly ${count} quiz question objects.
    Do NOT return more or fewer than ${count}. Do NOT include any commentary, markdown, headings, or other text outside the JSON array.

    Academic content:
    ${text}
    `;
  const result = await model.generateContent(prompt);
  const responseText = await result.response.text();

  const jsonStart = responseText.indexOf('[');
  const jsonEnd = responseText.lastIndexOf(']') + 1;
  const cleanJson = responseText.slice(jsonStart, jsonEnd);

  const quiz = JSON.parse(cleanJson);

  // Validate response length
  if (!Array.isArray(quiz) || quiz.length !== Number(count)) {
    console.warn(`⚠️ Gemini returned ${quiz.length} questions instead of ${count}`);
    return res.status(500).json({ error: `Received ${quiz.length} questions instead of ${count}. Try again or simplify the input.` });
  }

  res.json({ quiz });
} catch (err) {
  console.error('❌ Custom quiz error:', err.message || err);
  res.status(500).json({ error: 'Failed to generate custom quiz. Try again.' });
}
});

app.post('/generate-flashcards', async (req, res) => {
const { text } = req.body;

if (!text || text.trim() === '') {
  return res.status(400).json({ error: 'Missing input text' });
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

try {
  const model = genAI.getGenerativeModel({ model: 'models/gemini-1.5-flash' });
  const prompt = `
You're an AI tutor. Generate flashcards from the academic content below.

Output format:
[
{ "question": "...", "answer": "..." },
...
]

Text:
${text}
  `;

  const result = await model.generateContent(prompt);
  const raw = await result.response.text();
  const start = raw.indexOf('[');
  const end = raw.lastIndexOf(']') + 1;
  const json = raw.slice(start, end);

  const flashcards = JSON.parse(json);
  res.json({ flashcards });
} catch (err) {
  console.error('Flashcard error:', err.message || err);
  res.status(500).json({ error: 'Failed to generate flashcards' });
}
});

const { extractDocxText, extractPptxText, extractImageText } = require('./extractors');

// DOCX Upload
app.post('/upload-docx', upload.single('file'), async (req, res) => {
try {
  const text = await extractDocxText(req.file.buffer);
  res.json({ text });
} catch (err) {
  console.error('DOCX error:', err.message);
  res.status(500).json({ error: 'Failed to extract DOCX text' });
}
});

// PPTX Upload
app.post('/upload-pptx', upload.single('file'), async (req, res) => {
try {
  const text = await extractPptxText(req.file.buffer);
  res.json({ text });
} catch (err) {
  console.error('PPTX error:', err.message);
  res.status(500).json({ error: 'Failed to extract PPTX text' });
}
});

// IMAGE OCR Upload
app.post('/upload-image', upload.single('file'), async (req, res) => {
try {
  const text = await extractImageText(req.file.buffer);
  res.json({ text });
} catch (err) {
  console.error('Image OCR error:', err.message);
  res.status(500).json({ error: 'Failed to extract text from image' });
}
});
