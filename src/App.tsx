import { useState, useEffect } from 'react';
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

export default function App() {
  const [activeSection, setActiveSection] = useState('diary');
  const [activeCard, setActiveCard] = useState<FlashCard | null>(null);
  const [cardPath, setCardPath] = useState<FlashCard[]>([]);
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const handleNewEntry = async (content: string, mood: 'happy' | 'neutral' | 'sad', date: string) => {
    try {
      setError(null);
      const newEntry: DiaryEntry = {
        id: crypto.randomUUID(),
        content,
        mood,
        date,
        tags: [],
        type: 'diary',
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
            cardPath={cardPath}
            onBack={() => {
              if (cardPath.length > 0) {
                const parentCard = cardPath[cardPath.length - 1];
                const newPath = cardPath.slice(0, -1);
                setActiveCard(parentCard);
                setCardPath(newPath);
              } else {
                setActiveCard(null);
                setCardPath([]);
              }
            }}
            onAddNote={() => {}}
            onAddSubCard={() => {}}
            onSelectCard={(card, path) => {
              setActiveCard(card);
              setCardPath(path);
            }}
            onEditCard={() => {}}
            onDeleteCard={() => {}}
          />
        ) : (
          <NotesView
            cards={[]}
            deletedCards={[]}
            onAddCard={() => {}}
            onSelectCard={(card) => {
              setActiveCard(card);
              setCardPath([]);
            }}
            onEditCard={() => {}}
            onDeleteCard={() => {}}
            onRestoreCard={() => {}}
          />
        );
      case 'finance':
        return (
          <FinanceView
            entries={[]}
            accounts={[]}
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
      <div className="flex h-screen bg-gray-50" data-testid="app-container">
        <Sidebar 
          activeSection={activeSection} 
          onSectionChange={setActiveSection}
          onResetView={() => {
            setActiveCard(null);
            setCardPath([]);
          }}
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