import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  onDateSelect: (date: Date) => void;
  entries: { date: string }[];
}

export default function WeekCalendar({ onDateSelect, entries }: Props) {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const getWeekDates = (date: Date) => {
    const week = [];
    const first = date.getDate() - date.getDay();
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(date.getFullYear(), date.getMonth(), first + i);
      week.push(day);
    }
    
    return week;
  };

  const weekDates = getWeekDates(selectedDate);

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + (direction === 'next' ? 7 : -7));
    setSelectedDate(newDate);
  };

  const hasEntryOnDate = (date: Date) => {
    const dateStr = date.toLocaleDateString();
    return entries.some(entry => new Date(entry.date).toLocaleDateString() === dateStr);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigateWeek('prev')}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-semibold">
            {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>
          <button
            onClick={() => navigateWeek('next')}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-4">
        {weekDates.map((date, idx) => {
          const hasEntry = hasEntryOnDate(date);
          const isToday = date.toDateString() === new Date().toDateString();
          
          return (
            <button
              key={idx}
              onClick={() => onDateSelect(date)}
              className={`p-4 rounded-lg text-center space-y-1 ${
                isToday ? 'bg-blue-50 border-2 border-blue-500' : 
                hasEntry ? 'bg-blue-50' : 'hover:bg-gray-50'
              }`}
            >
              <div className="text-sm text-gray-600">
                {date.toLocaleString('default', { weekday: 'short' })}
              </div>
              <div className={`text-xl ${isToday ? 'font-bold text-blue-600' : ''}`}>
                {date.getDate()}
              </div>
              {hasEntry && (
                <div className="w-2 h-2 bg-blue-500 rounded-full mx-auto" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}