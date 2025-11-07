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

// Get district-wise recharge statistics
router.get('/districts', async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;

    // Get district-wise statistics from stations (using location field as district)
    const districtData = await db.query(
      `SELECT 
        SUBSTRING_INDEX(s.location, ',', -1) as district_name,
        COUNT(DISTINCT s.station_id) as station_count,
        AVG(r.water_level_m) as avg_level,
        AVG(
          (SELECT r2.water_level_m 
           FROM readings r2 
           WHERE r2.station_id = s.station_id 
             AND YEAR(r2.reading_time) = ?
           ORDER BY r2.reading_time DESC LIMIT 1)
        ) as recent_avg,
        AVG(
          (SELECT r3.water_level_m 
           FROM readings r3 
           WHERE r3.station_id = s.station_id 
             AND YEAR(r3.reading_time) = ? - 1
           ORDER BY r3.reading_time DESC LIMIT 1)
        ) as prev_year_avg
       FROM stations s
       LEFT JOIN readings r ON s.station_id = r.station_id 
         AND YEAR(r.reading_time) = ?
       WHERE s.is_active = 1
       GROUP BY district_name
       HAVING district_name IS NOT NULL AND district_name != ''
       ORDER BY station_count DESC
       LIMIT 20`,
      [year, year, year]
    );

    const formattedDistricts = districtData.map(d => {
      const recentAvg = parseFloat(d.recent_avg || 0);
      const prevYearAvg = parseFloat(d.prev_year_avg || 0);
      const rechargeRate = ((recentAvg - prevYearAvg) * 10).toFixed(1); // Estimate in mm/yr
      
      // Calculate efficiency (simplified: based on water level consistency)
      const efficiency = Math.min(100, Math.max(0, 
        50 + (recentAvg > 5 ? 30 : 0) + (d.station_count > 3 ? 20 : 10)
      ));

      // Determine trend
      let trend = 'stable';
      if (rechargeRate > 5) trend = 'up';
      else if (rechargeRate < -5) trend = 'down';

      return {
        name: d.district_name.trim(),
        recharge: Math.abs(parseFloat(rechargeRate)),
        efficiency: Math.round(efficiency),
        trend: trend,
        stationCount: d.station_count
      };
    });

    res.json(formattedDistricts);
  } catch (error) {
    console.error('District stats error:', error);
    res.status(500).json({ error: 'Failed to fetch district statistics' });
  }
});

// Get seasonal trend data (for trend analysis)
router.get('/trends/seasonal', async (req, res) => {
  try {
    // Get seasonal data for last 5 years
    const seasonalData = await db.query(
      `SELECT 
        YEAR(reading_time) as year,
        AVG(CASE WHEN MONTH(reading_time) IN (3,4,5) THEN water_level_m END) as spring,
        AVG(CASE WHEN MONTH(reading_time) IN (6,7,8) THEN water_level_m END) as summer,
        AVG(CASE WHEN MONTH(reading_time) IN (9,10,11) THEN water_level_m END) as monsoon,
        AVG(CASE WHEN MONTH(reading_time) IN (12,1,2) THEN water_level_m END) as winter
       FROM readings 
       WHERE reading_time >= DATE_SUB(NOW(), INTERVAL 5 YEAR)
       GROUP BY YEAR(reading_time)
       ORDER BY year ASC`
    );

    const formattedData = seasonalData.map(row => ({
      year: row.year.toString(),
      spring: parseFloat(row.spring || 0).toFixed(1),
      summer: parseFloat(row.summer || 0).toFixed(1),
      monsoon: parseFloat(row.monsoon || 0).toFixed(1),
      winter: parseFloat(row.winter || 0).toFixed(1)
    }));

    res.json(formattedData);
  } catch (error) {
    console.error('Seasonal trends error:', error);
    res.status(500).json({ error: 'Failed to fetch seasonal trends' });
  }
});

// Get monthly comparison data (for trend analysis)
router.get('/trends/monthly', async (req, res) => {
  try {
    const { year1 = new Date().getFullYear() - 1, year2 = new Date().getFullYear() } = req.query;

    const monthlyData = await db.query(
      `SELECT 
        DATE_FORMAT(reading_time, '%b') as month,
        MONTH(reading_time) as month_num,
        YEAR(reading_time) as year,
        AVG(water_level_m) as avg_level
       FROM readings 
       WHERE YEAR(reading_time) IN (?, ?)
       GROUP BY YEAR(reading_time), MONTH(reading_time)
       ORDER BY month_num ASC`,
      [year1, year2]
    );

    // Organize data by month with both years
    const monthlyMap = {};
    monthlyData.forEach(row => {
      if (!monthlyMap[row.month]) {
        monthlyMap[row.month] = { month: row.month, month_num: row.month_num };
      }
      monthlyMap[row.month][row.year] = parseFloat(row.avg_level || 0).toFixed(1);
    });

    // Calculate average across both years
    const formattedData = Object.values(monthlyMap).map(m => {
      const val1 = parseFloat(m[year1] || 0);
      const val2 = parseFloat(m[year2] || 0);
      return {
        ...m,
        avg: ((val1 + val2) / 2).toFixed(1)
      };
    });

    res.json(formattedData);
  } catch (error) {
    console.error('Monthly trends error:', error);
    res.status(500).json({ error: 'Failed to fetch monthly trends' });
  }
});

// Get district comparison data (for trend analysis)
router.get('/trends/districts', async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;

    const districtData = await db.query(
      `SELECT 
        SUBSTRING_INDEX(s.location, ',', -1) as district_name,
        AVG(CASE WHEN YEAR(r.reading_time) = ? THEN r.water_level_m END) as current_avg,
        AVG(CASE WHEN YEAR(r.reading_time) = ? - 1 THEN r.water_level_m END) as previous_avg
       FROM stations s
       LEFT JOIN readings r ON s.station_id = r.station_id
       WHERE s.is_active = 1 
         AND YEAR(r.reading_time) IN (?, ? - 1)
       GROUP BY district_name
       HAVING district_name IS NOT NULL AND district_name != ''
       ORDER BY current_avg DESC
       LIMIT 10`,
      [year, year, year, year]
    );

    const formattedData = districtData.map(d => {
      const current = parseFloat(d.current_avg || 0);
      const previous = parseFloat(d.previous_avg || 0);
      const change = previous > 0 ? ((current - previous) / previous * 100) : 0;

      return {
        name: d.district_name.trim(),
        current: current.toFixed(1),
        previous: previous.toFixed(1),
        change: parseFloat(change.toFixed(1))
      };
    });

    res.json(formattedData);
  } catch (error) {
    console.error('District comparison error:', error);
    res.status(500).json({ error: 'Failed to fetch district comparison' });
  }
});

export default router;
