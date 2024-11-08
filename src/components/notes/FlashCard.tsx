import { useState } from 'react';
import { Folder, Edit2, Trash2 } from 'lucide-react';
import type { FlashCard as FlashCardType } from '../../types';

interface Props {
  card: FlashCardType;
  onClick: () => void;
  onEdit: (cardId: string, updates: Partial<FlashCardType>) => void;
  onDelete: (cardId: string) => void;
}

export default function FlashCard({ card, onClick, onEdit, onDelete }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(card.name);

  const handleSave = () => {
    onEdit(card.id, { name: editName });
    setIsEditing(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(card.id);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  if (isEditing) {
    return (
      <div className="group relative w-full aspect-square bg-white rounded-xl shadow-md p-6" onClick={(e) => e.stopPropagation()}>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-white rounded-xl opacity-50 group-hover:opacity-100 transition-opacity" />
        
        <div className="relative z-10 flex flex-col h-full">
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
            autoFocus
          />
          
          <div className="flex justify-end gap-2 mt-auto">
            <button
              onClick={() => setIsEditing(false)}
              className="px-3 py-1 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className="group relative w-full aspect-square bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 p-6 cursor-pointer"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-white rounded-xl opacity-50 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative z-10 flex flex-col items-center gap-4">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
          <Folder className="w-8 h-8 text-blue-500" />
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">{card.name}</h3>
          <p className="text-sm text-gray-500">
            {card.children.length + card.notes.length} items
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Last modified {new Date(card.lastModified).toLocaleDateString()}
          </p>
        </div>

        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleEdit}
            className="p-2 rounded-full hover:bg-blue-100"
          >
            <Edit2 className="w-4 h-4 text-blue-500" />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 rounded-full hover:bg-red-100"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-b-xl transform scale-x-0 group-hover:scale-x-100 transition-transform" />
    </div>
  );
}