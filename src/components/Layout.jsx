import { useState } from 'react';
import {
  Home,
  Users,
  Package,
  CreditCard,
  Settings,
  FileText,
  Menu,
  X,
  BarChart,
  Tags,
  LogOut,
  Trash2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { id: 'genel-toplam', label: 'Genel Toplam', icon: BarChart, path: '/genel-toplam' },
    { id: 'musteriler', label: 'Müşteriler', icon: Users, path: '/musteriler' },
    { id: 'emanetler', label: 'Emanetler', icon: Package, path: '/emanetler' },
    { id: 'borclar', label: 'Borçlar', icon: CreditCard, path: '/borclar' },
    { id: 'emanet-turleri', label: 'Emanet Türleri', icon: Tags, path: '/emanet-turleri' },
    { id: 'raporlar', label: 'Raporlar', icon: FileText, path: '/raporlar' },
    { id: 'interaktif-raporlar', label: 'İnteraktif Raporlar', icon: BarChart, path: '/interaktif-raporlar' },
    { id: 'geri-donusum-kutusu', label: 'Geri Dönüşüm Kutusu', icon: Trash2, path: '/geri-donusum-kutusu' },
    { id: 'ayarlar', label: 'Ayarlar', icon: Settings, path: '/ayarlar' }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-4 border-b">
          <h1 className="text-xl font-bold text-blue-600">Emanet Defteri</h1>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <nav className="mt-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.id}
                onClick={() => {
                  navigate(item.path);
                  setSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center px-4 py-3 text-left hover:bg-blue-50 transition-colors
                  ${isActive ? 'bg-blue-100 text-blue-600 border-r-2 border-blue-600' : 'text-gray-700'}
                `}
              >
                <Icon className="h-5 w-5 mr-3" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b h-16 flex items-center justify-between px-4">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden mr-2"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h2 className="text-lg font-semibold text-gray-800">
              {menuItems.find(item => item.path === location.pathname)?.label || 'Emanet Defteri'}
            </h2>
          </div>
          
          <div className="flex items-center space-x-4">
            {user && (
              <>
                <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
                  {user.photoURL && (
                    <img 
                      src={user.photoURL} 
                      alt="Profil" 
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  <div>
                    <div className="font-medium">
                      {user.displayName || user.email}
                    </div>

                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Çıkış
                </Button>
              </>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;


