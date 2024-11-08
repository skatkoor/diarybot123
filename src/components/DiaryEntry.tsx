import { useState, useRef } from 'react';
import { Smile, Meh, Frown, Tag, Calendar, Edit2, Trash2, List } from 'lucide-react';
import type { DiaryEntry } from '../types';

interface Props {
  entry: DiaryEntry;
  onDelete: (id: string) => void;
  onEdit: (id: string, content: string) => void;
}

const moodIcons = {
  happy: Smile,
  neutral: Meh,
  sad: Frown,
};

export default function DiaryEntry({ entry, onDelete, onEdit }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(entry.content);
  const [isBulletMode, setIsBulletMode] = useState(entry.content.includes('• '));
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const MoodIcon = moodIcons[entry.mood];

  const handleSave = async () => {
    try {
      await onEdit(entry.id, editContent);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save entry:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && isBulletMode && textareaRef.current) {
      e.preventDefault();
      const textarea = textareaRef.current;
      const cursorPosition = textarea.selectionStart;
      const currentContent = editContent;
      const beforeCursor = currentContent.substring(0, cursorPosition);
      const afterCursor = currentContent.substring(cursorPosition);
      
      const currentLine = beforeCursor.split('\n').pop() || '';
      if (currentLine.trim() === '•') {
        const newContent = beforeCursor.slice(0, -1) + '\n' + afterCursor;
        setEditContent(newContent);
        
        requestAnimationFrame(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart = beforeCursor.length;
            textareaRef.current.selectionEnd = beforeCursor.length;
          }
        });
      } else {
        const newContent = beforeCursor + '\n• ' + afterCursor;
        setEditContent(newContent);
        
        requestAnimationFrame(() => {
          if (textareaRef.current) {
            const newPosition = beforeCursor.length + 3;
            textareaRef.current.selectionStart = newPosition;
            textareaRef.current.selectionEnd = newPosition;
          }
        });
      }
    }
  };

  const toggleBulletMode = () => {
    setIsBulletMode(!isBulletMode);
    if (!isBulletMode && !editContent.startsWith('• ')) {
      setEditContent('• ' + editContent.split('\n').join('\n• '));
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">
            {new Date(entry.date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <MoodIcon className={`w-5 h-5 ${
            entry.mood === 'happy' ? 'text-green-500' : 
            entry.mood === 'sad' ? 'text-red-500' : 'text-yellow-500'
          }`} />
          <button onClick={() => setIsEditing(true)} className="text-blue-500 hover:text-blue-600">
            <Edit2 className="w-4 h-4" />
          </button>
          <button onClick={() => onDelete(entry.id)} className="text-red-500 hover:text-red-600">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <button
              type="button"
              onClick={toggleBulletMode}
              className={`p-2 rounded-full ${
                isBulletMode ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-blue-500'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
            <span className="text-sm text-gray-500">
              {isBulletMode ? 'Press Enter for new bullet point, Shift+Enter for blank line' : 'Click to enable bullet points'}
            </span>
          </div>
          <textarea
            ref={textareaRef}
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setIsEditing(false);
                setEditContent(entry.content);
                setIsBulletMode(entry.content.includes('• '));
              }}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <p className="text-gray-700 whitespace-pre-wrap">{entry.content}</p>
      )}

      {entry.tags && entry.tags.length > 0 && (
        <div className="mt-4 flex items-center gap-2 flex-wrap">
          <Tag className="w-4 h-4 text-gray-500" />
          {entry.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}