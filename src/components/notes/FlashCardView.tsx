import { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { ChevronLeft, Plus, Search } from 'lucide-react';
import FlashCard from './FlashCard';
import NoteCard from './NoteCard';
import type { FlashCard as FlashCardType, Note } from '../../types';

interface Props {
  card: FlashCardType;
  onBack: () => void;
  onAddNote: (cardId: string, note: Omit<Note, 'id'>) => void;
  onAddSubCard: (parentId: string, card: Omit<FlashCardType, 'id'>) => void;
  onSelectCard: (card: FlashCardType) => void;
  onEditCard: (cardId: string, updates: Partial<FlashCardType>) => void;
  onDeleteCard: (cardId: string) => void;
  onReorderCards: (parentId: string | null, cards: FlashCardType[]) => void;
  onEditNote: (cardId: string, noteId: string, updates: Partial<Note>) => void;
  onDeleteNote: (cardId: string, noteId: string) => void;
}

export default function FlashCardView({
  card,
  onBack,
  onAddNote,
  onAddSubCard,
  onSelectCard,
  onEditCard,
  onDeleteCard,
  onReorderCards,
  onEditNote,
  onDeleteNote,
}: Props) {
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [newCardName, setNewCardName] = useState('');

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.title.trim() || !newNote.content.trim()) return;
    
    await onAddNote(card.id, {
      title: newNote.title,
      content: newNote.content,
      tags: [],
      lastModified: new Date().toISOString(),
    });
    
    setNewNote({ title: '', content: '' });
    setIsAddingNote(false);
  };

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardName.trim()) return;
    
    await onAddSubCard(card.id, {
      name: newCardName,
      type: 'folder',
      notes: [],
      children: [],
      lastModified: new Date().toISOString(),
    });
    
    setNewCardName('');
    setIsAddingCard(false);
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(card.children);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onReorderCards(card.id, items);
  };

  const filteredNotes = card.notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCards = card.children.filter(child =>
    child.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditSubCard = (cardId: string, updates: Partial<FlashCardType>) => {
    const updatedChildren = card.children.map(child => 
      child.id === cardId ? { ...child, ...updates } : child
    );
    onEditCard(card.id, { children: updatedChildren });
  };

  const handleDeleteSubCard = (cardId: string) => {
    const updatedChildren = card.children.filter(child => child.id !== cardId);
    onEditCard(card.id, { children: updatedChildren });
    onDeleteCard(cardId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">{card.name}</h1>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsAddingNote(true)}
          className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          <Plus className="w-4 h-4" />
          Add Note
        </button>
        <button
          onClick={() => setIsAddingCard(true)}
          className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
        >
          <Plus className="w-4 h-4" />
          Add Card
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search notes and cards..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {isAddingNote && (
        <form onSubmit={handleAddNote} className="bg-white p-6 rounded-lg shadow-md">
          <input
            type="text"
            value={newNote.title}
            onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
            placeholder="Note title"
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
            autoFocus
          />
          <textarea
            value={newNote.content}
            onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
            placeholder="Note content"
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
          />
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddingNote(false)}
              className="px-3 py-1 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!newNote.title.trim() || !newNote.content.trim()}
              className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Note
            </button>
          </div>
        </form>
      )}

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
              className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create
            </button>
          </div>
        </form>
      )}

      <div className="space-y-8">
        {filteredCards.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Cards</h2>
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="cards">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                  >
                    {filteredCards.map((subCard, index) => (
                      <Draggable key={subCard.id} draggableId={subCard.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <FlashCard
                              card={subCard}
                              onClick={() => onSelectCard(subCard)}
                              onEdit={(updates) => handleEditSubCard(subCard.id, updates)}
                              onDelete={() => handleDeleteSubCard(subCard.id)}
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
          </div>
        )}

        {filteredNotes.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Notes</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onEdit={(updates) => onEditNote(card.id, note.id, updates)}
                  onDelete={() => onDeleteNote(card.id, note.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}