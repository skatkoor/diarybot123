import { useState } from 'react';
import { AuthWrapper } from './components/auth/AuthWrapper';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DiaryView from './components/diary/DiaryView';
import FinanceView from './components/finance/FinanceView';
import NotesView from './components/notes/NotesView';
import FlashCardView from './components/notes/FlashCardView';
import TodoView from './components/todo/TodoView';
import type { DiaryEntry, FinanceEntry, Account, FlashCard, Note, Todo } from './types';

const STORAGE_KEY = 'diarybot-entries';
const FINANCE_STORAGE_KEY = 'diarybot-finance';
const ACCOUNTS_STORAGE_KEY = 'diarybot-accounts';
const FLASHCARDS_STORAGE_KEY = 'diarybot-flashcards';
const TODO_STORAGE_KEY = 'diarybot-todos';

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

  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem(TODO_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const handleNewEntry = async (content: string, mood: 'happy' | 'neutral' | 'sad', date: string) => {
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
    const updatedEntries = [newEntry, ...entries];
    setEntries(updatedEntries);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries));
  };

  const handleAddFlashcard = async (card: Omit<FlashCard, 'id'>) => {
    const newCard: FlashCard = {
      ...card,
      id: Date.now().toString(),
    };
    const updatedCards = [...flashcards, newCard];
    setFlashcards(updatedCards);
    localStorage.setItem(FLASHCARDS_STORAGE_KEY, JSON.stringify(updatedCards));
  };

  const handleEditCard = (cardId: string, updates: Partial<FlashCard>) => {
    const updatedCards = flashcards.map(card => {
      if (card.id === cardId) {
        const updatedCard = { ...card, ...updates, lastModified: new Date().toISOString() };
        if (activeCard?.id === cardId) {
          setActiveCard(updatedCard);
        }
        return updatedCard;
      }
      if (card.children && card.children.length > 0) {
        return {
          ...card,
          children: updateNestedCards(card.children, cardId, updates),
        };
      }
      return card;
    });

    setFlashcards(updatedCards);
    localStorage.setItem(FLASHCARDS_STORAGE_KEY, JSON.stringify(updatedCards));
  };

  const updateNestedCards = (
    cards: FlashCard[],
    cardId: string,
    updates: Partial<FlashCard>
  ): FlashCard[] => {
    return cards.map(card => {
      if (card.id === cardId) {
        const updatedCard = { ...card, ...updates, lastModified: new Date().toISOString() };
        if (activeCard?.id === cardId) {
          setActiveCard(updatedCard);
        }
        return updatedCard;
      }
      if (card.children && card.children.length > 0) {
        return {
          ...card,
          children: updateNestedCards(card.children, cardId, updates),
        };
      }
      return card;
    });
  };

  const handleDeleteCard = (cardId: string) => {
    const deleteCardRecursive = (cards: FlashCard[]): FlashCard[] => {
      return cards.filter(card => {
        if (card.id === cardId) {
          if (activeCard?.id === cardId) {
            setActiveCard(null);
          }
          return false;
        }
        if (card.children && card.children.length > 0) {
          return {
            ...card,
            children: deleteCardRecursive(card.children),
          };
        }
        return true;
      });
    };

    const updatedCards = deleteCardRecursive(flashcards);
    setFlashcards(updatedCards);
    localStorage.setItem(FLASHCARDS_STORAGE_KEY, JSON.stringify(updatedCards));
  };

  const handleReorderCards = (parentId: string | null, reorderedCards: FlashCard[]) => {
    if (!parentId) {
      setFlashcards(reorderedCards);
      localStorage.setItem(FLASHCARDS_STORAGE_KEY, JSON.stringify(reorderedCards));
      return;
    }

    const updateCardsOrder = (cards: FlashCard[]): FlashCard[] => {
      return cards.map(card => {
        if (card.id === parentId) {
          return { ...card, children: reorderedCards };
        }
        if (card.children && card.children.length > 0) {
          return { ...card, children: updateCardsOrder(card.children) };
        }
        return card;
      });
    };

    const updatedCards = updateCardsOrder(flashcards);
    setFlashcards(updatedCards);
    localStorage.setItem(FLASHCARDS_STORAGE_KEY, JSON.stringify(updatedCards));
  };

  const handleAddSubCard = async (parentId: string, card: Omit<FlashCard, 'id'>) => {
    const newCard = { ...card, id: Date.now().toString() };
    
    const addSubCardToParent = (cards: FlashCard[]): FlashCard[] => {
      return cards.map(existingCard => {
        if (existingCard.id === parentId) {
          const updatedCard = {
            ...existingCard,
            children: [...existingCard.children, newCard],
          };
          if (activeCard?.id === parentId) {
            setActiveCard(updatedCard);
          }
          return updatedCard;
        }
        if (existingCard.children && existingCard.children.length > 0) {
          return {
            ...existingCard,
            children: addSubCardToParent(existingCard.children),
          };
        }
        return existingCard;
      });
    };

    const updatedCards = addSubCardToParent(flashcards);
    setFlashcards(updatedCards);
    localStorage.setItem(FLASHCARDS_STORAGE_KEY, JSON.stringify(updatedCards));
  };

  const handleAddNote = async (cardId: string, note: Omit<Note, 'id'>) => {
    const newNote = { ...note, id: Date.now().toString() };
    
    const addNoteToCard = (cards: FlashCard[]): FlashCard[] => {
      return cards.map(card => {
        if (card.id === cardId) {
          const updatedCard = {
            ...card,
            notes: [...card.notes, newNote],
          };
          if (activeCard?.id === cardId) {
            setActiveCard(updatedCard);
          }
          return updatedCard;
        }
        if (card.children && card.children.length > 0) {
          return {
            ...card,
            children: addNoteToCard(card.children),
          };
        }
        return card;
      });
    };

    const updatedCards = addNoteToCard(flashcards);
    setFlashcards(updatedCards);
    localStorage.setItem(FLASHCARDS_STORAGE_KEY, JSON.stringify(updatedCards));
  };

  const handleEditNote = (cardId: string, noteId: string, updates: Partial<Note>) => {
    const updatedCards = flashcards.map(card => {
      if (card.id === cardId) {
        const updatedCard = {
          ...card,
          notes: card.notes.map(note =>
            note.id === noteId
              ? { ...note, ...updates, lastModified: new Date().toISOString() }
              : note
          ),
        };
        if (activeCard?.id === cardId) {
          setActiveCard(updatedCard);
        }
        return updatedCard;
      }
      if (card.children && card.children.length > 0) {
        return {
          ...card,
          children: updateNestedCardsWithNoteEdit(card.children, cardId, noteId, updates),
        };
      }
      return card;
    });

    setFlashcards(updatedCards);
    localStorage.setItem(FLASHCARDS_STORAGE_KEY, JSON.stringify(updatedCards));
  };

  const updateNestedCardsWithNoteEdit = (
    cards: FlashCard[],
    cardId: string,
    noteId: string,
    updates: Partial<Note>
  ): FlashCard[] => {
    return cards.map(card => {
      if (card.id === cardId) {
        const updatedCard = {
          ...card,
          notes: card.notes.map(note =>
            note.id === noteId
              ? { ...note, ...updates, lastModified: new Date().toISOString() }
              : note
          ),
        };
        if (activeCard?.id === cardId) {
          setActiveCard(updatedCard);
        }
        return updatedCard;
      }
      if (card.children && card.children.length > 0) {
        return {
          ...card,
          children: updateNestedCardsWithNoteEdit(card.children, cardId, noteId, updates),
        };
      }
      return card;
    });
  };

  const handleDeleteNote = (cardId: string, noteId: string) => {
    const updatedCards = flashcards.map(card => {
      if (card.id === cardId) {
        const updatedCard = {
          ...card,
          notes: card.notes.filter(note => note.id !== noteId),
        };
        if (activeCard?.id === cardId) {
          setActiveCard(updatedCard);
        }
        return updatedCard;
      }
      if (card.children && card.children.length > 0) {
        return {
          ...card,
          children: updateNestedCardsWithNoteDelete(card.children, cardId, noteId),
        };
      }
      return card;
    });

    setFlashcards(updatedCards);
    localStorage.setItem(FLASHCARDS_STORAGE_KEY, JSON.stringify(updatedCards));
  };

  const updateNestedCardsWithNoteDelete = (
    cards: FlashCard[],
    cardId: string,
    noteId: string
  ): FlashCard[] => {
    return cards.map(card => {
      if (card.id === cardId) {
        const updatedCard = {
          ...card,
          notes: card.notes.filter(note => note.id !== noteId),
        };
        if (activeCard?.id === cardId) {
          setActiveCard(updatedCard);
        }
        return updatedCard;
      }
      if (card.children && card.children.length > 0) {
        return {
          ...card,
          children: updateNestedCardsWithNoteDelete(card.children, cardId, noteId),
        };
      }
      return card;
    });
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

  const handleAddTodo = (content: string) => {
    const newTodo: Todo = {
      id: Date.now().toString(),
      content,
      completed: false,
      date: new Date().toISOString(),
    };
    const updatedTodos = [newTodo, ...todos];
    setTodos(updatedTodos);
    localStorage.setItem(TODO_STORAGE_KEY, JSON.stringify(updatedTodos));
  };

  const handleCompleteTodo = (id: string) => {
    const updatedTodos = todos.map(todo => {
      if (todo.id === id) {
        const completed = !todo.completed;
        // If completing the todo, add a diary entry
        if (completed) {
          handleNewEntry(
            `Completed task: ${todo.content}`,
            'happy',
            new Date().toISOString()
          );
        }
        return { ...todo, completed };
      }
      return todo;
    });
    setTodos(updatedTodos);
    localStorage.setItem(TODO_STORAGE_KEY, JSON.stringify(updatedTodos));
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
            onReorderCards={handleReorderCards}
            onEditNote={handleEditNote}
            onDeleteNote={handleDeleteNote}
          />
        ) : (
          <NotesView
            cards={flashcards}
            onAddCard={handleAddFlashcard}
            onSelectCard={setActiveCard}
            onEditCard={handleEditCard}
            onDeleteCard={handleDeleteCard}
            onReorderCards={handleReorderCards}
          />
        );
      case 'todo':
        return (
          <TodoView
            todos={todos}
            onAddTodo={handleAddTodo}
            onCompleteTodo={handleCompleteTodo}
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