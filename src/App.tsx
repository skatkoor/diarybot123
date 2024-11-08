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

const STORAGE_KEY = 'diarybot-entries';
const FINANCE_STORAGE_KEY = 'diarybot-finance';
const ACCOUNTS_STORAGE_KEY = 'diarybot-accounts';
const FLASHCARDS_STORAGE_KEY = 'diarybot-flashcards';
const DELETED_CARDS_STORAGE_KEY = 'diarybot-deleted-cards';

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

  const [deletedCards, setDeletedCards] = useState<DeletedCard[]>(() => {
    const saved = localStorage.getItem(DELETED_CARDS_STORAGE_KEY);
    if (saved) {
      const cards = JSON.parse(saved);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return cards.filter((card: DeletedCard) => 
        new Date(card.deletedAt) > sevenDaysAgo
      );
    }
    return [];
  });

  const handleNewEntry = (content: string, mood: 'happy' | 'neutral' | 'sad', date: string) => {
    const entryDate = new Date(date);
    const newEntry: DiaryEntry = {
      id: Date.now().toString(),
      content,
      mood,
      date: entryDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      tags: [],
      type: 'diary',
      lastModified: new Date().toISOString(),
    };
    setEntries([newEntry, ...entries]);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([newEntry, ...entries]));
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

  const handleEditCard = (cardId: string, updates: Partial<FlashCard>) => {
    const updateCardInList = (cards: FlashCard[]): FlashCard[] => {
      return cards.map(card => {
        if (card.id === cardId) {
          return { ...card, ...updates, lastModified: new Date().toISOString() };
        }
        if (card.children.length > 0) {
          return { ...card, children: updateCardInList(card.children) };
        }
        return card;
      });
    };

    const updatedCards = updateCardInList(flashcards);
    setFlashcards(updatedCards);
    localStorage.setItem(FLASHCARDS_STORAGE_KEY, JSON.stringify(updatedCards));
  };

  const handleDeleteCard = (cardId: string) => {
    const findAndDeleteCard = (cards: FlashCard[]): [FlashCard[], FlashCard | null] => {
      let deletedCard: FlashCard | null = null;
      
      const filteredCards = cards.filter(card => {
        if (card.id === cardId) {
          deletedCard = card;
          return false;
        }
        if (card.children && card.children.length > 0) {
          const [updatedChildren, deletedChild] = findAndDeleteCard(card.children);
          if (deletedChild) {
            deletedCard = deletedChild;
            card.children = updatedChildren;
          }
        }
        return true;
      });

      return [filteredCards, deletedCard];
    };

    const [updatedCards, deletedCard] = findAndDeleteCard(flashcards);
    
    if (deletedCard) {
      const newDeletedCard: DeletedCard = {
        ...deletedCard,
        deletedAt: new Date().toISOString(),
      };
      
      const updatedDeletedCards = [newDeletedCard, ...deletedCards];
      setDeletedCards(updatedDeletedCards);
      localStorage.setItem(DELETED_CARDS_STORAGE_KEY, JSON.stringify(updatedDeletedCards));
    }

    setFlashcards(updatedCards);
    localStorage.setItem(FLASHCARDS_STORAGE_KEY, JSON.stringify(updatedCards));
    
    if (activeCard?.id === cardId) {
      setActiveCard(null);
    }
  };

  const handleRestoreCard = (cardId: string) => {
    const cardToRestore = deletedCards.find(card => card.id === cardId);
    if (!cardToRestore) return;

    const updatedDeletedCards = deletedCards.filter(card => card.id !== cardId);
    setDeletedCards(updatedDeletedCards);
    localStorage.setItem(DELETED_CARDS_STORAGE_KEY, JSON.stringify(updatedDeletedCards));

    const restoredCard: FlashCard = {
      ...cardToRestore,
      lastModified: new Date().toISOString(),
    };
    
    const updatedCards = [...flashcards, restoredCard];
    setFlashcards(updatedCards);
    localStorage.setItem(FLASHCARDS_STORAGE_KEY, JSON.stringify(updatedCards));
  };

  const handleAddNote = (cardId: string, note: Omit<Note, 'id'>) => {
    const newNote: Note = {
      ...note,
      id: Date.now().toString(),
      lastModified: new Date().toISOString(),
    };

    const updateCardInList = (cards: FlashCard[]): FlashCard[] => {
      return cards.map(card => {
        if (card.id === cardId) {
          return { ...card, notes: [...card.notes, newNote] };
        }
        if (card.children.length > 0) {
          return { ...card, children: updateCardInList(card.children) };
        }
        return card;
      });
    };

    const updatedCards = updateCardInList(flashcards);
    setFlashcards(updatedCards);
    localStorage.setItem(FLASHCARDS_STORAGE_KEY, JSON.stringify(updatedCards));
  };

  const handleAddSubCard = (parentId: string, card: Omit<FlashCard, 'id'>) => {
    const newCard: FlashCard = {
      ...card,
      id: Date.now().toString(),
    };

    const updateCardInList = (cards: FlashCard[]): FlashCard[] => {
      return cards.map(existingCard => {
        if (existingCard.id === parentId) {
          return { ...existingCard, children: [...existingCard.children, newCard] };
        }
        if (existingCard.children.length > 0) {
          return { ...existingCard, children: updateCardInList(existingCard.children) };
        }
        return existingCard;
      });
    };

    const updatedCards = updateCardInList(flashcards);
    setFlashcards(updatedCards);
    localStorage.setItem(FLASHCARDS_STORAGE_KEY, JSON.stringify(updatedCards));
  };

  const handleAddTransaction = (transaction: Omit<FinanceEntry, 'id'>) => {
    const newTransaction: FinanceEntry = {
      ...transaction,
      id: Date.now().toString(),
    };
    setFinanceEntries([newTransaction, ...financeEntries]);
    localStorage.setItem(FINANCE_STORAGE_KEY, JSON.stringify([newTransaction, ...financeEntries]));
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
            onEditCard={handleEditCard}
            onDeleteCard={handleDeleteCard}
          />
        ) : (
          <NotesView
            cards={flashcards}
            deletedCards={deletedCards}
            onAddCard={handleAddFlashcard}
            onSelectCard={setActiveCard}
            onEditCard={handleEditCard}
            onDeleteCard={handleDeleteCard}
            onRestoreCard={handleRestoreCard}
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
      case 'todo':
        return <TodoView />;
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