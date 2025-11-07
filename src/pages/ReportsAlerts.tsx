import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, AlertTriangle, Info, CheckCircle, FileText, Download, Search, Filter, Brain, Zap } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import LoadingSpinner from '../components/LoadingSpinner';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

const ReportsAlerts: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'alerts' | 'reports'>('alerts');
  const [alertFilter, setAlertFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch alerts from API
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/dashboard/alerts?limit=20`);
        
        // Transform API data to match component format
        const formattedAlerts = response.data.map((alert: any, index: number) => ({
          id: alert.id || index,
          type: alert.type === 'critical' ? 'critical' : 
                alert.type === 'warning' ? 'warning' : 
                alert.type === 'success' ? 'success' : 'info',
          title: getAlertTitle(alert),
          message: alert.message,
          location: alert.location || 'Unknown Location',
          timestamp: alert.time,
          isNew: index < 3, // Mark first 3 as new
          aiInsight: getAIInsight(alert),
          stationId: alert.station_id || null
        }));
        
        setAlerts(formattedAlerts);
      } catch (error) {
        console.error('Error fetching alerts:', error);
        // Fallback to empty array
        setAlerts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  const getAlertTitle = (alert: any) => {
    if (alert.message.toLowerCase().includes('critical')) return 'Critical Water Level Alert';
    if (alert.message.toLowerCase().includes('battery')) return 'Battery Low Warning';
    if (alert.message.toLowerCase().includes('maintenance')) return 'Station Maintenance Required';
    if (alert.message.toLowerCase().includes('recharge')) return 'Recharge Pattern Detected';
    return 'System Alert';
  };

  const getAIInsight = (alert: any) => {
    if (alert.type === 'critical') {
      return 'AI Analysis: Unusual pattern detected - requires immediate attention.';
    }
    if (alert.message.toLowerCase().includes('battery')) {
      return null;
    }
    return 'AI Analysis: Pattern within normal operational parameters.';
  };

  const reports = [
    {
      id: 1,
      title: 'Monthly Groundwater Assessment Report',
      description: 'Comprehensive analysis of groundwater levels across regions for current month',
      type: 'monthly',
      generatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      size: '2.4 MB',
      pages: 24,
      downloadCount: 45,
      downloadUrl: '#'
    },
    {
      id: 2,
      title: 'Recharge Efficiency Analysis',
      description: 'Detailed study of groundwater recharge patterns and efficiency metrics',
      type: 'quarterly',
      generatedAt: new Date(Date.now() - 5*24*60*60*1000).toISOString().slice(0, 16).replace('T', ' '),
      size: '5.7 MB',
      pages: 67,
      downloadCount: 23,
      downloadUrl: '#'
    },
    {
      id: 3,
      title: 'Station Performance Summary',
      description: 'Performance metrics and status report for all monitoring stations',
      type: 'operational',
      generatedAt: new Date(Date.now() - 3*24*60*60*1000).toISOString().slice(0, 16).replace('T', ' '),
      size: '1.8 MB',
      pages: 18,
      downloadCount: 78,
      downloadUrl: '#'
    },
    {
      id: 4,
      title: 'Critical Alerts Investigation Report',
      description: 'Detailed investigation of recent critical water level alerts',
      type: 'investigation',
      generatedAt: new Date(Date.now() - 1*24*60*60*1000).toISOString().slice(0, 16).replace('T', ' '),
      size: '3.2 MB',
      pages: 35,
      downloadCount: 12,
      downloadUrl: '#'
    },
  ];

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical': return <AlertTriangle className="w-5 h-5 text-red-400" />;
      case 'warning': return <Bell className="w-5 h-5 text-amber-400" />;
      case 'info': return <Info className="w-5 h-5 text-blue-400" />;
      case 'success': return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      default: return <Info className="w-5 h-5 text-slate-400" />;
    }
  };

  const getAlertColors = (type: string) => {
    switch (type) {
      case 'critical': return 'from-red-500/20 to-pink-500/20 border-red-400/30';
      case 'warning': return 'from-amber-500/20 to-orange-500/20 border-amber-400/30';
      case 'info': return 'from-blue-500/20 to-indigo-500/20 border-blue-400/30';
      case 'success': return 'from-emerald-500/20 to-teal-500/20 border-emerald-400/30';
      default: return 'from-slate-500/20 to-gray-500/20 border-slate-400/30';
    }
  };

  const getReportTypeColor = (type: string) => {
    switch (type) {
      case 'monthly': return 'from-teal-500 to-cyan-500';
      case 'quarterly': return 'from-blue-500 to-indigo-500';
      case 'operational': return 'from-amber-500 to-orange-500';
      case 'investigation': return 'from-red-500 to-pink-500';
      default: return 'from-slate-500 to-gray-500';
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = alertFilter === 'all' || alert.type === alertFilter;
    
    return matchesSearch && matchesFilter;
  });

  const handleAlertClick = (alert: typeof alerts[0]) => {
    if (alert.stationId) {
      navigate(`/water-data?station=${alert.stationId}`);
    }
  };

  const handleDownloadReport = (report: typeof reports[0]) => {
    alert(`Downloading ${report.title}...`);
  };

  const handleGenerateReport = () => {
    setShowGenerateModal(false);
    alert('Report generation started! You will receive an email when ready.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Reports & Alerts</h1>
          <p className="text-slate-400">Monitor system alerts and generate comprehensive reports</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowGenerateModal(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-xl hover:from-teal-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-teal-500/25"
        >
          <FileText className="w-5 h-5" />
          <span>Generate Report</span>
        </motion.button>
      </div>

      {/* Tab Navigation */}
      <GlassCard className="p-1">
        <div className="flex bg-slate-800/30 rounded-xl">
          <button
            onClick={() => setActiveTab('alerts')}
            className={`flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-xl transition-all duration-200 ${
              activeTab === 'alerts'
                ? 'bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Alerts</span>
            <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">3</span>
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-xl transition-all duration-200 ${
              activeTab === 'reports'
                ? 'bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Reports</span>
          </button>
        </div>
      </GlassCard>

      <AnimatePresence mode="wait">
        {activeTab === 'alerts' && (
          <motion.div
            key="alerts"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Alert Filters */}
            <GlassCard className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0 md:space-x-6">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search alerts..."
                      className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-slate-400" />
                    <select
                      value={alertFilter}
                      onChange={(e) => setAlertFilter(e.target.value)}
                      className="px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                    >
                      <option value="all">All Alerts</option>
                      <option value="critical">Critical</option>
                      <option value="warning">Warning</option>
                      <option value="info">Info</option>
                      <option value="success">Success</option>
                    </select>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Alerts List */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : filteredAlerts.length === 0 ? (
              <GlassCard className="p-12">
                <div className="text-center text-slate-400">
                  <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No alerts found</p>
                </div>
              </GlassCard>
            ) : (
            <div className="space-y-4">
              {filteredAlerts.map((alert, index) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  onClick={() => handleAlertClick(alert)}
                  className="cursor-pointer"
                >
                  <GlassCard className={`p-6 bg-gradient-to-r ${getAlertColors(alert.type)} border hover:scale-105 transition-transform duration-200`}>
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 mt-1">
                        {getAlertIcon(alert.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-white">{alert.title}</h3>
                          {alert.isNew && (
                            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded-full border border-blue-400/30">
                              NEW
                            </span>
                          )}
                        </div>
                        
                        <p className="text-slate-300 mb-3">{alert.message}</p>
                        
                        <div className="flex items-center space-x-4 text-sm text-slate-400 mb-3">
                          <span>{alert.location}</span>
                          <span>•</span>
                          <span>{alert.timestamp}</span>
                        </div>
                        
                        {alert.aiInsight && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="p-4 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-400/20 rounded-xl"
                          >
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                                  <Brain className="w-4 h-4 text-white" />
                                </div>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium text-purple-300 mb-1">AI Insight</h4>
                                <p className="text-sm text-slate-300">{alert.aiInsight}</p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </div>
                      
                      <div className="flex-shrink-0 flex space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="w-8 h-8 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg flex items-center justify-center transition-all duration-200"
                        >
                          <Zap className="w-4 h-4 text-slate-300" />
                        </motion.button>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
            )}
          </motion.div>
        )}

        {activeTab === 'reports' && (
          <motion.div
            key="reports"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reports.map((report, index) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <GlassCard className="p-6 hover:scale-105 transition-transform duration-200">
                    <div className="flex items-start space-x-4">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${getReportTypeColor(report.type)} flex items-center justify-center flex-shrink-0`}>
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-white mb-2">{report.title}</h3>
                        <p className="text-slate-400 text-sm mb-4">{report.description}</p>
                        
                        <div className="flex items-center justify-between text-sm text-slate-400 mb-4">
                          <span>{report.generatedAt}</span>
                          <span>{report.size}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm text-slate-400">
                            <span>{report.pages} pages</span>
                            <span>•</span>
                            <span>{report.downloadCount} downloads</span>
                          </div>
                          
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDownloadReport(report)}
                            className="flex items-center space-x-2 px-4 py-2 bg-teal-500/20 border border-teal-400/30 text-teal-400 rounded-lg hover:bg-teal-500/30 transition-all duration-200"
                          >
                            <Download className="w-4 h-4" />
                            <span>Download</span>
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generate Report Modal */}
      <AnimatePresence>
        {showGenerateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowGenerateModal(false)}
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
                <h3 className="text-xl font-semibold text-white mb-6">Generate New Report</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Report Type</label>
                    <select className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-400">
                      <option value="monthly">Monthly Assessment</option>
                      <option value="quarterly">Quarterly Analysis</option>
                      <option value="operational">Station Performance</option>
                      <option value="investigation">Alert Investigation</option>
                      <option value="custom">Custom Report</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Time Period</label>
                    <select className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-400">
                      <option value="current">Current Month</option>
                      <option value="last">Last Month</option>
                      <option value="quarter">Last Quarter</option>
                      <option value="year">Last Year</option>
                      <option value="custom">Custom Range</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Include Sections</label>
                    <div className="space-y-2">
                      {['Executive Summary', 'Data Analysis', 'Trend Charts', 'AI Insights', 'Recommendations'].map((section) => (
                        <label key={section} className="flex items-center space-x-2">
                          <input type="checkbox" defaultChecked className="rounded" />
                          <span className="text-sm text-slate-300">{section}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-3 mt-6">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleGenerateReport}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-xl hover:from-teal-600 hover:to-blue-700 transition-all duration-200"
                  >
                    Generate
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowGenerateModal(false)}
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

export default ReportsAlerts;