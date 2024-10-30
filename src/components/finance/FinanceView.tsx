import { useState } from 'react';
import { Wallet, CreditCard, PlusCircle, Calendar } from 'lucide-react';
import type { FinanceEntry, Account } from '../../types';
import AccountsOverview from './AccountsOverview';
import TransactionList from './TransactionList';
import AddTransaction from './AddTransaction';

interface Props {
  entries: FinanceEntry[];
  accounts: Account[];
  onAddTransaction: (transaction: Omit<FinanceEntry, 'id'>) => void;
  onAddAccount: (account: Omit<Account, 'id'>) => void;
}

export default function FinanceView({ entries, accounts, onAddTransaction, onAddAccount }: Props) {
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'calendar'>('overview');

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Finance</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1 rounded-md ${
              activeTab === 'overview' ? 'bg-blue-500 text-white' : 'bg-gray-100'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-3 py-1 rounded-md ${
              activeTab === 'transactions' ? 'bg-blue-500 text-white' : 'bg-gray-100'
            }`}
          >
            Transactions
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-3 py-1 rounded-md ${
              activeTab === 'calendar' ? 'bg-blue-500 text-white' : 'bg-gray-100'
            }`}
          >
            Calendar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold">Total Balance</h3>
            </div>
          </div>
          <p className="text-2xl font-bold">${totalBalance.toFixed(2)}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-green-500" />
              <h3 className="font-semibold">Monthly Income</h3>
            </div>
          </div>
          <p className="text-2xl font-bold text-green-500">
            +${entries
              .filter(e => e.type === 'income' && new Date(e.date).getMonth() === new Date().getMonth())
              .reduce((sum, e) => sum + e.amount, 0)
              .toFixed(2)}
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-red-500" />
              <h3 className="font-semibold">Monthly Expenses</h3>
            </div>
          </div>
          <p className="text-2xl font-bold text-red-500">
            -${entries
              .filter(e => e.type === 'expense' && new Date(e.date).getMonth() === new Date().getMonth())
              .reduce((sum, e) => sum + e.amount, 0)
              .toFixed(2)}
          </p>
        </div>
      </div>

      {activeTab === 'overview' && (
        <AccountsOverview accounts={accounts} onAddAccount={onAddAccount} />
      )}

      {activeTab === 'transactions' && (
        <>
          <AddTransaction onAdd={onAddTransaction} accounts={accounts} />
          <TransactionList entries={entries} />
        </>
      )}

      {activeTab === 'calendar' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Calendar View Coming Soon</h2>
        </div>
      )}
    </div>
  );
}