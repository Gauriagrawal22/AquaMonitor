import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Database, Download, Filter, Calendar, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import GlassCard from '../components/GlassCard';

const WaterLevelData: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const stationParam = searchParams.get('station');
  
  const [selectedStation, setSelectedStation] = useState('all');
  const [dateRange, setDateRange] = useState('30d');
  const [sortBy, setSortBy] = useState('date');
  const [showExportModal, setShowExportModal] = useState(false);

  // Set initial station if coming from URL parameter
  React.useEffect(() => {
    if (stationParam) {
      setSelectedStation(stationParam);
    }
  }, [stationParam]);

  const mockSparklineData = [
    { value: 20.5 },
    { value: 19.8 },
    { value: 21.2 },
    { value: 20.1 },
    { value: 22.3 },
    { value: 21.8 },
    { value: 20.9 },
  ];

  const waterLevelData = [
    {
      id: 'DWLR-2341',
      station: 'Delhi North Station',
      location: 'Rohini, Delhi',
      currentLevel: 22.5,
      trend: 'down',
      change: -1.2,
      lastUpdated: '2024-01-15 14:30',
      readings: 847,
      sparkline: mockSparklineData,
    },
    {
      id: 'DWLR-2342',
      station: 'Gurgaon Central',
      location: 'Sector 14, Gurgaon',
      currentLevel: 18.2,
      trend: 'up',
      change: +0.8,
      lastUpdated: '2024-01-15 14:28',
      readings: 623,
      sparkline: mockSparklineData,
    },
    {
      id: 'DWLR-2343',
      station: 'Noida Extension',
      location: 'Greater Noida',
      currentLevel: 25.1,
      trend: 'stable',
      change: 0.1,
      lastUpdated: '2024-01-15 14:25',
      readings: 392,
      sparkline: mockSparklineData,
    },
    {
      id: 'DWLR-2344',
      station: 'Faridabad South',
      location: 'Sector 21, Faridabad',
      currentLevel: 19.8,
      trend: 'down',
      change: -2.1,
      lastUpdated: '2024-01-15 14:32',
      readings: 756,
      sparkline: mockSparklineData,
    },
    {
      id: 'DWLR-2345',
      station: 'Dwarka Station',
      location: 'Dwarka, Delhi',
      currentLevel: 23.7,
      trend: 'up',
      change: +1.5,
      lastUpdated: '2024-01-15 14:29',
      readings: 934,
      sparkline: mockSparklineData,
    },
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-emerald-400" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-400" />;
      case 'stable': return <Minus className="w-4 h-4 text-slate-400" />;
      default: return <Minus className="w-4 h-4 text-slate-400" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-emerald-400';
      case 'down': return 'text-red-400';
      case 'stable': return 'text-slate-400';
      default: return 'text-slate-400';
    }
  };

  const handleExport = () => {
    setShowExportModal(false);
    // Simulate export
    alert('Data export started! You will receive an email when ready.');
  };

  const handleViewDetails = (stationId: string) => {
    navigate(`/trends?station=${stationId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Water Level Data</h1>
          <p className="text-slate-400">Real-time groundwater monitoring and analysis</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowExportModal(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-xl hover:from-teal-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-teal-500/25"
        >
          <Download className="w-5 h-5" />
          <span>Export Data</span>
        </motion.button>
      </div>

      {/* Query Builder */}
      <GlassCard className="p-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between space-y-4 md:space-y-0 md:space-x-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Station</label>
              <select
                value={selectedStation}
                onChange={(e) => setSelectedStation(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
              >
                <option value="all">All Stations</option>
                <option value="DWLR-2341">Delhi North</option>
                <option value="DWLR-2342">Gurgaon Central</option>
                <option value="DWLR-2343">Noida Extension</option>
                <option value="DWLR-2344">Faridabad South</option>
                <option value="DWLR-2345">Dwarka Station</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Date Range</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="3m">Last 3 months</option>
                <option value="1y">Last year</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
              >
                <option value="date">Date (Latest)</option>
                <option value="station">Station Name</option>
                <option value="level">Water Level</option>
                <option value="change">Change Rate</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-700/50 border border-slate-600/50 text-white rounded-lg hover:bg-slate-600/50 transition-all duration-200"
            >
              <Filter className="w-4 h-4" />
              <span>Advanced</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 px-4 py-2 bg-teal-500/20 border border-teal-400/30 text-teal-400 rounded-lg hover:bg-teal-500/30 transition-all duration-200"
            >
              <Calendar className="w-4 h-4" />
              <span>Custom Range</span>
            </motion.button>
          </div>
        </div>
      </GlassCard>

      {/* Data Table */}
      <GlassCard className="overflow-hidden">
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center space-x-3">
            <Database className="w-5 h-5 text-teal-400" />
            <h3 className="text-lg font-semibold text-white">Live Readings</h3>
            <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-full">
              Real-time
            </span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800/30">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-slate-300">Station</th>
                <th className="text-left p-4 text-sm font-medium text-slate-300">Current Level</th>
                <th className="text-left p-4 text-sm font-medium text-slate-300">Trend</th>
                <th className="text-left p-4 text-sm font-medium text-slate-300">Change</th>
                <th className="text-left p-4 text-sm font-medium text-slate-300">7-Day Chart</th>
                <th className="text-left p-4 text-sm font-medium text-slate-300">Last Updated</th>
                <th className="text-left p-4 text-sm font-medium text-slate-300">Readings</th>
              </tr>
            </thead>
            <tbody>
              {waterLevelData.map((item, index) => (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="border-b border-slate-800/30 hover:bg-slate-800/20 transition-colors duration-200"
                >
                  <td className="p-4">
                    <div>
                      <p className="font-medium text-white">{item.station}</p>
                      <p className="text-sm text-slate-400">{item.id}</p>
                      <p className="text-xs text-slate-500">{item.location}</p>
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-white">{item.currentLevel}m</span>
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      {getTrendIcon(item.trend)}
                      <span className={`text-sm font-medium capitalize ${getTrendColor(item.trend)}`}>
                        {item.trend}
                      </span>
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <div className="flex items-center space-x-1">
                      <span className={`font-medium ${
                        item.change > 0 ? 'text-emerald-400' :
                        item.change < 0 ? 'text-red-400' :
                        'text-slate-400'
                      }`}>
                        {item.change > 0 ? '+' : ''}{item.change}m
                      </span>
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <div className="w-24 h-12">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={item.sparkline}>
                          <Line 
                            type="monotone" 
                            dataKey="value" 
                            stroke="#14B8A6" 
                            strokeWidth={2}
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <span className="text-sm text-slate-300">{item.lastUpdated}</span>
                  </td>
                  
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-white font-medium">{item.readings}</span>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleViewDetails(item.id)}
                        className="w-6 h-6 bg-teal-500/20 hover:bg-teal-500/30 border border-teal-400/30 rounded text-teal-400 text-xs flex items-center justify-center transition-all duration-200"
                      >
                        →
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Export Modal */}
      <AnimatePresence>
        {showExportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowExportModal(false)}
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
                <h3 className="text-xl font-semibold text-white mb-6">Export Data</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Format</label>
                    <select className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-400">
                      <option value="csv">CSV</option>
                      <option value="xlsx">Excel</option>
                      <option value="json">JSON</option>
                      <option value="pdf">PDF Report</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Date Range</label>
                    <select className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-400">
                      <option value="current">Current Selection</option>
                      <option value="all">All Available Data</option>
                      <option value="custom">Custom Range</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="includeMetadata" className="rounded" />
                    <label htmlFor="includeMetadata" className="text-sm text-slate-300">Include metadata</label>
                  </div>
                </div>
                
                <div className="flex space-x-3 mt-6">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleExport}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-xl hover:from-teal-600 hover:to-blue-700 transition-all duration-200"
                  >
                    Export
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowExportModal(false)}
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

export default WaterLevelData;