import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { db, initQueries } from './db.js';
import { randomUUID } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database tables
async function initializeDatabase() {
  try {
    for (const query of initQueries) {
      await db.query(query);
    }
    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Error initializing database tables:', error);
  }
}

// Call database initialization
initializeDatabase();

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    await db.query('SELECT NOW()');
    res.send('OK');
  } catch (error) {
    res.status(500).send('Database connection error');
  }
});

// API Routes
app.post('/api/diary', async (req, res) => {
  try {
    const { userId, content, mood } = req.body;
    const result = await db.query(
      'INSERT INTO diary_entries (id, user_id, content, mood) VALUES ($1, $2, $3, $4) RETURNING *',
      [randomUUID(), userId, content, mood]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating diary entry:', error);
    res.status(500).json({ error: 'Failed to create diary entry' });
  }
});

app.get('/api/diary/:userId', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM diary_entries WHERE user_id = $1 ORDER BY created_at DESC',
      [req.params.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching diary entries:', error);
    res.status(500).json({ error: 'Failed to fetch diary entries' });
  }
});

// Notes routes
app.post('/api/notes', async (req, res) => {
  try {
    const { userId, title, content } = req.body;
    const result = await db.query(
      'INSERT INTO notes (id, user_id, title, content) VALUES ($1, $2, $3, $4) RETURNING *',
      [randomUUID(), userId, title, content]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({ error: 'Failed to create note' });
  }
});

app.get('/api/notes/:userId', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM notes WHERE user_id = $1 ORDER BY created_at DESC',
      [req.params.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// Finance routes
app.post('/api/finances', async (req, res) => {
  try {
    const { userId, amount, type, category, description } = req.body;
    const result = await db.query(
      'INSERT INTO finances (id, user_id, amount, type, category, description) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [randomUUID(), userId, amount, type, category, description]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating finance entry:', error);
    res.status(500).json({ error: 'Failed to create finance entry' });
  }
});

app.get('/api/finances/:userId', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM finances WHERE user_id = $1 ORDER BY created_at DESC',
      [req.params.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching finance entries:', error);
    res.status(500).json({ error: 'Failed to fetch finance entries' });
  }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(join(__dirname, '../dist')));
  
  // Handle client-side routing
  app.get('*', (req, res) => {
    res.sendFile(join(__dirname, '../dist/index.html'));
  });
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});