import { useState, useEffect } from 'react';
import { cn } from '../../utils/cn';
import { useSupabase } from '../../lib/supabase/SupabaseProvider';
import { useAuthStore } from '../../stores/authStore';
import { PlusCircle, X } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const years = ['2022', '2023', '2024', '2025'];
const categories = ['Income', 'Investment', 'Fixed', 'Variable', 'Extra', 'Additional'];

interface WeeklyEntry {
  id: string;
  month: string;
  week: number;
  year: number;
  category: string;
  description: string;
  amount: number;
}

interface BudgetData {
  [week: string]: {
    [category: string]: number;
  };
}

export default function WeeklyBudget() {
  const { supabase } = useSupabase();
  const { user } = useAuthStore();
  const [selectedPeriod, setPeriod] = useState('Month');
  const [selectedMonth, setSelectedMonth] = useState('April');
  const [selectedYear, setSelectedYear] = useState('2025');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [entries, setEntries] = useState<WeeklyEntry[]>([]);
  
  // Form state
  const [newEntry, setNewEntry] = useState({
    month: selectedMonth,
    week: 1,
    category: 'Extra',
    description: '',
    amount: '',
  });

  // Fetch entries when month/year changes
  useEffect(() => {
    if (!user) return;

    const fetchEntries = async () => {
      const { data, error } = await supabase
        .from('weekly_budget_entries')
        .select('*')
        .eq('user_id', user.id)
        .eq('month', selectedMonth)
        .eq('year', parseInt(selectedYear));

      if (error) {
        console.error('Error fetching entries:', error);
        return;
      }

      setEntries(data || []);
    };

    fetchEntries();
  }, [selectedMonth, selectedYear, user, supabase]);

  // Process entries into budget data
  const budgetData = entries.reduce((acc: BudgetData, entry) => {
    const weekKey = `Week ${entry.week}`;
    if (!acc[weekKey]) {
      acc[weekKey] = {};
    }
    if (!acc[weekKey][entry.category]) {
      acc[weekKey][entry.category] = 0;
    }
    acc[weekKey][entry.category] += entry.amount;
    return acc;
  }, {});

  const handleAddEntry = async () => {
    if (!user || !newEntry.description || !newEntry.amount) return;
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('weekly_budget_entries')
        .insert([{
          user_id: user.id,
          month: newEntry.month,
          week: newEntry.week,
          year: parseInt(selectedYear),
          category: newEntry.category,
          description: newEntry.description,
          amount: parseFloat(newEntry.amount),
        }]);

      if (error) throw error;

      // Refresh entries
      const { data: newEntries } = await supabase
        .from('weekly_budget_entries')
        .select('*')
        .eq('user_id', user.id)
        .eq('month', selectedMonth)
        .eq('year', parseInt(selectedYear));

      setEntries(newEntries || []);
      setShowAddModal(false);
      setNewEntry({
        month: selectedMonth,
        week: 1,
        category: 'Extra',
        description: '',
        amount: '',
      });
    } catch (error) {
      console.error('Error adding entry:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getBalance = (weekData: { [category: string]: number } = {}) => {
    const income = weekData['Income'] || 0;
    const expenses = Object.entries(weekData)
      .filter(([category]) => category !== 'Income')
      .reduce((sum, [_, amount]) => sum + amount, 0);
    return income - expenses;
  };

  const currentWeekIndex = new Date().getDate() <= 7 ? 0 : new Date().getDate() <= 14 ? 1 : new Date().getDate() <= 21 ? 2 : 3;

  return (
    <div>
      {/* Period Selection */}
      <div className="flex gap-3 mb-6 items-center flex-wrap">
        {['Day', 'Week', 'Month', 'Year'].map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={cn(
              'px-4 py-1 rounded-full text-sm font-medium border',
              selectedPeriod === p
                ? 'bg-purple-600 text-white border-purple-600'
                : 'text-gray-700 border-gray-300 hover:border-purple-300'
            )}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Month Buttons */}
      {selectedPeriod === 'Month' && (
        <div className="flex flex-wrap gap-2 mb-6">
          {months.map(month => (
            <button
              key={month}
              onClick={() => setSelectedMonth(month)}
              className={cn(
                'px-3 py-1 rounded-md text-sm border',
                selectedMonth === month ? 'bg-purple-500 text-white border-purple-600' : 'text-gray-700 border-gray-300'
              )}
            >
              {month}
            </button>
          ))}
        </div>
      )}

      {/* Year Buttons */}
      {selectedPeriod === 'Year' && (
        <div className="flex flex-wrap gap-2 mb-6">
          {years.map(year => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={cn(
                'px-3 py-1 rounded-md text-sm border',
                selectedYear === year ? 'bg-purple-500 text-white border-purple-600' : 'text-gray-700 border-gray-300'
              )}
            >
              {year}
            </button>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl p-4 shadow-sm overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left text-sm text-gray-700">
              <th className="p-3">Category</th>
              {weeks.map((week, i) => (
                <th key={week} className="p-3 relative">
                  <div className="flex items-center gap-2">
                    {week}
                    {i === currentWeekIndex && (
                      <span className="text-xs bg-purple-200 text-purple-800 px-2 py-0.5 rounded-full">Current</span>
                    )}
                  </div>
                </th>
              ))}
              <th className="p-3 text-right">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-1 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors text-sm font-medium"
                >
                  <PlusCircle className="h-4 w-4" />
                  Add New
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {categories.map(category => (
              <tr key={category} className="border-t border-gray-200 text-sm text-gray-900">
                <td className="p-3 font-medium">{category}</td>
                {weeks.map(week => (
                  <td key={week} className="p-3">
                    {formatCurrency(budgetData[week]?.[category] || 0)}
                  </td>
                ))}
                <td></td>
              </tr>
            ))}
            {/* Balance row */}
            <tr className="border-t-2 border-gray-300 font-bold">
              <td className="p-3">Balance</td>
              {weeks.map(week => {
                const balance = getBalance(budgetData[week]);
                const color = balance > 0 ? 'text-green-600' : balance < 0 ? 'text-red-500' : 'text-black';
                return (
                  <td key={week} className={cn("p-3", color)}>
                    {formatCurrency(balance)}
                  </td>
                );
              })}
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Add Entry Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Add New Entry</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                <select
                  className="input w-full"
                  value={newEntry.month}
                  onChange={(e) => setNewEntry({ ...newEntry, month: e.target.value })}
                >
                  {months.map(month => (
                    <option key={month} value={month}>{month}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Week</label>
                <select
                  className="input w-full"
                  value={newEntry.week}
                  onChange={(e) => setNewEntry({ ...newEntry, week: parseInt(e.target.value) })}
                >
                  {[1, 2, 3, 4].map(week => (
                    <option key={week} value={week}>Week {week}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  className="input w-full"
                  value={newEntry.category}
                  onChange={(e) => setNewEntry({ ...newEntry, category: e.target.value })}
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  className="input w-full"
                  placeholder="Enter description"
                  value={newEntry.description}
                  onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                  <input
                    type="text"
                    className="input w-full pl-8"
                    placeholder="0.00"
                    value={newEntry.amount}
                    onChange={(e) => setNewEntry({ ...newEntry, amount: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleAddEntry}
                  disabled={isSubmitting}
                  className="btn btn-primary flex-1"
                >
                  {isSubmitting ? 'Adding...' : 'Add Entry'}
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="btn btn-outline flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
