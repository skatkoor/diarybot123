import { useState } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import YearCalendar from '../calendar/YearCalendar';
import WeekCalendar from '../calendar/WeekCalendar';
import DiaryEntry from '../DiaryEntry';
import NewEntry from '../NewEntry';
import type { DiaryEntry as DiaryEntryType } from '../../types';
import { createDiaryEntry, updateDiaryEntry, deleteDiaryEntry } from '../../api/diary';

interface Props {
  entries: DiaryEntryType[];
  onNewEntry: (content: string, mood: 'happy' | 'neutral' | 'sad', date: string) => Promise<void>;
  onDeleteEntry: (id: string) => Promise<void>;
  onEditEntry: (id: string, content: string) => Promise<void>;
}

export default function DiaryView({ entries, onNewEntry, onDeleteEntry, onEditEntry }: Props) {
  const [calendarView, setCalendarView] = useState<'year' | 'week'>('week');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [error, setError] = useState<string | null>(null);

  const handleNewEntry = async (content: string, mood: 'happy' | 'neutral' | 'sad', date: string) => {
    try {
      setError(null);
      await onNewEntry(content, mood, date);
    } catch (err) {
      console.error('Failed to create entry:', err);
      setError('Failed to save entry. Please try again.');
    }
  };

  const handleEditEntry = async (id: string, content: string) => {
    try {
      setError(null);
      await onEditEntry(id, content);
    } catch (err) {
      console.error('Failed to update entry:', err);
      setError('Failed to update entry. Please try again.');
    }
  };

  const handleDeleteEntry = async (id: string) => {
    try {
      setError(null);
      await onDeleteEntry(id);
    } catch (err) {
      console.error('Failed to delete entry:', err);
      setError('Failed to delete entry. Please try again.');
    }
  };

  const filteredEntries = entries.filter(entry => {
    const entryDate = new Date(entry.date);
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    return entryDate >= startOfDay && entryDate <= endOfDay;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Diary</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCalendarView('week')}
            className={`px-3 py-1 rounded-md ${
              calendarView === 'week' ? 'bg-blue-500 text-white' : 'bg-gray-100'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setCalendarView('year')}
            className={`px-3 py-1 rounded-md ${
              calendarView === 'year' ? 'bg-blue-500 text-white' : 'bg-gray-100'
            }`}
          >
            Year
          </button>
        </div>
      </div>

      {calendarView === 'year' ? (
        <YearCalendar onDateSelect={setSelectedDate} entries={entries} />
      ) : (
        <WeekCalendar onDateSelect={setSelectedDate} entries={entries} />
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <CalendarIcon className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-semibold">
            {selectedDate.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </h2>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <NewEntry onSubmit={handleNewEntry} selectedDate={selectedDate} />

        {filteredEntries.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No entries for this date</p>
        ) : (
          <div className="space-y-4">
            {filteredEntries.map(entry => (
              <DiaryEntry
                key={entry.id}
                entry={entry}
                onDelete={handleDeleteEntry}
                onEdit={handleEditEntry}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}