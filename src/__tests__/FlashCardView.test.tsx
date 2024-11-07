import { render, fireEvent, screen } from '@testing-library/react';
import FlashCardView from '../components/notes/FlashCardView';
import type { FlashCard } from '../types';

jest.mock('@hello-pangea/dnd', () => ({
  DragDropContext: ({ children }: any) => children,
  Droppable: ({ children }: any) => children({ provided: { droppableProps: {}, innerRef: null }, snapshot: null }),
  Draggable: ({ children }: any) => children({ provided: { draggableProps: {}, dragHandleProps: {}, innerRef: null }, snapshot: null }),
}));

describe('FlashCardView', () => {
  const mockCard: FlashCard = {
    id: '1',
    name: 'Test Card',
    type: 'folder',
    notes: [
      { id: 'n1', title: 'Note 1', content: 'Content 1', tags: [], lastModified: '' }
    ],
    children: [
      { id: 'c1', name: 'Child 1', type: 'folder', notes: [], children: [], lastModified: '' }
    ],
    lastModified: '',
  };

  const mockPath: FlashCard[] = [
    { id: 'root', name: 'Root', type: 'folder', notes: [], children: [], lastModified: '' },
  ];

  const mockProps = {
    card: mockCard,
    cardPath: mockPath,
    onBack: jest.fn(),
    onNavigate: jest.fn(),
    onAddNote: jest.fn(),
    onAddSubCard: jest.fn(),
    onSelectCard: jest.fn(),
    onEditCard: jest.fn(),
    onDeleteCard: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders breadcrumb navigation with correct path', () => {
    render(<FlashCardView {...mockProps} />);
    
    expect(screen.getByText('Root')).toBeInTheDocument();
    expect(screen.getByText('Test Card')).toBeInTheDocument();
  });

  it('handles back button click', () => {
    render(<FlashCardView {...mockProps} />);
    
    fireEvent.click(screen.getByTestId('back-button'));
    expect(mockProps.onBack).toHaveBeenCalled();
  });

  it('handles adding new card', () => {
    render(<FlashCardView {...mockProps} />);
    
    fireEvent.click(screen.getByTestId('add-card-button'));
    fireEvent.change(screen.getByTestId('card-name-input'), { target: { value: 'New Card' } });
    fireEvent.click(screen.getByTestId('save-card-button'));
    
    expect(mockProps.onAddSubCard).toHaveBeenCalledWith(mockCard.id, expect.objectContaining({
      name: 'New Card',
    }));
  });

  it('handles adding new note', () => {
    render(<FlashCardView {...mockProps} />);
    
    fireEvent.click(screen.getByTestId('add-note-button'));
    fireEvent.change(screen.getByTestId('note-title-input'), { target: { value: 'New Note' } });
    fireEvent.change(screen.getByTestId('note-content-input'), { target: { value: 'Content' } });
    fireEvent.click(screen.getByTestId('save-note-button'));
    
    expect(mockProps.onAddNote).toHaveBeenCalledWith(mockCard.id, expect.objectContaining({
      title: 'New Note',
      content: 'Content',
    }));
  });

  it('filters cards and notes based on search term', () => {
    render(<FlashCardView {...mockProps} />);
    
    fireEvent.change(screen.getByTestId('search-input'), { target: { value: 'Child 1' } });
    
    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.queryByText('Note 1')).not.toBeInTheDocument();
  });

  it('navigates to sub-card when clicked', () => {
    render(<FlashCardView {...mockProps} />);
    
    const childCard = mockCard.children[0];
    fireEvent.click(screen.getByText(childCard.name));
    
    expect(mockProps.onSelectCard).toHaveBeenCalledWith(childCard, [...mockPath, mockCard]);
  });
});