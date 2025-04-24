import { useState } from 'react';
import { useTransactionStore, Transaction } from '../../stores/transactionStore';
import { format } from 'date-fns';
import { ArrowDownCircle, ArrowUpCircle, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function RecentTransactions() {
  const { transactions } = useTransactionStore();
  const [limit, setLimit] = useState(5);
  
  const sortedTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);

  const getCategoryBadgeClass = (category: string) => {
    const baseClass = 'text-xs font-medium px-2 py-1 rounded';
    switch (category) {
      case 'needs':
        return `${baseClass} bg-secondary-100 text-secondary-800`;
      case 'wants':
        return `${baseClass} bg-accent-100 text-accent-800`;
      case 'savings':
        return `${baseClass} bg-primary-100 text-primary-800`;
      default:
        return `${baseClass} bg-gray-100 text-gray-800`;
    }
  };

  return (
    <div className="card animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">Recent Transactions</h3>
        <Link to="/transactions" className="text-primary-600 hover:text-primary-800 text-sm font-medium flex items-center">
          View All <ChevronRight size={16} />
        </Link>
      </div>
      
      <div className="space-y-4">
        {sortedTransactions.map((transaction) => (
          <div 
            key={transaction.id} 
            className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center">
              {transaction.type === 'income' ? (
                <ArrowUpCircle className="h-10 w-10 text-success-500 mr-3" />
              ) : (
                <ArrowDownCircle className="h-10 w-10 text-error-500 mr-3" />
              )}
              <div>
                <p className="font-medium">{transaction.description}</p>
                <p className="text-sm text-gray-500">
                  {format(new Date(transaction.date), 'MMM d, yyyy')}
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <span className={getCategoryBadgeClass(transaction.category)}>
                {transaction.category.charAt(0).toUpperCase() + transaction.category.slice(1)}
              </span>
              <span className={`ml-4 font-semibold ${
                transaction.type === 'income' ? 'text-success-600' : 'text-error-600'
              }`}>
                {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
              </span>
            </div>
          </div>
        ))}
        
        {sortedTransactions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No transactions found</p>
          </div>
        )}
        
        {transactions.length > limit && (
          <button
            className="w-full py-2 text-sm font-medium text-primary-600 hover:text-primary-800 border border-gray-200 rounded-lg"
            onClick={() => setLimit(prev => prev + 5)}
          >
            Load More
          </button>
        )}
      </div>
    </div>
  );
}