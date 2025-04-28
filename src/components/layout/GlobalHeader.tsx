import { Bell } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { Link } from 'react-router-dom';
import { useTransactionStore } from '../../stores/transactionStore';
import { formatCurrency } from '../../utils/formatters';

export default function GlobalHeader() {
  const { user } = useAuthStore();
  const { transactions } = useTransactionStore();

  // Calculate balance
  const balance = transactions.reduce((sum, t) => {
    if (t.type === 'income') {
      return sum + t.amount;
    } else {
      return sum - t.amount;
    }
  }, 0);

  return (
    <div className="bg-[#1F2533] text-white">
      <div className="relative">
        {/* Header content */}
        <div className="relative px-4 pt-6 pb-8">
          {/* Top Bar */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-gray-400 text-sm">Welcome Back</p>
              <h1 className="text-2xl font-bold">{user?.user_metadata?.full_name || 'User'}</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <img src="/logo.svg" alt="LivePlan³" className="h-8" />
              </div>
              <button className="p-2 hover:bg-white/10 rounded-full transition-colors relative">
                <Bell className="h-6 w-6" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>

          {/* Balance Card */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6">
            <p className="text-gray-400 mb-1">Weekly Balance</p>
            <p className="text-3xl font-bold">{formatCurrency(balance)}</p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-4 gap-4">
            <Link 
              to="/income" 
              className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-white/5 transition-colors"
            >
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                <div className="w-6 h-6">
                  <img src="/income-icon.png" alt="Income" className="w-6 h-6" />
                </div>
              </div>
              <span className="text-sm">Income</span>
            </Link>

            <Link 
              to="/expenses" 
              className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-white/5 transition-colors"
            >
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                <div className="w-6 h-6">
                  <img src="/expense-icon.png" alt="Expenses" className="w-6 h-6" />
                </div>
              </div>
              <span className="text-sm">Expenses</span>
            </Link>

            <Link 
              to="/variables" 
              className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-white/5 transition-colors"
            >
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                <div className="w-6 h-6">
                  <img src="/variable-icon.png" alt="Variables" className="w-6 h-6" />
                </div>
              </div>
              <span className="text-sm">Variables</span>
            </Link>

            <Link 
              to="/statement" 
              className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-white/5 transition-colors"
            >
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                <div className="w-6 h-6">
                  <img src="/statement-icon.png" alt="Statement" className="w-6 h-6" />
                </div>
              </div>
              <span className="text-sm">Statement</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}