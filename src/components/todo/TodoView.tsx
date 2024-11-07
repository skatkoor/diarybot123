import { useState } from 'react';
import { Plus } from 'lucide-react';

export default function TodoView() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">To Do</h1>
        <button className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
          <Plus className="w-4 h-4" />
          Add Task
        </button>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500">Todo functionality coming soon...</p>
      </div>
    </div>
  );
}