import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Map, Layers, Filter, Zap, Droplets, Cloud, Eye, Search, Settings } from 'lucide-react';
import GlassCard from '../components/GlassCard';

const MapExplorer: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  
  const [activeLayer, setActiveLayer] = useState('aquifers');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStation, setSelectedStation] = useState<string | null>(null);

  // Handle URL parameters
  React.useEffect(() => {
    const district = searchParams.get('district');
    if (district) {
      // Focus on specific district
      console.log('Focusing on district:', district);
    }
  }, [searchParams]);

  const mapLayers = [
    { id: 'aquifers', name: 'Aquifer Layers', icon: Layers, color: 'from-blue-500 to-cyan-500' },
    { id: 'stations', name: 'Well Stations', icon: Droplets, color: 'from-teal-500 to-emerald-500' },
    { id: 'rainfall', name: 'Rainfall Overlay', icon: Cloud, color: 'from-indigo-500 to-purple-500' },
    { id: 'anomalies', name: 'Anomaly Detection', icon: Zap, color: 'from-amber-500 to-red-500' },
  ];

  const wellStations = [
    { id: 'DWLR-2341', name: 'Delhi North', x: 30, y: 25, status: 'active', level: 22.5, anomaly: false },
    { id: 'DWLR-2342', name: 'Gurgaon Central', x: 45, y: 60, status: 'warning', level: 18.2, anomaly: true },
    { id: 'DWLR-2343', name: 'Noida Extension', x: 70, y: 35, status: 'inactive', level: 0, anomaly: false },
    { id: 'DWLR-2344', name: 'Faridabad South', x: 55, y: 75, status: 'active', level: 25.1, anomaly: false },
    { id: 'DWLR-2345', name: 'Dwarka Station', x: 15, y: 45, status: 'active', level: 19.8, anomaly: false },
    { id: 'DWLR-2346', name: 'Vasant Kunj', x: 25, y: 55, status: 'maintenance', level: 21.3, anomaly: false },
  ];

  const filterOptions = [
    { id: 'region', name: 'Region', options: ['All', 'Delhi', 'NCR', 'Haryana', 'UP'] },
    { id: 'timespan', name: 'Time Period', options: ['Live', '24h', '7d', '30d', '1y'] },
    { id: 'status', name: 'Station Status', options: ['All', 'Active', 'Warning', 'Inactive', 'Maintenance'] },
    { id: 'anomaly', name: 'Anomaly Level', options: ['All', 'Normal', 'Moderate', 'High', 'Critical'] },
  ];

  const getStationColor = (status: string, anomaly: boolean) => {
    if (anomaly) return 'from-red-500 to-pink-500 animate-pulse';
    switch (status) {
      case 'active': return 'from-emerald-500 to-teal-500';
      case 'warning': return 'from-amber-500 to-orange-500';
      case 'inactive': return 'from-slate-500 to-gray-500';
      case 'maintenance': return 'from-blue-500 to-indigo-500';
      default: return 'from-slate-500 to-gray-500';
    }
  };

  const handleStationClick = (stationId: string) => {
    setSelectedStation(selectedStation === stationId ? null : stationId);
  };

  const handleStationDetails = (stationId: string) => {
    navigate(`/water-data?station=${stationId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Map Explorer</h1>
          <p className="text-slate-400">3D visualization of groundwater systems and monitoring networks</p>
        </div>
        <div className="flex items-center space-x-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 ${
              showFilters
                ? 'bg-gradient-to-r from-teal-500 to-blue-600 text-white'
                : 'bg-slate-700/50 border border-slate-600/50 text-slate-300 hover:text-white'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-700/50 border border-slate-600/50 text-slate-300 hover:text-white rounded-xl transition-all duration-200"
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Layer Controls */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <Layers className="w-5 h-5 text-teal-400" />
              <span>Map Layers</span>
            </h3>
            
            <div className="space-y-3">
              {mapLayers.map((layer, index) => (
                <motion.button
                  key={layer.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  onClick={() => setActiveLayer(layer.id)}
                  className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${
                    activeLayer === layer.id
                      ? `bg-gradient-to-r ${layer.color} text-white shadow-lg`
                      : 'bg-slate-800/30 text-slate-300 hover:bg-slate-700/50 hover:text-white'
                  }`}
                >
                  <layer.icon className="w-5 h-5" />
                  <span className="font-medium">{layer.name}</span>
                  {activeLayer === layer.id && (
                    <motion.div
                      layoutId="activeLayer"
                      className="ml-auto w-2 h-2 bg-white rounded-full"
                      initial={false}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </motion.button>
              ))}
            </div>

            {/* Search */}
            <div className="mt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search stations..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            {/* Filters Panel */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-6 space-y-4"
                >
                  {filterOptions.map((filter) => (
                    <div key={filter.id}>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        {filter.name}
                      </label>
                      <select className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-400">
                        {filter.options.map((option) => (
                          <option key={option} value={option.toLowerCase()}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </GlassCard>
        </motion.div>

        {/* Main Map Area */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-2"
        >
          <GlassCard className="p-6 h-[600px]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                <Map className="w-5 h-5 text-teal-400" />
                <span>Interactive 3D Map</span>
              </h3>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-full">
                  Live Data
                </span>
                <span className="text-xs text-slate-400">Last updated: 2 min ago</span>
              </div>
            </div>
            
            {/* Map Visualization */}
            <div className="relative w-full h-full bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 rounded-xl overflow-hidden">
              {/* Background Grid */}
              <div className="absolute inset-0 opacity-10">
                <div className="w-full h-full" style={{
                  backgroundImage: `
                    linear-gradient(rgba(20, 184, 166, 0.3) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(20, 184, 166, 0.3) 1px, transparent 1px)
                  `,
                  backgroundSize: '40px 40px'
                }}>
                </div>
              </div>

              {/* Aquifer Layers (background) */}
              <AnimatePresence>
                {activeLayer === 'aquifers' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0"
                  >
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{
                          scale: [1, 1.1, 1],
                          opacity: [0.1, 0.3, 0.1],
                        }}
                        transition={{
                          duration: 8,
                          repeat: Infinity,
                          delay: i * 2,
                          ease: "easeInOut"
                        }}
                        className="absolute bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-xl"
                        style={{
                          left: `${20 + i * 25}%`,
                          top: `${30 + i * 15}%`,
                          width: `${200 + i * 50}px`,
                          height: `${200 + i * 50}px`,
                        }}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Rainfall Overlay */}
              <AnimatePresence>
                {activeLayer === 'rainfall' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0"
                  >
                    {[...Array(20)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{
                          y: [0, 100, 0],
                          opacity: [0, 1, 0],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          delay: Math.random() * 3,
                          ease: "easeInOut"
                        }}
                        className="absolute w-1 h-8 bg-gradient-to-b from-blue-400 to-transparent"
                        style={{
                          left: `${Math.random() * 100}%`,
                          top: `-32px`,
                        }}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Well Stations */}
              <div className="absolute inset-0">
                {wellStations.map((station, index) => (
                  <motion.div
                    key={station.id}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                    style={{ left: `${station.x}%`, top: `${station.y}%` }}
                    onClick={() => handleStationClick(station.id)}
                  >
                    {/* Station Glow */}
                    <motion.div
                      animate={station.anomaly ? {
                        scale: [1, 1.5, 1],
                        opacity: [0.3, 0.8, 0.3],
                      } : {}}
                      transition={station.anomaly ? {
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      } : {}}
                      className={`absolute inset-0 w-8 h-8 rounded-full blur-md bg-gradient-to-r ${getStationColor(station.status, station.anomaly)}`}
                    />
                    
                    {/* Station Node */}
                    <motion.div
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      className={`relative w-6 h-6 rounded-full bg-gradient-to-r ${getStationColor(station.status, station.anomaly)} border-2 border-white/20 shadow-lg flex items-center justify-center`}
                    >
                      <Droplets className="w-3 h-3 text-white" />
                    </motion.div>

                    {/* Station Info Popup */}
                    <AnimatePresence>
                      {selectedStation === station.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.8, y: 10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute left-8 top-0 z-10 w-48 p-3 bg-slate-800/90 backdrop-blur-md border border-slate-600/50 rounded-lg shadow-xl"
                        >
                          <h4 className="text-white font-medium text-sm mb-1">{station.name}</h4>
                          <p className="text-xs text-slate-400 mb-2">{station.id}</p>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Status:</span>
                              <span className={`font-medium capitalize ${
                                station.status === 'active' ? 'text-emerald-400' :
                                station.status === 'warning' ? 'text-amber-400' :
                                station.status === 'inactive' ? 'text-slate-400' :
                                'text-blue-400'
                              }`}>
                                {station.status}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Water Level:</span>
                              <span className="text-white font-medium">
                                {station.level > 0 ? `${station.level}m` : 'N/A'}
                              </span>
                            </div>
                            {station.anomaly && (
                              <div className="flex justify-between">
                                <span className="text-slate-400">Anomaly:</span>
                                <span className="text-red-400 font-medium">Detected</span>
                              </div>
                            )}
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStationDetails(station.id);
                            }}
                            className="w-full mt-3 px-3 py-1 bg-teal-500/20 border border-teal-400/30 text-teal-400 rounded text-xs hover:bg-teal-500/30 transition-all duration-200"
                          >
                            View Details
                          </motion.button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>

              {/* Map Controls */}
              <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-8 h-8 bg-slate-800/80 backdrop-blur-md border border-slate-600/50 rounded-lg flex items-center justify-center text-white hover:bg-slate-700/80 transition-all duration-200"
                >
                  <Eye className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-8 h-8 bg-slate-800/80 backdrop-blur-md border border-slate-600/50 rounded-lg flex items-center justify-center text-white hover:bg-slate-700/80 transition-all duration-200"
                >
                  +
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-8 h-8 bg-slate-800/80 backdrop-blur-md border border-slate-600/50 rounded-lg flex items-center justify-center text-white hover:bg-slate-700/80 transition-all duration-200"
                >
                  -
                </motion.button>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Station Details */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Station Details</h3>
            
            <div className="space-y-4">
              {wellStations.slice(0, 4).map((station, index) => (
                <motion.div
                  key={station.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                  onClick={() => handleStationClick(station.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all duration-200 ${
                    selectedStation === station.id
                      ? 'bg-teal-500/10 border-teal-400/30'
                      : 'bg-slate-800/30 border-slate-600/30 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-white text-sm">{station.name}</h4>
                    <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${getStationColor(station.status, station.anomaly)}`}></div>
                  </div>
                  <p className="text-xs text-slate-400">{station.id}</p>
                  <div className="flex justify-between items-center mt-2 text-xs">
                    <span className="text-slate-400">Level:</span>
                    <span className="text-white font-medium">
                      {station.level > 0 ? `${station.level}m` : 'Offline'}
                    </span>
                  </div>
                  {station.anomaly && (
                    <div className="mt-2 px-2 py-1 bg-red-500/20 border border-red-400/30 rounded text-xs text-red-400">
                      Anomaly Detected
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
};

export default MapExplorer;