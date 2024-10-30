import { useState } from 'react';
import { FileText, Edit2, Save, X } from 'lucide-react';
import type { Note } from '../../types';

interface Props {
  note: Note;
  onUpdate?: (noteId: string, updates: Partial<Note>) => void;
}

export default function NoteCard({ note, onUpdate }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(note.title);
  const [editedContent, setEditedContent] = useState(note.content);

  const handleSave = () => {
    if (onUpdate) {
      onUpdate(note.id, {
        title: editedTitle,
        content: editedContent,
        lastModified: new Date().toISOString()
      });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedTitle(note.title);
    setEditedContent(note.content);
    setIsEditing(false);
  };

  return (
    <div className="group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6">
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
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="flex-1 px-2 py-1 border rounded focus:ring-2 focus:ring-purple-500"
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
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="p-1 text-green-500 hover:text-green-600"
                >
                  <Save className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCancel}
                  className="p-1 text-red-500 hover:text-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 text-purple-500 hover:text-purple-600"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        
        {isEditing ? (
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-purple-500"
            rows={4}
          />
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
    </div>
  );
}