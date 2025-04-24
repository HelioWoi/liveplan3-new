import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useState } from 'react';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar for mobile */}
      <div
        className={`fixed inset-0 z-40 transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:hidden transition-transform duration-300 ease-in-out`}
      >
        <div className="relative flex h-full w-full max-w-xs flex-1 flex-col bg-white">
          <Sidebar closeSidebar={() => setSidebarOpen(false)} />
        </div>
      </div>

      {/* Backdrop for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar for desktop */}
      <div className="hidden lg:flex lg:w-64 lg:flex-shrink-0">
        <div className="flex h-full flex-grow flex-col overflow-y-auto border-r border-gray-200 bg-white">
          <Sidebar closeSidebar={() => {}} />
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header openSidebar={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}