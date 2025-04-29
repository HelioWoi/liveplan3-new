import { useState } from 'react';
import { cn } from '../../utils/cn';

const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const years = ['2022', '2023', '2024', '2025'];
const categories = ['Income', 'Investment', 'Fixed', 'Variable', 'Extra', 'Additional'];

const mockData = {
  'Week 1': { Income: 0, Investment: 0, Fixed: 0, Variable: 0, Extra: 0, Additional: 0 },
  'Week 2': { Income: 0, Investment: 0, Fixed: 0, Variable: 0, Extra: 0, Additional: 0 },
  'Week 3': { Income: 0, Investment: 0, Fixed: 0, Variable: 0, Extra: 0, Additional: 0 },
  'Week 4': { Income: 0, Investment: 0, Fixed: 0, Variable: 0, Extra: 0, Additional: 0 },
};

const getBalance = (data: any) => {
  const { Income = 0, Investment = 0, Fixed = 0, Variable = 0, Extra = 0, Additional = 0 } = data;
  return Income - (Investment + Fixed + Variable + Extra + Additional);
};

export default function WeeklyBudget() {
  const [selectedPeriod, setSelectedPeriod] = useState('Month');
  const [selectedMonth, setSelectedMonth] = useState('April');
  const [selectedYear, setSelectedYear] = useState('2025');
  const currentWeekIndex = new Date().getDate() <= 7 ? 0 : new Date().getDate() <= 14 ? 1 : new Date().getDate() <= 21 ? 2 : 3;

  const formatCurrency = (value: number) => `$${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

  return (
    <div>
      {/* Period Selection */}
      <div className="flex gap-3 mb-6 items-center flex-wrap">
        {['Day', 'Week', 'Month', 'Year'].map(p => (
          <button
            key={p}
            onClick={() => setSelectedPeriod(p)}
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
            </tr>
          </thead>
          <tbody>
            {categories.map(category => (
              <tr key={category} className="border-t border-gray-200 text-sm text-gray-900">
                <td className="p-3 font-medium">{category}</td>
                {weeks.map(week => (
                  <td key={week} className="p-3">{formatCurrency(mockData[week][category] ?? 0)}</td>
                ))}
              </tr>
            ))}
            {/* Balance row */}
            <tr className="border-t-2 border-gray-300 font-bold">
              <td className="p-3">Balance</td>
              {weeks.map(week => {
                const balance = getBalance(mockData[week]);
                const color = balance > 0 ? 'text-green-600' : balance < 0 ? 'text-red-500' : 'text-black';
                return (
                  <td key={week} className={cn("p-3", color)}>{formatCurrency(balance)}</td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}