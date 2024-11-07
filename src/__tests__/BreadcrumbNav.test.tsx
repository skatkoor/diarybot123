import { render, fireEvent, screen } from '@testing-library/react';
import BreadcrumbNav from '../components/notes/BreadcrumbNav';
import type { FlashCard } from '../types';

describe('BreadcrumbNav', () => {
  const mockPath: FlashCard[] = [
    { id: '1', name: 'Root', type: 'folder', notes: [], children: [], lastModified: '' },
    { id: '2', name: 'Folder 1', type: 'folder', notes: [], children: [], lastModified: '' },
    { id: '3', name: 'Folder 2', type: 'folder', notes: [], children: [], lastModified: '' },
  ];

  const mockNavigate = jest.fn();

  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders all items in the path', () => {
    render(<BreadcrumbNav path={mockPath} onNavigate={mockNavigate} />);
    
    mockPath.forEach(card => {
      expect(screen.getByText(card.name)).toBeInTheDocument();
    });
  });

  it('calls onNavigate with correct card when clicking a breadcrumb', () => {
    render(<BreadcrumbNav path={mockPath} onNavigate={mockNavigate} />);
    
    fireEvent.click(screen.getByText('Folder 1'));
    expect(mockNavigate).toHaveBeenCalledWith(mockPath[1]);
  });

  it('renders separators between items', () => {
    render(<BreadcrumbNav path={mockPath} onNavigate={mockNavigate} />);
    
    // There should be one less separator than items
    const separators = screen.getAllByTestId('breadcrumb-separator');
    expect(separators).toHaveLength(mockPath.length - 1);
  });

  it('handles empty path', () => {
    render(<BreadcrumbNav path={[]} onNavigate={mockNavigate} />);
    expect(screen.queryByTestId('breadcrumb-nav')).toBeEmptyDOMElement();
  });

  it('handles single item path', () => {
    render(<BreadcrumbNav path={[mockPath[0]]} onNavigate={mockNavigate} />);
    expect(screen.queryByTestId('breadcrumb-separator')).not.toBeInTheDocument();
  });
});