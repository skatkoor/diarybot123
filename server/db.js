import { neon, neonConfig } from '@neondatabase/serverless';

// Configure Neon client
neonConfig.fetchConnectionCache = true;

const sql = neon(process.env.DATABASE_URL);

// Helper function to convert array to Postgres array literal
function arrayToPostgresArray(arr) {
  return `{${arr.join(',')}}`;
}

export const db = {
  query: async (text, params) => {
    try {
      console.log('Executing query:', text.substring(0, 100), 'with params:', params?.map(p => 
        Array.isArray(p) ? `[Array of length ${p.length}]` : 
        typeof p === 'string' && p.length > 100 ? p.substring(0, 100) + '...' : p
      ));
      
      // Transform array parameters to Postgres array literals
      const transformedParams = params?.map(p => 
        Array.isArray(p) ? arrayToPostgresArray(p) : p
      );
      
      const result = await sql(text, transformedParams);
      console.log('Query result:', Array.isArray(result) ? 
        `${result.length} rows returned` : 
        'Single result returned'
      );
      
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
    query: `CREATE EXTENSION IF NOT EXISTS vector`
  },
  
  // Create helper function for array to vector conversion
  {
    name: 'Create array_to_vector function',
    query: `
      CREATE OR REPLACE FUNCTION array_to_vector(arr float8[])
      RETURNS vector
      AS $$
      BEGIN
        RETURN arr::vector;
      END;
      $$ LANGUAGE plpgsql IMMUTABLE;
    `
  },
  
  // Create tables
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
      )
    `
  },
  
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
      )
    `
  },
  
  {
    name: 'Create finances table',
    query: `
      CREATE TABLE IF NOT EXISTS ${schema.finances} (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        amount DECIMAL NOT NULL,
        type TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT,
        embedding vector(1536),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `
  },
  
  {
    name: 'Create users table',
    query: `
      CREATE TABLE IF NOT EXISTS ${schema.users} (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `
  },

  // Create indexes
  {
    name: 'Create diary entries embedding index',
    query: `CREATE INDEX IF NOT EXISTS diary_embedding_idx ON ${schema.diaryEntries} USING ivfflat (embedding vector_cosine_ops)`
  },
  {
    name: 'Create notes embedding index',
    query: `CREATE INDEX IF NOT EXISTS notes_embedding_idx ON ${schema.notes} USING ivfflat (embedding vector_cosine_ops)`
  },
  {
    name: 'Create finances embedding index',
    query: `CREATE INDEX IF NOT EXISTS finances_embedding_idx ON ${schema.finances} USING ivfflat (embedding vector_cosine_ops)`
  }
];