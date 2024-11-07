import { useState } from 'react';
import { Plus, Search, Trash2, RefreshCw } from 'lucide-react';
import FlashCard from './FlashCard';
import type { FlashCard as FlashCardType, DeletedCard } from '../../types';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

interface Props {
  cards?: FlashCardType[];
  deletedCards?: DeletedCard[];
  onAddCard: (card: Omit<FlashCardType, 'id'>) => void;
  onSelectCard: (card: FlashCardType) => void;
  onEditCard: (cardId: string, updates: Partial<FlashCardType>) => void;
  onDeleteCard: (cardId: string) => void;
  onRestoreCard: (cardId: string) => void;
}

export default function NotesView({
  cards = [],
  deletedCards = [],
  onAddCard,
  onSelectCard,
  onEditCard,
  onDeleteCard,
  onRestoreCard
}: Props) {
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardName, setNewCardName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeletedCards, setShowDeletedCards] = useState(false);

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
    card?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDeletedCards = deletedCards.filter(card =>
    card?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(filteredCards);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    items.forEach((card, index) => {
      onEditCard(card.id, { order: index });
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Notes</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDeletedCards(!showDeletedCards)}
            className={`flex items-center gap-2 px-3 py-2 rounded-md ${
              showDeletedCards ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            Deleted Cards
          </button>
          <button
            onClick={() => setIsAddingCard(true)}
            className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            <Plus className="w-4 h-4" />
            New Card
          </button>
        </div>
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
              disabled={!newCardName.trim()}
              className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              Create
            </button>
          </div>
        </form>
      )}

      {showDeletedCards ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDeletedCards.map((card) => (
            <div key={card.id} className="relative group">
              <FlashCard 
                card={card} 
                onClick={() => {}} 
                onEdit={() => {}}
                onDelete={() => {}}
              />
              <button
                onClick={() => onRestoreCard(card.id)}
                className="absolute top-2 right-2 p-2 bg-green-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                title="Restore card"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <div className="absolute bottom-2 right-2 text-xs text-gray-500">
                Deleted: {new Date(card.deletedAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="cards">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filteredCards.map((card, index) => (
                  <Draggable key={card.id} draggableId={card.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <FlashCard
                          card={card}
                          onClick={() => onSelectCard(card)}
                          onEdit={(updates) => onEditCard(card.id, updates)}
                          onDelete={() => onDeleteCard(card.id)}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  );
}