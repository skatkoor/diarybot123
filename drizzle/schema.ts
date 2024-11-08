import { pgTable, text, timestamp, boolean } from 'drizzle-orm/pg-core';

export const todos = pgTable('todos', {
  id: text('id').primaryKey(),
  content: text('content').notNull(),
  completed: boolean('completed').notNull().default(false),
  date: timestamp('created_at').defaultNow(),
  completedAt: timestamp('completed_at'),
});