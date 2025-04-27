import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Plus, Bell, ArrowUpCircle, ArrowDownCircle, ChevronDown, X, ArrowLeft, Download } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import BottomNavigation from '../components/layout/BottomNavigation';
import classNames from 'classnames';
import { format, differenceInDays, addMonths, isBefore } from 'date-fns';
import { formatCurrency } from '../utils/formatters';

interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  frequency: 'one-time' | 'monthly' | 'quarterly';
  category: string;
  isPaid: boolean;
  paidOn?: string;
  paymentMethod?: string;
  notes?: string;
}

const DEMO_BILLS: Bill[] = [
  {
    id: '1',
    name: 'Insurance',
    amount: 150,
    dueDate: '2025-04-20',
    frequency: 'monthly',
    category: 'utilities',
    isPaid: false
  },
  {
    id: '2',
    name: 'Netflix',
    amount: 19.99,
    dueDate: '2025-04-24',
    frequency: 'monthly',
    category: 'entertainment',
    isPaid: false
  },
  {
    id: '3',
    name: 'Phone Plan',
    amount: 60,
    dueDate: '2025-04-28',
    frequency: 'monthly',
    category: 'utilities',
    isPaid: true,
    paidOn: '2025-04-15',
    paymentMethod: 'Credit Card'
  },
  {
    id: '4',
    name: 'Gym Membership',
    amount: 45,
    dueDate: '2025-04-30',
    frequency: 'monthly',
    category: 'health',
    isPaid: false
  },
  {
    id: '5',
    name: 'Car Insurance',
    amount: 150,
    dueDate: '2025-05-15',
    frequency: 'quarterly',
    category: 'insurance',
    isPaid: false
  }
];

const CATEGORIES = [
  { value: 'utilities', label: 'Utilities' },
  { value: 'rent', label: 'Rent/Mortgage' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'health', label: 'Health & Fitness' },
  { value: 'other', label: 'Other' }
];

type Period = 'day' | 'week' | 'month' | 'year';
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const years = ['2022', '2023', '2024', '2025'];

export default function BillsPage() {
  const navigate = useNavigate();
  const [bills, setBills] = useState<Bill[]>(DEMO_BILLS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPaidBills, setShowPaidBills] = useState(false);
  const [selectedPeriod, setPeriod] = useState<Period>('month');
  const [selectedMonth, setSelectedMonth] = useState('April');
  const [selectedYear, setSelectedYear] = useState('2025');
  
  // New bill form state
  const [newBill, setNewBill] = useState({
    name: '',
    amount: '',
    dueDate: format(new Date(), 'yyyy-MM-dd'),
    frequency: 'monthly' as const,
    category: '',
    notes: '',
    paymentMethod: ''
  });

  const upcomingBills = bills.filter(bill => !bill.isPaid);
  const paidBills = bills.filter(bill => bill.isPaid);

  const getDueDateStatus = (dueDate: string) => {
    const days = differenceInDays(new Date(dueDate), new Date());
    if (days > 7) return 'success';
    if (days > 3) return 'warning';
    return 'error';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-success-50 border-l-success-500 text-success-700';
      case 'warning':
        return 'bg-warning-50 border-l-warning-500 text-warning-700';
      case 'error':
        return 'bg-error-50 border-l-error-500 text-error-700';
      default:
        return 'bg-gray-50 border-l-gray-500 text-gray-700';
    }
  };

  const handleAddBill = () => {
    if (!newBill.name || !newBill.amount || !newBill.category) return;

    const bill: Bill = {
      id: Date.now().toString(),
      name: newBill.name,
      amount: parseFloat(newBill.amount),
      dueDate: newBill.dueDate,
      frequency: newBill.frequency,
      category: newBill.category,
      isPaid: false,
      notes: newBill.notes,
      paymentMethod: newBill.paymentMethod
    };

    setBills(prev => [...prev, bill]);
    setShowAddModal(false);
    setNewBill({
      name: '',
      amount: '',
      dueDate: format(new Date(), 'yyyy-MM-dd'),
      frequency: 'monthly',
      category: '',
      notes: '',
      paymentMethod: ''
    });
  };

  const handlePayBill = (billId: string) => {
    setBills(prev => prev.map(bill => 
      bill.id === billId
        ? {
            ...bill,
            isPaid: true,
            paidOn: format(new Date(), 'yyyy-MM-dd'),
            paymentMethod: 'Credit Card'
          }
        : bill
    ));
  };

  const totalDueThisMonth = upcomingBills.reduce((sum, bill) => {
    const dueDate = new Date(bill.dueDate);
    const monthStart = new Date();
    monthStart.setDate(1);
    const monthEnd = addMonths(monthStart, 1);
    
    if (isBefore(dueDate, monthEnd) && !bill.isPaid) {
      return sum + bill.amount;
    }
    return sum;
  }, 0);

  const totalPaid = paidBills.reduce((sum, bill) => sum + bill.amount, 0);

  const exportToCSV = () => {
    const headers = ['Name', 'Amount', 'Due Date', 'Frequency', 'Category', 'Status', 'Payment Date', 'Payment Method'];
    const csvContent = [
      headers.join(','),
      ...bills.map(bill => [
        bill.name,
        bill.amount,
        bill.dueDate,
        bill.frequency,
        bill.category,
        bill.isPaid ? 'Paid' : 'Pending',
        bill.paidOn || '',
        bill.paymentMethod || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `bills_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
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
              <h1 className="text-2xl font-bold">Bills</h1>
              <button className="p-2 hover:bg-white/10 rounded-full transition-colors relative">
                <Bell className="h-6 w-6" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex gap-2">
            <button 
              className="btn btn-primary flex-1 sm:flex-none"
              onClick={() => setShowAddModal(true)}
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Bill
            </button>
            <button 
              className="btn btn-outline flex-1 sm:flex-none"
              onClick={exportToCSV}
            >
              <Download className="h-5 w-5 mr-2" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Period Selection */}
        <div className="bg-white rounded-xl p-4 shadow-card mb-6">
          <div className="flex flex-col gap-4">
            <div className="flex gap-3 items-center flex-wrap">
              {(['day', 'week', 'month', 'year'] as Period[]).map((period) => (
                <button
                  key={period}
                  onClick={() => setPeriod(period)}
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
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-6 shadow-card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Due This Month</p>
                <p className="text-2xl font-bold text-primary-600">
                  {formatCurrency(totalDueThisMonth)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-success-100 flex items-center justify-center">
                <ArrowUpCircle className="h-6 w-6 text-success-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Paid</p>
                <p className="text-2xl font-bold text-success-600">
                  {formatCurrency(totalPaid)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-warning-100 flex items-center justify-center">
                <ArrowDownCircle className="h-6 w-6 text-warning-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Average Monthly</p>
                <p className="text-2xl font-bold text-warning-600">
                  {formatCurrency((totalDueThisMonth + totalPaid) / 2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Bills */}
        <div className="bg-white rounded-xl shadow-card overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Upcoming Bills</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
            {upcomingBills.map(bill => {
              const status = getDueDateStatus(bill.dueDate);
              return (
                <div
                  key={bill.id}
                  className={classNames(
                    'rounded-xl p-4 border-l-4 flex items-center justify-between',
                    getStatusColor(status)
                  )}
                >
                  <div>
                    <h3 className="font-semibold">{bill.name}</h3>
                    <p className="text-sm opacity-75">
                      Due {format(new Date(bill.dueDate), 'MMM d, yyyy')}
                    </p>
                    <p className="text-xs mt-1">
                      {bill.frequency.charAt(0).toUpperCase() + bill.frequency.slice(1)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{formatCurrency(bill.amount)}</p>
                    <button
                      onClick={() => handlePayBill(bill.id)}
                      className="text-sm text-primary-600 hover:text-primary-700"
                    >
                      Mark as Paid
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Paid Bills */}
        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          <div
            className="p-6 border-b border-gray-100 cursor-pointer"
            onClick={() => setShowPaidBills(!showPaidBills)}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Paid Bills</h2>
              <ChevronDown
                className={`h-5 w-5 transition-transform ${
                  showPaidBills ? 'rotate-180' : ''
                }`}
              />
            </div>
          </div>

          {showPaidBills && (
            <div className="divide-y divide-gray-100">
              {paidBills.map(bill => (
                <div
                  key={bill.id}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{bill.name}</h3>
                      <p className="text-sm text-gray-500">
                        Paid on {format(new Date(bill.paidOn!), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-success-600">
                        {formatCurrency(bill.amount)}
                      </p>
                      <p className="text-xs text-gray-500">{bill.paymentMethod}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Bill Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Add New Bill</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="label">Bill Name</label>
                <input
                  type="text"
                  className="input"
                  value={newBill.name}
                  onChange={(e) => setNewBill(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Electricity"
                />
              </div>

              <div>
                <label className="label">Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                  <input
                    type="text"
                    className="input pl-8"
                    placeholder="0.00"
                    value={newBill.amount}
                    onChange={e => setNewBill(prev => ({ ...prev, amount: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="label">Due Date</label>
                <input
                  type="date"
                  className="input"
                  value={newBill.dueDate}
                  onChange={e => setNewBill(prev => ({ ...prev, dueDate: e.target.value }))}
                />
              </div>

              <div>
                <label className="label">Frequency</label>
                <select
                  className="input"
                  value={newBill.frequency}
                  onChange={e => setNewBill(prev => ({ ...prev, frequency: e.target.value as 'one-time' | 'monthly' | 'quarterly' }))}
                >
                  <option value="one-time">One-time</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                </select>
              </div>

              <div>
                <label className="label">Category</label>
                <select
                  className="input"
                  value={newBill.category}
                  onChange={e => setNewBill(prev => ({ ...prev, category: e.target.value }))}
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Notes (Optional)</label>
                <textarea
                  className="input"
                  rows={3}
                  value={newBill.notes}
                  onChange={e => setNewBill(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Add any additional details..."
                />
              </div>

              <div>
                <label className="label">Payment Method (Optional)</label>
                <select
                  className="input"
                  value={newBill.paymentMethod}
                  onChange={e => setNewBill(prev => ({ ...prev, paymentMethod: e.target.value }))}
                >
                  <option value="">Select payment method</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>

              <button
                onClick={handleAddBill}
                className="btn btn-primary w-full"
              >
                Add Bill
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="btn btn-outline w-full"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNavigation />
    </div>
  );
}