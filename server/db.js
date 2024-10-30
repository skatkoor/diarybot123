import { neon, neonConfig } from '@neondatabase/serverless';

// Configure Neon client
neonConfig.fetchConnectionCache = true;

const sql = neon(process.env.DATABASE_URL);

export const db = {
  query: async (text, params) => {
    try {
      console.log('Executing query:', text, 'with params:', params);
      const result = await sql(text, params);
      return {
        rows: Array.isArray(result) ? result : [result],
        rowCount: Array.isArray(result) ? result.length : 1
      };
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  },
  getClient: () => ({ query: sql })
};

// Define your database schema
export const schema = {
  diaryEntries: 'diary_entries',
  notes: 'notes',
  finances: 'finances',
  users: 'users'
};

// Initialize tables one by one with error handling
export const initQueries = [
  // Enable vector extension
  {
    name: 'Enable vector extension',
    query: `CREATE EXTENSION IF NOT EXISTS vector;`
  },
  
  // Create diary_entries table
  {
    name: 'Create diary_entries table',
    query: `
      CREATE TABLE IF NOT EXISTS ${schema.diaryEntries} (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        content TEXT NOT NULL,
        mood TEXT NOT NULL,
        embedding vector(1536),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS diary_entries_user_id_idx ON ${schema.diaryEntries}(user_id);
      CREATE INDEX IF NOT EXISTS diary_entries_content_idx ON ${schema.diaryEntries} USING GIN(to_tsvector('english', content));
      CREATE INDEX IF NOT EXISTS diary_entries_embedding_idx ON ${schema.diaryEntries} USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
    `
  },
  
  // Create notes table
  {
    name: 'Create notes table',
    query: `
      CREATE TABLE IF NOT EXISTS ${schema.notes} (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        embedding vector(1536),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS notes_user_id_idx ON ${schema.notes}(user_id);
      CREATE INDEX IF NOT EXISTS notes_content_idx ON ${schema.notes} USING GIN(to_tsvector('english', content));
      CREATE INDEX IF NOT EXISTS notes_embedding_idx ON ${schema.notes} USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
    `
  }
];