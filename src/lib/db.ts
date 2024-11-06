import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { pgTable, text, timestamp, decimal, boolean } from 'drizzle-orm/pg-core';

neonConfig.fetchConnectionCache = true;

const sql = neon(import.meta.env.VITE_DATABASE_URL);
export const db = drizzle(sql);

// Define tables
export const diaryEntries = pgTable('diary_entries', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  content: text('content').notNull(),
  mood: text('mood').notNull(),
  date: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const notes = pgTable('notes', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  cardId: text('card_id').notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  date: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const flashcards = pgTable('flashcards', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  parentId: text('parent_id'),
  name: text('name').notNull(),
  date: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const finances = pgTable('finances', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  amount: decimal('amount').notNull(),
  type: text('type').notNull(),
  category: text('category').notNull(),
  description: text('description'),
  date: timestamp('created_at').defaultNow(),
});

export const todos = pgTable('todos', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  content: text('content').notNull(),
  completed: boolean('completed').notNull().default(false),
  date: timestamp('created_at').defaultNow(),
  completedAt: timestamp('completed_at'),
});