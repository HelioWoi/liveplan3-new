import { useMemo } from 'react';
import { useTransactionStore } from '../../stores/transactionStore';
import { getCategoryForFormula } from '../../types/transaction';
import classNames from 'classnames';

interface BudgetProgressBarProps {
  category: 'fixed' | 'variable' | 'investment';
  totalIncome: number;
}

export default function BudgetProgressBar({ category, totalIncome }: BudgetProgressBarProps) {
  const { transactions } = useTransactionStore();
  
  const { targetPercentage, targetAmount, currentAmount, percentage, color } = useMemo(() => {
    const categoryPercentages = {
      fixed: 0.5, // 50%
      variable: 0.3, // 30%
      investment: 0.2, // 20%
    };

    const targetPercentage = categoryPercentages[category];
    const targetAmount = totalIncome * targetPercentage;
    
    const categoryExpenses = transactions
      .filter(t => getCategoryForFormula(t.category) === category && t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const percentage = targetAmount > 0 ? (categoryExpenses / targetAmount) * 100 : 0;
    
    // Color mapping based on percentage relative to target
    let color;
    if (category === 'investment') {
      // For investments, higher is better
      color = percentage < 80 ? 'warning' : 'success';
    } else {
      // For fixed and variable, lower is better
      color = percentage > 95 ? 'error' : percentage > 80 ? 'warning' : 'success';
    }
    
    return {
      targetPercentage: targetPercentage * 100,
      targetAmount,
      currentAmount: categoryExpenses,
      percentage: Math.min(percentage, 100), // Cap at 100% for display
      color,
    };
  }, [transactions, category, totalIncome]);

  const titleMap = {
    fixed: 'Fixed (50%)',
    variable: 'Variable (30%)',
    investment: 'Investment (20%)',
  };

  return (
    <div className="mb-5">
      <div className="flex justify-between mb-1">
        <h4 className="text-sm font-medium">{titleMap[category]}</h4>
        <span className="text-sm font-medium">
          ${currentAmount.toFixed(2)} / ${targetAmount.toFixed(2)}
        </span>
      </div>
      <div className="progress-bar">
        <div 
          className={classNames('progress-fill', {
            'bg-success-500': color === 'success',
            'bg-warning-500': color === 'warning',
            'bg-error-500': color === 'error',
          })}
          style={{ 
            width: `${percentage}%`,
            '--progress-width': `${percentage}%`
          } as React.CSSProperties}
        ></div>
      </div>
    </div>
  );
}