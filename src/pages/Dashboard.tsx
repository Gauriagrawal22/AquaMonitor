import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Droplets, TrendingUp, AlertTriangle, MapPin, Activity, Waves } from 'lucide-react';
import GlassCard from '../components/GlassCard';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const mockData = [
    { name: 'Jan', value: 24.5, recharge: 15.2 },
    { name: 'Feb', value: 23.8, recharge: 18.1 },
    { name: 'Mar', value: 22.1, recharge: 22.5 },
    { name: 'Apr', value: 20.5, recharge: 28.3 },
    { name: 'May', value: 19.2, recharge: 35.1 },
    { name: 'Jun', value: 18.8, recharge: 42.8 },
  ];

  const metricCards = [
    {
      title: 'Average Depth',
      value: '21.2m',
      change: '-2.3%',
      trend: 'down',
      icon: Droplets,
      color: 'from-blue-500 to-cyan-500',
      link: '/water-data'
    },
    {
      title: 'Recharge Rate',
      value: '15.8%',
      change: '+5.2%',
      trend: 'up',
      icon: TrendingUp,
      color: 'from-teal-500 to-emerald-500',
      link: '/recharge'
    },
    {
      title: 'Active Stations',
      value: '1,247',
      change: '+12',
      trend: 'up',
      icon: MapPin,
      color: 'from-purple-500 to-indigo-500',
      link: '/stations'
    },
    {
      title: 'Critical Alerts',
      value: '8',
      change: '+3',
      trend: 'up',
      icon: AlertTriangle,
      color: 'from-red-500 to-pink-500',
      link: '/reports'
    }
  ];

  const alerts = [
    { id: 1, type: 'critical', message: 'Severe depletion detected in North Delhi', time: '2 hours ago' },
    { id: 2, type: 'warning', message: 'Unusual recharge pattern in Gurgaon', time: '4 hours ago' },
    { id: 3, type: 'info', message: 'New station installation completed', time: '6 hours ago' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Groundwater Intelligence Dashboard</h1>
          <p className="text-slate-400">Real-time monitoring across National Capital Region</p>
        </div>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 bg-gradient-to-br from-teal-400 to-blue-500 rounded-2xl flex items-center justify-center"
        >
          <Activity className="w-6 h-6 text-white" />
        </motion.div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            onClick={() => navigate(metric.link)}
            className="cursor-pointer"
          >
            <GlassCard glow className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${metric.color} flex items-center justify-center`}>
                  <metric.icon className="w-6 h-6 text-white" />
                </div>
                <div className={`px-2 py-1 rounded-lg text-xs font-medium ${
                  metric.trend === 'up' 
                    ? 'bg-emerald-500/20 text-emerald-400' 
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {metric.change}
                </div>
              </div>
              <h3 className="text-slate-400 text-sm font-medium">{metric.title}</h3>
              <p className="text-2xl font-bold text-white mt-1">{metric.value}</p>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Groundwater Contour Map */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-2"
        >
          <GlassCard className="p-6 h-96">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Groundwater Level Trends</h3>
              <div className="flex space-x-2">
                <button className="px-3 py-1 bg-teal-500/20 text-teal-400 rounded-lg text-sm hover:bg-teal-500/30 transition-colors">
                  6M
                </button>
                <button className="px-3 py-1 bg-slate-700/50 text-slate-400 rounded-lg text-sm hover:bg-slate-600/50 transition-colors">
                  1Y
                </button>
              </div>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockData}>
                <defs>
                  <linearGradient id="waterLevel" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#14B8A6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="recharge" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F3F4F6'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#14B8A6" 
                  fillOpacity={1} 
                  fill="url(#waterLevel)"
                  strokeWidth={2}
                />
                <Area 
                  type="monotone" 
                  dataKey="recharge" 
                  stroke="#3B82F6" 
                  fillOpacity={1} 
                  fill="url(#recharge)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </GlassCard>
        </motion.div>

        {/* Insights Feed */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="space-y-4"
        >
          <GlassCard className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Waves className="w-5 h-5 text-teal-400" />
              <h3 className="text-lg font-semibold text-white">Smart Insights</h3>
            </div>
            <div className="space-y-4">
              {alerts.map((alert, index) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                  onClick={() => navigate('/reports')}
                  className={`p-4 rounded-xl border ${
                    alert.type === 'critical' 
                      ? 'bg-red-500/10 border-red-500/30' 
                      : alert.type === 'warning'
                      ? 'bg-amber-500/10 border-amber-500/30'
                      : 'bg-blue-500/10 border-blue-500/30'
                  }`}
                >
                  <p className="text-white text-sm">{alert.message}</p>
                  <p className="text-slate-400 text-xs mt-1">{alert.time}</p>
                </motion.div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/reports')}
                className="w-full p-3 bg-gradient-to-r from-teal-500/20 to-blue-500/20 border border-teal-400/30 rounded-xl text-white hover:from-teal-500/30 hover:to-blue-500/30 transition-all duration-200"
              >
                Generate Report
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/stations')}
                className="w-full p-3 bg-slate-700/30 border border-slate-600/50 rounded-xl text-white hover:bg-slate-600/30 transition-all duration-200"
              >
                View All Stations
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/water-data')}
                className="w-full p-3 bg-slate-700/30 border border-slate-600/50 rounded-xl text-white hover:bg-slate-600/30 transition-all duration-200"
              >
                Export Data
              </motion.button>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;