import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createDiaryEntry, getDiaryEntries } from '../api/diary';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the dist directory
app.use(express.static(join(__dirname, '../../dist')));

// Health check endpoint
app.get('/api/health', (_, res) => res.send('OK'));

// Diary routes
app.post('/api/diary', async (req, res) => {
  try {
    const { content, mood, date } = req.body;
    const entry = await createDiaryEntry(content, mood, date);
    res.json(entry);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create diary entry' });
  }
});

app.get('/api/diary', async (_, res) => {
  try {
    const entries = await getDiaryEntries();
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch diary entries' });
  }
});

// Serve index.html for all other routes (SPA support)
app.get('*', (_, res) => {
  res.sendFile(join(__dirname, '../../dist/index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});