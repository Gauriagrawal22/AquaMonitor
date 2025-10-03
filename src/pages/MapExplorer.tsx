import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Layers, Filter, Droplets, AlertTriangle, MapPin, Navigation } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import LoadingSpinner from '../components/LoadingSpinner';
import 'leaflet/dist/leaflet.css';

// API service
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

// Fix for default marker icons in Leaflet with Webpack
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom marker icons for different station statuses
const createCustomIcon = (status: string) => {
  const colors: { [key: string]: string } = {
    active: '#10b981',
    warning: '#f59e0b',
    inactive: '#6b7280',
    error: '#ef4444'
  };

  const color = colors[status] || '#6b7280';

  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div style="position: relative;">
        <div style="
          width: 30px;
          height: 30px;
          background: ${color};
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 4px 6px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
          </svg>
        </div>
        ${status === 'warning' ? `
          <div style="
            position: absolute;
            top: -5px;
            right: -5px;
            width: 12px;
            height: 12px;
            background: #ef4444;
            border: 2px solid white;
            border-radius: 50%;
            animation: pulse 2s infinite;
          "></div>
        ` : ''}
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15]
  });
};

// Component to recenter map
const RecenterMap: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  
  return null;
};


const MapExplorer: React.FC = () => {
  const navigate = useNavigate();
  const [selectedStation, setSelectedStation] = useState<string | null>(null);
  const [activeLayer, setActiveLayer] = useState('stations');
  const [showFilters, setShowFilters] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([19.7515, 75.7139]); // Maharashtra center
  const [mapZoom, setMapZoom] = useState(7);
  const [stations, setStations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch real station data from API
  useEffect(() => {
    const fetchStations = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/stations`);
        
        // Transform the data to match our component's expected format
        const transformedStations = response.data.stations.map((station: any) => ({
          id: station.code || station.id,
          name: station.name,
          location: station.location || 'Unknown location',
          latitude: parseFloat(station.latitude),
          longitude: parseFloat(station.longitude),
          status: station.status || 'active',
          lastReading: station.lastReading ? `${station.lastReading}m` : 'N/A',
          battery: station.battery_level || 0,
          waterLevel: station.lastReading || 0,
          temperature: station.temperature || 0
        }));

        setStations(transformedStations);
        setError(null);
      } catch (err) {
        console.error('Error fetching stations:', err);
        setError('Failed to load stations. Using offline mode.');
        // Keep sample data as fallback
        setStations(getSampleStations());
      } finally {
        setLoading(false);
      }
    };

    fetchStations();
  }, []);

  // Sample/fallback stations data
  const getSampleStations = () => [
    {
      id: 'DWLR-2341',
      name: 'Delhi North Station',
      location: 'Rohini, Delhi',
      latitude: 28.7041,
      longitude: 77.1025,
      status: 'active',
      lastReading: '22.5m',
      battery: 87,
      waterLevel: 22.5,
      temperature: 18.5
    },
    {
      id: 'DWLR-2342',
      name: 'Gurgaon Central',
      location: 'Sector 14, Gurgaon',
      latitude: 28.4595,
      longitude: 77.0266,
      status: 'warning',
      lastReading: '18.2m',
      battery: 23,
      waterLevel: 18.2,
      temperature: 19.1
    },
    {
      id: 'DWLR-2343',
      name: 'Noida Extension',
      location: 'Greater Noida',
      latitude: 28.4744,
      longitude: 77.5040,
      status: 'inactive',
      lastReading: 'N/A',
      battery: 0,
      waterLevel: 0,
      temperature: 0
    },
    {
      id: 'DWLR-2344',
      name: 'Faridabad South',
      location: 'Sector 21, Faridabad',
      latitude: 28.4089,
      longitude: 77.3178,
      status: 'active',
      lastReading: '25.8m',
      battery: 92,
      waterLevel: 25.8,
      temperature: 17.9
    },
    {
      id: 'DWLR-2345',
      name: 'Ghaziabad East',
      location: 'Vaishali, Ghaziabad',
      latitude: 28.6411,
      longitude: 77.3840,
      status: 'active',
      lastReading: '20.1m',
      battery: 78,
      waterLevel: 20.1,
      temperature: 18.8
    }
  ];

  const mapLayers = [
    { id: 'stations', name: 'Stations', icon: MapPin, color: 'from-blue-500 to-cyan-500' },
    { id: 'heatmap', name: 'Water Level', icon: Droplets, color: 'from-teal-500 to-emerald-500' },
    { id: 'alerts', name: 'Alerts', icon: AlertTriangle, color: 'from-amber-500 to-red-500' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-emerald-400';
      case 'warning': return 'text-amber-400';
      case 'inactive': return 'text-slate-400';
      case 'error': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-500/20 border-emerald-500/50';
      case 'warning': return 'bg-amber-500/20 border-amber-500/50';
      case 'inactive': return 'bg-slate-500/20 border-slate-500/50';
      case 'error': return 'bg-red-500/20 border-red-500/50';
      default: return 'bg-slate-500/20 border-slate-500/50';
    }
  };

  const focusStation = (lat: number, lng: number) => {
    setMapCenter([lat, lng]);
    setMapZoom(14);
  };

  const handleStationDetails = (stationId: string) => {
    navigate(`/water-data?station=${stationId}`);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error message if API failed */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-500/10 border border-amber-500/50 rounded-lg p-4"
        >
          <div className="flex items-center space-x-2 text-amber-400">
            <AlertTriangle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        </motion.div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:flex-items-center justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Map Explorer</h1>
          <p className="text-slate-400">Interactive map of groundwater monitoring stations</p>
        </div>
        <div className="flex items-center space-x-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setMapCenter([28.6139, 77.2090]);
              setMapZoom(11);
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-700/50 border border-slate-600/50 text-slate-300 hover:text-white rounded-xl transition-all duration-200"
          >
            <Navigation className="w-4 h-4" />
            <span>Reset View</span>
          </motion.button>
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
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          {/* Layer Controls */}
          <GlassCard>
            <div className="p-4">
              <div className="flex items-center space-x-2 mb-4">
                <Layers className="w-5 h-5 text-cyan-400" />
                <h3 className="font-semibold text-white">Map Layers</h3>
              </div>
              <div className="space-y-2">
                {mapLayers.map((layer) => {
                  const Icon = layer.icon;
                  return (
                    <motion.button
                      key={layer.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setActiveLayer(layer.id)}
                      className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
                        activeLayer === layer.id
                          ? `bg-gradient-to-r ${layer.color} text-white`
                          : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{layer.name}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </GlassCard>

          {/* Station List */}
          <GlassCard>
            <div className="p-4">
              <div className="flex items-center space-x-2 mb-4">
                <MapPin className="w-5 h-5 text-cyan-400" />
                <h3 className="font-semibold text-white">Stations</h3>
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {stations.map((station) => (
                  <motion.div
                    key={station.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => {
                      setSelectedStation(station.id);
                      focusStation(station.latitude, station.longitude);
                    }}
                    className={`p-3 rounded-lg cursor-pointer transition-all duration-200 border ${
                      selectedStation === station.id
                        ? 'bg-cyan-500/20 border-cyan-500/50'
                        : 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-700/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-white">{station.name}</span>
                      <span className={`text-xs px-2 py-1 rounded-full border ${getStatusBg(station.status)}`}>
                        {station.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 space-y-1">
                      <div className="flex items-center justify-between">
                        <span>Water Level:</span>
                        <span className="text-white font-medium">{station.lastReading}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Battery:</span>
                        <span className={`font-medium ${station.battery > 30 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {station.battery}%
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Map Container */}
        <div className="lg:col-span-3">
          <GlassCard>
            <div className="p-4">
              <div className="rounded-lg overflow-hidden h-[600px]">
                <MapContainer
                  center={mapCenter}
                  zoom={mapZoom}
                  className="h-full w-full"
                  zoomControl={true}
                >
                  <RecenterMap center={mapCenter} zoom={mapZoom} />
                  
                  {/* Base Map Layer */}
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  {/* Station Markers */}
                  {activeLayer === 'stations' && stations.map((station) => (
                    <Marker
                      key={station.id}
                      position={[station.latitude, station.longitude]}
                      icon={createCustomIcon(station.status)}
                      eventHandlers={{
                        click: () => setSelectedStation(station.id)
                      }}
                    >
                      <Popup>
                        <div className="p-2 min-w-[200px]">
                          <h3 className="font-bold text-lg mb-2">{station.name}</h3>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">ID:</span>
                              <span className="font-medium">{station.id}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Location:</span>
                              <span className="font-medium">{station.location}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Status:</span>
                              <span className={`font-medium capitalize ${getStatusColor(station.status)}`}>
                                {station.status}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Water Level:</span>
                              <span className="font-medium">{station.lastReading}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Battery:</span>
                              <span className="font-medium">{station.battery}%</span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleStationDetails(station.id)}
                            className="mt-3 w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                          >
                            View Details
                          </button>
                        </div>
                      </Popup>
                    </Marker>
                  ))}

                  {/* Water Level Circles (Heatmap-like visualization) */}
                  {activeLayer === 'heatmap' && stations.filter(s => s.status !== 'inactive').map((station) => (
                    <Circle
                      key={station.id}
                      center={[station.latitude, station.longitude]}
                      radius={station.waterLevel * 100}
                      pathOptions={{
                        fillColor: station.waterLevel > 22 ? '#10b981' : station.waterLevel > 18 ? '#f59e0b' : '#ef4444',
                        fillOpacity: 0.3,
                        color: station.waterLevel > 22 ? '#10b981' : station.waterLevel > 18 ? '#f59e0b' : '#ef4444',
                        weight: 2
                      }}
                    >
                      <Popup>
                        <div className="text-center">
                          <h4 className="font-bold">{station.name}</h4>
                          <p className="text-lg font-semibold mt-1">{station.lastReading}</p>
                        </div>
                      </Popup>
                    </Circle>
                  ))}

                  {/* Alert Markers */}
                  {activeLayer === 'alerts' && stations.filter(s => s.status === 'warning' || s.battery < 30).map((station) => (
                    <Marker
                      key={station.id}
                      position={[station.latitude, station.longitude]}
                      icon={createCustomIcon('warning')}
                    >
                      <Popup>
                        <div className="p-2">
                          <h3 className="font-bold text-amber-600 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            Alert: {station.name}
                          </h3>
                          <div className="mt-2 space-y-1 text-sm">
                            {station.battery < 30 && (
                              <p className="text-red-600">⚠️ Low Battery: {station.battery}%</p>
                            )}
                            {station.waterLevel < 20 && station.waterLevel > 0 && (
                              <p className="text-amber-600">⚠️ Low Water Level: {station.lastReading}</p>
                            )}
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>

              {/* Map Legend */}
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="text-slate-300">Active</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <span className="text-slate-300">Warning</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-slate-500"></div>
                  <span className="text-slate-300">Inactive</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-slate-300">Error</span>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Add custom styles for pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
};

export default MapExplorer;