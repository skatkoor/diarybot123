import { useState } from 'react';
import { PlusCircle, Wallet, CreditCard, DollarSign, Coins } from 'lucide-react';
import type { Account, AccountType } from '../../types';

interface Props {
  accounts: Account[];
  onAddAccount: (account: Omit<Account, 'id'>) => void;
}

export default function AccountsOverview({ accounts, onAddAccount }: Props) {
  const [isAdding, setIsAdding] = useState(false);
  const [newAccount, setNewAccount] = useState({
    name: '',
    type: 'checking' as AccountType,
    balance: 0,
    currency: 'USD',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddAccount(newAccount);
    setIsAdding(false);
    setNewAccount({
      name: '',
      type: 'checking',
      balance: 0,
      currency: 'USD',
    });
  };

  const accountIcons = {
    checking: Wallet,
    savings: Coins,
    credit: CreditCard,
    cash: DollarSign,
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Accounts</h2>
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 text-blue-500 hover:text-blue-600"
          >
            <PlusCircle className="w-5 h-5" />
            Add Account
          </button>
        </div>

        {isAdding && (
          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Account Name</label>
              <input
                type="text"
                value={newAccount.name}
                onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Account Type</label>
              <select
                value={newAccount.type}
                onChange={(e) => setNewAccount({ ...newAccount, type: e.target.value as AccountType })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="checking">Checking</option>
                <option value="savings">Savings</option>
                <option value="credit">Credit</option>
                <option value="cash">Cash</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Initial Balance</label>
              <input
                type="number"
                step="0.01"
                value={newAccount.balance}
                onChange={(e) => setNewAccount({ ...newAccount, balance: parseFloat(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Add Account
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 gap-4">
          {accounts.map((account) => {
            const Icon = accountIcons[account.type];
            return (
              <div
                key={account.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full bg-blue-50`}>
                    <Icon className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-medium">{account.name}</h3>
                    <p className="text-sm text-gray-500">{account.type}</p>
                  </div>
                </div>
                <p className="text-lg font-semibold">${account.balance.toFixed(2)}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}