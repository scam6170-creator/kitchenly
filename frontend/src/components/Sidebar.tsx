import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, Settings, Moon, Sun } from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { useUIStore } from '../store/ui';
import { t } from '../i18n/translations';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const Sidebar = ({ isOpen, onToggle }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearAuth, user } = useAuthStore();
  const { theme, setTheme, language } = useUIStore();

  const menuItems = [
    { path: '/', label: t('dashboard', language), icon: '📊' },
    { path: '/products', label: t('products', language), icon: '📦' },
    { path: '/stock', label: t('stock', language), icon: '📈' },
    { path: '/sales', label: t('sales', language), icon: '💳' },
    { path: '/reports', label: t('reports', language), icon: '📄' },
    { path: '/employees', label: t('employees', language), icon: '👥' },
    { path: '/search', label: t('search', language), icon: '🔍' },
  ];

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={onToggle}
        className="fixed top-4 left-4 z-50 md:hidden bg-blue-500 text-white p-2 rounded"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed top-0 left-0 w-64 h-screen bg-gradient-to-b from-blue-600 to-blue-800 text-white shadow-lg z-40 transition-transform duration-300 md:translate-x-0 md:static`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-blue-400">
          <h1 className="text-2xl font-bold">🍳 KITCHENLY</h1>
          <p className="text-xs text-blue-200 mt-1">Inventory Management</p>
        </div>

        {/* User Info */}
        <div className="p-4 bg-blue-700 m-4 rounded-lg">
          <p className="text-sm font-semibold">{user?.full_name}</p>
          <p className="text-xs text-blue-200">{user?.role}</p>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => isOpen && onToggle()}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                location.pathname === item.path
                  ? 'bg-white text-blue-600 font-semibold'
                  : 'text-blue-100 hover:bg-blue-500'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Settings & Logout */}
        <div className="p-4 border-t border-blue-400 space-y-2">
          <Link
            to="/settings"
            className="flex items-center space-x-3 px-4 py-3 text-blue-100 hover:bg-blue-500 rounded-lg transition-colors"
          >
            <Settings size={20} />
            <span>{t('settings', language)}</span>
          </Link>
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="w-full flex items-center space-x-3 px-4 py-3 text-blue-100 hover:bg-blue-500 rounded-lg transition-colors"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            <span>{theme === 'light' ? 'Dark' : 'Light'} Mode</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-red-200 hover:bg-red-600 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span>{t('logout', language)}</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={onToggle}
        />
      )}
    </>
  );
};
