import express from 'express';
import Joi from 'joi';
import db from '../config/database.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Validation schemas
const stationSchema = Joi.object({
  id: Joi.string().required(),
  name: Joi.string().min(2).max(100).required(),
  location: Joi.string().min(5).max(200).required(),
  latitude: Joi.number().min(-90).max(90),
  longitude: Joi.number().min(-180).max(180),
  status: Joi.string().valid('active', 'inactive', 'warning', 'error').default('active'),
  installDate: Joi.date(),
  batteryLevel: Joi.number().min(0).max(100).default(100)
});

// Get all stations
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { search, status } = req.query;
    
    let query = `
      SELECT s.*, 
             COUNT(w.id) as total_readings,
             MAX(w.reading_time) as last_reading_time,
             MAX(w.water_level) as last_water_level
      FROM stations s 
      LEFT JOIN water_readings w ON s.id = w.station_id 
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ' AND (s.name LIKE ? OR s.location LIKE ? OR s.id LIKE ?)';
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam);
    }

    if (status && status !== 'all') {
      query += ' AND s.status = ?';
      params.push(status);
    }

    query += ' GROUP BY s.id ORDER BY s.created_at DESC';

    const stations = await db.query(query, params);
    
    res.json({
      stations: stations.map(station => ({
        ...station,
        lastReading: station.last_water_level ? `${station.last_water_level}m` : 'N/A',
        dataPoints: station.total_readings || 0
      }))
    });
  } catch (error) {
    console.error('Fetch stations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single station
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const stations = await db.query(
      `SELECT s.*, 
              COUNT(w.id) as total_readings,
              MAX(w.reading_time) as last_reading_time,
              MAX(w.water_level) as last_water_level
       FROM stations s 
       LEFT JOIN water_readings w ON s.id = w.station_id 
       WHERE s.id = ?
       GROUP BY s.id`,
      [req.params.id]
    );

    if (stations.length === 0) {
      return res.status(404).json({ error: 'Station not found' });
    }

    const station = stations[0];
    res.json({
      station: {
        ...station,
        lastReading: station.last_water_level ? `${station.last_water_level}m` : 'N/A',
        dataPoints: station.total_readings || 0
      }
    });
  } catch (error) {
    console.error('Fetch station error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new station
router.post('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.role === 'viewer') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const { error, value } = stationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { id, name, location, latitude, longitude, status, installDate, batteryLevel } = value;

    // Check if station ID already exists
    const existingStation = await db.query('SELECT id FROM stations WHERE id = ?', [id]);
    if (existingStation.length > 0) {
      return res.status(409).json({ error: 'Station ID already exists' });
    }

    await db.query(
      `INSERT INTO stations (id, name, location, latitude, longitude, status, install_date, battery_level)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, name, location, latitude, longitude, status, installDate, batteryLevel]
    );

    res.status(201).json({ message: 'Station created successfully', stationId: id });
  } catch (error) {
    console.error('Create station error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update station
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role === 'viewer') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const { error, value } = stationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { name, location, latitude, longitude, status, installDate, batteryLevel } = value;

    const result = await db.query(
      `UPDATE stations 
       SET name = ?, location = ?, latitude = ?, longitude = ?, status = ?, 
           install_date = ?, battery_level = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [name, location, latitude, longitude, status, installDate, batteryLevel, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Station not found' });
    }

    res.json({ message: 'Station updated successfully' });
  } catch (error) {
    console.error('Update station error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete station
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const result = await db.query('DELETE FROM stations WHERE id = ?', [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Station not found' });
    }

    res.json({ message: 'Station deleted successfully' });
  } catch (error) {
    console.error('Delete station error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;