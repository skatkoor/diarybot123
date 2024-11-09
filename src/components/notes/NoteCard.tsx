import { useState, useRef, useEffect } from 'react';
import { FileText, Edit2, Trash2, AlertCircle, X } from 'lucide-react';
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showFullContent, setShowFullContent] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowFullContent(false);
      }
    }

    if (showFullContent) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [showFullContent]);

  const handleSave = () => {
    if (!editTitle.trim() || !editContent.trim()) return;
    
    onEdit(note.id, {
      title: editTitle,
      content: editContent,
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    onDelete(note.id);
    setShowDeleteConfirm(false);
  };

  if (showDeleteConfirm) {
    return (
      <div className="group relative bg-white rounded-xl shadow-md p-6">
        <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-white rounded-xl opacity-50 transition-opacity" />
        
        <div className="relative z-10 flex flex-col items-center justify-center text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Delete "{note.title}"?</h3>
          <p className="text-gray-600 mb-6">This action cannot be undone.</p>
          
          <div className="flex gap-3">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div 
        onClick={() => !isEditing && setShowFullContent(true)}
        className="group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 p-6 cursor-pointer"
      >
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
                  onClick={(e) => e.stopPropagation()}
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
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="p-1 text-gray-400 hover:text-purple-500"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleDelete}
                className="p-1 text-gray-400 hover:text-red-500"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {isEditing ? (
            <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
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

      {/* Full Content Modal */}
      {showFullContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div 
            ref={modalRef}
            className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <FileText className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">{note.title}</h2>
                  <p className="text-sm text-gray-500">
                    Last modified {new Date(note.lastModified).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowFullContent(false)}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="prose max-w-none">
                {note.content.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4">{paragraph}</p>
                ))}
              </div>
              
              {note.tags.length > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {note.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-sm bg-purple-100 text-purple-600 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}