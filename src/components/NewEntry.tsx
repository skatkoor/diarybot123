import { useState } from 'react';
import { Smile, Meh, Frown, List, Calendar } from 'lucide-react';

interface Props {
  onSubmit: (content: string, mood: 'happy' | 'neutral' | 'sad', date: string) => void;
  selectedDate: Date;
}

export default function NewEntry({ onSubmit, selectedDate }: Props) {
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<'happy' | 'neutral' | 'sad'>('neutral');
  const [isBulletMode, setIsBulletMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onSubmit(content, mood, selectedDate.toISOString());
      setContent('');
      setMood('neutral');
    } catch (error) {
      console.error('Failed to submit entry:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (isBulletMode && e.key === 'Enter') {
      e.preventDefault();
      setContent(prev => prev + '\n• ');
    }
  };

  const toggleBulletMode = () => {
    setIsBulletMode(!isBulletMode);
    if (!isBulletMode && !content.startsWith('• ')) {
      setContent('• ' + content);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleBulletMode}
            className={`p-2 rounded-full ${isBulletMode ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-blue-500'}`}
          >
            <List className="w-5 h-5" />
          </button>
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-1" />
            {selectedDate.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </div>
        </div>
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={isBulletMode ? "Press Enter for new bullet point..." : "How are you feeling today?"}
        className="w-full p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        rows={4}
        disabled={isSubmitting}
      />
      
      <div className="mt-4 flex items-center justify-between">
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setMood('happy')}
            className={`p-2 rounded-full ${mood === 'happy' ? 'bg-green-100 text-green-500' : 'text-gray-400 hover:text-green-500'}`}
            disabled={isSubmitting}
          >
            <Smile className="w-6 h-6" />
          </button>
          <button
            type="button"
            onClick={() => setMood('neutral')}
            className={`p-2 rounded-full ${mood === 'neutral' ? 'bg-yellow-100 text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}`}
            disabled={isSubmitting}
          >
            <Meh className="w-6 h-6" />
          </button>
          <button
            type="button"
            onClick={() => setMood('sad')}
            className={`p-2 rounded-full ${mood === 'sad' ? 'bg-red-100 text-red-500' : 'text-gray-400 hover:text-red-500'}`}
            disabled={isSubmitting}
          >
            <Frown className="w-6 h-6" />
          </button>
        </div>
        
        <button
          type="submit"
          disabled={!content.trim() || isSubmitting}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : 'Save Entry'}
        </button>
      </div>
    </form>
  );
}