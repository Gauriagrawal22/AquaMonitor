import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, MapPin, Activity, Calendar, Settings, Plus, Eye } from 'lucide-react';
import GlassCard from '../components/GlassCard';

const StationsManagement: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [showAddModal, setShowAddModal] = useState(false);

  const stations = [
    {
      id: 'DWLR-2341',
      name: 'Delhi North Station',
      location: 'Rohini, Delhi',
      lat: 28.7041,
      lng: 77.1025,
      status: 'active',
      lastReading: '22.5m',
      installDate: '2023-01-15',
      battery: 87,
      dataPoints: 2847,
    },
    {
      id: 'DWLR-2342',
      name: 'Gurgaon Central',
      location: 'Sector 14, Gurgaon',
      lat: 28.4595,
      lng: 77.0266,
      status: 'warning',
      lastReading: '18.2m',
      installDate: '2023-02-10',
      battery: 23,
      dataPoints: 1956,
    },
    {
      id: 'DWLR-2343',
      name: 'Noida Extension',
      location: 'Greater Noida',
      lat: 28.4744,
      lng: 77.5040,
      status: 'inactive',
      lastReading: 'N/A',
      installDate: '2022-11-20',
      battery: 0,
      dataPoints: 892,
    },
    {
      id: 'DWLR-2344',
      name: 'Faridabad South',
      location: 'Sector 21, Faridabad',
      lat: 28.4089,
      lng: 77.3178,
      status: 'active',
      lastReading: '25.1m',
      installDate: '2023-03-05',
      battery: 94,
      dataPoints: 3241,
    },
    {
      id: 'DWLR-2345',
      name: 'Dwarka Station',
      location: 'Dwarka, Delhi',
      lat: 28.5921,
      lng: 77.0460,
      status: 'active',
      lastReading: '19.8m',
      installDate: '2023-01-30',
      battery: 76,
      dataPoints: 2654,
    },
    {
      id: 'DWLR-2346',
      name: 'Vasant Kunj Monitor',
      location: 'Vasant Kunj, Delhi',
      lat: 28.5244,
      lng: 77.1589,
      status: 'maintenance',
      lastReading: '21.3m',
      installDate: '2022-12-12',
      battery: 45,
      dataPoints: 1743,
    },
  ];

  const filteredStations = stations.filter(station => {
    const matchesSearch = station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         station.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         station.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || station.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'from-emerald-500 to-teal-500';
      case 'warning': return 'from-amber-500 to-orange-500';
      case 'inactive': return 'from-red-500 to-pink-500';
      case 'maintenance': return 'from-blue-500 to-indigo-500';
      default: return 'from-slate-500 to-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'warning': return 'Warning';
      case 'inactive': return 'Inactive';
      case 'maintenance': return 'Maintenance';
      default: return 'Unknown';
    }
  };

  const handleViewStation = (stationId: string) => {
    navigate(`/water-data?station=${stationId}`);
  };
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Station Management</h1>
          <p className="text-slate-400">Monitor and manage DWLR stations across the network</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-xl hover:from-teal-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-teal-500/25"
        >
          <Plus className="w-5 h-5" />
          <span>Add Station</span>
        </motion.button>
      </div>

      {/* Filters and Search */}
      <GlassCard className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0 md:space-x-6">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search stations..."
                className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="warning">Warning</option>
                <option value="inactive">Inactive</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
            
            <div className="flex bg-slate-800/50 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  viewMode === 'grid' 
                    ? 'bg-teal-500 text-white' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  viewMode === 'map' 
                    ? 'bg-teal-500 text-white' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Map
              </button>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Stations Grid */}
      <AnimatePresence mode="wait">
        {viewMode === 'grid' && (
          <motion.div
            key="grid"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredStations.map((station, index) => (
              <motion.div
                key={station.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <GlassCard className="p-6 hover:scale-105 transition-transform duration-200">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{station.name}</h3>
                      <p className="text-sm text-slate-400">{station.id}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getStatusColor(station.status)} text-white`}>
                      {getStatusText(station.status)}
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-teal-400" />
                      <span className="text-sm text-slate-300">{station.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Activity className="w-4 h-4 text-teal-400" />
                      <span className="text-sm text-slate-300">
                        Last Reading: <span className="text-white font-medium">{station.lastReading}</span>
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-teal-400" />
                      <span className="text-sm text-slate-300">
                        Installed: {new Date(station.installDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs text-slate-400">Battery Level</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-300 ${
                              station.battery > 50 ? 'bg-emerald-500' :
                              station.battery > 25 ? 'bg-amber-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${station.battery}%` }}
                          />
                        </div>
                        <span className="text-sm text-white font-medium">{station.battery}%</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400">Data Points</p>
                      <p className="text-sm text-white font-medium">{station.dataPoints.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleViewStation(station.id)}
                      className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-teal-500/20 border border-teal-400/30 rounded-lg text-teal-400 hover:bg-teal-500/30 transition-all duration-200"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="text-sm">View</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center justify-center px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-400 hover:text-white hover:bg-slate-600/50 transition-all duration-200"
                    >
                      <Settings className="w-4 h-4" />
                    </motion.button>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        )}
        
        {viewMode === 'map' && (
          <motion.div
            key="map"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            onClick={() => navigate('/map')}
            className="cursor-pointer"
          >
            <GlassCard className="p-8 h-96 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-16 h-16 text-teal-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Interactive Map View</h3>
                <p className="text-slate-400">3D station visualization with real-time status indicators</p>
                <p className="text-sm text-slate-500 mt-2">Map integration would be implemented here</p>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Station Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddModal(false)}
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
                <h3 className="text-xl font-semibold text-white mb-6">Add New Station</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Station Name</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
                      placeholder="Enter station name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Location</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
                      placeholder="Enter location"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Latitude</label>
                      <input
                        type="number"
                        step="0.000001"
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
                        placeholder="28.7041"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Longitude</label>
                      <input
                        type="number"
                        step="0.000001"
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
                        placeholder="77.1025"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-3 mt-6">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-xl hover:from-teal-600 hover:to-blue-700 transition-all duration-200"
                  >
                    Add Station
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAddModal(false)}
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

export default StationsManagement;