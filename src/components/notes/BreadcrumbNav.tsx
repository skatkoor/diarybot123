import { ChevronRight } from 'lucide-react';
import type { FlashCard } from '../../types';

interface Props {
  path: FlashCard[];
  onNavigate: (card: FlashCard) => void;
}

export default function BreadcrumbNav({ path, onNavigate }: Props) {
  return (
    <nav className="flex items-center gap-2 overflow-x-auto py-2" data-testid="breadcrumb-nav">
      {path.map((card, index) => (
        <div key={`${card.id}-${index}`} className="flex items-center">
          <button
            onClick={() => onNavigate(card)}
            className="text-sm hover:text-blue-500 whitespace-nowrap transition-colors"
            data-testid={`breadcrumb-item-${card.id}`}
          >
            {card.name}
          </button>
          {index < path.length - 1 && (
            <ChevronRight 
              className="w-4 h-4 mx-1 text-gray-400 flex-shrink-0" 
              data-testid="breadcrumb-separator"
            />
          )}
        </div>
      ))}
    </nav>
  );
}