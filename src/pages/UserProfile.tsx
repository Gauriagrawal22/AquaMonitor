import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, MapPin, Calendar, Award, Edit3, Save, X, Camera } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import LoadingSpinner from '../components/LoadingSpinner';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

const UserProfile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    location: '',
    organization: '',
    joinDate: '',
    bio: ''
  });
  const [activities, setActivities] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        // Using user ID 1 (admin) as default - in a real app, this would come from auth context
        const response = await axios.get(`${API_BASE_URL}/dashboard/profile/1`);
        
        setProfileData({
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          email: response.data.email,
          role: response.data.role,
          location: response.data.location,
          organization: response.data.organization,
          joinDate: response.data.joinDate,
          bio: response.data.bio
        });
        
        setActivities(response.data.activities || []);
        setAchievements(response.data.achievements || []);
      } catch (error) {
        console.error('Error fetching profile:', error);
        // Fallback to default data
        setProfileData({
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@aquamonitor.com',
          role: 'Administrator',
          location: 'Maharashtra, India',
          organization: 'Water Resources Department',
          joinDate: 'January 2024',
          bio: 'System administrator with access to groundwater monitoring system.'
        });
        setActivities([]);
        setAchievements([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfileData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSave = () => {
    setIsEditing(false);
    // Save logic would go here
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <GlassCard className="p-12">
          <div className="flex items-center justify-center">
            <LoadingSpinner />
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <GlassCard className="p-8">
          <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-32 h-32 bg-gradient-to-br from-teal-400 to-blue-500 rounded-full flex items-center justify-center text-4xl font-bold text-white shadow-2xl">
                {profileData.firstName[0]}{profileData.lastName[0]}
              </div>
              <div className="absolute inset-0 w-32 h-32 rounded-full border-4 border-teal-400/50 animate-pulse"></div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="absolute bottom-2 right-2 w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center border-2 border-teal-400/50 opacity-0 group-hover:opacity-100 transition-all duration-200"
              >
                <Camera className="w-4 h-4 text-teal-400" />
              </motion.button>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="firstName"
                      value={profileData.firstName}
                      onChange={handleInputChange}
                      className="px-4 py-2 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
                      placeholder="First Name"
                    />
                    <input
                      type="text"
                      name="lastName"
                      value={profileData.lastName}
                      onChange={handleInputChange}
                      className="px-4 py-2 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
                      placeholder="Last Name"
                    />
                  </div>
                  <input
                    type="text"
                    name="role"
                    value={profileData.role}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
                    placeholder="Role"
                  />
                  <textarea
                    name="bio"
                    value={profileData.bio}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
                    placeholder="Bio"
                  />
                </div>
              ) : (
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">
                    {profileData.firstName} {profileData.lastName}
                  </h1>
                  <div className="flex items-center justify-center md:justify-start space-x-2 mb-2">
                    <span className="px-3 py-1 bg-gradient-to-r from-teal-500/20 to-blue-500/20 border border-teal-400/30 rounded-full text-teal-400 text-sm font-medium">
                      {profileData.role}
                    </span>
                    <Award className="w-4 h-4 text-amber-400" />
                  </div>
                  <p className="text-slate-400 mb-4 max-w-2xl">{profileData.bio}</p>
                  <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-6 text-sm text-slate-400">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-teal-400" />
                      <span>{profileData.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-teal-400" />
                      <span>{profileData.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-teal-400" />
                      <span>Joined {profileData.joinDate}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Edit Button */}
            <div className="flex space-x-3">
              {isEditing ? (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSave}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-xl hover:from-teal-600 hover:to-blue-700 transition-all duration-200"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsEditing(false)}
                    className="flex items-center space-x-2 px-4 py-2 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-all duration-200"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </motion.button>
                </>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-slate-700/50 border border-slate-600/50 text-white rounded-xl hover:bg-slate-600/50 transition-all duration-200"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Profile</span>
                </motion.button>
              )}
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <GlassCard className="p-6">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span>Achievements</span>
            </h3>
            {achievements.length === 0 ? (
              <div className="text-center text-slate-400 py-8">
                <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No achievements yet</p>
              </div>
            ) : (
            <div className="space-y-4">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={achievement.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
                  className="flex items-start space-x-3 p-3 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-400/20 rounded-xl"
                >
                  <span className="text-2xl">{achievement.icon}</span>
                  <div>
                    <h4 className="font-semibold text-white">{achievement.title}</h4>
                    <p className="text-sm text-slate-400">{achievement.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            )}
          </GlassCard>
        </motion.div>

        {/* Activity Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-2"
        >
          <GlassCard className="p-6">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
              <User className="w-5 h-5 text-teal-400" />
              <span>Recent Activity</span>
            </h3>
            {activities.length === 0 ? (
              <div className="text-center text-slate-400 py-8">
                <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No recent activity</p>
              </div>
            ) : (
            <div className="space-y-4">
              {activities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                  className="flex items-start space-x-4 p-4 bg-slate-800/30 border border-slate-600/30 rounded-xl hover:bg-slate-800/50 transition-all duration-200"
                >
                  <div className={`w-3 h-3 rounded-full mt-2 ${
                    activity.type === 'report' ? 'bg-teal-400' :
                    activity.type === 'update' ? 'bg-blue-400' :
                    activity.type === 'analysis' ? 'bg-purple-400' :
                    activity.type === 'alert' ? 'bg-amber-400' :
                    'bg-slate-400'
                  }`} />
                  <div className="flex-1">
                    <p className="text-white">{activity.action}</p>
                    <p className="text-sm text-slate-400 mt-1">{activity.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            )}
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
};

export default UserProfile;