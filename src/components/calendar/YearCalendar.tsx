import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { DiaryEntry } from '../../types';

interface Props {
  onDateSelect: (date: Date) => void;
  entries: DiaryEntry[];
}

export default function YearCalendar({ onDateSelect, entries }: Props) {
  const [year, setYear] = useState(new Date().getFullYear());
  const months = Array.from({ length: 12 }, (_, i) => new Date(year, i));
  
  const weekDays = [
    { key: 'sun', label: 'S' },
    { key: 'mon', label: 'M' },
    { key: 'tue', label: 'T' },
    { key: 'wed', label: 'W' },
    { key: 'thu', label: 'T' },
    { key: 'fri', label: 'F' },
    { key: 'sat', label: 'S' },
  ];

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const hasEntryOnDate = (year: number, month: number, day: number) => {
    const calendarDate = new Date(year, month, day);
    return entries.some(entry => {
      const entryDate = new Date(entry.date);
      return entryDate.toDateString() === calendarDate.toDateString();
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setYear(year - 1)}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-semibold">{year}</h2>
        <button
          onClick={() => setYear(year + 1)}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {months.map((month, idx) => (
          <div key={`month-${idx}`} className="space-y-2">
            <h3 className="font-medium text-gray-600">
              {month.toLocaleString('default', { month: 'long' })}
            </h3>
            <div className="grid grid-cols-7 gap-1 text-sm">
              {weekDays.map(day => (
                <div key={`weekday-${day.key}`} className="text-center text-gray-400">
                  {day.label}
                </div>
              ))}
              {Array.from({ length: getFirstDayOfMonth(month) }).map((_, i) => (
                <div key={`empty-${month.getMonth()}-${i}`} />
              ))}
              {Array.from({ length: getDaysInMonth(month) }).map((_, i) => {
                const day = i + 1;
                const hasEntry = hasEntryOnDate(year, month.getMonth(), day);
                const isToday = new Date(year, month.getMonth(), day).toDateString() === 
                               new Date().toDateString();
                
                return (
                  <button
                    key={`day-${month.getMonth()}-${day}`}
                    onClick={() => onDateSelect(new Date(year, month.getMonth(), day))}
                    className={`text-center p-1 rounded-full relative
                      ${isToday ? 'bg-blue-100 text-blue-600 font-bold' : ''}
                      ${hasEntry ? 'bg-blue-50 text-blue-600' : 'hover:bg-blue-50'}`}
                  >
                    {day}
                    {hasEntry && (
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}