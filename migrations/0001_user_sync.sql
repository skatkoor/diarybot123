-- Add sync-related columns and constraints
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE diary_entries 
  ADD COLUMN IF NOT EXISTS sync_status TEXT DEFAULT 'synced',
  ADD CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE todos 
  ADD COLUMN IF NOT EXISTS sync_status TEXT DEFAULT 'synced',
  ADD CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE flashcards 
  ADD COLUMN IF NOT EXISTS sync_status TEXT DEFAULT 'synced',
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
  ADD CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_parent FOREIGN KEY (parent_id) REFERENCES flashcards(id) ON DELETE CASCADE;

ALTER TABLE notes 
  ADD COLUMN IF NOT EXISTS sync_status TEXT DEFAULT 'synced',
  ADD CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_card FOREIGN KEY (card_id) REFERENCES flashcards(id) ON DELETE CASCADE;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_diary_user ON diary_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_todos_user ON todos(user_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_user ON flashcards(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_user ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_sync_status ON diary_entries(sync_status);
CREATE INDEX IF NOT EXISTS idx_todos_sync_status ON todos(sync_status);
CREATE INDEX IF NOT EXISTS idx_flashcards_sync_status ON flashcards(sync_status);
CREATE INDEX IF NOT EXISTS idx_notes_sync_status ON notes(sync_status);