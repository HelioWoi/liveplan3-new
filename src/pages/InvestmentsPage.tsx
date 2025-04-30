import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTransactionStore } from '../stores/transactionStore';
import { ArrowLeft, Bell, Calendar, ChevronRight, ArrowUpCircle, ArrowDownCircle, PlusCircle, Download, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import BottomNavigation from '../components/layout/BottomNavigation';
import { formatCurrency } from '../utils/formatters';
import classNames from 'classnames';

type Period = 'day' | 'week' | 'month' | 'year';
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const years = ['2022', '2023', '2024', '2025'];

export function InvestmentsPage() {
  const navigate = useNavigate();
  const { transactions } = useTransactionStore();
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('month');
  const [selectedMonth, setSelectedMonth] = useState('April');
  const [selectedYear, setSelectedYear] = useState('2025');
  const [showAddModal, setShowAddModal] = useState(false);

  // Filter investment transactions
  const investments = transactions.filter(t => t.category === 'Investimento');

  // Calculate total invested
  const totalInvested = investments.reduce((sum, t) => sum + t.amount, 0);

  // Sample data for the trend chart
  const trendData = investments.map(t => ({
    date: format(new Date(t.date), 'MMM d'),
    amount: t.amount
  })).slice(-6);

  // Calculate monthly returns (sample data)
  const monthlyReturns = [
    { month: 'Jan', return: 5.2 },
    { month: 'Feb', return: 4.8 },
    { month: 'Mar', return: -2.1 },
    { month: 'Apr', return: 6.3 },
    { month: 'May', return: 3.9 },
    { month: 'Jun', return: 4.5 },
  ];

  // Portfolio distribution (sample data)
  const portfolioData = [
    { name: 'Stocks', value: 45 },
    { name: 'Bonds', value: 25 },
    { name: 'Real Estate', value: 15 },
    { name: 'Crypto', value: 10 },
    { name: 'Cash', value: 5 },
  ];

  const COLORS = ['#4F46E5', '#10B981', '#7C3AED', '#F59E0B', '#EC4899'];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#334155] text-white">
        <div className="relative">
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#334155] rounded-b-[40px]"></div>
          <div className="relative px-4 pt-12 pb-6">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <h1 className="text-2xl font-bold">Investment Portfolio</h1>
              <button className="p-2 hover:bg-white/10 rounded-full transition-colors relative">
                <Bell className="h-6 w-6" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 space-y-6 mt-6">
        {/* Period Selection */}
        <div className="flex flex-col gap-4">
          <div className="flex gap-3 items-center flex-wrap">
            {(['day', 'week', 'month', 'year'] as Period[]).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={classNames(
                  'px-4 py-1 rounded-full text-sm font-medium border',
                  selectedPeriod === period
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'text-gray-700 border-gray-300 hover:border-purple-300'
                )}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>

          {selectedPeriod === 'month' && (
            <div className="flex flex-wrap gap-2">
              {months.map(month => (
                <button
                  key={month}
                  onClick={() => setSelectedMonth(month)}
                  className={classNames(
                    'px-3 py-1 rounded-md text-sm border',
                    selectedMonth === month ? 'bg-purple-500 text-white border-purple-600' : 'text-gray-700 border-gray-300'
                  )}
                >
                  {month}
                </button>
              ))}
            </div>
          )}

          {selectedPeriod === 'year' && (
            <div className="flex flex-wrap gap-2">
              {years.map(year => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={classNames(
                    'px-3 py-1 rounded-md text-sm border',
                    selectedYear === year ? 'bg-purple-500 text-white border-purple-600' : 'text-gray-700 border-gray-300'
                  )}
                >
                  {year}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-6 shadow-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                <ArrowUpCircle className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Invested</p>
                <p className="text-2xl font-bold text-primary-600">{formatCurrency(totalInvested)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-success-100 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-success-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Returns</p>
                <p className="text-2xl font-bold text-success-600">+12.5%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-accent-100 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-accent-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Monthly Income</p>
                <p className="text-2xl font-bold text-accent-600">{formatCurrency(totalInvested * 0.01)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Portfolio Distribution */}
        <div className="bg-white rounded-xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Portfolio Distribution</h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn btn-primary"
            >
              <PlusCircle className="h-5 w-5 mr-2" />
              Add Investment
            </button>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={portfolioData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {portfolioData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Returns Chart */}
        <div className="bg-white rounded-xl p-6 shadow-card">
          <h2 className="text-xl font-bold mb-6">Monthly Returns</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyReturns}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `${value}%`} />
                <Tooltip formatter={(value) => `${value}%`} />
                <Line 
                  type="monotone" 
                  dataKey="return" 
                  stroke="#4F46E5" 
                  strokeWidth={2}
                  dot={{ fill: '#4F46E5' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Investments */}
        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold">Recent Investments</h2>
          </div>

          <div className="divide-y divide-gray-100">
            {investments.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p>No investments recorded</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="btn btn-primary mt-4"
                >
                  <PlusCircle className="h-5 w-5 mr-2" />
                  Make Your First Investment
                </button>
              </div>
            ) : (
              investments.map(investment => (
                <div key={investment.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <ArrowUpCircle className="h-5 w-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{investment.origin}</p>
                        <p className="text-sm text-gray-500">
                          {format(new Date(investment.date), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    <span className="font-medium text-primary-600">
                      {formatCurrency(investment.amount)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}
