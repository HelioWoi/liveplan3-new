import { Bell } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { Link } from 'react-router-dom';

export default function GlobalHeader() {
  const { user } = useAuthStore();

  return (
    <div className="bg-[#120B39] text-white">
      <div className="relative">
        {/* Curved background shape */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-[#120B39] rounded-b-[40px]"></div>
        
        {/* Header content */}
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
                <div className="w-6 h-6">
                  <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMkw0IDhWMjBIMjBWOEwxMiAyWiIgc3Ryb2tlPSIjMUYyNTMzIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik0xMiAxNlYxME0xMiAxMEw5IDEzTTEyIDEwTDE1IDEzIiBzdHJva2U9IiMxRjI1MzMiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+" alt="Income" className="w-6 h-6" />
                </div>
              </div>
              <span className="text-xs text-white">Income</span>
            </Link>

            <Link to="/expenses" className="flex flex-col items-center">
              <div className="w-14 h-14 bg-[#E8E5FF] rounded-full flex items-center justify-center mb-2">
                <div className="w-6 h-6">
                  <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMkM2LjQ4IDIgMiA2LjQ4IDIgMTJDMiAxNy41MiA2LjQ4IDIyIDEyIDIyQzE3LjUyIDIyIDIyIDE3LjUyIDIyIDEyQzIyIDYuNDggMTcuNTIgMiAxMiAyWk0xMiAyMEM3LjU4IDIwIDQgMTYuNDIgNCAxMkM0IDcuNTggNy41OCA0IDEyIDRDMTYuNDIgNCAyMCA3LjU4IDIwIDEyQzIwIDE2LjQyIDE2LjQyIDIwIDEyIDIwWiIgZmlsbD0iIzFGMjUzMyIvPjxwYXRoIGQ9Ik0xMyAxMkgxNyIgc3Ryb2tlPSIjMUYyNTMzIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjwvc3ZnPg==" alt="Expenses" className="w-6 h-6" />
                </div>
              </div>
              <span className="text-xs text-white">Expenses</span>
            </Link>

            <Link to="/variables" className="flex flex-col items-center">
              <div className="w-14 h-14 bg-[#E8E5FF] rounded-full flex items-center justify-center mb-2">
                <div className="w-6 h-6">
                  <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMjEgNEgzQzEuODk1NDMgNCAyIDQuODk1NDMgMiA2VjE4QzIgMTkuMTA0NiAyLjg5NTQzIDIwIDQgMjBIMjBDMjEuMTA0NiAyMCAyMiAxOS4xMDQ2IDIyIDE4VjZDMjIgNC44OTU0MyAyMS4xMDQ2IDQgMjAgNEgyMVpNMTIgMTdDOS4yMzg1OCAxNyA3IDE0Ljc2MTQgNyAxMkM3IDkuMjM4NTggOS4yMzg1OCA3IDEyIDdDMTQuNzYxNCA3IDE3IDkuMjM4NTggMTcgMTJDMTcgMTQuNzYxNCAxNC43NjE0IDE3IDEyIDE3WiIgc3Ryb2tlPSIjMUYyNTMzIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==" alt="Variables" className="w-6 h-6" />
                </div>
              </div>
              <span className="text-xs text-white">Variables</span>
            </Link>

            <Link to="/statements" className="flex flex-col items-center">
              <div className="w-14 h-14 bg-[#E8E5FF] rounded-full flex items-center justify-center mb-2">
                <div className="w-6 h-6">
                  <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMjAgOEgxMk0yMCAxNkgxMk0yMCAxMkgxMk04IDhINE04IDE2SDRNOCAxMkg0IiBzdHJva2U9IiMxRjI1MzMiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+" alt="Statements" className="w-6 h-6" />
                </div>
              </div>
              <span className="text-xs text-white">Statements</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}