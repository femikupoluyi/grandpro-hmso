import { FC, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { config } from '../config';

interface MenuItem {
  label: string;
  path: string;
  icon: string;
  children?: MenuItem[];
}

export const DashboardLayout: FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const menuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: '📊',
    },
    {
      label: 'Hospital Onboarding',
      path: '/dashboard/onboarding',
      icon: '🏥',
    },
    {
      label: 'Hospitals',
      path: '/dashboard/hospitals',
      icon: '🏨',
    },
    {
      label: 'Patients',
      path: '/dashboard/patients',
      icon: '👥',
    },
    {
      label: 'Appointments',
      path: '/dashboard/appointments',
      icon: '📅',
    },
    {
      label: 'Billing',
      path: '/dashboard/billing',
      icon: '💰',
    },
    {
      label: 'Inventory',
      path: '/dashboard/inventory',
      icon: '📦',
    },
    {
      label: 'Analytics',
      path: '/dashboard/analytics',
      icon: '📈',
    },
    {
      label: 'Operations Center',
      path: '/dashboard/operations',
      icon: '🎛️',
    },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/auth/login');
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-white shadow-lg transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b">
          <Link to="/dashboard" className="flex items-center">
            <span
              className={`text-xl font-bold text-primary-500 ${
                !isSidebarOpen && 'hidden'
              }`}
            >
              {config.app.name}
            </span>
            <span className={`text-2xl ${isSidebarOpen && 'hidden'}`}>
              🏥
            </span>
          </Link>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={
                  isSidebarOpen
                    ? 'M11 19l-7-7 7-7m8 14l-7-7 7-7'
                    : 'M13 5l7 7-7 7M5 5l7 7-7 7'
                }
              />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 text-sm font-medium transition-colors ${
                isActive(item.path)
                  ? 'bg-primary-50 text-primary-700 border-r-4 border-primary-500'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
              title={!isSidebarOpen ? item.label : undefined}
            >
              <span className="text-xl">{item.icon}</span>
              <span className={`ml-3 ${!isSidebarOpen && 'hidden'}`}>
                {item.label}
              </span>
            </Link>
          ))}
        </nav>

        {/* User Info */}
        <div className="border-t p-4">
          <div className={`flex items-center ${!isSidebarOpen && 'justify-center'}`}>
            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className={`ml-3 ${!isSidebarOpen && 'hidden'}`}>
              <p className="text-sm font-medium text-gray-700">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className={`mt-3 w-full text-left text-sm text-red-600 hover:text-red-700 ${
              !isSidebarOpen && 'text-center'
            }`}
          >
            {isSidebarOpen ? 'Logout' : '🚪'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white shadow-sm">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-900">
                {menuItems.find((item) => isActive(item.path))?.label || 'Dashboard'}
              </h2>
              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <button className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                </button>
                {/* Settings */}
                <button className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
