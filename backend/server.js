require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Check if ENV variables exist
const API_KEY = process.env.OPENROUTER_API_KEY ? process.env.OPENROUTER_API_KEY.trim() : null;
if (!API_KEY) {
  console.warn('WARNING: OPENROUTER_API_KEY is not set in .env');
}

// Helper to get clean auth header
const getAuthHeader = () => {
  if (!API_KEY) return '';
  if (API_KEY.startsWith('Bearer ')) return API_KEY;
  return `Bearer ${API_KEY}`;
};

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/react-flow-ai';
mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

console.log('Backend started with API_KEY:', API_KEY ? `${API_KEY.substring(0, 10)}...` : 'NULL');
console.log('Auth header test:', getAuthHeader().substring(0, 20) + '...');

// Mongoose Schema and Model
const promptSchema = new mongoose.Schema({
  prompt: String,
  response: String,
  createdAt: { type: Date, default: Date.now }
});
const Prompt = mongoose.model('Prompt', promptSchema);

// Endpoint to ask AI
app.post('/api/ask-ai', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    console.log(`Sending prompt to OpenRouter: "${prompt}"`);
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': getAuthHeader(),
        'HTTP-Referer': 'http://localhost:5000', 
        'X-OpenRouter-Title': 'React Flow AI', 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'openrouter/auto',
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenRouter full error body:', errorText);
        console.error('Request was sent with Auth starting with:', getAuthHeader().substring(0, 20));
        throw new Error(`OpenRouter API responded with status ${response.status}`);
    }

    const data = await response.json();
    const resultText = data.choices[0].message.content;

    res.json({ response: resultText });
  } catch (error) {
    console.error('Error asking AI:', error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
});

// Endpoint to save prompt and response
app.post('/api/save', async (req, res) => {
  try {
    const { prompt, response } = req.body;
    
    if (!prompt || !response) {
      return res.status(400).json({ error: 'Prompt and response are required' });
    }

    const newPrompt = new Prompt({ prompt, response });
    await newPrompt.save();
    
    res.json({ success: true, message: 'Saved successfully' });
  } catch (error) {
    console.error('Error saving:', error);
    res.status(500).json({ error: 'Failed to save to database' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
