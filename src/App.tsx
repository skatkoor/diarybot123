import { useState } from 'react';
import { AuthWrapper } from './components/auth/AuthWrapper';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DiaryView from './components/diary/DiaryView';
import FinanceView from './components/finance/FinanceView';
import NotesView from './components/notes/NotesView';
import FlashCardView from './components/notes/FlashCardView';
import AIAssistant from './components/ai/AIAssistant';
import type { DiaryEntry, FinanceEntry, Account, FlashCard, Note } from './types';

const STORAGE_KEY = 'diarybot-entries';
const FINANCE_STORAGE_KEY = 'diarybot-finance';
const ACCOUNTS_STORAGE_KEY = 'diarybot-accounts';
const FLASHCARDS_STORAGE_KEY = 'diarybot-flashcards';

function App() {
  const [activeSection, setActiveSection] = useState('diary');
  const [activeCard, setActiveCard] = useState<FlashCard | null>(null);
  
  const [entries, setEntries] = useState<DiaryEntry[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [financeEntries, setFinanceEntries] = useState<FinanceEntry[]>(() => {
    const saved = localStorage.getItem(FINANCE_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [accounts, setAccounts] = useState<Account[]>(() => {
    const saved = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [flashcards, setFlashcards] = useState<FlashCard[]>(() => {
    const saved = localStorage.getItem(FLASHCARDS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const handleNewEntry = async (content: string, mood: 'happy' | 'neutral' | 'sad') => {
    try {
      const response = await fetch('/api/diary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'test', // Replace with actual user ID
          content,
          mood,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create entry');
      }

      const newEntry = await response.json();
      setEntries([newEntry, ...entries]);
      localStorage.setItem(STORAGE_KEY, JSON.stringify([newEntry, ...entries]));
    } catch (error) {
      console.error('Error creating entry:', error);
      // Handle error (show notification, etc.)
    }
  };

  const handleAddFlashcard = (card: Omit<FlashCard, 'id'>) => {
    const newCard: FlashCard = {
      ...card,
      id: Date.now().toString(),
    };
    const updatedCards = [...flashcards, newCard];
    setFlashcards(updatedCards);
    localStorage.setItem(FLASHCARDS_STORAGE_KEY, JSON.stringify(updatedCards));
  };

  const handleUpdateNote = async (noteId: string, updates: Partial<Note>) => {
    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'test', // Replace with actual user ID
          ...updates,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update note');
      }

      const updatedNote = await response.json();
      const updatedCards = flashcards.map(card => ({
        ...card,
        notes: card.notes.map(note => 
          note.id === noteId ? { ...note, ...updatedNote } : note
        )
      }));

      setFlashcards(updatedCards);
      localStorage.setItem(FLASHCARDS_STORAGE_KEY, JSON.stringify(updatedCards));
    } catch (error) {
      console.error('Error updating note:', error);
      // Handle error (show notification, etc.)
    }
  };

  const handleAddNote = async (cardId: string, note: Omit<Note, 'id'>) => {
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'test', // Replace with actual user ID
          cardId,
          ...note,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create note');
      }

      const newNote = await response.json();
      const updatedCards = flashcards.map(card => {
        if (card.id === cardId) {
          return { ...card, notes: [...card.notes, newNote] };
        }
        return card;
      });

      setFlashcards(updatedCards);
      localStorage.setItem(FLASHCARDS_STORAGE_KEY, JSON.stringify(updatedCards));
    } catch (error) {
      console.error('Error creating note:', error);
      // Handle error (show notification, etc.)
    }
  };

  const handleAddSubCard = (parentId: string, card: Omit<FlashCard, 'id'>) => {
    const newCard = { ...card, id: Date.now().toString() };
    const updatedCards = flashcards.map(existingCard => {
      if (existingCard.id === parentId) {
        return { ...existingCard, children: [...existingCard.children, newCard] };
      }
      return existingCard;
    });
    setFlashcards(updatedCards);
    localStorage.setItem(FLASHCARDS_STORAGE_KEY, JSON.stringify(updatedCards));
  };

  const handleAddTransaction = async (transaction: Omit<FinanceEntry, 'id'>) => {
    try {
      const response = await fetch('/api/finances', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'test', // Replace with actual user ID
          ...transaction,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create transaction');
      }

      const newTransaction = await response.json();
      setFinanceEntries([newTransaction, ...financeEntries]);
      localStorage.setItem(FINANCE_STORAGE_KEY, JSON.stringify([newTransaction, ...financeEntries]));
    } catch (error) {
      console.error('Error creating transaction:', error);
      // Handle error (show notification, etc.)
    }
  };

  const handleAddAccount = (account: Omit<Account, 'id'>) => {
    const newAccount: Account = {
      ...account,
      id: Date.now().toString(),
    };
    setAccounts([...accounts, newAccount]);
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify([...accounts, newAccount]));
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
            onBack={() => setActiveCard(null)}
            onAddNote={handleAddNote}
            onAddSubCard={handleAddSubCard}
            onSelectCard={setActiveCard}
          />
        ) : (
          <NotesView
            cards={flashcards}
            onAddCard={handleAddFlashcard}
            onSelectCard={setActiveCard}
            onUpdateNote={handleUpdateNote}
          />
        );
      case 'finance':
        return (
          <FinanceView
            entries={financeEntries}
            accounts={accounts}
            onAddTransaction={handleAddTransaction}
            onAddAccount={handleAddAccount}
          />
        );
      case 'ai':
        return <AIAssistant />;
      default:
        return null;
    }
  };

  return (
    <AuthWrapper>
      <div className="flex h-screen bg-gray-50">
        <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
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

export default App;