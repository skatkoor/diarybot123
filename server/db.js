import { neon, neonConfig } from '@neondatabase/serverless';

// Configure Neon client
neonConfig.fetchConnectionCache = true;

const sql = neon(process.env.DATABASE_URL);

export const db = {
  query: async (text, params) => {
    try {
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

// Drop and recreate tables
export const initQueries = [
  // Enable vector extension if not already enabled
  `CREATE EXTENSION IF NOT EXISTS vector`,

  // Drop existing tables to ensure clean slate
  `DROP TABLE IF EXISTS ${schema.diaryEntries}`,
  `DROP TABLE IF EXISTS ${schema.notes}`,
  `DROP TABLE IF EXISTS ${schema.finances}`,
  `DROP TABLE IF EXISTS ${schema.users}`,

  // Create tables with vector support
  `CREATE TABLE ${schema.diaryEntries} (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    content TEXT NOT NULL,
    mood TEXT NOT NULL,
    embedding vector(1536),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  )`,
  
  `CREATE TABLE ${schema.notes} (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    embedding vector(1536),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  )`,
  
  `CREATE TABLE ${schema.finances} (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    amount DECIMAL NOT NULL,
    type TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    embedding vector(1536),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  )`,
  
  `CREATE TABLE ${schema.users} (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  )`,

  // Create indexes for vector similarity search
  `CREATE INDEX diary_embedding_idx ON ${schema.diaryEntries} USING ivfflat (embedding vector_cosine_ops)`,
  `CREATE INDEX notes_embedding_idx ON ${schema.notes} USING ivfflat (embedding vector_cosine_ops)`,
  `CREATE INDEX finances_embedding_idx ON ${schema.finances} USING ivfflat (embedding vector_cosine_ops)`
];