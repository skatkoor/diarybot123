import { useState } from 'react';
import { Plus, CheckCircle, Circle, Trash2 } from 'lucide-react';
import type { Todo } from '../../types';

interface Props {
  todos: Todo[];
  onAddTodo: (content: string) => void;
  onCompleteTodo: (id: string) => void;
}

export default function TodoView({ todos = [], onAddTodo, onCompleteTodo }: Props) {
  const [newTodo, setNewTodo] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    onAddTodo(newTodo);
    setNewTodo('');
  };

  const activeTodos = todos.filter(todo => !todo.completed);
  const completedTodos = todos.filter(todo => todo.completed);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">To Do</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Add a new task..."
            className="flex-1 px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            <Plus className="w-4 h-4" />
            Add Task
          </button>
        </div>
      </form>

      <div className="space-y-4">
        {activeTodos.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Active Tasks</h2>
            <div className="space-y-2">
              {activeTodos.map((todo) => (
                <div
                  key={todo.id}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-md"
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onCompleteTodo(todo.id)}
                      className="text-gray-400 hover:text-green-500"
                    >
                      <Circle className="w-5 h-5" />
                    </button>
                    <span>{todo.content}</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(todo.date).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {completedTodos.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Completed Tasks</h2>
            <div className="space-y-2">
              {completedTodos.map((todo) => (
                <div
                  key={todo.id}
                  className="flex items-center justify-between p-3 text-gray-500 line-through"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>{todo.content}</span>
                  </div>
                  <span className="text-sm">
                    {new Date(todo.date).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}