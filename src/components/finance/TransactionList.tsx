import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import type { FinanceEntry } from '../../types';

interface Props {
  entries: FinanceEntry[];
}

export default function TransactionList({ entries }: Props) {
  const sortedEntries = [...entries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>
        
        <div className="space-y-4">
          {sortedEntries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-full ${
                    entry.type === 'income' ? 'bg-green-50' : 'bg-red-50'
                  }`}
                >
                  {entry.type === 'income' ? (
                    <ArrowUpRight className="w-5 h-5 text-green-500" />
                  ) : (
                    <ArrowDownRight className="w-5 h-5 text-red-500" />
                  )}
                </div>
                <div>
                  <h3 className="font-medium">{entry.description}</h3>
                  <p className="text-sm text-gray-500">{entry.category}</p>
                </div>
              </div>
              <div className="text-right">
                <p
                  className={`text-lg font-semibold ${
                    entry.type === 'income' ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  {entry.type === 'income' ? '+' : '-'}${entry.amount.toFixed(2)}
                </p>
                <p className="text-sm text-gray-500">{entry.account}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}