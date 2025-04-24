import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTransactionStore } from '../../stores/transactionStore';
import { Briefcase, Pin, Receipt } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export default function ExpenseCategories() {
  const { transactions } = useTransactionStore();
  const navigate = useNavigate();
  
  const categoryTotals = useMemo(() => {
    return transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);
  }, [transactions]);

  const categories = [
    {
      id: 'extras',
      name: 'Extras',
      description: 'Discretionary spend',
      icon: Briefcase,
      amount: categoryTotals['Extra'] || 0,
      iconBg: 'bg-[#FFF7ED]',
      iconColor: 'text-[#EA580C]',
    },
    {
      id: 'additional',
      name: 'Additional',
      description: 'Other expenses',
      icon: Pin,
      amount: categoryTotals['Additional'] || 0,
      iconBg: 'bg-[#FDF2F8]',
      iconColor: 'text-[#BE185D]',
    },
    {
      id: 'tax',
      name: 'Tax',
      description: 'Other expenses',
      icon: Receipt,
      amount: categoryTotals['Tax'] || 0,
      iconBg: 'bg-[#FDF2F8]',
      iconColor: 'text-[#BE185D]',
    },
  ];

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-4">Expense Categories</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {categories.map((category) => (
          <div
            key={category.id}
            onClick={() => navigate(`/report/${category.id}`)}
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-12 h-12 rounded-full ${category.iconBg} flex items-center justify-center`}>
                <category.icon className={`h-6 w-6 ${category.iconColor}`} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{category.name}</h3>
                <p className="text-sm text-gray-500">{category.description}</p>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              ${category.amount.toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}