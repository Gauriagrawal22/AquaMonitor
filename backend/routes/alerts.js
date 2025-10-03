import express from 'express';
import Joi from 'joi';
import db from '../config/database.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Validation schema
const alertSchema = Joi.object({
  stationId: Joi.string().required(),
  alertType: Joi.string().valid('low_water', 'high_water', 'battery_low', 'sensor_error', 'maintenance').required(),
  severity: Joi.string().valid('low', 'medium', 'high', 'critical').default('medium'),
  message: Joi.string().max(500)
});

// Get all alerts
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status = 'active', limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT a.alert_id as id, a.station_id, a.reading_id, a.level as severity, 
             a.message, a.triggered_at as created_at, a.is_acknowledged,
             a.acknowledged_by, a.acknowledged_at,
             s.name as station_name, s.code as station_code, s.location,
             u.username as acknowledged_by_username
      FROM alerts a
      LEFT JOIN stations s ON a.station_id = s.station_id
      LEFT JOIN users u ON a.acknowledged_by = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status === 'active') {
      query += ' AND (a.is_acknowledged = FALSE OR a.is_acknowledged IS NULL)';
    } else if (status === 'acknowledged') {
      query += ' AND a.is_acknowledged = TRUE';
    }

    query += ' ORDER BY a.triggered_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const alerts = await db.query(query, params);

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM alerts a
      WHERE 1=1 ${status === 'active' ? 'AND (a.is_acknowledged = FALSE OR a.is_acknowledged IS NULL)' : status === 'acknowledged' ? 'AND a.is_acknowledged = TRUE' : ''}
    `;
    const countResult = await db.query(countQuery);
    const total = countResult[0].total;

    res.json({
      alerts: alerts.map(alert => ({
        ...alert,
        stationId: alert.station_code || `DWLR-${alert.station_id}`
      })),
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: (parseInt(offset) + alerts.length) < total
      }
    });
  } catch (error) {
    console.error('Fetch alerts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get alerts for specific station
router.get('/station/:stationId', authenticateToken, async (req, res) => {
  try {
    const { stationId } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const alerts = await db.query(`
      SELECT a.*, u.username as acknowledged_by_username
      FROM alerts a
      LEFT JOIN users u ON a.acknowledged_by = u.id
      WHERE a.station_id = ?
      ORDER BY a.created_at DESC
      LIMIT ? OFFSET ?
    `, [stationId, parseInt(limit), parseInt(offset)]);

    res.json({ alerts });
  } catch (error) {
    console.error('Fetch station alerts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new alert
router.post('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.role === 'viewer') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const { error, value } = alertSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { stationId, alertType, severity, message } = value;

    // Verify station exists
    const station = await db.query('SELECT id FROM stations WHERE id = ?', [stationId]);
    if (station.length === 0) {
      return res.status(404).json({ error: 'Station not found' });
    }

    const result = await db.query(
      'INSERT INTO alerts (station_id, alert_type, severity, message) VALUES (?, ?, ?, ?)',
      [stationId, alertType, severity, message]
    );

    res.status(201).json({ 
      message: 'Alert created successfully', 
      alertId: result.insertId 
    });
  } catch (error) {
    console.error('Create alert error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Acknowledge alert
router.patch('/:id/acknowledge', authenticateToken, async (req, res) => {
  try {
    if (req.user.role === 'viewer') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const alertId = req.params.id;
    const userId = req.user.userId;

    const result = await db.query(
      `UPDATE alerts 
       SET is_acknowledged = TRUE, acknowledged_by = ?, acknowledged_at = CURRENT_TIMESTAMP
       WHERE id = ? AND is_acknowledged = FALSE`,
      [userId, alertId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Alert not found or already acknowledged' });
    }

    res.json({ message: 'Alert acknowledged successfully' });
  } catch (error) {
    console.error('Acknowledge alert error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get alert statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const stats = await db.query(`
      SELECT 
        COUNT(*) as total_alerts,
        SUM(CASE WHEN is_acknowledged = FALSE THEN 1 ELSE 0 END) as active_alerts,
        SUM(CASE WHEN severity = 'critical' AND is_acknowledged = FALSE THEN 1 ELSE 0 END) as critical_alerts,
        SUM(CASE WHEN severity = 'high' AND is_acknowledged = FALSE THEN 1 ELSE 0 END) as high_alerts
      FROM alerts
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `);

    const alertsByType = await db.query(`
      SELECT alert_type, COUNT(*) as count
      FROM alerts
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY alert_type
    `);

    res.json({
      stats: stats[0],
      alertsByType
    });
  } catch (error) {
    console.error('Alert stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;