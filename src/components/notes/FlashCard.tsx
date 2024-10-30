import { Folder } from 'lucide-react';
import type { FlashCard as FlashCardType } from '../../types';

interface Props {
  card: FlashCardType;
  onClick: () => void;
}

export default function FlashCard({ card, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="group relative w-full aspect-square bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 p-6 flex flex-col items-center justify-center text-center"
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
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-b-xl transform scale-x-0 group-hover:scale-x-100 transition-transform" />
    </button>
  );
}