import { db, finances } from '../lib/db';
import { eq } from 'drizzle-orm';

export async function createFinanceEntry(
  userId: string,
  amount: string,
  type: string,
  category: string,
  description?: string
) {
  const entry = await db.insert(finances).values({
    id: crypto.randomUUID(),
    userId,
    amount,
    type,
    category,
    description,
  }).returning();
  return entry[0];
}

export async function getFinanceEntries(userId: string) {
  return await db.select().from(finances)
    .where(eq(finances.userId, userId))
    .orderBy(finances.createdAt);
}

export async function deleteFinanceEntry(id: string, userId: string) {
  return await db.delete(finances)
    .where(eq(finances.id, id) && eq(finances.userId, userId));
}