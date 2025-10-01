import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Database, 
  Palette, 
  Globe, 
  Moon, 
  Sun,
  Check,
  Save
} from 'lucide-react';
import GlassCard from '../components/GlassCard';

const Settings: React.FC = () => {
  const [activeSection, setActiveSection] = useState('general');
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    criticalAlerts: true,
    weeklyReports: false,
    systemUpdates: true
  });

  const [preferences, setPreferences] = useState({
    theme: 'dark',
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'YYYY-MM-DD',
    units: 'metric'
  });

  const settingSections = [
    { id: 'general', name: 'General', icon: SettingsIcon },
    { id: 'account', name: 'Account', icon: User },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'data', name: 'Data & Export', icon: Database },
    { id: 'appearance', name: 'Appearance', icon: Palette },
  ];

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Regional Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Language</label>
            <select
              value={preferences.language}
              onChange={(e) => setPreferences(prev => ({ ...prev, language: e.target.value }))}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Timezone</label>
            <select
              value={preferences.timezone}
              onChange={(e) => setPreferences(prev => ({ ...prev, timezone: e.target.value }))}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
            >
              <option value="UTC">UTC</option>
              <option value="IST">IST (India)</option>
              <option value="EST">EST (Eastern)</option>
              <option value="PST">PST (Pacific)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Date Format</label>
            <select
              value={preferences.dateFormat}
              onChange={(e) => setPreferences(prev => ({ ...prev, dateFormat: e.target.value }))}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
            >
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Units</label>
            <select
              value={preferences.units}
              onChange={(e) => setPreferences(prev => ({ ...prev, units: e.target.value }))}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
            >
              <option value="metric">Metric</option>
              <option value="imperial">Imperial</option>
            </select>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-700/50 pt-6">
        <h3 className="text-lg font-semibold text-white mb-4">System Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl">
            <div>
              <h4 className="text-white font-medium">Auto-refresh Data</h4>
              <p className="text-sm text-slate-400">Automatically refresh monitoring data</p>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-teal-500 transition-colors">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
            </button>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl">
            <div>
              <h4 className="text-white font-medium">Compact View</h4>
              <p className="text-sm text-slate-400">Use compact layout for data tables</p>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-600 transition-colors">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Alert Preferences</h3>
        <div className="space-y-4">
          {Object.entries({
            criticalAlerts: 'Critical Water Level Alerts',
            email: 'Email Notifications',
            push: 'Push Notifications',
            weeklyReports: 'Weekly Summary Reports',
            systemUpdates: 'System Update Notifications'
          }).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl">
              <div>
                <h4 className="text-white font-medium">{label}</h4>
                <p className="text-sm text-slate-400">
                  {key === 'criticalAlerts' && 'Immediate alerts for critical water levels'}
                  {key === 'email' && 'Receive notifications via email'}
                  {key === 'push' && 'Browser push notifications'}
                  {key === 'weeklyReports' && 'Weekly summary of monitoring data'}
                  {key === 'systemUpdates' && 'Updates about system maintenance'}
                </p>
              </div>
              <button 
                onClick={() => setNotifications(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications[key as keyof typeof notifications] ? 'bg-teal-500' : 'bg-slate-600'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notifications[key as keyof typeof notifications] ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-slate-700/50 pt-6">
        <h3 className="text-lg font-semibold text-white mb-4">Notification Schedule</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Quiet Hours Start</label>
            <input
              type="time"
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
              defaultValue="22:00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Quiet Hours End</label>
            <input
              type="time"
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
              defaultValue="08:00"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Theme Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { id: 'dark', name: 'Dark Mode', icon: Moon, description: 'Dark theme with blue accents' },
            { id: 'light', name: 'Light Mode', icon: Sun, description: 'Light theme (coming soon)' },
            { id: 'auto', name: 'Auto', icon: Globe, description: 'Follow system preference' },
          ].map((theme) => (
            <motion.button
              key={theme.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setPreferences(prev => ({ ...prev, theme: theme.id }))}
              disabled={theme.id !== 'dark'}
              className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                preferences.theme === theme.id
                  ? 'border-teal-400/50 bg-teal-500/10'
                  : theme.id === 'dark'
                  ? 'border-slate-600/50 bg-slate-800/30 hover:border-slate-500/50'
                  : 'border-slate-700/50 bg-slate-800/20 opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="flex flex-col items-center space-y-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  preferences.theme === theme.id ? 'bg-teal-500' : 'bg-slate-700'
                }`}>
                  <theme.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-center">
                  <h4 className="font-medium text-white">{theme.name}</h4>
                  <p className="text-xs text-slate-400 mt-1">{theme.description}</p>
                </div>
                {preferences.theme === theme.id && (
                  <Check className="w-5 h-5 text-teal-400" />
                )}
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="border-t border-slate-700/50 pt-6">
        <h3 className="text-lg font-semibold text-white mb-4">Display Options</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl">
            <div>
              <h4 className="text-white font-medium">Animated Charts</h4>
              <p className="text-sm text-slate-400">Enable smooth animations in charts</p>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-teal-500 transition-colors">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
            </button>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl">
            <div>
              <h4 className="text-white font-medium">High Contrast Mode</h4>
              <p className="text-sm text-slate-400">Improve accessibility with higher contrast</p>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-600 transition-colors">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'general':
        return renderGeneralSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'appearance':
        return renderAppearanceSettings();
      case 'account':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Account Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Display Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                    defaultValue="Dr. Sarah Johnson"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                    defaultValue="sarah.johnson@aquamonitor.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Organization</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                    defaultValue="National Water Research Institute"
                  />
                </div>
              </div>
            </div>
          </div>
        );
      case 'security':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Password & Authentication</h3>
              <div className="space-y-4">
                <button className="w-full p-4 bg-slate-800/30 border border-slate-600/50 rounded-xl text-left hover:bg-slate-800/50 transition-all duration-200">
                  <h4 className="text-white font-medium">Change Password</h4>
                  <p className="text-sm text-slate-400">Update your account password</p>
                </button>
                <button className="w-full p-4 bg-slate-800/30 border border-slate-600/50 rounded-xl text-left hover:bg-slate-800/50 transition-all duration-200">
                  <h4 className="text-white font-medium">Two-Factor Authentication</h4>
                  <p className="text-sm text-slate-400">Add an extra layer of security</p>
                </button>
              </div>
            </div>
          </div>
        );
      case 'data':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Data Management</h3>
              <div className="space-y-4">
                <button className="w-full p-4 bg-slate-800/30 border border-slate-600/50 rounded-xl text-left hover:bg-slate-800/50 transition-all duration-200">
                  <h4 className="text-white font-medium">Export All Data</h4>
                  <p className="text-sm text-slate-400">Download your complete dataset</p>
                </button>
                <button className="w-full p-4 bg-slate-800/30 border border-slate-600/50 rounded-xl text-left hover:bg-slate-800/50 transition-all duration-200">
                  <h4 className="text-white font-medium">Data Retention</h4>
                  <p className="text-sm text-slate-400">Configure data retention policies</p>
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return renderGeneralSettings();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-slate-400">Customize your AquaMonitor experience</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-xl hover:from-teal-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-teal-500/25"
        >
          <Save className="w-5 h-5" />
          <span>Save Changes</span>
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Settings</h3>
            <nav className="space-y-2">
              {settingSections.map((section, index) => (
                <motion.button
                  key={section.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-left ${
                    activeSection === section.id
                      ? 'bg-gradient-to-r from-teal-500/20 to-blue-500/20 text-teal-300 border border-teal-400/30'
                      : 'text-slate-300 hover:bg-slate-800/50 hover:text-teal-300'
                  }`}
                >
                  <section.icon className="w-5 h-5" />
                  <span className="font-medium">{section.name}</span>
                  {activeSection === section.id && (
                    <motion.div
                      layoutId="activeSettingIndicator"
                      className="ml-auto w-2 h-2 bg-teal-400 rounded-full"
                      initial={false}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </motion.button>
              ))}
            </nav>
          </GlassCard>
        </motion.div>

        {/* Settings Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-3"
        >
          <GlassCard className="p-8">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {renderSectionContent()}
            </motion.div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;