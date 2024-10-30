import { db, notes } from '../lib/db';
import { eq } from 'drizzle-orm';

export async function createNote(userId: string, title: string, content: string) {
  const note = await db.insert(notes).values({
    id: crypto.randomUUID(),
    userId,
    title,
    content,
  }).returning();
  return note[0];
}

export async function getNotes(userId: string) {
  return await db.select().from(notes)
    .where(eq(notes.userId, userId))
    .orderBy(notes.createdAt);
}

export async function updateNote(id: string, userId: string, title: string, content: string) {
  return await db.update(notes)
    .set({ title, content, updatedAt: new Date() })
    .where(eq(notes.id, id) && eq(notes.userId, userId))
    .returning();
}

export async function deleteNote(id: string, userId: string) {
  return await db.delete(notes)
    .where(eq(notes.id, id) && eq(notes.userId, userId));
}