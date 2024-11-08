import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { pgTable, text, timestamp, boolean } from 'drizzle-orm/pg-core';

const DATABASE_URL = 'postgresql://neondb_owner:qKQBVp7T5Sro@ep-damp-bread-a4zxktgw.us-east-1.aws.neon.tech/neondb';

const sql = neon(DATABASE_URL);
export const db = drizzle(sql);

// Define tables
export const diaryEntries = pgTable('diary_entries', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  content: text('content').notNull(),
  mood: text('mood').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  lastModified: timestamp('last_modified').defaultNow(),
  tags: text('tags').array()
});

export const todos = pgTable('todos', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  content: text('content').notNull(),
  completed: boolean('completed').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  completedAt: timestamp('completed_at')
});

// Database initialization
export async function initializeDatabase() {
  try {
    console.log('Initializing database...');
    
    // Drop existing tables if they exist
    await sql`DROP TABLE IF EXISTS diary_entries CASCADE`;
    await sql`DROP TABLE IF EXISTS todos CASCADE`;
    
    // Create diary entries table
    await sql`
      CREATE TABLE IF NOT EXISTS diary_entries (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        content TEXT NOT NULL,
        mood TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        last_modified TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        tags TEXT[]
      )
    `;

    // Create todos table
    await sql`
      CREATE TABLE IF NOT EXISTS todos (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        content TEXT NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP WITH TIME ZONE
      )
    `;

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_diary_user ON diary_entries(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_diary_date ON diary_entries(created_at)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_todos_user ON todos(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_todos_date ON todos(created_at)`;

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

// Test database connection
export async function testConnection() {
  try {
    const result = await sql`SELECT NOW()`;
    console.log('Database connection successful:', result);
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}