import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import FlashCard from './FlashCard';
import type { FlashCard as FlashCardType } from '../../types';

interface Props {
  cards: FlashCardType[];
  onAddCard: (card: Omit<FlashCardType, 'id'>) => void;
  onSelectCard: (card: FlashCardType) => void;
}

export default function NotesView({ cards, onAddCard, onSelectCard }: Props) {
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardName, setNewCardName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardName.trim()) return;
    
    onAddCard({
      name: newCardName,
      type: 'folder',
      notes: [],
      children: [],
      lastModified: new Date().toISOString(),
    });
    
    setNewCardName('');
    setIsAddingCard(false);
  };

  const filteredCards = cards.filter(card => 
    card.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Notes</h1>
        <button
          onClick={() => setIsAddingCard(true)}
          className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          <Plus className="w-4 h-4" />
          New Card
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search cards..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {isAddingCard && (
        <form onSubmit={handleAddCard} className="bg-white p-4 rounded-lg shadow-md">
          <input
            type="text"
            value={newCardName}
            onChange={(e) => setNewCardName(e.target.value)}
            placeholder="Enter card name"
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoFocus
          />
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddingCard(false)}
              className="px-3 py-1 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Create
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCards.map((card) => (
          <FlashCard key={card.id} card={card} onClick={() => onSelectCard(card)} />
        ))}
      </div>
    </div>
  );
}