import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { db, initQueries } from './db.js';
import { generateEmbedding, searchContent } from './search.js';
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
    console.log('Starting database initialization...');
    for (const query of initQueries) {
      console.log('Executing query:', query.substring(0, 50) + '...');
      await db.query(query);
    }
    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Error initializing database tables:', error);
    throw error; // Rethrow to prevent app from starting with uninitialized database
  }
}

// Call database initialization
initializeDatabase().catch(error => {
  console.error('Failed to initialize database:', error);
  process.exit(1); // Exit if database initialization fails
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW()');
    res.json({ 
      status: 'OK',
      timestamp: result.rows[0].now
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({ 
      status: 'ERROR',
      message: 'Database connection error'
    });
  }
});

// Test OpenAI endpoint
app.get('/api/test-openai', async (req, res) => {
  try {
    const embedding = await generateEmbedding('Test embedding generation');
    res.json({ 
      message: 'OpenAI connection successful',
      embeddingLength: embedding.length 
    });
  } catch (error) {
    console.error('OpenAI test error:', error);
    res.status(500).json({ error: 'OpenAI connection failed' });
  }
});

// Search endpoint
app.get('/api/search', async (req, res) => {
  try {
    const { query, userId, type } = req.query;
    const results = await searchContent(query, userId, type);
    res.json(results);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// API Routes
app.post('/api/diary', async (req, res) => {
  try {
    const { userId, content, mood } = req.body;
    const embedding = await generateEmbedding(content);
    const result = await db.query(
      'INSERT INTO diary_entries (id, user_id, content, mood, embedding) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [randomUUID(), userId, content, mood, embedding]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating diary entry:', error);
    res.status(500).json({ error: 'Failed to create diary entry' });
  }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('dist'));
  
  // Handle client-side routing
  app.get('*', (req, res) => {
    res.sendFile(join(__dirname, '../dist/index.html'));
  });
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});