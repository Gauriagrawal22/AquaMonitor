import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, Calendar, ToggleLeft, ToggleRight, Layers, Eye, BarChart3 } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import LoadingSpinner from '../components/LoadingSpinner';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

const TrendAnalysis: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  
  const [viewMode, setViewMode] = useState<'district' | 'state'>('district');
  const [selectedYear, setSelectedYear] = useState('2024');
  const [showComparison, setShowComparison] = useState(false);
  const [activeChart, setActiveChart] = useState('seasonal');
  const [seasonalData, setSeasonalData] = useState<any[]>([]);
  const [monthlyTrendData, setMonthlyTrendData] = useState<any[]>([]);
  const [districtComparison, setDistrictComparison] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Handle URL parameters
  useEffect(() => {
    const station = searchParams.get('station');
    const period = searchParams.get('period');
    const metric = searchParams.get('metric');
    const view = searchParams.get('view');
    
    if (period === 'monsoon') setActiveChart('seasonal');
    if (metric === 'efficiency') setActiveChart('district');
    if (view === 'projection') setShowComparison(true);
  }, [searchParams]);

  // Fetch seasonal trends
  useEffect(() => {
    const fetchSeasonalData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/dashboard/trends/seasonal?years=5`);
        setSeasonalData(response.data);
      } catch (error) {
        console.error('Error fetching seasonal data:', error);
        setSeasonalData([]);
      } finally {
        setLoading(false);
      }
    };

    if (activeChart === 'seasonal') {
      fetchSeasonalData();
    }
  }, [activeChart]);

  // Fetch monthly comparison data
  useEffect(() => {
    const fetchMonthlyData = async () => {
      try {
        setLoading(true);
        const year1 = parseInt(selectedYear) - 1;
        const year2 = parseInt(selectedYear);
        const response = await axios.get(`${API_BASE_URL}/dashboard/trends/monthly?year1=${year1}&year2=${year2}`);
        setMonthlyTrendData(response.data);
      } catch (error) {
        console.error('Error fetching monthly data:', error);
        setMonthlyTrendData([]);
      } finally {
        setLoading(false);
      }
    };

    if (activeChart === 'monthly') {
      fetchMonthlyData();
    }
  }, [activeChart, selectedYear]);

  // Fetch district comparison data
  useEffect(() => {
    const fetchDistrictData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/dashboard/trends/districts?year=${selectedYear}`);
        setDistrictComparison(response.data);
      } catch (error) {
        console.error('Error fetching district data:', error);
        setDistrictComparison([]);
      } finally {
        setLoading(false);
      }
    };

    if (activeChart === 'district') {
      fetchDistrictData();
    }
  }, [activeChart, selectedYear]);

  const chartTypes = [
    { id: 'seasonal', name: 'Seasonal Trends', icon: Layers },
    { id: 'monthly', name: 'Monthly Comparison', icon: BarChart3 },
    { id: 'district', name: 'District Analysis', icon: Eye },
  ];

  const handleDistrictClick = (districtName: string) => {
    navigate(`/map?district=${encodeURIComponent(districtName)}`);
  };
  const renderChart = () => {
    if (loading) {
      return (
        <div className="w-full h-full flex items-center justify-center">
          <LoadingSpinner />
        </div>
      );
    }

    switch (activeChart) {
      case 'seasonal':
        if (seasonalData.length === 0) {
          return <div className="flex items-center justify-center h-full text-slate-400">No seasonal data available</div>;
        }
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={seasonalData}>
              <defs>
                {['spring', 'summer', 'monsoon', 'winter'].map((season) => (
                  <linearGradient key={season} id={`${season}Gradient`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={
                      season === 'spring' ? '#10B981' :
                      season === 'summer' ? '#F59E0B' :
                      season === 'monsoon' ? '#3B82F6' : '#8B5CF6'
                    } stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={
                      season === 'spring' ? '#10B981' :
                      season === 'summer' ? '#F59E0B' :
                      season === 'monsoon' ? '#3B82F6' : '#8B5CF6'
                    } stopOpacity={0}/>
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="year" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F3F4F6'
                }} 
              />
              <Area type="monotone" dataKey="spring" stackId="1" stroke="#10B981" fill="url(#springGradient)" />
              <Area type="monotone" dataKey="summer" stackId="1" stroke="#F59E0B" fill="url(#summerGradient)" />
              <Area type="monotone" dataKey="monsoon" stackId="1" stroke="#3B82F6" fill="url(#monsoonGradient)" />
              <Area type="monotone" dataKey="winter" stackId="1" stroke="#8B5CF6" fill="url(#winterGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        );
      
      case 'monthly':
        if (monthlyTrendData.length === 0) {
          return <div className="flex items-center justify-center h-full text-slate-400">No monthly data available</div>;
        }
        const year1 = parseInt(selectedYear) - 1;
        const year2 = parseInt(selectedYear);
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyTrendData}>
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
              <Line type="monotone" dataKey={year1.toString()} stroke="#6B7280" strokeWidth={2} strokeDasharray="5 5" />
              <Line type="monotone" dataKey={year2.toString()} stroke="#14B8A6" strokeWidth={3} />
              <Line type="monotone" dataKey="avg" stroke="#F59E0B" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'district':
        if (districtComparison.length === 0) {
          return <div className="flex items-center justify-center h-full text-slate-400">No district data available</div>;
        }
        return (
          <div className="space-y-4 h-full overflow-y-auto p-4">
            {districtComparison.map((district, index) => (
              <motion.div
                key={district.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                onClick={() => handleDistrictClick(district.name)}
                className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl cursor-pointer hover:bg-slate-800/50 transition-all"
              >
                <div>
                  <h4 className="text-white font-medium">{district.name}</h4>
                  <div className="flex items-center space-x-4 text-sm text-slate-400">
                    <span>Current: {district.current}m</span>
                    <span>Previous: {district.previous}m</span>
                  </div>
                </div>
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-lg ${
                  district.change > 0 
                    ? 'bg-emerald-500/20 text-emerald-400' 
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  <TrendingUp className={`w-4 h-4 ${district.change < 0 ? 'rotate-180' : ''}`} />
                  <span className="font-medium">{Math.abs(district.change)}%</span>
                </div>
              </motion.div>
            ))}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Trend Analysis</h1>
          <p className="text-slate-400">Advanced groundwater trend visualization and forecasting</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-slate-800/50 rounded-xl p-1">
            <button
              onClick={() => setViewMode('district')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                viewMode === 'district'
                  ? 'bg-teal-500 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              District
            </button>
            <button
              onClick={() => setViewMode('state')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                viewMode === 'state'
                  ? 'bg-teal-500 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              State
            </button>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowComparison(!showComparison)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 ${
              showComparison
                ? 'bg-gradient-to-r from-teal-500 to-blue-600 text-white'
                : 'bg-slate-700/50 border border-slate-600/50 text-slate-300 hover:text-white'
            }`}
          >
            {showComparison ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
            <span>Compare Years</span>
          </motion.button>
        </div>
      </div>

      {/* Chart Type Selector */}
      <GlassCard className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-2">
            {chartTypes.map((chart) => (
              <motion.button
                key={chart.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveChart(chart.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                  activeChart === chart.id
                    ? 'bg-gradient-to-r from-teal-500 to-blue-600 text-white'
                    : 'bg-slate-700/50 text-slate-400 hover:text-white'
                }`}
              >
                <chart.icon className="w-4 h-4" />
                <span>{chart.name}</span>
              </motion.button>
            ))}
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
              >
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
                <option value="2021">2021</option>
              </select>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Main Chart */}
      <motion.div
        key={activeChart}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-teal-400" />
              <span>
                {chartTypes.find(chart => chart.id === activeChart)?.name} - {viewMode === 'district' ? 'District Level' : 'State Level'}
              </span>
            </h3>
            {activeChart === 'seasonal' && (
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                  <span className="text-slate-300">Spring</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                  <span className="text-slate-300">Summer</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-slate-300">Monsoon</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-slate-300">Winter</span>
                </div>
              </div>
            )}
            {activeChart === 'monthly' && (
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-slate-500 border-2 border-dashed border-slate-500 rounded-full"></div>
                  <span className="text-slate-300">2023</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                  <span className="text-slate-300">2024</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                  <span className="text-slate-300">Average</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="h-80">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeChart}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full"
              >
                {renderChart()}
              </motion.div>
            </AnimatePresence>
          </div>
        </GlassCard>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          onClick={() => navigate('/recharge')}
          className="cursor-pointer"
        >
          <GlassCard className="p-6">
            <h4 className="text-lg font-semibold text-white mb-4">Trend Summary</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Overall Trend</span>
                <div className="flex items-center space-x-2 text-emerald-400">
                  <TrendingUp className="w-4 h-4" />
                  <span className="font-medium">Positive</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Best Performing</span>
                <span className="text-white font-medium">Gurgaon</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Avg. Change</span>
                <span className="text-white font-medium">+4.2%</span>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          onClick={() => navigate('/recharge?view=seasonal')}
          className="cursor-pointer"
        >
          <GlassCard className="p-6">
            <h4 className="text-lg font-semibold text-white mb-4">Seasonal Insights</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Peak Season</span>
                <span className="text-blue-400 font-medium">Monsoon</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Low Season</span>
                <span className="text-amber-400 font-medium">Summer</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Variation</span>
                <span className="text-white font-medium">72%</span>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          onClick={() => navigate('/reports?type=forecast')}
          className="cursor-pointer"
        >
          <GlassCard className="p-6">
            <h4 className="text-lg font-semibold text-white mb-4">Forecast</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Next Month</span>
                <div className="flex items-center space-x-2 text-emerald-400">
                  <TrendingUp className="w-4 h-4" />
                  <span className="font-medium">+2.1m</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Next Quarter</span>
                <div className="flex items-center space-x-2 text-emerald-400">
                  <TrendingUp className="w-4 h-4" />
                  <span className="font-medium">+5.8m</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Confidence</span>
                <span className="text-white font-medium">87%</span>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
};

export default TrendAnalysis;