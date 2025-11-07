import express from 'express';
import db from '../config/database.js';

const router = express.Router();

// Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    // Get total active stations
    const activeStations = await db.query(
      `SELECT COUNT(*) as count FROM stations WHERE is_active = 1 AND status = 'active'`
    );

    // Get average water level
    const avgWaterLevel = await db.query(
      `SELECT AVG(water_level_m) as avg_level 
       FROM readings 
       WHERE reading_time >= DATE_SUB(NOW(), INTERVAL 24 HOUR)`
    );

    // Get critical alerts count
    const criticalAlerts = await db.query(
      `SELECT COUNT(*) as count 
       FROM alerts 
       WHERE level = 'critical' AND is_acknowledged = 0`
    );

    // Get recharge rate (simplified calculation)
    const rechargeData = await db.query(
      `SELECT 
        AVG(CASE WHEN reading_time >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN water_level_m END) as recent_avg,
        AVG(CASE WHEN reading_time >= DATE_SUB(NOW(), INTERVAL 14 DAY) AND reading_time < DATE_SUB(NOW(), INTERVAL 7 DAY) THEN water_level_m END) as previous_avg
       FROM readings`
    );

    const recentAvg = rechargeData[0].recent_avg || 0;
    const previousAvg = rechargeData[0].previous_avg || 0;
    const rechargeRate = previousAvg > 0 ? ((recentAvg - previousAvg) / previousAvg * 100).toFixed(1) : 0;

    res.json({
      activeStations: activeStations[0].count,
      avgWaterLevel: parseFloat(avgWaterLevel[0].avg_level || 0).toFixed(2),
      criticalAlerts: criticalAlerts[0].count,
      rechargeRate: parseFloat(rechargeRate)
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

// Get trend data for charts (last 6 months)
router.get('/trends', async (req, res) => {
  try {
    const trends = await db.query(
      `SELECT 
        DATE_FORMAT(reading_time, '%b') as month,
        AVG(water_level_m) as avg_level,
        COUNT(DISTINCT station_id) as station_count
       FROM readings 
       WHERE reading_time >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
       GROUP BY YEAR(reading_time), MONTH(reading_time)
       ORDER BY reading_time ASC`
    );

    const formattedTrends = trends.map(t => ({
      name: t.month,
      value: parseFloat(t.avg_level).toFixed(1),
      recharge: (parseFloat(t.avg_level) * 1.5).toFixed(1) // Simplified recharge calculation
    }));

    res.json(formattedTrends);
  } catch (error) {
    console.error('Dashboard trends error:', error);
    res.status(500).json({ error: 'Failed to fetch trend data' });
  }
});

// Get recent alerts
router.get('/alerts', async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const alerts = await db.query(
      `SELECT 
        a.alert_id as id,
        a.level as type,
        a.message,
        CONCAT(
          CASE 
            WHEN TIMESTAMPDIFF(MINUTE, a.triggered_at, NOW()) < 60 THEN CONCAT(TIMESTAMPDIFF(MINUTE, a.triggered_at, NOW()), ' minutes ago')
            WHEN TIMESTAMPDIFF(HOUR, a.triggered_at, NOW()) < 24 THEN CONCAT(TIMESTAMPDIFF(HOUR, a.triggered_at, NOW()), ' hours ago')
            ELSE CONCAT(TIMESTAMPDIFF(DAY, a.triggered_at, NOW()), ' days ago')
          END
        ) as time
       FROM alerts a
       ORDER BY a.triggered_at DESC
       LIMIT ?`,
      [parseInt(limit)]
    );

    res.json(alerts);
  } catch (error) {
    console.error('Dashboard alerts error:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// Get recharge estimation data (monthly aggregated)
router.get('/recharge', async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;

    // Get monthly recharge data (based on water level changes)
    const rechargeData = await db.query(
      `SELECT 
        DATE_FORMAT(reading_time, '%b') as month,
        MONTH(reading_time) as month_num,
        AVG(water_level_m) as avg_level,
        MAX(water_level_m) - MIN(water_level_m) as recharge_estimate,
        COUNT(*) as reading_count
       FROM readings 
       WHERE YEAR(reading_time) = ?
       GROUP BY YEAR(reading_time), MONTH(reading_time)
       ORDER BY month_num ASC`,
      [year]
    );

    const formattedData = rechargeData.map(r => ({
      month: r.month,
      recharge: parseFloat((r.recharge_estimate || 0) * 10).toFixed(1), // Convert to mm estimate
      rainfall: parseFloat((r.recharge_estimate || 0) * 15).toFixed(1), // Simplified rainfall estimate
      groundwater: parseFloat(r.avg_level || 0).toFixed(1)
    }));

    res.json(formattedData);
  } catch (error) {
    console.error('Recharge data error:', error);
    res.status(500).json({ error: 'Failed to fetch recharge estimation data' });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await db.query(
      `SELECT 
        id,
        username as name,
        email,
        role,
        created_at,
        updated_at
       FROM users
       ORDER BY created_at DESC`
    );

    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: 'active', // Default to active (add status column to DB if needed)
      lastLogin: user.updated_at,
      avatar: user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }));

    res.json(formattedUsers);
  } catch (error) {
    console.error('Users fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

export default router;
