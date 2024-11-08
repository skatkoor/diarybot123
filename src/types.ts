// Add to your existing types
export interface DeletedCard extends FlashCard {
  deletedAt: string;
}

export interface FlashCard {
  id: string;
  name: string;
  type: 'folder';
  notes: Note[];
  children: FlashCard[];
  lastModified: string;
  isDeleted?: boolean;
}