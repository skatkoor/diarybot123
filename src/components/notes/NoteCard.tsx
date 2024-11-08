import { useState } from 'react';
import { FileText, Edit2, Trash2, AlertCircle } from 'lucide-react';
import type { Note } from '../../types';

interface Props {
  note: Note;
  onEdit: (updates: Partial<Note>) => Promise<void>;
  onDelete: () => Promise<void>;
}

export default function NoteCard({ note, onEdit, onDelete }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(note.title);
  const [editContent, setEditContent] = useState(note.content);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSave = async () => {
    if (!editTitle.trim() || !editContent.trim()) return;
    
    try {
      setError(null);
      await onEdit({
        title: editTitle,
        content: editContent,
        lastModified: new Date().toISOString()
      });
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to save note:', err);
      setError('Failed to save note. Please try again.');
    }
  };

  const handleDelete = async () => {
    try {
      setError(null);
      await onDelete();
      setIsDeleting(false);
    } catch (err) {
      console.error('Failed to delete note:', err);
      setError('Failed to delete note. Please try again.');
    }
  };

  if (isDeleting) {
    return (
      <div className="group relative bg-white rounded-xl shadow-md p-6 flex flex-col items-center justify-center text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Delete Note?</h3>
        <p className="text-sm text-gray-600 mb-4">
          Are you sure you want to delete "{note.title}"? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setIsDeleting(false)}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 text-sm bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 p-6">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-white rounded-xl opacity-50 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative z-10">
        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors">
              <FileText className="w-5 h-5 text-purple-500" />
            </div>
            {isEditing ? (
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="px-2 py-1 border rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                autoFocus
              />
            ) : (
              <div>
                <h3 className="font-medium text-gray-800">{note.title}</h3>
                <p className="text-xs text-gray-500">
                  Last modified {new Date(note.lastModified).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-1 text-gray-400 hover:text-purple-500"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsDeleting(true)}
              className="p-1 text-gray-400 hover:text-red-500"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {isEditing ? (
          <div className="space-y-4">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows={4}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditTitle(note.title);
                  setEditContent(note.content);
                  setError(null);
                }}
                className="px-3 py-1 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!editTitle.trim() || !editContent.trim()}
                className="px-3 py-1 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-700 whitespace-pre-wrap">{note.content}</p>
        )}
        
        {note.tags && note.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {note.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs bg-purple-100 text-purple-600 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-purple-600 rounded-b-xl transform scale-x-0 group-hover:scale-x-100 transition-transform" />
    </div>
  );
}