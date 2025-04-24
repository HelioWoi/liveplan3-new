import { useMemo } from 'react';
import { useTransactionStore } from '../../stores/transactionStore';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function BudgetSummary() {
  const { transactions } = useTransactionStore();
  
  const { data, totalSpent, totalIncome, balance } = useMemo(() => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const needsSpent = transactions
      .filter(t => t.category === 'needs' && t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const wantsSpent = transactions
      .filter(t => t.category === 'wants' && t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const savingsSpent = transactions
      .filter(t => t.category === 'savings' && t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalSpent = needsSpent + wantsSpent + savingsSpent;
    
    const data = [
      { name: 'Needs', value: needsSpent, color: '#047857' },
      { name: 'Wants', value: wantsSpent, color: '#7C3AED' },
      { name: 'Savings', value: savingsSpent, color: '#1E40AF' },
    ];
    
    return {
      data,
      totalSpent,
      totalIncome: income,
      balance: income - totalSpent,
    };
  }, [transactions]);

  return (
    <div className="card animate-fade-in">
      <h3 className="text-xl font-semibold mb-4">Budget Summary</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-primary-50 rounded-lg p-4">
          <p className="text-primary-600 text-sm font-medium">Total Income</p>
          <p className="text-2xl font-bold">${totalIncome.toFixed(2)}</p>
        </div>
        <div className="bg-secondary-50 rounded-lg p-4">
          <p className="text-secondary-600 text-sm font-medium">Total Spent</p>
          <p className="text-2xl font-bold">${totalSpent.toFixed(2)}</p>
        </div>
        <div className="bg-accent-50 rounded-lg p-4">
          <p className="text-accent-600 text-sm font-medium">Balance</p>
          <p className="text-2xl font-bold">${balance.toFixed(2)}</p>
        </div>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}