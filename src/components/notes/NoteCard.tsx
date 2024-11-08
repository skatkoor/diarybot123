import { useState } from 'react';
import { FileText, Edit2, Trash2 } from 'lucide-react';
import type { Note } from '../../types';

interface Props {
  note: Note;
  onEdit: (noteId: string, updates: Partial<Note>) => void;
  onDelete: (noteId: string) => void;
}

export default function NoteCard({ note, onEdit, onDelete }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(note.title);
  const [editContent, setEditContent] = useState(note.content);

  const handleSave = () => {
    if (!editTitle.trim() || !editContent.trim()) return;
    
    onEdit(note.id, {
      title: editTitle,
      content: editContent,
    });
    setIsEditing(false);
  };

  return (
    <div className="group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 p-6">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-white rounded-xl opacity-50 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative z-10">
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
              onClick={() => onDelete(note.id)}
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
                }}
                className="px-3 py-1 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!editTitle.trim() || !editContent.trim()}
                className="px-3 py-1 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-700 line-clamp-3">{note.content}</p>
        )}
        
        {note.tags.length > 0 && (
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