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
    
    const embedding = response.data[0].embedding;
    if (!Array.isArray(embedding)) {
      throw new Error('Embedding must be an array');
    }
    
    return embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

export async function searchContent(query, userId, type = 'diary') {
  try {
    console.log('Starting search with query:', query, 'type:', type);
    
    // Handle time-based queries
    const timeRegex = /today|yesterday|this week|last week/i;
    let timeFilter = '';
    
    if (query.match(/today/i)) {
      timeFilter = `AND DATE(created_at) = CURRENT_DATE`;
    } else if (query.match(/yesterday/i)) {
      timeFilter = `AND DATE(created_at) = CURRENT_DATE - INTERVAL '1 day'`;
    } else if (query.match(/this week/i)) {
      timeFilter = `AND DATE(created_at) >= DATE_TRUNC('week', CURRENT_DATE)`;
    } else if (query.match(/last week/i)) {
      timeFilter = `AND DATE(created_at) >= DATE_TRUNC('week', CURRENT_DATE - INTERVAL '1 week')
                    AND DATE(created_at) < DATE_TRUNC('week', CURRENT_DATE)`;
    }

    // First try text search as it's faster
    const textSearchQuery = `
      SELECT 
        id, 
        content, 
        created_at,
        ts_rank(to_tsvector('english', content), plainto_tsquery('english', $1)) as rank
      FROM ${type === 'diary' ? 'diary_entries' : 'notes'}
      WHERE 
        user_id = $2
        ${timeFilter}
        AND to_tsvector('english', content) @@ plainto_tsquery('english', $1)
      ORDER BY rank DESC, created_at DESC
      LIMIT 10;
    `;

    console.log('Executing text search...');
    const textResult = await db.query(textSearchQuery, [query, userId]);
    
    if (textResult.rows.length > 0) {
      console.log('Text search found results:', textResult.rows.length);
      return textResult.rows;
    }

    // If no text results, try semantic search
    console.log('No text results, trying semantic search...');
    const embedding = await generateEmbedding(query);

    const vectorSearchQuery = `
      SELECT 
        id, 
        content, 
        created_at,
        embedding <=> $1::vector as distance
      FROM ${type === 'diary' ? 'diary_entries' : 'notes'}
      WHERE 
        user_id = $2
        ${timeFilter}
        AND embedding IS NOT NULL
      ORDER BY embedding <=> $1::vector
      LIMIT 10;
    `;

    console.log('Executing vector search...');
    const vectorResult = await db.query(vectorSearchQuery, [embedding, userId]);
    
    if (vectorResult.rows.length > 0) {
      console.log('Vector search found results:', vectorResult.rows.length);
      return vectorResult.rows;
    }

    console.log('No results found');
    return { message: 'No matching entries found for your query.' };
  } catch (error) {
    console.error('Error in searchContent:', error);
    throw new Error('Failed to search entries: ' + error.message);
  }
}