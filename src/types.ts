export interface DiaryEntry {
  id: string;
  content: string;
  mood: 'happy' | 'neutral' | 'sad';
  date: string;
  tags: string[];
  type: 'diary';
  lastModified: string;
  createdAt: string;
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

export interface DeletedCard extends FlashCard {
  deletedAt: string;
}

export interface FinanceEntry {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description?: string;
  account: string;
  date: string;
}

export type AccountType = 'checking' | 'savings' | 'credit' | 'cash';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
}