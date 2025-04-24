import { Menu, X, Bell, User } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useSupabase } from '../../lib/supabase/SupabaseProvider';

interface HeaderProps {
  openSidebar: () => void;
}

export default function Header({ openSidebar }: HeaderProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user } = useAuthStore();
  const { supabase } = useSupabase();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="text-gray-500 hover:text-gray-700 lg:hidden"
            onClick={openSidebar}
          >
            <Menu size={24} />
          </button>
          <h1 className="text-xl font-semibold text-gray-900 lg:hidden">LivePlan³</h1>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            className="rounded-full bg-white p-1 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            <span className="sr-only">View notifications</span>
            <Bell size={20} />
          </button>

          {/* Profile dropdown */}
          <div className="relative">
            <button
              type="button"
              className="flex items-center gap-2 rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
            >
              <span className="sr-only">Open user menu</span>
              <div className="h-8 w-8 rounded-full bg-primary-200 flex items-center justify-center text-primary-700 font-medium">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="hidden md:block text-sm font-medium text-gray-700">
                {user?.email?.split('@')[0]}
              </span>
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setUserMenuOpen(false)}
                >
                  Your Profile
                </Link>
                <button
                  onClick={() => {
                    handleSignOut();
                    setUserMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}