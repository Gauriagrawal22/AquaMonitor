import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Waves, 
  BarChart3, 
  MapPin, 
  User, 
  Database, 
  TrendingUp, 
  Bell, 
  Map, 
  Users, 
  Settings,
  Menu,
  X,
  Droplets,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: BarChart3 },
    { name: 'Stations', href: '/stations', icon: MapPin },
    { name: 'Water Data', href: '/water-data', icon: Database },
    { name: 'Recharge', href: '/recharge', icon: Droplets },
    { name: 'Reports & Alerts', href: '/reports', icon: Bell },
    { name: 'Trend Analysis', href: '/trends', icon: TrendingUp },
    { name: 'Map Explorer', href: '/map', icon: Map },
    { name: 'User Roles', href: '/roles', icon: Users },
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    navigate('/login');
  };
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="w-64 backdrop-blur-xl bg-slate-900/30 border-r border-teal-400/20"
          >
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-blue-500 rounded-xl flex items-center justify-center">
                  <Waves className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">AquaMonitor</h1>
                  <p className="text-xs text-teal-300">Water Intelligence</p>
                </div>
              </div>
              
              <nav className="space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                        isActive
                          ? 'bg-gradient-to-r from-teal-500/20 to-blue-500/20 text-teal-300 border border-teal-400/30'
                          : 'text-slate-300 hover:bg-slate-800/50 hover:text-teal-300'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? 'text-teal-400' : 'group-hover:text-teal-400'} transition-colors`} />
                      <span className="font-medium">{item.name}</span>
                      {isActive && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="ml-auto w-2 h-2 bg-teal-400 rounded-full"
                          initial={false}
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="backdrop-blur-xl bg-slate-900/20 border-b border-teal-400/20 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-lg bg-slate-800/50 text-slate-300 hover:text-teal-400 hover:bg-slate-700/50 transition-all duration-200"
              >
                {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <h2 className="text-xl font-semibold text-white">
                {navigation.find(item => item.href === location.pathname)?.name || 'Dashboard'}
              </h2>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button
                  onClick={() => navigate('/reports')}
                  className="relative p-2 rounded-lg hover:bg-slate-800/50 transition-all duration-200"
                >
                  <Bell className="w-6 h-6 text-slate-300 hover:text-teal-400 transition-colors" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                </button>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="w-8 h-8 bg-gradient-to-br from-teal-400 to-blue-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-200"
                >
                  <User className="w-4 h-4 text-white" />
                </button>
                
                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 top-12 w-48 backdrop-blur-xl bg-slate-800/90 border border-teal-400/20 rounded-xl shadow-2xl z-50"
                    >
                      <div className="p-2">
                        <Link
                          to="/profile"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-700/50 hover:text-teal-300 transition-all duration-200"
                        >
                          <User className="w-4 h-4" />
                          <span>Profile</span>
                        </Link>
                        <Link
                          to="/settings"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-700/50 hover:text-teal-300 transition-all duration-200"
                        >
                          <Settings className="w-4 h-4" />
                          <span>Settings</span>
                        </Link>
                        <hr className="my-2 border-slate-700/50" />
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-all duration-200"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;