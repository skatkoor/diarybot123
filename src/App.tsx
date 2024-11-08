import { useState } from 'react';
import { AuthWrapper } from './components/auth/AuthWrapper';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DiaryView from './components/diary/DiaryView';
import FinanceView from './components/finance/FinanceView';
import NotesView from './components/notes/NotesView';
import FlashCardView from './components/notes/FlashCardView';
import TodoView from './components/todo/TodoView';
import type { DiaryEntry, FinanceEntry, Account, FlashCard, Note, DeletedCard } from './types';

export default function App() {
  const [activeSection, setActiveSection] = useState('diary');
  const [activeCard, setActiveCard] = useState<FlashCard | null>(null);
  const [cardPath, setCardPath] = useState<FlashCard[]>([]);
  
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [financeEntries, setFinanceEntries] = useState<FinanceEntry[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [flashcards, setFlashcards] = useState<FlashCard[]>([]);
  const [deletedCards, setDeletedCards] = useState<DeletedCard[]>([]);

  // Helper function to find and update a card at any nesting level
  const findAndUpdateCard = (cards: FlashCard[], cardId: string, updateFn: (card: FlashCard) => FlashCard): FlashCard[] => {
    return cards.map(card => {
      if (card.id === cardId) {
        return updateFn(card);
      }
      if (card.children?.length > 0) {
        return {
          ...card,
          children: findAndUpdateCard(card.children, cardId, updateFn),
        };
      }
      return card;
    });
  };

  // Helper function to find a card by ID at any nesting level
  const findCardById = (cards: FlashCard[], cardId: string): FlashCard | null => {
    for (const card of cards) {
      if (card.id === cardId) return card;
      if (card.children?.length > 0) {
        const found = findCardById(card.children, cardId);
        if (found) return found;
      }
    }
    return null;
  };

  const handleNewEntry = (content: string, mood: 'happy' | 'neutral' | 'sad', date: string) => {
    const newEntry: DiaryEntry = {
      id: Date.now().toString(),
      content,
      mood,
      date,
      tags: [],
      type: 'diary',
      lastModified: new Date().toISOString(),
    };
    setEntries(prev => [newEntry, ...prev]);
  };

  const handleAddFlashcard = (card: Omit<FlashCard, 'id'>) => {
    const newCard: FlashCard = {
      ...card,
      id: Date.now().toString(),
    };
    setFlashcards(prev => [...prev, newCard]);
  };

  const handleAddSubCard = (parentId: string, card: Omit<FlashCard, 'id'>) => {
    const newCard: FlashCard = {
      ...card,
      id: Date.now().toString(),
    };

    setFlashcards(prevCards => {
      const updatedCards = findAndUpdateCard(prevCards, parentId, parent => ({
        ...parent,
        children: [...(parent.children || []), newCard],
        lastModified: new Date().toISOString(),
      }));

      // Update active card if needed
      if (activeCard?.id === parentId) {
        const updatedActiveCard = findCardById(updatedCards, parentId);
        if (updatedActiveCard) {
          setActiveCard(updatedActiveCard);
        }
      }

      return updatedCards;
    });
  };

  const handleEditCard = (cardId: string, updates: Partial<FlashCard>) => {
    setFlashcards(prevCards => {
      const updatedCards = findAndUpdateCard(prevCards, cardId, card => ({
        ...card,
        ...updates,
        lastModified: new Date().toISOString(),
      }));

      // Update active card if needed
      if (activeCard?.id === cardId) {
        const updatedActiveCard = findCardById(updatedCards, cardId);
        if (updatedActiveCard) {
          setActiveCard(updatedActiveCard);
        }
      }

      // Update card path if needed
      if (cardPath.some(pathCard => pathCard.id === cardId)) {
        setCardPath(prevPath => 
          prevPath.map(pathCard => 
            pathCard.id === cardId 
              ? { ...pathCard, ...updates, lastModified: new Date().toISOString() }
              : pathCard
          )
        );
      }

      return updatedCards;
    });
  };

  const handleDeleteCard = (cardId: string) => {
    setFlashcards(prevCards => {
      const deleteFromCards = (cards: FlashCard[]): FlashCard[] => {
        const cardToDelete = findCardById(cards, cardId);
        if (cardToDelete) {
          setDeletedCards(prev => [
            { ...cardToDelete, deletedAt: new Date().toISOString() },
            ...prev
          ]);
        }

        return cards.filter(card => {
          if (card.id === cardId) {
            return false;
          }
          if (card.children?.length > 0) {
            card.children = deleteFromCards(card.children);
          }
          return true;
        });
      };

      return deleteFromCards(prevCards);
    });

    if (activeCard?.id === cardId) {
      setActiveCard(null);
      setCardPath([]);
    }
  };

  const handleEditNote = (cardId: string, noteId: string, updates: Partial<Note>) => {
    setFlashcards(prevCards => {
      const updatedCards = findAndUpdateCard(prevCards, cardId, card => ({
        ...card,
        notes: card.notes?.map(note => 
          note.id === noteId 
            ? { ...note, ...updates, lastModified: new Date().toISOString() }
            : note
        ) || [],
        lastModified: new Date().toISOString(),
      }));

      // Update active card if needed
      if (activeCard?.id === cardId) {
        const updatedActiveCard = findCardById(updatedCards, cardId);
        if (updatedActiveCard) {
          setActiveCard(updatedActiveCard);
        }
      }

      return updatedCards;
    });
  };

  const handleDeleteNote = (cardId: string, noteId: string) => {
    setFlashcards(prevCards => {
      const updatedCards = findAndUpdateCard(prevCards, cardId, card => ({
        ...card,
        notes: card.notes?.filter(note => note.id !== noteId) || [],
        lastModified: new Date().toISOString(),
      }));

      // Update active card if needed
      if (activeCard?.id === cardId) {
        const updatedActiveCard = findCardById(updatedCards, cardId);
        if (updatedActiveCard) {
          setActiveCard(updatedActiveCard);
        }
      }

      return updatedCards;
    });
  };

  const handleAddNote = (cardId: string, note: Omit<Note, 'id'>) => {
    const newNote: Note = {
      ...note,
      id: Date.now().toString(),
    };

    setFlashcards(prevCards => {
      const updatedCards = findAndUpdateCard(prevCards, cardId, card => ({
        ...card,
        notes: [...(card.notes || []), newNote],
        lastModified: new Date().toISOString(),
      }));

      // Update active card if needed
      if (activeCard?.id === cardId) {
        const updatedActiveCard = findCardById(updatedCards, cardId);
        if (updatedActiveCard) {
          setActiveCard(updatedActiveCard);
        }
      }

      return updatedCards;
    });
  };

  const handleSelectCard = (card: FlashCard, path: FlashCard[]) => {
    setActiveCard(card);
    setCardPath(path);
  };

  const handleBackToCards = () => {
    setActiveCard(null);
    setCardPath([]);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'diary':
        return (
          <DiaryView
            entries={entries}
            onNewEntry={handleNewEntry}
            onDeleteEntry={() => {}}
            onEditEntry={() => {}}
          />
        );
      case 'notes':
        return activeCard ? (
          <FlashCardView
            card={activeCard}
            cardPath={cardPath}
            onBack={handleBackToCards}
            onAddNote={handleAddNote}
            onAddSubCard={handleAddSubCard}
            onSelectCard={handleSelectCard}
            onEditCard={handleEditCard}
            onDeleteCard={handleDeleteCard}
            onEditNote={handleEditNote}
            onDeleteNote={handleDeleteNote}
          />
        ) : (
          <NotesView
            cards={flashcards}
            deletedCards={deletedCards}
            onAddCard={handleAddFlashcard}
            onSelectCard={(card) => handleSelectCard(card, [])}
            onEditCard={handleEditCard}
            onDeleteCard={handleDeleteCard}
            onRestoreCard={() => {}}
          />
        );
      case 'finance':
        return (
          <FinanceView
            entries={financeEntries}
            accounts={accounts}
            onAddTransaction={() => {}}
            onAddAccount={() => {}}
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
      <div className="flex h-screen bg-gray-50">
        <Sidebar 
          activeSection={activeSection} 
          onSectionChange={setActiveSection}
          onResetView={handleBackToCards}
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