import { FileText } from 'lucide-react';
import type { Note } from '../../types';

interface Props {
  note: Note;
}

export default function NoteCard({ note }: Props) {
  return (
    <div className="group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 p-6">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-white rounded-xl opacity-50 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors">
            <FileText className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <h3 className="font-medium text-gray-800">{note.title}</h3>
            <p className="text-xs text-gray-500">
              Last modified {new Date(note.lastModified).toLocaleDateString()}
            </p>
          </div>
        </div>
        
        <p className="text-gray-700 line-clamp-3">{note.content}</p>
        
        {note.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {note.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs bg-purple-100 text-purple-600 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-purple-600 rounded-b-xl transform scale-x-0 group-hover:scale-x-100 transition-transform" />
    </div>
  );
}