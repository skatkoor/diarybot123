import { useState } from 'react';
import { ChevronLeft, Plus, Search, Edit2, Trash2 } from 'lucide-react';
import FlashCard from './FlashCard';
import NoteCard from './NoteCard';
import type { FlashCard as FlashCardType, Note } from '../../types';

interface Props {
  card: FlashCardType;
  onBack: () => void;
  onAddNote: (cardId: string, note: Omit<Note, 'id'>) => Promise<void>;
  onAddSubCard: (parentId: string, card: Omit<FlashCardType, 'id'>) => Promise<void>;
  onSelectCard: (card: FlashCardType) => void;
  onEditCard: (cardId: string, updates: Partial<FlashCardType>) => Promise<void>;
  onDeleteCard: (cardId: string) => Promise<void>;
  onEditNote: (cardId: string, noteId: string, updates: Partial<Note>) => Promise<void>;
  onDeleteNote: (cardId: string, noteId: string) => Promise<void>;
}

export default function FlashCardView({
  card,
  onBack,
  onAddNote,
  onAddSubCard,
  onSelectCard,
  onEditCard,
  onDeleteCard,
  onEditNote,
  onDeleteNote
}: Props) {
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [newCardName, setNewCardName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingName, setEditingName] = useState(card.name);
  const [error, setError] = useState<string | null>(null);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.title.trim() || !newNote.content.trim()) return;

    try {
      setError(null);
      await onAddNote(card.id, {
        title: newNote.title,
        content: newNote.content,
        tags: [],
        lastModified: new Date().toISOString(),
        createdAt: new Date().toISOString()
      });
      
      setNewNote({ title: '', content: '' });
      setIsAddingNote(false);
    } catch (err) {
      console.error('Failed to add note:', err);
      setError('Failed to add note. Please try again.');
    }
  };

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardName.trim()) return;

    try {
      setError(null);
      await onAddSubCard(card.id, {
        name: newCardName,
        type: 'folder',
        notes: [],
        children: [],
        lastModified: new Date().toISOString(),
        createdAt: new Date().toISOString()
      });
      
      setNewCardName('');
      setIsAddingCard(false);
    } catch (err) {
      console.error('Failed to add card:', err);
      setError('Failed to add card. Please try again.');
    }
  };

  const handleEditCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingName.trim()) return;

    try {
      setError(null);
      await onEditCard(card.id, { name: editingName });
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to edit card:', err);
      setError('Failed to edit card. Please try again.');
    }
  };

  const handleEditNote = async (noteId: string, updates: Partial<Note>) => {
    try {
      await onEditNote(card.id, noteId, updates);
    } catch (err) {
      console.error('Failed to edit note:', err);
      throw err;
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await onDeleteNote(card.id, noteId);
    } catch (err) {
      console.error('Failed to delete note:', err);
      throw err;
    }
  };

  const filteredNotes = card.notes?.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const filteredCards = card.children?.filter(child =>
    child.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          {isEditing ? (
            <form onSubmit={handleEditCard} className="flex items-center gap-2">
              <input
                type="text"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                className="px-3 py-1 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
              <button
                type="submit"
                disabled={!editingName.trim()}
                className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setEditingName(card.name);
                }}
                className="px-3 py-1 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
            </form>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-800">{card.name}</h1>
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <Edit2 className="w-4 h-4 text-gray-500" />
              </button>
              <button
                onClick={() => onDeleteCard(card.id)}
                className="p-1 hover:bg-gray-100 rounded-full text-red-500"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

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
              onClick={() => {
                setIsAddingNote(false);
                setNewNote({ title: '', content: '' });
              }}
              className="px-3 py-1 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!newNote.title.trim() || !newNote.content.trim()}
              className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
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
              onClick={() => {
                setIsAddingCard(false);
                setNewCardName('');
              }}
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

      <div className="space-y-8">
        {filteredCards.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Cards</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCards.map((subCard) => (
                <FlashCard
                  key={subCard.id}
                  card={subCard}
                  onClick={() => onSelectCard(subCard)}
                  onEdit={onEditCard}
                  onDelete={onDeleteCard}
                />
              ))}
            </div>
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
                  onEdit={(updates) => handleEditNote(note.id, updates)}
                  onDelete={() => handleDeleteNote(note.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}