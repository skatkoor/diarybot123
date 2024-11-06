export type Mood = 'happy' | 'neutral' | 'sad';
export type CalendarView = 'year' | 'week';
export type AccountType = 'checking' | 'savings' | 'credit' | 'cash';

export interface DiaryEntry {
  id: string;
  content: string;
  mood: Mood;
  date: string;
  tags: string[];
  type: 'diary' | 'note' | 'template';
  isPinned?: boolean;
  lastModified: string;
}

export interface Template {
  id: string;
  name: string;
  content: string;
  description: string;
  icon: string;
}

export interface User {
  name: string;
  avatar: string;
  preferences: {
    theme: 'light' | 'dark';
    sidebarCollapsed: boolean;
  };
}

export interface FinanceEntry {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  type: 'income' | 'expense';
  account: AccountType;
}

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  lastModified: string;
}

export interface FlashCard {
  id: string;
  name: string;
  type: 'folder';
  notes: Note[];
  children: FlashCard[];
  lastModified: string;
}

export interface TodoItem {
  id: string;
  content: string;
  completed: boolean;
  date: string;
}