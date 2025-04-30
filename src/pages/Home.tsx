import { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { Bell, HomeIcon, Clock, BarChart2, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import BottomNavigation from '../components/layout/BottomNavigation';
import WeeklyBudget from '../components/home/WeeklyBudget';
import Formula3 from '../components/home/Formula3';
import TopGoals from '../components/home/TopGoals';
import UpcomingBills from '../components/home/UpcomingBills';
import { useTransactionStore } from '../stores/transactionStore';
import { formatCurrency } from '../utils/formatters';
import classNames from 'classnames';

export default function Home() {
  const { user } = useAuthStore();
  const { transactions } = useTransactionStore();
  
  // Calculate totals
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Modern Header */}
      <div className="bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#334155] text-white">
        <div className="px-4 pt-6 pb-8">
          {/* Top Bar */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-gray-400 text-sm">Welcome Back</p>
              <h1 className="text-2xl font-bold">{user?.user_metadata?.full_name || 'User'}</h1>
            </div>
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                LivePlan³
              </h2>
              <button className="p-2 hover:bg-white/10 rounded-full transition-colors relative">
                <Bell className="h-6 w-6" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>

          {/* Balance Card */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6">
            <p className="text-gray-400 mb-1">Weekly Balance</p>
            <p className="text-3xl font-bold">{formatCurrency(totalIncome - totalExpenses)}</p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-4 gap-4">
            <Link 
              to="/income" 
              className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-white/5 transition-colors"
            >
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                <HomeIcon className="h-6 w-6" />
              </div>
              <span className="text-sm">Income</span>
            </Link>

            <Link 
              to="/expenses" 
              className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-white/5 transition-colors"
            >
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                <Clock className="h-6 w-6" />
              </div>
              <span className="text-sm">Expenses</span>
            </Link>

            <Link 
              to="/investments" 
              className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-white/5 transition-colors"
            >
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                <BarChart2 className="h-6 w-6" />
              </div>
              <span className="text-sm">Investments</span>
            </Link>

            <Link 
              to="/statement" 
              className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-white/5 transition-colors"
            >
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                <FileText className="h-6 w-6" />
              </div>
              <span className="text-sm">Statement</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-6 mt-6">
        {/* Total Income/Expenses Section */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="text-sm text-gray-500 mb-1">Total Income</h3>
            <p className="text-xl font-bold">{formatCurrency(totalIncome)}</p>
            <p className="text-xs text-gray-500">All income in the period</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="text-sm text-gray-500 mb-1">Total Expenses</h3>
            <p className="text-xl font-bold">{formatCurrency(totalExpenses)}</p>
            <p className="text-xs text-gray-500">All expenses in the period</p>
          </div>
        </div>

        <WeeklyBudget />
        <UpcomingBills />
        <Formula3 data={{
          fixed: { current: 0, target: 0, percentage: 0 },
          variable: { current: 0, target: 0, percentage: 0 },
          investments: { current: 0, target: 0, percentage: 0 }
        }} />
        <TopGoals />
      </div>

      <BottomNavigation />
    </div>
  );
}
