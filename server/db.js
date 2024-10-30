import { neon, neonConfig } from '@neondatabase/serverless';

// Configure Neon client
neonConfig.fetchConnectionCache = true;

const sql = neon(process.env.DATABASE_URL);

export const db = {
  query: async (text, params) => {
    try {
      console.log('Executing query:', text);
      if (params) console.log('with params:', params);
      const result = await sql(text, params);
      return {
        rows: Array.isArray(result) ? result : [result],
        rowCount: Array.isArray(result) ? result.length : 1
      };
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }
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
  {
    name: 'Enable vector extension',
    query: `CREATE EXTENSION IF NOT EXISTS vector;`
  },
  {
    name: 'Create diary_entries table',
    query: `CREATE TABLE IF NOT EXISTS ${schema.diaryEntries} (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      content TEXT NOT NULL,
      mood TEXT NOT NULL,
      embedding vector(1536),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );`
  },
  {
    name: 'Create diary_entries user_id index',
    query: `CREATE INDEX IF NOT EXISTS diary_entries_user_id_idx ON ${schema.diaryEntries}(user_id);`
  },
  {
    name: 'Create diary_entries content index',
    query: `CREATE INDEX IF NOT EXISTS diary_entries_content_idx ON ${schema.diaryEntries} USING GIN(to_tsvector('english', content));`
  },
  {
    name: 'Create diary_entries embedding index',
    query: `CREATE INDEX IF NOT EXISTS diary_entries_embedding_idx ON ${schema.diaryEntries} USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);`
  },
  {
    name: 'Create notes table',
    query: `CREATE TABLE IF NOT EXISTS ${schema.notes} (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      embedding vector(1536),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );`
  },
  {
    name: 'Create notes user_id index',
    query: `CREATE INDEX IF NOT EXISTS notes_user_id_idx ON ${schema.notes}(user_id);`
  },
  {
    name: 'Create notes content index',
    query: `CREATE INDEX IF NOT EXISTS notes_content_idx ON ${schema.notes} USING GIN(to_tsvector('english', content));`
  },
  {
    name: 'Create notes embedding index',
    query: `CREATE INDEX IF NOT EXISTS notes_embedding_idx ON ${schema.notes} USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);`
  }
];