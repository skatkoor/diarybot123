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
      try {
        console.log(`Executing ${query.name}...`);
        await db.query(query.query);
        console.log(`Successfully executed ${query.name}`);
      } catch (error) {
        console.error(`Error executing ${query.name}:`, error);
        if (!error.message.includes('already exists')) {
          throw error;
        }
      }
    }
    
    console.log('Database initialization completed');
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
}

// Call database initialization
initializeDatabase().catch(error => {
  console.error('Failed to initialize database:', error);
  process.exit(1);
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
      message: error.message
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
    res.status(500).json({ 
      error: error.message 
    });
  }
});

// API Routes
app.post('/api/diary', async (req, res) => {
  try {
    console.log('Creating diary entry with data:', req.body);
    
    const { userId, content, mood } = req.body;
    
    if (!userId || !content || !mood) {
      return res.status(400).json({ 
        error: 'Missing required fields' 
      });
    }

    console.log('Generating embedding...');
    const embedding = await generateEmbedding(content);
    console.log('Embedding generated');

    const query = `
      INSERT INTO diary_entries (id, user_id, content, mood, embedding) 
      VALUES ($1, $2, $3, $4, $5::vector) 
      RETURNING *
    `;
    
    const values = [randomUUID(), userId, content, mood, embedding];
    console.log('Executing insert query...');
    
    const result = await db.query(query, values);
    console.log('Insert successful');
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating diary entry:', error);
    res.status(500).json({ 
      error: 'Failed to create diary entry',
      details: error.message
    });
  }
});

// Search endpoint
app.get('/api/search', async (req, res) => {
  try {
    const { query, userId, type } = req.query;
    
    if (!query || !userId) {
      return res.status(400).json({ 
        error: 'Missing required parameters' 
      });
    }
    
    const results = await searchContent(query, userId, type);
    
    if (results.message) {
      // No results found
      return res.json([]);
    }
    
    res.json(results);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ 
      error: 'Search failed',
      details: error.message 
    });
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