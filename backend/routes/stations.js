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

// Get all stations (public endpoint - no auth required for viewing)
router.get('/', async (req, res) => {
  try {
    const { search, status } = req.query;
    
    let query = `
      SELECT s.station_id as id, s.code, s.name, s.location, s.latitude, s.longitude,
             CASE 
               WHEN s.is_active = 1 AND s.battery_level > 30 THEN 'active'
               WHEN s.is_active = 1 AND s.battery_level <= 30 THEN 'warning'
               ELSE 'inactive'
             END as status,
             s.install_date as installDate,
             s.battery_level as batteryLevel,
             COUNT(r.reading_id) as total_readings,
             latest.water_level_m as lastReading,
             latest.temperature_c as temperature,
             latest.reading_time as lastReadingTime,
             s.created_at, s.updated_at
      FROM stations s 
      LEFT JOIN readings r ON s.station_id = r.station_id 
      LEFT JOIN (
        SELECT r1.station_id, r1.water_level_m, r1.temperature_c, r1.reading_time
        FROM readings r1
        INNER JOIN (
          SELECT station_id, MAX(reading_time) as max_time
          FROM readings
          GROUP BY station_id
        ) r2 ON r1.station_id = r2.station_id AND r1.reading_time = r2.max_time
      ) latest ON s.station_id = latest.station_id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ' AND (s.name LIKE ? OR s.location LIKE ? OR s.code LIKE ?)';
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam);
    }

    if (status && status !== 'all') {
      if (status === 'active') {
        query += ' AND s.is_active = 1 AND s.battery_level > 30';
      } else if (status === 'inactive') {
        query += ' AND s.is_active = 0';
      } else if (status === 'warning') {
        query += ' AND s.battery_level <= 30 AND s.is_active = 1';
      }
    }

    query += ' GROUP BY s.station_id, s.code, s.name, latest.water_level_m, latest.temperature_c, latest.reading_time ORDER BY s.created_at DESC';

    const stations = await db.query(query, params);
    
    res.json({
      stations: stations.map(station => ({
        id: station.code || `DWLR-${station.id}`,
        name: station.name,
        location: station.location || 'Unknown',
        latitude: parseFloat(station.latitude),
        longitude: parseFloat(station.longitude),
        status: station.status,
        installDate: station.installDate,
        battery_level: station.batteryLevel || 100,
        dataPoints: station.total_readings || 0,
        lastReading: station.lastReading ? parseFloat(station.lastReading) : null,
        temperature: station.temperature ? parseFloat(station.temperature) : null,
        lastReadingTime: station.lastReadingTime
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
      `SELECT s.station_id, s.code, s.name, s.location, s.latitude, s.longitude,
              s.is_active, s.install_date as installDate, s.battery_level as batteryLevel,
              COUNT(r.reading_id) as total_readings,
              s.created_at, s.updated_at
       FROM stations s 
       LEFT JOIN readings r ON s.station_id = r.station_id 
       WHERE s.code = ? OR s.station_id = ?
       GROUP BY s.station_id`,
      [req.params.id, req.params.id]
    );

    if (stations.length === 0) {
      return res.status(404).json({ error: 'Station not found' });
    }

    const station = stations[0];
    res.json({
      station: {
        id: station.code || `DWLR-${station.station_id}`,
        name: station.name,
        location: station.location || 'Unknown',
        latitude: parseFloat(station.latitude),
        longitude: parseFloat(station.longitude),
        status: station.is_active ? 'active' : 'inactive',
        installDate: station.installDate,
        battery: station.batteryLevel || 100,
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