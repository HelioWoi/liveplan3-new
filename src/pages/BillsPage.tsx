import { useState } from 'react';
import { format, differenceInDays, addMonths, isBefore } from 'date-fns';
import { Calendar, Plus, Bell, ArrowUpCircle, ArrowDownCircle, ChevronDown, X } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import BottomNavigation from '../components/layout/BottomNavigation';
import classNames from 'classnames';

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
}

const DEMO_BILLS: Bill[] = [
  {
    id: '1',
    name: 'Electricity',
    amount: 120,
    dueDate: '2025-04-28',
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
    dueDate: '2025-04-15',
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

export default function BillsPage() {
  const [bills, setBills] = useState<Bill[]>(DEMO_BILLS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPaidBills, setShowPaidBills] = useState(false);
  
  // New bill form state
  const [newBill, setNewBill] = useState({
    name: '',
    amount: '',
    dueDate: format(new Date(), 'yyyy-MM-dd'),
    frequency: 'monthly' as const,
    category: ''
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
      isPaid: false
    };

    setBills(prev => [...prev, bill]);
    setShowAddModal(false);
    setNewBill({
      name: '',
      amount: '',
      dueDate: format(new Date(), 'yyyy-MM-dd'),
      frequency: 'monthly',
      category: ''
    });
  };

  const handlePayBill = (billId: string) => {
    setBills(prev => prev.map(bill => 
      bill.id === billId
        ? {
            ...bill,
            isPaid: true,
            paidOn: format(new Date(), 'yyyy-MM-dd'),
            paymentMethod: 'Credit Card' // This could be made dynamic
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

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <PageHeader title="Bills" />
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-6 shadow-card">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Due This Month</h3>
            <p className="text-2xl font-bold text-primary-600">
              ${totalDueThisMonth.toFixed(2)}
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-card">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Paid</h3>
            <p className="text-2xl font-bold text-success-600">
              ${totalPaid.toFixed(2)}
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-card">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Average Monthly</h3>
            <p className="text-2xl font-bold text-accent-600">
              ${((totalDueThisMonth + totalPaid) / 2).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Upcoming Bills */}
        <div className="bg-white rounded-xl shadow-card overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Upcoming Bills</h2>
              <button
                onClick={() => setShowAddModal(true)}
                className="btn btn-primary"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Bill
              </button>
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
                    <p className="text-lg font-bold">${bill.amount.toFixed(2)}</p>
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
                        ${bill.amount.toFixed(2)}
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
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bill Name
                </label>
                <input
                  type="text"
                  className="input"
                  value={newBill.name}
                  onChange={e => setNewBill(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Electricity"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                  <input
                    type="number"
                    className="input pl-8"
                    value={newBill.amount}
                    onChange={e => setNewBill(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    className="input"
                    value={newBill.dueDate}
                    onChange={e => setNewBill(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                  <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frequency
                </label>
                <select
                  className="input"
                  value={newBill.frequency}
                  onChange={e => setNewBill(prev => ({ ...prev, frequency: e.target.value as any }))}
                >
                  <option value="one-time">One-time</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
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

              <button
                onClick={handleAddBill}
                className="btn btn-primary w-full"
              >
                Add Bill
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNavigation />
    </div>
  );
}