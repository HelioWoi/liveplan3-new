import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Receipt, 
  Target, 
  TrendingUp, 
  User, 
  X, 
  PiggyBank
} from 'lucide-react';
import classNames from 'classnames';

interface SidebarProps {
  closeSidebar: () => void;
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Transactions', href: '/transactions', icon: Receipt },
  { name: 'Goals', href: '/goals', icon: Target },
  { name: 'Passive Income', href: '/passive-income', icon: TrendingUp },
  { name: 'Profile', href: '/profile', icon: User },
];

export default function Sidebar({ closeSidebar }: SidebarProps) {
  const location = useLocation();

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-white">
      <div className="flex items-center justify-between px-4 py-5">
        <Link to="/" className="flex items-center">
          <PiggyBank className="h-8 w-8 text-primary-600" />
          <span className="ml-2 text-xl font-semibold text-gray-900">LivePlan³</span>
        </Link>
        <button
          type="button"
          className="lg:hidden -mr-2 rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          onClick={closeSidebar}
        >
          <X size={20} />
        </button>
      </div>
      <div className="flex flex-1 flex-col">
        <nav className="flex-1 space-y-1 px-2 py-4">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={classNames(
                  isActive
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                  'group flex items-center rounded-md px-2 py-3 text-sm font-medium transition-colors'
                )}
                onClick={closeSidebar}
              >
                <item.icon
                  className={classNames(
                    isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-500',
                    'mr-3 h-5 w-5 flex-shrink-0'
                  )}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="border-t border-gray-200 p-4">
        <div className="rounded-md bg-primary-50 p-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-primary-800">Premium Plan</h3>
            <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-800">
              PRO
            </span>
          </div>
          <p className="mt-1 text-xs text-primary-700">
            Unlock advanced features to accelerate your financial goals.
          </p>
        </div>
      </div>
    </div>
  );
}