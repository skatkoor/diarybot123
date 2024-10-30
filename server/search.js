import OpenAI from 'openai';
import { db } from './db.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function generateEmbedding(text) {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  return response.data[0].embedding;
}

export async function searchContent(query, userId, type = 'all') {
  // Generate embedding for the search query
  const queryEmbedding = await generateEmbedding(query);
  
  // Build the search query based on type
  let searchQuery = '';
  let tables = [];
  
  if (type === 'all' || type === 'diary') {
    tables.push(`
      (SELECT id, content, 'diary' as type, created_at, 
       embedding <=> $1 as distance
       FROM diary_entries 
       WHERE user_id = $2) 
    `);
  }
  
  if (type === 'all' || type === 'notes') {
    tables.push(`
      (SELECT id, content, 'note' as type, created_at,
       embedding <=> $1 as distance 
       FROM notes 
       WHERE user_id = $2)
    `);
  }
  
  if (type === 'all' || type === 'finances') {
    tables.push(`
      (SELECT id, description as content, 'finance' as type, created_at,
       embedding <=> $1 as distance
       FROM finances 
       WHERE user_id = $2)
    `);
  }
  
  searchQuery = `
    SELECT * FROM (${tables.join(' UNION ALL ')}) results
    WHERE distance < 0.3
    ORDER BY distance
    LIMIT 10
  `;

  const result = await db.query(searchQuery, [queryEmbedding, userId]);
  return result.rows;
}