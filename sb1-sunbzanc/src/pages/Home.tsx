import { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { Bell, ChevronRight, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import BottomNavigation from '../components/layout/BottomNavigation';
import classNames from 'classnames';
import UpcomingBills from '../components/home/UpcomingBills';
import WeeklyBudget from '../components/home/WeeklyBudget';
import Formula3 from '../components/home/Formula3';
import TopGoals from '../components/home/TopGoals';

type Period = 'day' | 'week' | 'month' | 'year';

const formula3Data = {
  fixed: {
    current: 1637.50,
    target: 3275.00,
    percentage: 35.0 // Above 33.2%, will show green
  },
  variable: {
    current: 150.00,
    target: 1965.00,
    percentage: 7.6 // Below 10%, will show red
  },
  investments: {
    current: 170.00,
    target: 1310.00,
    percentage: 13.0 // Between 6.6% and 13.2%, will show yellow
  }
};

export default function Home() {
  const { user } = useAuthStore();
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('week');

  const periodData = {
    day: { income: 250.00, expenses: 180.50 },
    week: { income: 6550.00, expenses: 5259.80 },
    month: { income: 25000.00, expenses: 18500.00 },
    year: { income: 300000.00, expenses: 220000.00 },
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-[#1F2533] text-white px-4 py-6 rounded-b-[40px]">
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-gray-300 text-sm font-light">Welcome Back</p>
            <h1 className="text-2xl font-bold">{user?.user_metadata?.full_name || 'User'}</h1>
          </div>
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors relative">
            <Bell className="h-6 w-6" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>

        <div className="bg-white rounded-2xl p-6 text-gray-900">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-600 mb-2">Weekly Balance</p>
              <p className="text-3xl font-bold">$2,887.65</p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-4 gap-4">
          <Link to="/income" className="flex flex-col items-center">
            <div className="w-14 h-14 bg-[#E8E5FF] rounded-full flex items-center justify-center mb-2">
              <div className="w-6 h-6">
                <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMkw0IDhWMjBIMjBWOEwxMiAyWiIgc3Ryb2tlPSIjMUYyNTMzIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik0xMiAxNlYxME0xMiAxMEw5IDEzTTEyIDEwTDE1IDEzIiBzdHJva2U9IiMxRjI1MzMiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+" alt="Income" className="w-6 h-6" />
              </div>
            </div>
            <span className="text-xs text-white">Income</span>
          </Link>

          <Link to="/expenses" className="flex flex-col items-center">
            <div className="w-14 h-14 bg-[#E8E5FF] rounded-full flex items-center justify-center mb-2">
              <div className="w-6 h-6">
                <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMkM2LjQ4IDIgMiA2LjQ4IDIgMTJDMiAxNy41MiA2LjQ4IDIyIDEyIDIyQzE3LjUyIDIyIDIyIDE3LjUyIDIyIDEyQzIyIDYuNDggMTcuNTIgMiAxMiAyWk0xMiAyMEM3LjU4IDIwIDQgMTYuNDIgNCAxMkM0IDcuNTggNy41OCA0IDEyIDRDMTYuNDIgNCAyMCA3LjU4IDIwIDEyQzIwIDE2LjQyIDE2LjQyIDIwIDEyIDIwWiIgZmlsbD0iIzFGMjUzMyIvPjxwYXRoIGQ9Ik0xMyAxMkgxNyIgc3Ryb2tlPSIjMUYyNTMzIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjwvc3ZnPg==" alt="Expenses" className="w-6 h-6" />
              </div>
            </div>
            <span className="text-xs text-white">Expenses</span>
          </Link>

          <Link to="/transition" className="flex flex-col items-center">
            <div className="w-14 h-14 bg-[#E8E5FF] rounded-full flex items-center justify-center mb-2">
              <div className="w-6 h-6">
                <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNyAxMEwxMiA1TDE3IDEwTTcgMTRMMTIgMTlMMTcgMTQiIHN0cm9rZT0iIzFGMjUzMyIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48L3N2Zz4=" alt="Transition" className="w-6 h-6" />
              </div>
            </div>
            <span className="text-xs text-white">Transition</span>
          </Link>

          <Link to="/tax" className="flex flex-col items-center">
            <div className="w-14 h-14 bg-[#E8E5FF] rounded-full flex items-center justify-center mb-2">
              <div className="w-6 h-6">
                <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNOSA0SDVDMy44OTU0MyA0IDMgNC44OTU0MyAzIDZWMjBDMyAyMS4xMDQ2IDMuODk1NDMgMjIgNSAyMkgxOUMyMC4xMDQ2IDIyIDIxIDIxLjEwNDYgMjEgMjBWMTZNMTYgNEwxMiA4TTIxIDJMMTYgNE0yMSAyTDE5IDciIHN0cm9rZT0iIzFGMjUzMyIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48L3N2Zz4=" alt="Tax" className="w-6 h-6" />
              </div>
            </div>
            <span className="text-xs text-white">Tax</span>
          </Link>
        </div>
      </div>

      <div className="px-4 space-y-6 mt-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">LivePlan³ View</h2>
            <div className="flex bg-white rounded-lg shadow-sm">
              {(['day', 'week', 'month', 'year'] as Period[]).map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={classNames(
                    'px-3 py-1.5 text-sm font-medium capitalize transition-colors',
                    selectedPeriod === period
                      ? 'bg-primary-600 text-white rounded-lg'
                      : 'text-gray-600 hover:text-primary-600'
                  )}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-md">
              <h3 className="text-sm text-gray-500 mb-2">Total Income</h3>
              <p className="text-2xl font-bold text-success-600">
                ${periodData[selectedPeriod].income.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                All income in the period
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-md">
              <h3 className="text-sm text-gray-500 mb-2">Total Expenses</h3>
              <p className="text-2xl font-bold text-error-600">
                ${periodData[selectedPeriod].expenses.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                All expenses in the period
              </p>
            </div>
          </div>
        </div>

        <UpcomingBills />

        <Formula3 data={formula3Data} />

        <WeeklyBudget />

        <TopGoals />
      </div>

      <BottomNavigation />
    </div>
  );
}