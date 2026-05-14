import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Cpu, 
  AlertTriangle, 
  Package, 
  BookOpen, 
  BarChart3, 
  Settings, 
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  ChevronRight,
  Globe,
  Calendar,
  Activity
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: t('nav.dashboard') },
    { path: '/dispatcher', icon: Activity, label: t('nav.dispatcher'), highlight: true },
    { path: '/equipment', icon: Cpu, label: t('nav.equipment') },
    { path: '/tickets', icon: AlertTriangle, label: t('nav.tickets') },
    { path: '/calendar', icon: Calendar, label: t('nav.calendar') },
    { path: '/materials', icon: Package, label: t('nav.materials') },
    { path: '/knowledge', icon: BookOpen, label: t('nav.knowledge') },
    { path: '/reports', icon: BarChart3, label: t('nav.reports') },
  ];

  if (user?.role === 'admin') {
    menuItems.push({ path: '/admin', icon: Settings, label: t('nav.admin') });
  }

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'ru' ? 'pt' : 'ru';
    i18n.changeLanguage(nextLang);
  };

  return (
    <div className="flex h-screen bg-dark-bg text-text-main overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-72' : 'w-20'} bg-catoca-blue border-r border-dark-border transition-all duration-300 flex flex-col z-30 shadow-2xl relative`}>
        {/* Logo Section */}
        <div className="p-6 flex items-center gap-4 mb-4">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
            <Settings className="text-dark-bg w-6 h-6 animate-spin-slow" />
          </div>
          {isSidebarOpen && (
            <div className="animate-in fade-in slide-in-from-left-2">
              <h1 className="font-black text-xl tracking-tighter text-white leading-none">CATOCA</h1>
              <p className="text-[10px] text-primary font-bold tracking-[0.2em] uppercase mt-1">Maintenance</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto no-scrollbar">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all group relative ${
                  isActive 
                    ? 'bg-primary text-dark-bg font-bold shadow-lg shadow-primary/20' 
                    : item.highlight
                      ? 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20'
                      : 'text-text-muted hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon className={`w-5 h-5 shrink-0 ${isActive ? 'scale-110' : 'group-hover:scale-110 transition-transform'}`} />
                {isSidebarOpen && <span className="text-sm tracking-tight">{item.label}</span>}
                {isActive && isSidebarOpen && (
                  <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
                )}
                {!isSidebarOpen && (
                  <div className="absolute left-full ml-4 px-3 py-2 bg-dark-surface border border-dark-border rounded-xl text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-dark-border bg-dark-bg/50">
          <div className={`flex items-center ${isSidebarOpen ? 'gap-4 p-3' : 'justify-center'} rounded-2xl bg-dark-surface/50 border border-dark-border/50`}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-primary-dark flex items-center justify-center shrink-0 shadow-inner">
              <span className="font-black text-dark-bg">{user?.name?.charAt(0)}</span>
            </div>
            {isSidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                <p className="text-[10px] text-text-muted uppercase tracking-widest">{t(`roles.${user?.role}`)}</p>
              </div>
            )}
            {isSidebarOpen && (
              <button 
                onClick={logout}
                className="p-2 text-text-muted hover:text-accent-red hover:bg-accent-red/10 rounded-xl transition-all"
              >
                <LogOut className="w-5 h-5" />
              </button>
            )}
          </div>
          {isSidebarOpen && (
            <button 
              onClick={toggleLanguage}
              className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dark-border text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-primary hover:border-primary/50 transition-all bg-dark-surface/30"
            >
              <Globe className="w-3.5 h-3.5" />
              {i18n.language === 'ru' ? 'Português' : 'Русский'}
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        {/* Header */}
        <header className="h-20 border-b border-dark-border flex items-center justify-between px-8 bg-dark-bg/50 backdrop-blur-xl z-20 sticky top-0">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2.5 hover:bg-white/5 rounded-xl transition-colors border border-dark-border/50"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="relative group hidden md:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder={t('common.search')}
                className="bg-dark-surface border border-dark-border/50 rounded-2xl pl-11 pr-6 py-2.5 w-80 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2.5 hover:bg-white/5 rounded-xl transition-all border border-dark-border/50 group">
              <Bell className="w-5 h-5 text-text-muted group-hover:text-primary transition-colors" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-accent-red rounded-full ring-4 ring-dark-bg animate-pulse"></span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-hidden">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
