import { db, diaryEntries } from '../lib/db.js';
import { eq, desc } from 'drizzle-orm';

export async function createDiaryEntry(userId, content, mood, date) {
  try {
    const entry = await db.insert(diaryEntries).values({
      id: crypto.randomUUID(),
      userId,
      content,
      mood,
      createdAt: date ? new Date(date) : new Date(),
      updatedAt: new Date(),
      tags: []
    }).returning();
    return entry[0];
  } catch (error) {
    console.error('Failed to create diary entry:', error);
    throw error;
  }
}

export async function getDiaryEntries(userId) {
  try {
    return await db.select()
      .from(diaryEntries)
      .where(eq(diaryEntries.userId, userId))
      .orderBy(desc(diaryEntries.createdAt));
  } catch (error) {
    console.error('Failed to load diary entries:', error);
    throw error;
  }
}

export async function updateDiaryEntry(id, userId, content) {
  try {
    return await db.update(diaryEntries)
      .set({ 
        content, 
        updatedAt: new Date() 
      })
      .where(eq(diaryEntries.id, id) && eq(diaryEntries.userId, userId))
      .returning();
  } catch (error) {
    console.error('Failed to update diary entry:', error);
    throw error;
  }
}

export async function deleteDiaryEntry(id, userId) {
  try {
    return await db.delete(diaryEntries)
      .where(eq(diaryEntries.id, id) && eq(diaryEntries.userId, userId));
  } catch (error) {
    console.error('Failed to delete diary entry:', error);
    throw error;
  }
}