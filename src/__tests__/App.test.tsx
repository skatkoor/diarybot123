import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';

jest.mock('@hello-pangea/dnd', () => ({
  DragDropContext: ({ children }: any) => children,
  Droppable: ({ children }: any) => children({ provided: { droppableProps: {}, innerRef: null }, snapshot: null }),
  Draggable: ({ children }: any) => children({ provided: { draggableProps: {}, dragHandleProps: {}, innerRef: null }, snapshot: null }),
}));

describe('App', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('renders the main app container', () => {
    render(<App />);
    expect(screen.getByTestId('app-container')).toBeInTheDocument();
  });

  it('renders the sidebar with navigation options', () => {
    render(<App />);
    expect(screen.getByText('Diary')).toBeInTheDocument();
    expect(screen.getByText('Notes')).toBeInTheDocument();
    expect(screen.getByText('Finance')).toBeInTheDocument();
    expect(screen.getByText('To Do')).toBeInTheDocument();
  });

  it('switches between different sections when clicking sidebar items', () => {
    render(<App />);
    
    // Click Notes section
    fireEvent.click(screen.getByText('Notes'));
    expect(screen.getByText('New Card')).toBeInTheDocument();
    
    // Click Finance section
    fireEvent.click(screen.getByText('Finance'));
    expect(screen.getByText('Total Balance')).toBeInTheDocument();
    
    // Click Todo section
    fireEvent.click(screen.getByText('To Do'));
    expect(screen.getByText('Add Task')).toBeInTheDocument();
  });

  it('persists data in localStorage', () => {
    const { rerender } = render(<App />);
    
    // Add a new card in Notes section
    fireEvent.click(screen.getByText('Notes'));
    fireEvent.click(screen.getByText('New Card'));
    fireEvent.change(screen.getByPlaceholderText('Enter card name'), { target: { value: 'Test Card' } });
    fireEvent.click(screen.getByText('Create'));
    
    // Verify localStorage was updated
    expect(localStorage.getItem('diarybot-flashcards')).toBeTruthy();
    
    // Unmount and remount to test persistence
    rerender(<App />);
    expect(screen.getByText('Test Card')).toBeInTheDocument();
  });

  it('shows authentication wrapper', () => {
    render(<App />);
    expect(screen.getByText('Login to DiaryBot')).toBeInTheDocument();
  });
});