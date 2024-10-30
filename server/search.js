import OpenAI from 'openai';
import { db } from './db.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function generateEmbedding(text) {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });
    
    // Ensure the embedding is an array and properly formatted
    const embedding = response.data[0].embedding;
    if (!Array.isArray(embedding)) {
      throw new Error('Embedding must be an array');
    }
    
    // Format the embedding as a proper Postgres vector string
    return `[${embedding.join(',')}]`;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

export async function searchContent(query, userId, type = 'all') {
  try {
    // Generate embedding for the search query
    const queryEmbedding = await generateEmbedding(query);
    
    // Build the search query based on type
    let searchQuery = '';
    let tables = [];
    
    if (type === 'all' || type === 'diary') {
      tables.push(`
        (SELECT id, content, 'diary' as type, created_at, 
         embedding <=> $1::vector as distance
         FROM diary_entries 
         WHERE user_id = $2) 
      `);
    }
    
    if (type === 'all' || type === 'notes') {
      tables.push(`
        (SELECT id, content, 'note' as type, created_at,
         embedding <=> $1::vector as distance 
         FROM notes 
         WHERE user_id = $2)
      `);
    }
    
    if (type === 'all' || type === 'finances') {
      tables.push(`
        (SELECT id, description as content, 'finance' as type, created_at,
         embedding <=> $1::vector as distance
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
  } catch (error) {
    console.error('Error in searchContent:', error);
    throw error;
  }
}