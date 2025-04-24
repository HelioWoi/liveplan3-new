import { useGoalsStore } from '../../stores/goalsStore';
import { formatDistance } from 'date-fns';
import { Link } from 'react-router-dom';
import { ChevronRight, Target } from 'lucide-react';

export default function GoalProgress() {
  const { goals } = useGoalsStore();
  
  // Get only the active goals that are not completed
  const activeGoals = goals
    .filter(goal => goal.currentAmount < goal.targetAmount)
    .sort((a, b) => {
      // Sort by completion percentage in descending order
      const percentA = (a.currentAmount / a.targetAmount) * 100;
      const percentB = (b.currentAmount / b.targetAmount) * 100;
      return percentB - percentA;
    })
    .slice(0, 3); // Show top 3 goals

  return (
    <div className="card animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">Goal Progress</h3>
        <Link to="/goals" className="text-primary-600 hover:text-primary-800 text-sm font-medium flex items-center">
          View All <ChevronRight size={16} />
        </Link>
      </div>
      
      <div className="space-y-4">
        {activeGoals.map((goal) => {
          const percentage = (goal.currentAmount / goal.targetAmount) * 100;
          const timeRemaining = formatDistance(new Date(goal.targetDate), new Date(), { addSuffix: true });
          
          return (
            <div key={goal.id} className="border border-gray-100 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Target className="h-5 w-5 text-primary-600 mr-2" />
                  <h4 className="font-medium">{goal.title}</h4>
                </div>
                <span className="text-sm text-gray-500">Due {timeRemaining}</span>
              </div>
              
              <p className="text-sm text-gray-500 mb-3">{goal.description}</p>
              
              <div className="flex justify-between text-sm mb-1">
                <span>${goal.currentAmount.toFixed(2)}</span>
                <span>${goal.targetAmount.toFixed(2)}</span>
              </div>
              
              <div className="progress-bar mb-2">
                <div 
                  className="progress-fill bg-primary-500"
                  style={{ 
                    width: `${percentage}%`,
                    '--progress-width': `${percentage}%`
                  } as React.CSSProperties}
                ></div>
              </div>
              
              <div className="text-right text-sm font-medium text-primary-700">
                {percentage.toFixed(0)}% Complete
              </div>
            </div>
          );
        })}
        
        {activeGoals.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No active goals. Create some goals to track your progress!</p>
            <Link 
              to="/goals" 
              className="mt-2 inline-block btn btn-primary"
            >
              Create Goal
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}