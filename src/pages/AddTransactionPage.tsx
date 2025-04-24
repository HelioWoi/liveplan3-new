import { useState, useEffect } from 'react';
import { ArrowLeft, MoreVertical, Minus, Plus, ChevronDown, Check, Plus as PlusIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames';
import { useTransactionStore } from '../stores/transactionStore';

interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  isCustom?: boolean;
}

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'salary', name: 'Salary', type: 'income' },
  { id: 'freelance', name: 'Freelance', type: 'income' },
  { id: 'investments', name: 'Investments', type: 'income' },
  { id: 'rent', name: 'Rent', type: 'expense' },
  { id: 'groceries', name: 'Groceries', type: 'expense' },
  { id: 'utilities', name: 'Utilities', type: 'expense' },
  { id: 'transport', name: 'Transport', type: 'expense' },
  { id: 'entertainment', name: 'Entertainment', type: 'expense' },
];

export default function AddTransactionPage() {
  const navigate = useNavigate();
  const { addTransaction } = useTransactionStore();
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState<string>('0.00');
  const [category, setCategory] = useState<Category | null>(null);
  const [description, setDescription] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);

  // Format amount with 2 decimal places
  useEffect(() => {
    if (amount !== '0.00') {
      const formatted = parseFloat(amount).toFixed(2);
      if (formatted !== amount) {
        setAmount(formatted);
      }
    }
  }, [amount]);

  const handleAmountChange = (value: number) => {
    const currentAmount = parseFloat(amount);
    const newAmount = Math.max(0, Math.min(currentAmount + value, 999.99));
    setAmount(newAmount.toFixed(2));
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setAmount(value.toFixed(2));
  };

  const handleAddNewCategory = () => {
    if (newCategoryName.trim()) {
      const newCategory: Category = {
        id: `custom-${Date.now()}`,
        name: newCategoryName.trim(),
        type,
        isCustom: true,
      };
      setCategories([...categories, newCategory]);
      setCategory(newCategory);
      setNewCategoryName('');
      setShowNewCategoryModal(false);
    }
  };

  const handleProceed = async () => {
    if (!category || !description.trim() || parseFloat(amount) === 0) {
      return;
    }

    try {
      await addTransaction({
        amount: parseFloat(amount),
        category: category.name.toLowerCase(),
        description: description.trim(),
        type,
        date: new Date().toISOString(),
        userId: 'current-user', // Replace with actual user ID
      });
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Failed to add transaction:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#120B39] text-white">
      {/* Header with safe area padding */}
      <div className="px-4 pt-12 pb-6 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-2xl font-bold">{type === 'income' ? 'Income' : 'Expense'}</h1>
        <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <MoreVertical className="h-6 w-6" />
        </button>
      </div>

      {/* Type Selector */}
      <div className="px-4 mb-6">
        <div className="bg-white/10 p-1 rounded-xl flex">
          {(['income', 'expense'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={classNames(
                'flex-1 py-3 rounded-lg font-medium transition-colors capitalize',
                type === t ? 'bg-white text-[#120B39]' : 'text-white/80'
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4">
        <div className="bg-white rounded-3xl p-6 text-gray-900">
          {/* Category Selector */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Choose a category
            </label>
            <div className="relative">
              <button
                className="w-full px-4 py-3 bg-gray-50 rounded-xl flex items-center justify-between border border-gray-200 focus:border-[#120B39] focus:ring-1 focus:ring-[#120B39] transition-colors"
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              >
                <span className="text-lg font-medium">
                  {category?.name || 'Select category'}
                </span>
                <ChevronDown className={`h-5 w-5 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {showCategoryDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 z-10 max-h-64 overflow-y-auto">
                  {categories
                    .filter(cat => cat.type === type)
                    .map((cat) => (
                      <button
                        key={cat.id}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl flex items-center justify-between"
                        onClick={() => {
                          setCategory(cat);
                          setShowCategoryDropdown(false);
                        }}
                      >
                        <span>{cat.name}</span>
                        {cat.isCustom && (
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                            Custom
                          </span>
                        )}
                      </button>
                    ))}
                  <button
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 text-[#120B39] font-medium flex items-center gap-2 border-t border-gray-100"
                    onClick={() => {
                      setShowCategoryDropdown(false);
                      setShowNewCategoryModal(true);
                    }}
                  >
                    <PlusIcon className="h-4 w-4" />
                    Add new category
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Description Input */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Description
            </label>
            <input
              type="text"
              placeholder={type === 'income' ? 'E.g. Photography' : 'E.g. Electric bill'}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 rounded-xl text-lg border border-gray-200 focus:border-[#120B39] focus:ring-1 focus:ring-[#120B39] transition-colors"
            />
          </div>

          {/* Amount Picker */}
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center gap-8 mb-6">
              <button
                onClick={() => handleAmountChange(-0.01)}
                className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <Minus className="h-6 w-6" />
              </button>
              <span className="text-4xl font-bold tracking-tight font-mono">
                ${amount}
              </span>
              <button
                onClick={() => handleAmountChange(0.01)}
                className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <Plus className="h-6 w-6" />
              </button>
            </div>

            {/* Slider */}
            <input
              type="range"
              min="0"
              max="999.99"
              step="0.01"
              value={amount}
              onChange={handleSliderChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />

            {/* Quick Amount Grid */}
            <div className="grid grid-cols-3 gap-3 mt-6">
              {[50, 100, 150, 200, 250, 300, 350, 400, 450].map((preset) => (
                <button
                  key={preset}
                  onClick={() => setAmount(preset.toFixed(2))}
                  className={classNames(
                    'py-3 rounded-xl font-medium transition-colors',
                    parseFloat(amount) === preset
                      ? 'bg-[#120B39] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  ${preset}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Buttons */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#120B39]">
        <button
          onClick={handleProceed}
          className="w-full bg-white text-[#120B39] rounded-full py-4 font-bold text-lg mb-3"
        >
          Proceed
        </button>
        <button
          onClick={() => navigate(-1)}
          className="w-full text-white/80 font-medium"
        >
          Cancel
        </button>
      </div>

      {/* New Category Modal */}
      {showNewCategoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md animate-slide-up">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Add New Category
            </h2>
            <input
              type="text"
              placeholder="Category name"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 rounded-xl text-lg border border-gray-200 focus:border-[#120B39] focus:ring-1 focus:ring-[#120B39] mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={handleAddNewCategory}
                className="flex-1 bg-[#120B39] text-white rounded-xl py-3 font-medium"
              >
                Add Category
              </button>
              <button
                onClick={() => setShowNewCategoryModal(false)}
                className="flex-1 border border-gray-200 rounded-xl py-3 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md text-center animate-slide-up">
            <div className="w-20 h-20 bg-[#120B39] rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Transaction Added
            </h2>
            <p className="text-gray-600 mb-8">
              The entry has been recorded successfully
            </p>
            <button
              onClick={() => navigate(-1)}
              className="w-full bg-[#120B39] text-white rounded-full py-4 font-bold text-lg"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}