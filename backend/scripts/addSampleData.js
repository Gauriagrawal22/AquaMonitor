import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import bcrypt from 'bcryptjs';
import db from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });

async function addSampleData() {
  try {
    console.log('🚀 Adding sample data to database...\n');

    // 1. Add sample users
    console.log('👤 Adding sample users...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const users = [
      {
        username: 'admin',
        email: 'admin@aquamonitor.com',
        password_hash: hashedPassword,
        full_name: 'Admin User',
        role: 'admin'
      },
      {
        username: 'operator1',
        email: 'operator@aquamonitor.com',
        password_hash: hashedPassword,
        full_name: 'Operator User',
        role: 'operator'
      },
      {
        username: 'viewer1',
        email: 'viewer@aquamonitor.com',
        password_hash: hashedPassword,
        full_name: 'Viewer User',
        role: 'viewer'
      }
    ];

    for (const user of users) {
      try {
        await db.query(
          'INSERT INTO users (username, email, password_hash, full_name, role) VALUES (?, ?, ?, ?, ?)',
          [user.username, user.email, user.password_hash, user.full_name, user.role]
        );
        console.log(`✅ Created user: ${user.username} (${user.role})`);
      } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          console.log(`ℹ️  User ${user.username} already exists`);
        } else {
          throw err;
        }
      }
    }

    // 2. Update existing stations with location data
    console.log('\n📍 Updating station locations...');
    const stationUpdates = [
      { code: 'ST001', location: 'Shirpur District, Maharashtra' },
      { code: 'ST002', location: 'Amalner District, Maharashtra' },
      { code: 'ST003', location: 'Chandwad District, Maharashtra' },
      { code: 'ST004', location: 'Nashik District, Maharashtra' },
      { code: 'ST005', location: 'Yeola District, Maharashtra' }
    ];

    for (const update of stationUpdates) {
      await db.query(
        'UPDATE stations SET location = ?, install_date = ? WHERE code = ?',
        [update.location, '2024-01-15', update.code]
      );
      console.log(`✅ Updated location for ${update.code}`);
    }

    // 3. Add more recent readings for each station
    console.log('\n📊 Adding recent readings...');
    const stations = await db.query('SELECT station_id, code FROM stations');
    
    const today = new Date();
    for (const station of stations) {
      for (let i = 0; i < 10; i++) {
        const readingTime = new Date(today);
        readingTime.setDate(today.getDate() - i);
        readingTime.setHours(12, 0, 0, 0);

        const waterLevel = (8 + Math.random() * 3).toFixed(2); // Random between 8-11m
        const temperature = (20 + Math.random() * 10).toFixed(1); // Random between 20-30°C

        try {
          await db.query(
            'INSERT INTO readings (station_id, reading_time, water_level_m, temperature_c) VALUES (?, ?, ?, ?)',
            [station.station_id, readingTime, waterLevel, temperature]
          );
        } catch (err) {
          // Skip if duplicate
        }
      }
      console.log(`✅ Added readings for station ${station.code}`);
    }

    // 4. Acknowledge some old alerts
    console.log('\n🚨 Updating alerts...');
    const adminUser = await db.query('SELECT id FROM users WHERE role = ? LIMIT 1', ['admin']);
    
    if (adminUser.length > 0) {
      const adminId = adminUser[0].id;
      await db.query(
        'UPDATE alerts SET is_acknowledged = 1, acknowledged_by = ?, acknowledged_at = NOW() WHERE alert_id <= 3',
        [adminId]
      );
      console.log('✅ Acknowledged some alerts');
    }

    // 5. Add a few new alerts
    console.log('\n🚨 Adding new alerts...');
    const recentReadings = await db.query(`
      SELECT r.reading_id, r.station_id, r.water_level_m 
      FROM readings r 
      WHERE r.reading_time >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      AND r.water_level_m < 7.5
      LIMIT 3
    `);

    for (const reading of recentReadings) {
      try {
        await db.query(
          `INSERT INTO alerts (station_id, reading_id, level, alert_type, message, triggered_at) 
           VALUES (?, ?, ?, ?, ?, NOW())`,
          [
            reading.station_id,
            reading.reading_id,
            'warning',
            'low_water_level',
            `Water level ${reading.water_level_m}m is below safe threshold`
          ]
        );
      } catch (err) {
        // Skip duplicates
      }
    }
    console.log('✅ Added new alerts');

    console.log('\n✅ Sample data added successfully!');
    console.log('\n📊 Summary:');
    console.log('  - Users: 3 (admin, operator, viewer)');
    console.log('  - Stations: Updated with locations');
    console.log('  - Readings: Added recent 10-day data');
    console.log('  - Alerts: Updated and added new ones');
    console.log('\n🔐 Login credentials:');
    console.log('  Username: admin / Password: password123');
    console.log('  Username: operator1 / Password: password123');
    console.log('  Username: viewer1 / Password: password123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding sample data:', error);
    process.exit(1);
  }
}

addSampleData();
