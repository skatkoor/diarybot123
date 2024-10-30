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

export async function searchContent(query, userId, type = 'all') {
  try {
    console.log('Starting search with query:', query);
    
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

    // Generate embedding for the search query
    const embedding = await generateEmbedding(query);
    console.log('Generated embedding for search');

    // Build the search query based on type
    let searchQuery = '';
    let tables = [];
    
    if (type === 'all' || type === 'diary') {
      tables.push(`
        (SELECT 
          id, 
          content, 
          'diary' as type, 
          created_at,
          CASE 
            WHEN embedding IS NULL THEN 1 
            ELSE embedding <=> array_to_vector($1::float8[])
          END as distance
         FROM diary_entries 
         WHERE user_id = $2 ${timeFilter})
      `);
    }
    
    if (type === 'all' || type === 'notes') {
      tables.push(`
        (SELECT 
          id, 
          content, 
          'note' as type, 
          created_at,
          CASE 
            WHEN embedding IS NULL THEN 1 
            ELSE embedding <=> array_to_vector($1::float8[])
          END as distance
         FROM notes 
         WHERE user_id = $2 ${timeFilter})
      `);
    }
    
    searchQuery = `
      WITH search_results AS (
        ${tables.join(' UNION ALL ')}
      )
      SELECT * FROM search_results
      WHERE distance < 0.3
      ORDER BY distance ASC, created_at DESC
      LIMIT 10;
    `;

    console.log('Executing search query...');
    const result = await db.query(searchQuery, [embedding, userId]);
    console.log('Search returned', result.rows.length, 'results');

    // If no results found with vector search, try text search
    if (result.rows.length === 0) {
      console.log('No vector search results, trying text search');
      const textSearchQuery = `
        WITH text_results AS (
          SELECT 
            id, 
            content, 
            type,
            created_at,
            ts_rank(to_tsvector('english', content), plainto_tsquery('english', $1)) as rank
          FROM (
            ${type === 'all' || type === 'diary' 
              ? `SELECT id, content, 'diary' as type, created_at FROM diary_entries WHERE user_id = $2 ${timeFilter}`
              : ''
            }
            ${type === 'all' ? 'UNION ALL' : ''}
            ${type === 'all' || type === 'notes'
              ? `SELECT id, content, 'note' as type, created_at FROM notes WHERE user_id = $2 ${timeFilter}`
              : ''
            }
          ) combined_results
          WHERE to_tsvector('english', content) @@ plainto_tsquery('english', $1)
        )
        SELECT * FROM text_results
        ORDER BY rank DESC, created_at DESC
        LIMIT 10;
      `;

      const textResult = await db.query(textSearchQuery, [query, userId]);
      console.log('Text search returned', textResult.rows.length, 'results');
      
      if (textResult.rows.length === 0) {
        return { message: 'No matching entries found for your query.' };
      }
      
      return textResult.rows;
    }

    return result.rows;
  } catch (error) {
    console.error('Error in searchContent:', error);
    throw new Error('Failed to search entries: ' + error.message);
  }
}