import { jest } from '@jest/globals';
import { searchContent, generateEmbedding } from '../server/search.js';
import { db } from '../server/db.js';

// Mock the database and OpenAI
jest.mock('../server/db.js');
jest.mock('openai');

describe('Search functionality', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test('should find entries using text search', async () => {
    // Mock successful text search
    db.query.mockResolvedValueOnce({
      rows: [
        {
          id: '1',
          content: 'Test diary entry',
          created_at: new Date().toISOString()
        }
      ]
    });

    const results = await searchContent('test', 'user123', 'diary');
    expect(results).toHaveLength(1);
    expect(results[0].content).toBe('Test diary entry');
  });

  test('should fall back to vector search if text search fails', async () => {
    // Mock empty text search results
    db.query.mockResolvedValueOnce({ rows: [] });

    // Mock successful vector search
    const mockEmbedding = new Array(1536).fill(0);
    jest.spyOn(global, 'generateEmbedding').mockResolvedValueOnce(mockEmbedding);

    db.query.mockResolvedValueOnce({
      rows: [
        {
          id: '2',
          content: 'Vector search result',
          created_at: new Date().toISOString()
        }
      ]
    });

    const results = await searchContent('vector', 'user123', 'diary');
    expect(results).toHaveLength(1);
    expect(results[0].content).toBe('Vector search result');
  });

  test('should handle time-based queries', async () => {
    // Mock successful search for "today"
    db.query.mockResolvedValueOnce({
      rows: [
        {
          id: '3',
          content: "Today's entry",
          created_at: new Date().toISOString()
        }
      ]
    });

    const results = await searchContent('what did I do today', 'user123', 'diary');
    expect(results).toHaveLength(1);
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('DATE(created_at) = CURRENT_DATE'),
      expect.any(Array)
    );
  });

  test('should return message when no results found', async () => {
    // Mock empty results for both text and vector search
    db.query.mockResolvedValueOnce({ rows: [] });
    db.query.mockResolvedValueOnce({ rows: [] });

    const results = await searchContent('nonexistent', 'user123', 'diary');
    expect(results).toHaveProperty('message');
    expect(results.message).toContain('No matching entries found');
  });

  test('should handle search errors gracefully', async () => {
    db.query.mockRejectedValueOnce(new Error('Database error'));

    await expect(searchContent('test', 'user123', 'diary')).rejects.toThrow('Failed to search entries');
  });
});

describe('Embedding generation', () => {
  test('should generate valid embeddings', async () => {
    const mockEmbedding = new Array(1536).fill(0);
    const mockOpenAI = {
      embeddings: {
        create: jest.fn().mockResolvedValueOnce({
          data: [{ embedding: mockEmbedding }]
        })
      }
    };

    const embedding = await generateEmbedding('test text');
    expect(embedding).toHaveLength(1536);
    expect(Array.isArray(embedding)).toBe(true);
  });

  test('should handle embedding generation errors', async () => {
    const mockOpenAI = {
      embeddings: {
        create: jest.fn().mockRejectedValueOnce(new Error('OpenAI error'))
      }
    };

    await expect(generateEmbedding('test text')).rejects.toThrow();
  });
});