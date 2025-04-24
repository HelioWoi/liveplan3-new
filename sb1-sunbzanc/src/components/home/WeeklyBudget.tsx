import { useMemo } from 'react';
import { format, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';

interface WeeklyData {
  week: string;
  income: number;
  investimento: number;
  fixed: number;
  variable: number;
  extra: number;
  additional: number;
  tax: number;
}

const weeklyBudget: WeeklyData[] = [
  { 
    week: 'WEEK 1', 
    income: 2000,
    investimento: 400,
    fixed: 800, 
    variable: 300, 
    extra: 100, 
    additional: 200,
    tax: 200
  },
  { 
    week: 'WEEK 2', 
    income: 2000,
    investimento: 400,
    fixed: 800, 
    variable: 400, 
    extra: 150, 
    additional: 150,
    tax: 200
  },
  { 
    week: 'WEEK 3', 
    income: 2000,
    investimento: 400,
    fixed: 800, 
    variable: 350, 
    extra: 50, 
    additional: 300,
    tax: 200
  },
  { 
    week: 'WEEK 4', 
    income: 2000,
    investimento: 400,
    fixed: 800, 
    variable: 450, 
    extra: 200, 
    additional: 50,
    tax: 200
  },
];

export default function WeeklyBudget() {
  const totals = useMemo(() => {
    return weeklyBudget.map(week => {
      const total = week.income - week.investimento - week.fixed - week.variable - week.extra - week.additional - week.tax;
      return total;
    });
  }, []);

  // Determine current week (1-4)
  const currentWeek = useMemo(() => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const dayOfMonth = today.getDate();
    
    if (dayOfMonth <= 7) return 'WEEK 1';
    if (dayOfMonth <= 14) return 'WEEK 2';
    if (dayOfMonth <= 21) return 'WEEK 3';
    return 'WEEK 4';
  }, []);

  return (
    <div className="bg-white rounded-xl p-4 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr>
              <th className="text-left py-3 px-4 text-[#1A1A80] text-sm font-medium bg-[#F8F9FF]">
                Category
              </th>
              {weeklyBudget.map((week) => (
                <th 
                  key={week.week} 
                  className="relative text-right py-3 px-4 text-[#1A1A80] text-sm font-medium bg-[#F8F9FF]"
                >
                  {week.week === currentWeek && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-primary-500"></div>
                  )}
                  <div className="flex items-center justify-end gap-2">
                    {week.week}
                    {week.week === currentWeek && (
                      <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium bg-primary-100 text-primary-800 rounded-full">
                        Current
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { key: 'income', label: 'Income' },
              { key: 'investimento', label: 'Investment' },
              { key: 'fixed', label: 'Fixed' },
              { key: 'variable', label: 'Variable' },
              { key: 'extra', label: 'Extra' },
              { key: 'additional', label: 'Additional' },
              { key: 'tax', label: 'Tax' }
            ].map(({ key, label }, index) => (
              <tr 
                key={key}
                className={index % 2 === 0 ? 'bg-[#FAFBFF]' : 'bg-white'}
              >
                <td className="py-3 px-4 text-sm font-medium text-[#1A1A80]">
                  {label}
                </td>
                {weeklyBudget.map((week) => (
                  <td 
                    key={`${week.week}-${key}`} 
                    className={`text-right py-3 px-4 text-sm text-[#1A1A80] ${
                      week.week === currentWeek ? 'bg-primary-50/50' : ''
                    }`}
                  >
                    ${week[key as keyof WeeklyData].toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </td>
                ))}
              </tr>
            ))}
            <tr className="border-t-2 border-[#E5E7FF]">
              <td className="py-3 px-4 text-sm font-bold text-[#1A1A80]">
                Balance
              </td>
              {totals.map((total, index) => (
                <td 
                  key={`total-${index}`} 
                  className={`text-right py-3 px-4 text-sm font-bold ${
                    weeklyBudget[index].week === currentWeek ? 'bg-primary-50/50' : ''
                  } ${
                    total >= 0 ? 'text-[#00A389]' : 'text-[#FF3B3B]'
                  }`}
                >
                  ${total.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}