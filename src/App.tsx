import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import UserProfile from './pages/UserProfile';
import StationsManagement from './pages/StationsManagement';
import WaterLevelData from './pages/WaterLevelData';
import RechargeEstimation from './pages/RechargeEstimation';
import ReportsAlerts from './pages/ReportsAlerts';
import TrendAnalysis from './pages/TrendAnalysis';
import MapExplorer from './pages/MapExplorer';
import UserRoles from './pages/UserRoles';
import Settings from './pages/Settings';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/*" element={
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/profile" element={<UserProfile />} />
                <Route path="/stations" element={<StationsManagement />} />
                <Route path="/water-data" element={<WaterLevelData />} />
                <Route path="/recharge" element={<RechargeEstimation />} />
                <Route path="/reports" element={<ReportsAlerts />} />
                <Route path="/trends" element={<TrendAnalysis />} />
                <Route path="/map" element={<MapExplorer />} />
                <Route path="/roles" element={<UserRoles />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </Layout>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;