import express from 'express';
import Joi from 'joi';
import db from '../config/database.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Validation schema
const readingSchema = Joi.object({
  stationId: Joi.string().required(),
  waterLevel: Joi.number().required(),
  temperature: Joi.number(),
  phLevel: Joi.number().min(0).max(14)
});

// Get readings for a station
router.get('/station/:stationId', authenticateToken, async (req, res) => {
  try {
    const { stationId } = req.params;
    const { limit = 100, offset = 0, startDate, endDate } = req.query;

    let query = `
      SELECT id, station_id, water_level, temperature, ph_level, reading_time
      FROM water_readings 
      WHERE station_id = ?
    `;
    const params = [stationId];

    if (startDate) {
      query += ' AND reading_time >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND reading_time <= ?';
      params.push(endDate + ' 23:59:59');
    }

    query += ' ORDER BY reading_time DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const readings = await db.query(query, params);

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM water_readings 
      WHERE station_id = ?
      ${startDate ? 'AND reading_time >= ?' : ''}
      ${endDate ? 'AND reading_time <= ?' : ''}
    `;
    const countParams = [stationId];
    if (startDate) countParams.push(startDate);
    if (endDate) countParams.push(endDate + ' 23:59:59');

    const countResult = await db.query(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      readings,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: (parseInt(offset) + readings.length) < total
      }
    });
  } catch (error) {
    console.error('Fetch readings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get latest readings for all stations
router.get('/latest', authenticateToken, async (req, res) => {
  try {
    const readings = await db.query(`
      SELECT w1.station_id, w1.water_level, w1.temperature, w1.ph_level, w1.reading_time, s.name as station_name
      FROM water_readings w1
      INNER JOIN stations s ON w1.station_id = s.id
      INNER JOIN (
        SELECT station_id, MAX(reading_time) as max_time
        FROM water_readings
        GROUP BY station_id
      ) w2 ON w1.station_id = w2.station_id AND w1.reading_time = w2.max_time
      ORDER BY w1.reading_time DESC
    `);

    res.json({ readings });
  } catch (error) {
    console.error('Fetch latest readings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add new reading
router.post('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.role === 'viewer') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const { error, value } = readingSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { stationId, waterLevel, temperature, phLevel } = value;

    // Verify station exists
    const station = await db.query('SELECT id FROM stations WHERE id = ?', [stationId]);
    if (station.length === 0) {
      return res.status(404).json({ error: 'Station not found' });
    }

    const result = await db.query(
      'INSERT INTO water_readings (station_id, water_level, temperature, ph_level) VALUES (?, ?, ?, ?)',
      [stationId, waterLevel, temperature, phLevel]
    );

    res.status(201).json({ 
      message: 'Reading added successfully', 
      readingId: result.insertId 
    });
  } catch (error) {
    console.error('Add reading error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get analytics data
router.get('/analytics/:stationId', authenticateToken, async (req, res) => {
  try {
    const { stationId } = req.params;
    const { period = '7d' } = req.query;

    let dateFilter = '';
    switch (period) {
      case '24h':
        dateFilter = 'AND reading_time >= DATE_SUB(NOW(), INTERVAL 1 DAY)';
        break;
      case '7d':
        dateFilter = 'AND reading_time >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
        break;
      case '30d':
        dateFilter = 'AND reading_time >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
        break;
      case '90d':
        dateFilter = 'AND reading_time >= DATE_SUB(NOW(), INTERVAL 90 DAY)';
        break;
    }

    const analytics = await db.query(`
      SELECT 
        AVG(water_level) as avg_water_level,
        MIN(water_level) as min_water_level,
        MAX(water_level) as max_water_level,
        AVG(temperature) as avg_temperature,
        AVG(ph_level) as avg_ph_level,
        COUNT(*) as total_readings
      FROM water_readings 
      WHERE station_id = ? ${dateFilter}
    `, [stationId]);

    // Get trend data
    const trendData = await db.query(`
      SELECT 
        DATE(reading_time) as date,
        AVG(water_level) as avg_water_level,
        COUNT(*) as readings_count
      FROM water_readings 
      WHERE station_id = ? ${dateFilter}
      GROUP BY DATE(reading_time)
      ORDER BY date DESC
    `, [stationId]);

    res.json({
      analytics: analytics[0],
      trend: trendData
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;