import { db, executeQuery } from './db';

async function testConnection() {
  try {
    const result = await executeQuery(async () => {
      return await db.execute(sql`SELECT NOW()`);
    });
    console.log('Database connection successful:', result);
    
    // Test diary entries
    const entries = await executeQuery(async () => {
      return await db.execute(sql`SELECT * FROM diary_entries ORDER BY created_at DESC LIMIT 5`);
    });
    console.log('Recent diary entries:', entries);
    
    return { success: true, entries };
  } catch (error) {
    console.error('Database test failed:', error);
    return { success: false, error };
  }
}

testConnection();