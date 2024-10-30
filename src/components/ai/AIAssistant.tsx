import { useState, useEffect } from 'react';
import { Search, Send, Bot, Book, FileText } from 'lucide-react';

type SearchType = 'diary' | 'notes' | 'all';

interface SearchResult {
  id: string;
  content: string;
  type: string;
  created_at: string;
  distance: number;
}

export default function AIAssistant() {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<SearchType>('diary');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(
        `/api/search?query=${encodeURIComponent(query)}&type=${searchType}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError('Failed to search entries. Please try again.');
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-4 mb-6">
          <Bot className="w-8 h-8 text-blue-500" />
          <h1 className="text-2xl font-bold text-gray-800">AI Assistant</h1>
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setSearchType('diary')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md ${
              searchType === 'diary'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Book className="w-4 h-4" />
            Diary Entries
          </button>
          <button
            onClick={() => setSearchType('notes')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md ${
              searchType === 'notes'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            Notes
          </button>
        </div>

        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Ask me anything about your entries..."
            className="w-full pl-4 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-blue-500 hover:text-blue-600 disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-md">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="mt-8 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          results.length > 0 && (
            <div className="mt-8 space-y-6">
              {results.map((result) => (
                <div
                  key={result.id}
                  className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-gray-500">
                      {result.type.charAt(0).toUpperCase() + result.type.slice(1)}
                    </span>
                    <span className="text-sm text-gray-400">
                      {new Date(result.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700">{result.content}</p>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}