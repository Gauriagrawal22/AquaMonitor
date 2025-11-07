import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Droplets, Calendar, Download, TrendingUp, Cloud, Zap } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import LoadingSpinner from '../components/LoadingSpinner';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

const RechargeEstimation: React.FC = () => {
  const navigate = useNavigate();
  const [selectedYear, setSelectedYear] = useState('2024');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [showCustomPeriod, setShowCustomPeriod] = useState(false);
  const [rechargeData, setRechargeData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch recharge data from API
  useEffect(() => {
    const fetchRechargeData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/dashboard/recharge?year=${selectedYear}`);
        setRechargeData(response.data);
      } catch (error) {
        console.error('Error fetching recharge data:', error);
        // Fallback to sample data
        setRechargeData([
          { month: 'Jan', recharge: 15.2, rainfall: 2.1, groundwater: 8.7 },
          { month: 'Feb', recharge: 18.1, rainfall: 3.4, groundwater: 9.2 },
          { month: 'Mar', recharge: 22.5, rainfall: 8.9, groundwater: 10.1 },
          { month: 'Apr', recharge: 28.3, rainfall: 15.2, groundwater: 12.4 },
          { month: 'May', recharge: 35.1, rainfall: 28.7, groundwater: 15.8 },
          { month: 'Jun', recharge: 42.8, rainfall: 95.3, groundwater: 22.1 },
          { month: 'Jul', recharge: 58.7, rainfall: 187.4, groundwater: 28.9 },
          { month: 'Aug', recharge: 62.4, rainfall: 201.6, groundwater: 31.2 },
          { month: 'Sep', recharge: 45.2, rainfall: 118.3, groundwater: 25.7 },
          { month: 'Oct', recharge: 31.8, rainfall: 32.1, groundwater: 18.4 },
          { month: 'Nov', recharge: 24.6, rainfall: 8.7, groundwater: 13.2 },
          { month: 'Dec', recharge: 19.3, rainfall: 3.2, groundwater: 10.5 },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchRechargeData();
  }, [selectedYear]);

  const districtStats = [
    { name: 'North Delhi', recharge: 24.5, efficiency: 68, trend: 'up' },
    { name: 'South Delhi', recharge: 31.2, efficiency: 74, trend: 'up' },
    { name: 'East Delhi', recharge: 19.8, efficiency: 62, trend: 'down' },
    { name: 'West Delhi', recharge: 27.6, efficiency: 71, trend: 'up' },
    { name: 'Central Delhi', recharge: 22.1, efficiency: 65, trend: 'stable' },
    { name: 'Gurgaon', recharge: 35.4, efficiency: 78, trend: 'up' },
    { name: 'Faridabad', recharge: 28.9, efficiency: 69, trend: 'stable' },
    { name: 'Noida', recharge: 33.7, efficiency: 76, trend: 'up' },
  ];

  const insightCards = [
    {
      title: 'Peak Recharge Period',
      value: 'Jul-Aug 2024',
      description: 'Maximum groundwater recharge during monsoon season',
      icon: Cloud,
      color: 'from-blue-500 to-cyan-500',
      action: () => navigate('/trends?period=monsoon')
    },
    {
      title: 'Recharge Efficiency',
      value: '72.3%',
      description: 'Average conversion of rainfall to groundwater',
      icon: Zap,
      color: 'from-amber-500 to-orange-500',
      action: () => navigate('/trends?metric=efficiency')
    },
    {
      title: 'Annual Projection',
      value: '387.2mm',
      description: 'Expected total recharge for 2024',
      icon: TrendingUp,
      color: 'from-emerald-500 to-teal-500',
      action: () => navigate('/trends?view=projection')
    },
  ];

  const handleExportReport = () => {
    alert('Recharge estimation report is being generated. You will receive an email when ready.');
  };

  const handleDistrictClick = (districtName: string) => {
    navigate(`/map?district=${encodeURIComponent(districtName)}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Recharge Estimation</h1>
          <p className="text-slate-400">Groundwater recharge analysis and forecasting</p>
        </div>
        <div className="flex items-center space-x-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCustomPeriod(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-700/50 border border-slate-600/50 text-white rounded-xl hover:bg-slate-600/50 transition-all duration-200"
          >
            <Calendar className="w-4 h-4" />
            <span>Custom Period</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleExportReport}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-xl hover:from-teal-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-teal-500/25"
          >
            <Download className="w-5 h-5" />
            <span>Export Report</span>
          </motion.button>
        </div>
      </div>

      {/* Insight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {insightCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            onClick={card.action}
            className="cursor-pointer"
          >
            <GlassCard glow className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                  <card.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-400">{card.title}</h3>
                  <p className="text-2xl font-bold text-white">{card.value}</p>
                </div>
              </div>
              <p className="text-sm text-slate-400">{card.description}</p>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-2"
        >
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Droplets className="w-5 h-5 text-teal-400" />
                <h3 className="text-xl font-semibold text-white">Recharge Timeline</h3>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-slate-400">Year:</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="px-3 py-1 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                  >
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                    <option value="2022">2022</option>
                  </select>
                </div>
                <div className="flex bg-slate-800/50 rounded-lg p-1">
                  <button className="px-3 py-1 bg-teal-500 text-white rounded-md text-xs">Monthly</button>
                  <button className="px-3 py-1 text-slate-400 rounded-md text-xs">Seasonal</button>
                </div>
              </div>
            </div>
            
            <div className="h-80">
              {loading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <LoadingSpinner />
                </div>
              ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={rechargeData}>
                  <defs>
                    <linearGradient id="rechargeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#14B8A6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="rainfallGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9CA3AF" />
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
                    dataKey="rainfall" 
                    stackId="1"
                    stroke="#3B82F6" 
                    fill="url(#rainfallGradient)"
                    strokeWidth={2}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="recharge" 
                    stackId="2"
                    stroke="#14B8A6" 
                    fill="url(#rechargeGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
              )}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center space-x-8 mt-6">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-teal-400 rounded-full"></div>
                <span className="text-sm text-slate-300">Groundwater Recharge</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                <span className="text-sm text-slate-300">Rainfall</span>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* District Statistics */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">District Analysis</h3>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="px-2 py-1 bg-slate-800/50 border border-slate-600/50 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
              >
                <option value="all">All Districts</option>
                <option value="delhi">Delhi Only</option>
                <option value="ncr">NCR Only</option>
              </select>
            </div>
            
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {districtStats.map((district, index) => (
                <motion.div
                  key={district.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                  onClick={() => handleDistrictClick(district.name)}
                  className="p-4 bg-slate-800/30 border border-slate-600/30 rounded-xl hover:bg-slate-800/50 transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-white">{district.name}</h4>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      district.trend === 'up' 
                        ? 'bg-emerald-500/20 text-emerald-400' 
                        : district.trend === 'down'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-slate-500/20 text-slate-400'
                    }`}>
                      {district.trend}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Recharge Rate</span>
                    <span className="text-white font-medium">{district.recharge}mm/yr</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-slate-400">Efficiency</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-teal-500 to-blue-500 rounded-full transition-all duration-300"
                          style={{ width: `${district.efficiency}%` }}
                        />
                      </div>
                      <span className="text-white font-medium">{district.efficiency}%</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Date Range Slider */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Time Range Selector</h3>
          <div className="relative">
            <div className="w-full h-2 bg-slate-700 rounded-full">
              <div className="w-3/4 h-full bg-gradient-to-r from-teal-500 to-blue-500 rounded-full"></div>
            </div>
            <div className="flex justify-between text-sm text-slate-400 mt-2">
              <span>Jan 2024</span>
              <span>Current: Sep 2024</span>
              <span>Dec 2024</span>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Custom Period Modal */}
      <AnimatePresence>
        {showCustomPeriod && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowCustomPeriod(false)}
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
                <h3 className="text-xl font-semibold text-white mb-6">Custom Time Period</h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Start Date</label>
                      <input
                        type="date"
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">End Date</label>
                      <input
                        type="date"
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Analysis Type</label>
                    <select className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-400">
                      <option value="recharge">Recharge Analysis</option>
                      <option value="efficiency">Efficiency Study</option>
                      <option value="comparison">Period Comparison</option>
                      <option value="forecast">Forecast Model</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex space-x-3 mt-6">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowCustomPeriod(false)}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-xl hover:from-teal-600 hover:to-blue-700 transition-all duration-200"
                  >
                    Apply
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowCustomPeriod(false)}
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

export default RechargeEstimation;