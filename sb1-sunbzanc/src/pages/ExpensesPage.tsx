import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Calendar, ChevronRight, ArrowUpCircle, ArrowDownCircle, AlertTriangle, CheckCircle } from 'lucide-react';
import { useTransactionStore } from '../stores/transactionStore';
import { format, differenceInDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import BottomNavigation from '../components/layout/BottomNavigation';
import { formatCurrency } from '../utils/formatters';
import { TransactionCategory } from '../types/transaction';

interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  icon: string;
}

const upcomingBills: Bill[] = [
  {
    id: '1',
    name: 'Insurance',
    amount: 150,
    dueDate: '2025-05-15',
    icon: 'https://api.iconify.design/lucide:shield.svg'
  },
  {
    id: '2',
    name: 'Netflix',
    amount: 19.99,
    dueDate: '2025-05-01',
    icon: 'https://api.iconify.design/lucide:tv.svg'
  },
  {
    id: '3',
    name: 'Rent',
    amount: 1200,
    dueDate: '2025-05-05',
    icon: 'https://api.iconify.design/lucide:home.svg'
  },
  {
    id: '4',
    name: 'Phone',
    amount: 65,
    dueDate: '2025-05-10',
    icon: 'https://api.iconify.design/lucide:smartphone.svg'
  }
];

const CATEGORY_COLORS = {
  Fixed: '#047857',    // Green
  Variable: '#7C3AED', // Purple
  Extra: '#F59E0B',    // Orange
  Additional: '#EC4899', // Pink
  Tax: '#6B7280',      // Gray
};

export default function ExpensesPage() {
  const navigate = useNavigate();
  const { transactions } = useTransactionStore();

  // Calculate expenses for different periods
  const periodExpenses = useMemo(() => {
    const now = new Date();
    
    // Weekly
    const weekStart = startOfWeek(now);
    const weekEnd = endOfWeek(now);
    const weeklyExpenses = transactions
      .filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate >= weekStart && transactionDate <= weekEnd;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    // Monthly
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const monthlyExpenses = transactions
      .filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate >= monthStart && transactionDate <= monthEnd;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    // Yearly
    const yearStart = startOfYear(now);
    const yearEnd = endOfYear(now);
    const yearlyExpenses = transactions
      .filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate >= yearStart && transactionDate <= yearEnd;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      weekly: weeklyExpenses,
      monthly: monthlyExpenses,
      yearly: yearlyExpenses,
    };
  }, [transactions]);

  // Calculate expense distribution
  const expensesByCategory = useMemo(() => {
    const categories = ['Fixed', 'Variable', 'Extra', 'Additional', 'Tax'] as TransactionCategory[];
    const totals = categories.reduce((acc, category) => {
      acc[category] = transactions
        .filter(t => t.category === category)
        .reduce((sum, t) => sum + t.amount, 0);
      return acc;
    }, {} as Record<string, number>);

    const totalExpenses = Object.values(totals).reduce((sum, amount) => sum + amount, 0);

    return categories.map(category => ({
      name: category,
      value: totals[category],
      percentage: totalExpenses > 0 ? (totals[category] / totalExpenses) * 100 : 0,
      color: CATEGORY_COLORS[category],
    }));
  }, [transactions]);

  const getBillStatusColor = (dueDate: string) => {
    const daysUntilDue = differenceInDays(new Date(dueDate), new Date());
    if (daysUntilDue > 13) return 'bg-[#E6F4EA] border-l-[#34D399]';
    if (daysUntilDue > 6) return 'bg-[#FFF8E1] border-l-[#F59E0B]';
    return 'bg-[#FFEAEA] border-l-[#EF4444]';
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-[#120B39] text-white">
        <div className="relative">
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-[#120B39] rounded-b-[40px]"></div>
          <div className="relative px-4 pt-12 pb-6">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <h1 className="text-2xl font-bold">Expenses Overview</h1>
              <button className="p-2 hover:bg-white/10 rounded-full transition-colors relative">
                <Bell className="h-6 w-6" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 space-y-8 mt-6">
        {/* Period Summaries */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Weekly Summary */}
          <div className="bg-white rounded-xl p-6 shadow-card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Weekly</h2>
                <p className="text-2xl font-bold text-primary-600 mt-1">
                  {formatCurrency(periodExpenses.weekly)}
                </p>
              </div>
            </div>
          </div>

          {/* Monthly Summary */}
          <div className="bg-white rounded-xl p-6 shadow-card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-secondary-100 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-secondary-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Monthly</h2>
                <p className="text-2xl font-bold text-secondary-600 mt-1">
                  {formatCurrency(periodExpenses.monthly)}
                </p>
              </div>
            </div>
          </div>

          {/* Annual Summary */}
          <div className="bg-white rounded-xl p-6 shadow-card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-accent-100 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-accent-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Annual</h2>
                <p className="text-2xl font-bold text-accent-600 mt-1">
                  {formatCurrency(periodExpenses.yearly)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Expense Distribution Chart */}
        <div className="bg-white rounded-xl p-6 shadow-card">
          <h2 className="text-xl font-bold mb-6">Expense Distribution</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expensesByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {expensesByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => formatCurrency(Number(value))}
                  contentStyle={{ background: 'white', border: 'none', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value, entry: any) => (
                    <span className="text-sm">
                      {value} ({entry.payload.percentage.toFixed(1)}%)
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Upcoming Bills */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Upcoming Bills</h2>
            <button 
              onClick={() => navigate('/bills')}
              className="text-primary-600 hover:text-primary-700 font-medium flex items-center"
            >
              See All Bills <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingBills.map(bill => (
              <div
                key={bill.id}
                className={`relative rounded-xl p-4 bg-white shadow-md overflow-hidden border-l-4 ${getBillStatusColor(
                  bill.dueDate
                )}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#EAE6FE] flex items-center justify-center">
                    <img src={bill.icon} alt={bill.name} className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{bill.name}</h3>
                    <p className="text-gray-500 text-sm">
                      Due {format(new Date(bill.dueDate), 'MMM d')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">${bill.amount}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <BottomNavigation />
    </div>
  );
}