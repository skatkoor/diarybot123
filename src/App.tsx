import { useState, useEffect } from 'react';
import { AuthWrapper } from './components/auth/AuthWrapper';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DiaryView from './components/diary/DiaryView';
import NotesView from './components/notes/NotesView';
import FlashCardView from './components/notes/FlashCardView';
import TodoView from './components/todo/TodoView';
import type { DiaryEntry, FlashCard, Note } from './types';

const STORAGE_KEY = 'diarybot-entries';
const NOTES_STORAGE_KEY = 'diarybot-notes';

export default function App() {
  const [activeSection, setActiveSection] = useState('diary');
  const [activeCard, setActiveCard] = useState<FlashCard | null>(null);
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [cards, setCards] = useState<FlashCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load diary entries
  useEffect(() => {
    const loadEntries = () => {
      try {
        setIsLoading(true);
        setError(null);
        const savedEntries = localStorage.getItem(STORAGE_KEY);
        if (savedEntries) {
          setEntries(JSON.parse(savedEntries));
        }
      } catch (error) {
        console.error('Failed to load diary entries:', error);
        setError('Failed to load entries. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadEntries();
  }, []);

  // Load notes and cards
  useEffect(() => {
    const loadNotes = () => {
      const savedCards = localStorage.getItem(NOTES_STORAGE_KEY);
      if (savedCards) {
        setCards(JSON.parse(savedCards));
      }
    };

    loadNotes();
  }, []);

  // Update active card when cards change
  useEffect(() => {
    if (activeCard) {
      const findCard = (cards: FlashCard[], id: string): FlashCard | null => {
        for (const card of cards) {
          if (card.id === id) return card;
          const found = findCard(card.children, id);
          if (found) return found;
        }
        return null;
      };

      const updatedCard = findCard(cards, activeCard.id);
      if (updatedCard) {
        setActiveCard(updatedCard);
      }
    }
  }, [cards, activeCard?.id]);

  const handleNewEntry = async (content: string, mood: 'happy' | 'neutral' | 'sad', date: string) => {
    try {
      setError(null);
      const newEntry: DiaryEntry = {
        id: crypto.randomUUID(),
        content,
        mood,
        date,
        tags: [],
        lastModified: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };

      const updatedEntries = [newEntry, ...entries];
      setEntries(updatedEntries);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries));
    } catch (error) {
      console.error('Failed to create entry:', error);
      setError('Failed to save entry. Please try again.');
      throw error;
    }
  };

  const handleEditEntry = async (id: string, content: string) => {
    try {
      setError(null);
      const updatedEntries = entries.map(entry =>
        entry.id === id
          ? { ...entry, content, lastModified: new Date().toISOString() }
          : entry
      );
      setEntries(updatedEntries);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries));
    } catch (error) {
      console.error('Failed to update entry:', error);
      setError('Failed to update entry. Please try again.');
      throw error;
    }
  };

  const handleDeleteEntry = async (id: string) => {
    try {
      setError(null);
      const updatedEntries = entries.filter(entry => entry.id !== id);
      setEntries(updatedEntries);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries));
    } catch (error) {
      console.error('Failed to delete entry:', error);
      setError('Failed to delete entry. Please try again.');
      throw error;
    }
  };

  // Notes functionality
  const handleAddCard = async (newCard: Omit<FlashCard, 'id'>) => {
    try {
      const card: FlashCard = {
        ...newCard,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString()
      };
      const updatedCards = [...cards, card];
      setCards(updatedCards);
      localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(updatedCards));
    } catch (error) {
      console.error('Failed to add card:', error);
      throw error;
    }
  };

  const handleAddSubCard = async (parentId: string, newCard: Omit<FlashCard, 'id'>) => {
    try {
      const card: FlashCard = {
        ...newCard,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString()
      };

      const updateCardsRecursively = (cards: FlashCard[]): FlashCard[] => {
        return cards.map(existingCard => {
          if (existingCard.id === parentId) {
            return {
              ...existingCard,
              children: [...existingCard.children, card],
              lastModified: new Date().toISOString()
            };
          }
          if (existingCard.children.length > 0) {
            return {
              ...existingCard,
              children: updateCardsRecursively(existingCard.children)
            };
          }
          return existingCard;
        });
      };

      const updatedCards = updateCardsRecursively(cards);
      setCards(updatedCards);
      localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(updatedCards));
    } catch (error) {
      console.error('Failed to add sub-card:', error);
      throw error;
    }
  };

  const handleAddNote = async (cardId: string, newNote: Omit<Note, 'id'>) => {
    try {
      const note: Note = {
        ...newNote,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString()
      };

      const updateCardsRecursively = (cards: FlashCard[]): FlashCard[] => {
        return cards.map(card => {
          if (card.id === cardId) {
            return {
              ...card,
              notes: [...card.notes, note],
              lastModified: new Date().toISOString()
            };
          }
          if (card.children.length > 0) {
            return {
              ...card,
              children: updateCardsRecursively(card.children)
            };
          }
          return card;
        });
      };

      const updatedCards = updateCardsRecursively(cards);
      setCards(updatedCards);
      localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(updatedCards));
    } catch (error) {
      console.error('Failed to add note:', error);
      throw error;
    }
  };

  const handleEditCard = async (cardId: string, updates: Partial<FlashCard>) => {
    try {
      const updateCardsRecursively = (cards: FlashCard[]): FlashCard[] => {
        return cards.map(card => {
          if (card.id === cardId) {
            return {
              ...card,
              ...updates,
              lastModified: new Date().toISOString()
            };
          }
          if (card.children.length > 0) {
            const updatedChildren = updateCardsRecursively(card.children);
            return updatedChildren.some(child => child !== card.children.find(c => c.id === child.id))
              ? { ...card, children: updatedChildren }
              : card;
          }
          return card;
        });
      };

      const updatedCards = updateCardsRecursively(cards);
      setCards(updatedCards);
      localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(updatedCards));
    } catch (error) {
      console.error('Failed to edit card:', error);
      throw error;
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    try {
      const deleteCardRecursively = (cards: FlashCard[]): FlashCard[] => {
        return cards.filter(card => {
          if (card.id === cardId) {
            return false;
          }
          if (card.children.length > 0) {
            const updatedChildren = deleteCardRecursively(card.children);
            return {
              ...card,
              children: updatedChildren,
              lastModified: updatedChildren.length !== card.children.length 
                ? new Date().toISOString() 
                : card.lastModified
            };
          }
          return true;
        });
      };

      const updatedCards = deleteCardRecursively(cards);
      setCards(updatedCards);
      localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(updatedCards));

      if (activeCard?.id === cardId) {
        setActiveCard(null);
      }
    } catch (error) {
      console.error('Failed to delete card:', error);
      throw error;
    }
  };

  const handleEditNote = async (cardId: string, noteId: string, updates: Partial<Note>) => {
    try {
      const updateCardsRecursively = (cards: FlashCard[]): FlashCard[] => {
        return cards.map(card => {
          if (card.id === cardId) {
            const updatedNotes = card.notes.map(note =>
              note.id === noteId
                ? { ...note, ...updates, lastModified: new Date().toISOString() }
                : note
            );
            return {
              ...card,
              notes: updatedNotes,
              lastModified: new Date().toISOString()
            };
          }
          if (card.children.length > 0) {
            const updatedChildren = updateCardsRecursively(card.children);
            return updatedChildren.some(child => child !== card.children.find(c => c.id === child.id))
              ? { ...card, children: updatedChildren }
              : card;
          }
          return card;
        });
      };

      const updatedCards = updateCardsRecursively(cards);
      setCards(updatedCards);
      localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(updatedCards));
    } catch (error) {
      console.error('Failed to edit note:', error);
      throw error;
    }
  };

  const handleDeleteNote = async (cardId: string, noteId: string) => {
    try {
      const updateCardsRecursively = (cards: FlashCard[]): FlashCard[] => {
        return cards.map(card => {
          if (card.id === cardId) {
            return {
              ...card,
              notes: card.notes.filter(note => note.id !== noteId),
              lastModified: new Date().toISOString()
            };
          }
          if (card.children.length > 0) {
            const updatedChildren = updateCardsRecursively(card.children);
            return updatedChildren.some(child => child !== card.children.find(c => c.id === child.id))
              ? { ...card, children: updatedChildren }
              : card;
          }
          return card;
        });
      };

      const updatedCards = updateCardsRecursively(cards);
      setCards(updatedCards);
      localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(updatedCards));
    } catch (error) {
      console.error('Failed to delete note:', error);
      throw error;
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      );
    }

    switch (activeSection) {
      case 'diary':
        return (
          <DiaryView
            entries={entries}
            onNewEntry={handleNewEntry}
            onDeleteEntry={handleDeleteEntry}
            onEditEntry={handleEditEntry}
          />
        );
      case 'notes':
        return activeCard ? (
          <FlashCardView
            card={activeCard}
            onBack={() => setActiveCard(null)}
            onAddNote={handleAddNote}
            onAddSubCard={handleAddSubCard}
            onSelectCard={setActiveCard}
            onEditCard={handleEditCard}
            onDeleteCard={handleDeleteCard}
            onEditNote={handleEditNote}
            onDeleteNote={handleDeleteNote}
          />
        ) : (
          <NotesView
            cards={cards}
            onAddCard={handleAddCard}
            onSelectCard={setActiveCard}
            onEditCard={handleEditCard}
            onDeleteCard={handleDeleteCard}
          />
        );
      case 'todo':
        return <TodoView />;
      default:
        return null;
    }
  };

  return (
    <AuthWrapper>
      <div className="flex h-screen bg-gray-50" data-testid="app-container">
        <Sidebar 
          activeSection={activeSection} 
          onSectionChange={setActiveSection}
          onResetView={() => setActiveCard(null)}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-7xl mx-auto px-4 py-8">
              {renderContent()}
            </div>
          </main>
        </div>
      </div>
    </AuthWrapper>
  );
}