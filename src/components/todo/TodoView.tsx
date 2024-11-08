import { useState, useEffect } from 'react';
import { Plus, Check, Calendar, X } from 'lucide-react';
import type { Todo } from '../../types';
import { db, todos, testConnection } from '../../lib/db';
import { eq } from 'drizzle-orm';

const DEFAULT_USER_ID = 'default-user'; // Add default user ID constant

export default function TodoView() {
  const [todoItems, setTodoItems] = useState<Todo[]>([]);
  const [newTask, setNewTask] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTodos = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const isConnected = await testConnection();
        if (!isConnected) {
          throw new Error('Could not connect to database');
        }

        const dbTodos = await db.select()
          .from(todos)
          .where(eq(todos.userId, DEFAULT_USER_ID)); // Filter by user ID

        setTodoItems(dbTodos.map(todo => ({
          id: todo.id,
          content: todo.content,
          completed: todo.completed,
          date: todo.date?.toISOString() ?? new Date().toISOString(),
          completedAt: todo.completedAt?.toISOString(),
        })));
      } catch (error) {
        console.error('Failed to load todos:', error);
        setError('Failed to load tasks. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    loadTodos();
  }, []);

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    try {
      setError(null);
      const todo: Todo = {
        id: crypto.randomUUID(),
        content: newTask.trim(),
        completed: false,
        date: new Date().toISOString(),
      };

      // Save to database with user ID
      await db.insert(todos).values({
        id: todo.id,
        userId: DEFAULT_USER_ID, // Add user ID
        content: todo.content,
        completed: todo.completed,
        date: new Date(todo.date),
      });

      setTodoItems(prev => [...prev, todo]);
      setNewTask('');
    } catch (error) {
      console.error('Failed to save todo:', error);
      setError('Failed to save task. Please try again.');
    }
  };

  const toggleTodo = async (id: string) => {
    try {
      setError(null);
      const todoToUpdate = todoItems.find(todo => todo.id === id);
      if (!todoToUpdate) return;

      const updatedTodo = {
        ...todoToUpdate,
        completed: !todoToUpdate.completed,
        completedAt: todoToUpdate.completed ? undefined : new Date().toISOString()
      };

      await db.update(todos)
        .set({
          completed: updatedTodo.completed,
          completedAt: updatedTodo.completedAt ? new Date(updatedTodo.completedAt) : null,
        })
        .where(eq(todos.id, id) && eq(todos.userId, DEFAULT_USER_ID)); // Add user ID to where clause

      setTodoItems(prev => prev.map(todo => 
        todo.id === id ? updatedTodo : todo
      ));
    } catch (error) {
      console.error('Failed to update todo:', error);
      setError('Failed to update task. Please try again.');
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      setError(null);
      await db.delete(todos)
        .where(eq(todos.id, id) && eq(todos.userId, DEFAULT_USER_ID)); // Add user ID to where clause

      setTodoItems(prev => prev.filter(todo => todo.id !== id));
    } catch (error) {
      console.error('Failed to delete todo:', error);
      setError('Failed to delete task. Please try again.');
    }
  };

  const activeTodos = todoItems.filter(todo => !todo.completed);
  const completedTodos = todoItems
    .filter(todo => todo.completed)
    .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime());

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">To Do</h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

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