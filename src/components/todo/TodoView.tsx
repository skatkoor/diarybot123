import { useState } from 'react';
import { Plus, Check, Calendar, X } from 'lucide-react';
import type { Todo } from '../../types';

export default function TodoView() {
  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem('diarybot-todos');
    return saved ? JSON.parse(saved) : [];
  });
  const [newTask, setNewTask] = useState('');

  // Save todos to localStorage whenever they change
  useState(() => {
    localStorage.setItem('diarybot-todos', JSON.stringify(todos));
  });

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    const todo: Todo = {
      id: crypto.randomUUID(),
      content: newTask.trim(),
      completed: false,
      date: new Date().toISOString(),
    };

    setTodos(prev => [...prev, todo]);
    setNewTask('');
  };

  const toggleTodo = (id: string) => {
    setTodos(prev => prev.map(todo => {
      if (todo.id === id) {
        return {
          ...todo,
          completed: !todo.completed,
          completedAt: todo.completed ? undefined : new Date().toISOString()
        };
      }
      return todo;
    }));
  };

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  };

  const activeTodos = todos.filter(todo => !todo.completed);
  const completedTodos = todos
    .filter(todo => todo.completed)
    .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">To Do</h1>
      </div>

      <form onSubmit={handleAddTodo} className="flex gap-2">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add a new task..."
          className="flex-1 px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="submit"
          disabled={!newTask.trim()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          Add Task
        </button>
      </form>

      <div className="space-y-6">
        {/* Active Tasks */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Active Tasks</h2>
          {activeTodos.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No active tasks</p>
          ) : (
            <div className="space-y-2">
              {activeTodos.map(todo => (
                <div
                  key={todo.id}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-md group"
                >
                  <button
                    onClick={() => toggleTodo(todo.id)}
                    className="w-5 h-5 border-2 rounded flex items-center justify-center hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <Check className="w-4 h-4 text-transparent group-hover:text-gray-300" />
                  </button>
                  <span className="flex-1">{todo.content}</span>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Completed Tasks */}
        {completedTodos.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Completed Tasks</h2>
            <div className="space-y-2">
              {completedTodos.map(todo => (
                <div
                  key={todo.id}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-md group"
                >
                  <button
                    onClick={() => toggleTodo(todo.id)}
                    className="w-5 h-5 border-2 border-green-500 bg-green-500 rounded flex items-center justify-center"
                  >
                    <Check className="w-4 h-4 text-white" />
                  </button>
                  <span className="flex-1 text-gray-500 line-through">{todo.content}</span>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Calendar className="w-4 h-4" />
                    {new Date(todo.completedAt!).toLocaleDateString()}
                  </div>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}