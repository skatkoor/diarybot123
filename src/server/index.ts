import express from 'express';
import cors from 'cors';
import { createDiaryEntry, getDiaryEntries } from '../api/diary';
import { createNote, getNotes } from '../api/notes';
import { createFinanceEntry, getFinanceEntries } from '../api/finances';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, '../../dist')));

// Health check endpoint
app.get('/api/health', (_, res) => res.send('OK'));

// Diary routes
app.post('/api/diary', async (req, res) => {
  const { userId, content, mood } = req.body;
  const entry = await createDiaryEntry(userId, content, mood);
  res.json(entry);
});

app.get('/api/diary/:userId', async (req, res) => {
  const entries = await getDiaryEntries(req.params.userId);
  res.json(entries);
});

// Notes routes
app.post('/api/notes', async (req, res) => {
  const { userId, title, content } = req.body;
  const note = await createNote(userId, title, content);
  res.json(note);
});

app.get('/api/notes/:userId', async (req, res) => {
  const notes = await getNotes(req.params.userId);
  res.json(notes);
});

// Finance routes
app.post('/api/finances', async (req, res) => {
  const { userId, amount, type, category, description } = req.body;
  const entry = await createFinanceEntry(userId, amount, type, category, description);
  res.json(entry);
});

app.get('/api/finances/:userId', async (req, res) => {
  const entries = await getFinanceEntries(req.params.userId);
  res.json(entries);
});

// Serve index.html for all other routes (SPA support)
app.get('*', (_, res) => {
  res.sendFile(path.join(__dirname, '../../dist/index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});