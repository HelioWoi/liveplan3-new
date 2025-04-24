import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Target } from 'lucide-react';

interface Goal {
  id: string;
  title: string;
  description: string;
  currentAmount: number;
  targetAmount: number;
  progress: number;
}

const goals: Goal[] = [
  {
    id: '1',
    title: 'Buy PlayStation',
    description: 'Slim 1TB 56 Games',
    currentAmount: 400,
    targetAmount: 500,
    progress: 80
  },
  {
    id: '2',
    title: 'Emergency Fund',
    description: '6 Months of Expenses',
    currentAmount: 3000,
    targetAmount: 10000,
    progress: 30
  },
  {
    id: '3',
    title: 'New MacBook',
    description: 'M3 Pro 16-inch',
    currentAmount: 1200,
    targetAmount: 2000,
    progress: 60
  },
  {
    id: '4',
    title: 'Europe Trip',
    description: '2 Weeks Vacation',
    currentAmount: 4000,
    targetAmount: 5000,
    progress: 80
  }
];

export default function TopGoals() {
  const topGoals = useMemo(() => {
    // Sort by progress percentage and take top 2
    return [...goals]
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 2);
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-[#1F2533]">Top Goals</h2>
        <Link 
          to="/goals" 
          className="text-[14px] font-medium text-[#5B3FFB] hover:text-[#4931E4] transition-colors flex items-center"
        >
          View All <ChevronRight className="h-4 w-4 ml-1" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {topGoals.map((goal) => (
          <div 
            key={goal.id}
            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#EAE6FE] flex items-center justify-center flex-shrink-0">
                <Target className="h-5 w-5 text-[#5B3FFB]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-[#1F2533] truncate">
                  {goal.title}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  {goal.description}
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      ${goal.currentAmount.toLocaleString()}
                    </span>
                    <span className="text-gray-600">
                      ${goal.targetAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        goal.progress >= 100 
                          ? 'bg-green-500' 
                          : 'bg-[#5B3FFB]'
                      }`}
                      style={{ width: `${Math.min(goal.progress, 100)}%` }}
                    />
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-medium ${
                      goal.progress >= 100 
                        ? 'text-green-600' 
                        : 'text-[#5B3FFB]'
                    }`}>
                      {goal.progress}% Complete
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}