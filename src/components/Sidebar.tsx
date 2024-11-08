import { useState } from 'react';
import {
  Book,
  StickyNote,
  Layout,
  Search,
  Settings,
  ChevronLeft,
  Bot,
  Plus,
  DollarSign,
  CheckSquare,
} from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onResetView?: () => void;
}

export default function Sidebar({ activeSection, onSectionChange, onResetView }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { id: 'diary', icon: Book, label: 'Diary' },
    { id: 'notes', icon: StickyNote, label: 'Notes' },
    { id: 'todo', icon: CheckSquare, label: 'To Do' },
    { id: 'ai', icon: Bot, label: 'AI Assistant' },
    { id: 'finance', icon: DollarSign, label: 'Finance' },
    { id: 'search', icon: Search, label: 'Search' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  const handleSectionChange = (sectionId: string) => {
    if (sectionId === activeSection) {
      onResetView?.();
    }
    onSectionChange(sectionId);
  };

  return (
    <div
      className={`bg-white border-r border-gray-200 h-screen transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="p-4 flex items-center justify-between border-b border-gray-200">
        {!collapsed && <h1 className="text-xl font-bold text-gray-800">DiaryBot</h1>}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 hover:bg-gray-100 rounded-md"
        >
          <ChevronLeft className={`w-5 h-5 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      <div className="p-2">
        <button
          className="w-full flex items-center gap-2 p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          <Plus className="w-5 h-5" />
          {!collapsed && <span>New Entry</span>}
        </button>
      </div>

      <nav className="p-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleSectionChange(item.id)}
            className={`w-full flex items-center gap-3 p-2 rounded-md mb-1 ${
              activeSection === item.id
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <item.icon className="w-5 h-5" />
            {!collapsed && <span>{item.label}</span>}
          </button>
        ))}
      </nav>
    </div>
  );
}