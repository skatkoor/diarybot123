import { db, diaryEntries } from '../lib/db';
import { eq } from 'drizzle-orm';

const DEFAULT_USER_ID = 'default-user';

export async function createDiaryEntry(content: string, mood: string, date: string) {
  try {
    const entry = await db.insert(diaryEntries).values({
      id: crypto.randomUUID(),
      userId: DEFAULT_USER_ID,
      content,
      mood,
      date,
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    
    return entry[0];
  } catch (error) {
    console.error('Failed to create diary entry:', error);
    throw error;
  }
}

export async function getDiaryEntries() {
  try {
    return await db.select()
      .from(diaryEntries)
      .where(eq(diaryEntries.userId, DEFAULT_USER_ID))
      .orderBy(diaryEntries.date);
  } catch (error) {
    console.error('Failed to load diary entries:', error);
    throw error;
  }
}

export async function updateDiaryEntry(id: string, content: string) {
  try {
    const [updatedEntry] = await db.update(diaryEntries)
      .set({ 
        content, 
        updatedAt: new Date() 
      })
      .where(eq(diaryEntries.id, id) && eq(diaryEntries.userId, DEFAULT_USER_ID))
      .returning();
    
    return updatedEntry;
  } catch (error) {
    console.error('Failed to update diary entry:', error);
    throw error;
  }
}

export async function deleteDiaryEntry(id: string) {
  try {
    await db.delete(diaryEntries)
      .where(eq(diaryEntries.id, id) && eq(diaryEntries.userId, DEFAULT_USER_ID));
  } catch (error) {
    console.error('Failed to delete diary entry:', error);
    throw error;
  }
}