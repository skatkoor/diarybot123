import { useState, useRef, useEffect } from 'react';
import { Folder, Edit2, Trash2, AlertCircle } from 'lucide-react';
import type { FlashCard as FlashCardType } from '../../types';

interface Props {
  card: FlashCardType;
  onClick: () => void;
  onEdit: (updates: Partial<FlashCardType>) => void;
  onDelete: () => void;
}

export default function FlashCard({ card, onClick, onEdit, onDelete }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(card.name);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const editContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (isEditing && editContainerRef.current && !editContainerRef.current.contains(event.target as Node)) {
        setIsEditing(false);
        setEditName(card.name);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isEditing, card.name]);

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!editName.trim()) return;
    
    onEdit({ name: editName });
    setIsEditing(false);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  if (showDeleteConfirm) {
    return (
      <div className="relative w-full aspect-square bg-white rounded-xl shadow-md p-6 flex flex-col items-center justify-center text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Delete Card?</h3>
        <p className="text-sm text-gray-600 mb-4">
          Are you sure you want to delete "{card.name}"? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowDeleteConfirm(false);
            }}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete();
            }}
            className="px-4 py-2 text-sm bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="group relative w-full aspect-square bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 p-6 flex flex-col items-center justify-center text-center cursor-pointer"
      onClick={!isEditing ? onClick : undefined}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-white rounded-xl opacity-50 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative z-10 flex flex-col items-center gap-4 w-full">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
          <Folder className="w-8 h-8 text-blue-500" />
        </div>
        
        <div className="w-full">
          {isEditing ? (
            <div 
              ref={editContainerRef}
              onClick={(e) => e.stopPropagation()}
              className="w-full"
            >
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && editName.trim()) {
                    handleSave(e as any);
                  } else if (e.key === 'Escape') {
                    setIsEditing(false);
                    setEditName(card.name);
                  }
                }}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
                autoFocus
              />
              <div className="mt-2 flex justify-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(false);
                    setEditName(card.name);
                  }}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!editName.trim()}
                  className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{card.name}</h3>
              <p className="text-sm text-gray-500">
                {card.children.length + card.notes.length} items
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Last modified {new Date(card.lastModified).toLocaleDateString()}
              </p>
            </>
          )}
        </div>
      </div>

      {!isEditing && (
        <div 
          className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleEdit}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <Edit2 className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <Trash2 className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-b-xl transform scale-x-0 group-hover:scale-x-100 transition-transform" />
    </div>
  );
}