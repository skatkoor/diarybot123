import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { pgTable, text, timestamp, boolean } from 'drizzle-orm/pg-core';

const DATABASE_URL = process.env.DATABASE_URL || '';
const sql = neon(DATABASE_URL);
export const db = drizzle(sql);

// Define tables
export const diaryEntries = pgTable('diary_entries', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  content: text('content').notNull(),
  mood: text('mood').notNull(),
  date: text('date').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  tags: text('tags').array()
});

export const todos = pgTable('todos', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  content: text('content').notNull(),
  completed: boolean('completed').default(false),
  date: timestamp('date').defaultNow(),
  completedAt: timestamp('completed_at')
});

export const notes = pgTable('notes', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  cardId: text('card_id').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  tags: text('tags').array()
});

export const flashcards = pgTable('flashcards', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  name: text('name').notNull(),
  parentId: text('parent_id'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Database initialization
export async function initializeDatabase() {
  try {
    // Create diary entries table
    await sql`
      CREATE TABLE IF NOT EXISTS diary_entries (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        content TEXT NOT NULL,
        mood TEXT NOT NULL,
        date TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
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
        date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP WITH TIME ZONE
      )
    `;

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_diary_user ON diary_entries(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_diary_date ON diary_entries(date)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_todos_user ON todos(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_todos_date ON todos(date)`;

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