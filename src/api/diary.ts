import { db, diaryEntries } from '../lib/db';
import { eq } from 'drizzle-orm';

export async function createDiaryEntry(userId: string, content: string, mood: string) {
  const entry = await db.insert(diaryEntries).values({
    id: crypto.randomUUID(),
    userId,
    content,
    mood,
  }).returning();
  return entry[0];
}

export async function getDiaryEntries(userId: string) {
  return await db.select().from(diaryEntries)
    .where(eq(diaryEntries.userId, userId))
    .orderBy(diaryEntries.createdAt);
}

export async function updateDiaryEntry(id: string, userId: string, content: string) {
  return await db.update(diaryEntries)
    .set({ content, updatedAt: new Date() })
    .where(eq(diaryEntries.id, id) && eq(diaryEntries.userId, userId))
    .returning();
}

export async function deleteDiaryEntry(id: string, userId: string) {
  return await db.delete(diaryEntries)
    .where(eq(diaryEntries.id, id) && eq(diaryEntries.userId, userId));
}