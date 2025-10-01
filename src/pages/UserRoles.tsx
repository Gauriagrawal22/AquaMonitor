import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Shield, Settings, Plus, Edit3, Trash2, Eye, Check, X } from 'lucide-react';
import GlassCard from '../components/GlassCard';

const UserRoles: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');
  const [showAddUser, setShowAddUser] = useState(false);
  const [editingUser, setEditingUser] = useState<number | null>(null);

  const users = [
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      email: 'sarah.johnson@aquamonitor.com',
      role: 'admin',
      status: 'active',
      lastLogin: '2024-01-15 14:30',
      permissions: ['read', 'write', 'delete', 'manage'],
      avatar: 'SJ'
    },
    {
      id: 2,
      name: 'Prof. Michael Chen',
      email: 'michael.chen@university.edu',
      role: 'researcher',
      status: 'active',
      lastLogin: '2024-01-15 12:15',
      permissions: ['read', 'write', 'analyze'],
      avatar: 'MC'
    },
    {
      id: 3,
      name: 'Emma Rodriguez',
      email: 'emma.rodriguez@planning.gov',
      role: 'planner',
      status: 'active',
      lastLogin: '2024-01-14 16:45',
      permissions: ['read', 'reports'],
      avatar: 'ER'
    },
    {
      id: 4,
      name: 'James Wilson',
      email: 'james.wilson@contractor.com',
      role: 'researcher',
      status: 'inactive',
      lastLogin: '2024-01-10 09:20',
      permissions: ['read'],
      avatar: 'JW'
    },
  ];

  const roleDefinitions = [
    {
      id: 'admin',
      name: 'Administrator',
      description: 'Full system access with user management capabilities',
      color: 'from-red-500 to-pink-500',
      permissions: ['read', 'write', 'delete', 'manage', 'admin'],
      userCount: 1,
      features: [
        'Complete system access',
        'User management',
        'System configuration',
        'Data export/import',
        'Security settings'
      ]
    },
    {
      id: 'researcher',
      name: 'Researcher',
      description: 'Advanced data analysis and research capabilities',
      color: 'from-blue-500 to-indigo-500',
      permissions: ['read', 'write', 'analyze', 'reports'],
      userCount: 2,
      features: [
        'Data analysis tools',
        'Advanced reporting',
        'Trend analysis',
        'Data visualization',
        'Export capabilities'
      ]
    },
    {
      id: 'planner',
      name: 'Urban Planner',
      description: 'Planning-focused insights and reporting access',
      color: 'from-teal-500 to-emerald-500',
      permissions: ['read', 'reports', 'maps'],
      userCount: 1,
      features: [
        'Planning reports',
        'Map visualization',
        'Trend summaries',
        'Public dashboards',
        'Basic export'
      ]
    },
  ];

  const permissionLabels = {
    read: 'View Data',
    write: 'Edit Data',
    delete: 'Delete Records',
    analyze: 'Advanced Analysis',
    reports: 'Generate Reports',
    maps: 'Map Access',
    manage: 'Manage Stations',
    admin: 'System Administration'
  };

  const getRoleColor = (role: string) => {
    const roleData = roleDefinitions.find(r => r.id === role);
    return roleData?.color || 'from-slate-500 to-gray-500';
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'text-emerald-400' : 'text-slate-400';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">User Roles & Access Control</h1>
          <p className="text-slate-400">Manage user permissions and role-based access</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddUser(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-xl hover:from-teal-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-teal-500/25"
        >
          <Plus className="w-5 h-5" />
          <span>Add User</span>
        </motion.button>
      </div>

      {/* Tab Navigation */}
      <GlassCard className="p-1">
        <div className="flex bg-slate-800/30 rounded-xl">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-xl transition-all duration-200 ${
              activeTab === 'users'
                ? 'bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Users</span>
            <span className="px-2 py-1 bg-slate-600 text-white text-xs rounded-full">{users.length}</span>
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            className={`flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-xl transition-all duration-200 ${
              activeTab === 'roles'
                ? 'bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Roles</span>
          </button>
        </div>
      </GlassCard>

      <AnimatePresence mode="wait">
        {activeTab === 'users' && (
          <motion.div
            key="users"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* User List */}
            <div className="space-y-4">
              {users.map((user, index) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <GlassCard className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getRoleColor(user.role)} flex items-center justify-center text-white font-bold`}>
                          {user.avatar}
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-semibold text-white">{user.name}</h3>
                          <p className="text-sm text-slate-400">{user.email}</p>
                          <div className="flex items-center space-x-3 mt-1">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize bg-gradient-to-r ${getRoleColor(user.role)} text-white`}>
                              {user.role}
                            </span>
                            <span className={`text-xs font-medium ${getStatusColor(user.status)}`}>
                              {user.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6">
                        <div className="text-right">
                          <p className="text-sm text-slate-400">Last Login</p>
                          <p className="text-sm text-white">{user.lastLogin}</p>
                        </div>

                        <div className="flex items-center space-x-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setEditingUser(editingUser === user.id ? null : user.id)}
                            className="w-8 h-8 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg flex items-center justify-center transition-all duration-200"
                          >
                            <Eye className="w-4 h-4 text-slate-300" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="w-8 h-8 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 rounded-lg flex items-center justify-center transition-all duration-200"
                          >
                            <Edit3 className="w-4 h-4 text-blue-400" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="w-8 h-8 bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 rounded-lg flex items-center justify-center transition-all duration-200"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </motion.button>
                        </div>
                      </div>
                    </div>

                    {/* Expanded User Details */}
                    <AnimatePresence>
                      {editingUser === user.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mt-6 pt-6 border-t border-slate-700/50"
                        >
                          <h4 className="text-white font-medium mb-4">Permissions</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {Object.entries(permissionLabels).map(([key, label]) => (
                              <div
                                key={key}
                                className={`flex items-center space-x-2 p-3 rounded-lg border ${
                                  user.permissions.includes(key)
                                    ? 'bg-emerald-500/10 border-emerald-400/30 text-emerald-400'
                                    : 'bg-slate-800/30 border-slate-600/30 text-slate-400'
                                }`}
                              >
                                {user.permissions.includes(key) ? (
                                  <Check className="w-4 h-4" />
                                ) : (
                                  <X className="w-4 h-4" />
                                )}
                                <span className="text-sm">{label}</span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'roles' && (
          <motion.div
            key="roles"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Role Definitions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {roleDefinitions.map((role, index) => (
                <motion.div
                  key={role.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <GlassCard className="p-6 h-full">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${role.color} flex items-center justify-center`}>
                        <Shield className="w-6 h-6 text-white" />
                      </div>
                      <span className="px-3 py-1 bg-slate-700/50 text-slate-300 text-sm rounded-full">
                        {role.userCount} user{role.userCount !== 1 ? 's' : ''}
                      </span>
                    </div>

                    <h3 className="text-xl font-semibold text-white mb-2">{role.name}</h3>
                    <p className="text-slate-400 text-sm mb-4">{role.description}</p>

                    <div className="space-y-3 mb-6">
                      <h4 className="text-white font-medium text-sm">Key Features:</h4>
                      <ul className="space-y-2">
                        {role.features.map((feature, featureIndex) => (
                          <li
                            key={featureIndex}
                            className="flex items-center space-x-2 text-sm text-slate-300"
                          >
                            <Check className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`flex-1 py-2 px-4 bg-gradient-to-r ${role.color} text-white rounded-lg text-sm font-medium transition-all duration-200`}
                      >
                        Edit Role
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-300 hover:text-white transition-all duration-200"
                      >
                        <Settings className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>

            {/* Access Flow Diagram */}
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center space-x-2">
                <Shield className="w-5 h-5 text-teal-400" />
                <span>Access Flow Diagram</span>
              </h3>
              
              <div className="relative">
                <div className="flex items-center justify-between">
                  {roleDefinitions.map((role, index) => (
                    <motion.div
                      key={role.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.2 }}
                      className="text-center"
                    >
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${role.color} flex items-center justify-center mb-3 mx-auto`}>
                        <Shield className="w-8 h-8 text-white" />
                      </div>
                      <h4 className="text-white font-medium text-sm">{role.name}</h4>
                      <p className="text-slate-400 text-xs mt-1">{role.permissions.length} permissions</p>
                      
                      {/* Access Level Indicator */}
                      <div className="mt-3 w-full bg-slate-700/50 rounded-full h-2">
                        <div 
                          className={`h-2 bg-gradient-to-r ${role.color} rounded-full transition-all duration-500`}
                          style={{ width: `${(role.permissions.length / 8) * 100}%` }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                {/* Connection Lines */}
                <div className="absolute top-8 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-400/30 to-transparent"></div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add User Modal */}
      <AnimatePresence>
        {showAddUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddUser(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-md"
              onClick={e => e.stopPropagation()}
            >
              <GlassCard className="p-6">
                <h3 className="text-xl font-semibold text-white mb-6">Add New User</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
                      placeholder="Enter full name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                    <input
                      type="email"
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
                      placeholder="Enter email address"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Role</label>
                    <select className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-400">
                      <option value="">Select role</option>
                      {roleDefinitions.map(role => (
                        <option key={role.id} value={role.id}>{role.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="flex space-x-3 mt-6">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAddUser(false)}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-xl hover:from-teal-600 hover:to-blue-700 transition-all duration-200"
                  >
                    Add User
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAddUser(false)}
                    className="px-4 py-3 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-all duration-200"
                  >
                    Cancel
                  </motion.button>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserRoles;