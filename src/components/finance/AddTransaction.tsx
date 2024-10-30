import { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import type { FinanceEntry, Account } from '../../types';

interface Props {
  onAdd: (transaction: Omit<FinanceEntry, 'id'>) => void;
  accounts: Account[];
}

export default function AddTransaction({ onAdd, accounts }: Props) {
  const [isAdding, setIsAdding] = useState(false);
  const [transaction, setTransaction] = useState({
    amount: 0,
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    type: 'expense' as 'income' | 'expense',
    account: accounts[0]?.type || 'checking',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(transaction);
    setIsAdding(false);
    setTransaction({
      amount: 0,
      category: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      type: 'expense',
      account: accounts[0]?.type || 'checking',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Add Transaction</h2>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 text-blue-500 hover:text-blue-600"
        >
          <PlusCircle className="w-5 h-5" />
          {isAdding ? 'Cancel' : 'Add Transaction'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Amount</label>
              <input
                type="number"
                step="0.01"
                value={transaction.amount}
                onChange={(e) => setTransaction({ ...transaction, amount: parseFloat(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <select
                value={transaction.type}
                onChange={(e) => setTransaction({ ...transaction, type: e.target.value as 'income' | 'expense' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <input
                type="text"
                value={transaction.category}
                onChange={(e) => setTransaction({ ...transaction, category: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Account</label>
              <select
                value={transaction.account}
                onChange={(e) => setTransaction({ ...transaction, account: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                {accounts.map((account) => (
                  <option key={account.id} value={account.type}>
                    {account.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <input
                type="text"
                value={transaction.description}
                onChange={(e) => setTransaction({ ...transaction, description: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <input
                type="date"
                value={transaction.date}
                onChange={(e) => setTransaction({ ...transaction, date: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Add Transaction
            </button>
          </div>
        </form>
      )}
    </div>
  );
}