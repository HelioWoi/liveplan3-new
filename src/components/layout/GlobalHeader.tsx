import { Bell } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { Link } from 'react-router-dom';

// Novos ícones em PNG
import incomeIcon from '../../icons/income.png';
import expenseIcon from '../../icons/expense.png';
import variableIcon from '../../icons/variable.png';
import statementIcon from '../../icons/statement.png';

export default function GlobalHeader() {
  const { user } = useAuthStore();

  return (
    <div className="bg-[#120B39] text-white">
      <div className="relative">
        {/* Fundo com borda curva */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-[#120B39] rounded-b-[40px]"></div>

        {/* Conteúdo do cabeçalho */}
        <div className="relative px-4 pt-12 pb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-gray-300 text-sm font-light">Welcome Back</p>
              <h1 className="text-2xl font-bold">{user?.user_metadata?.full_name || 'User'}</h1>
            </div>
            <button className="p-2 hover:bg-white/10 rounded-full transition-colors relative">
              <Bell className="h-6 w-6" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>

          {/* Balance Card */}
          <div className="bg-white rounded-2xl p-6 text-gray-900">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-[#1A1A40]">My Balance</h2>
              <p className="text-3xl font-bold text-[#1A1A40]">$2,887.65</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 grid grid-cols-4 gap-4">
            <Link to="/income" className="flex flex-col items-center">
              <div className="w-14 h-14 bg-[#E8E5FF] rounded-full flex items-center justify-center mb-2">
                <img src={incomeIcon} alt="Income" className="w-6 h-6" />
              </div>
              <span className="text-xs text-white">Income</span>
            </Link>

            <Link to="/expenses" className="flex flex-col items-center">
              <div className="w-14 h-14 bg-[#E8E5FF] rounded-full flex items-center justify-center mb-2">
                <img src={expenseIcon} alt="Expenses" className="w-6 h-6" />
              </div>
              <span className="text-xs text-white">Expenses</span>
            </Link>

            <Link to="/variables" className="flex flex-col items-center">
              <div className="w-14 h-14 bg-[#E8E5FF] rounded-full flex items-center justify-center mb-2">
                <img src={variableIcon} alt="Variables" className="w-6 h-6" />
              </div>
              <span className="text-xs text-white">Variables</span>
            </Link>

            <Link to="/statements" className="flex flex-col items-center">
              <div className="w-14 h-14 bg-[#E8E5FF] rounded-full flex items-center justify-center mb-2">
                <img src={statementIcon} alt="Statements" className="w-6 h-6" />
              </div>
              <span className="text-xs text-white">Statements</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
