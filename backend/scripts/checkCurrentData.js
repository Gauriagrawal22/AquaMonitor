import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import db from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from backend directory
dotenv.config({ path: join(__dirname, '../.env') });

async function checkCurrentData() {
  try {
    console.log('🔍 Checking current database data...\n');

    // Check stations
    const stations = await db.query('SELECT * FROM stations LIMIT 5');
    console.log('📍 Stations in database:', stations.length);
    if (stations.length > 0) {
      console.log('Sample station:', JSON.stringify(stations[0], null, 2));
    }

    // Check users
    const users = await db.query('SELECT id, username, email, role FROM users');
    console.log('\n👤 Users in database:', users.length);
    if (users.length > 0) {
      console.log('Sample user:', JSON.stringify(users[0], null, 2));
    }

    // Check readings
    const readings = await db.query('SELECT * FROM readings LIMIT 5');
    console.log('\n📊 Readings in database:', readings.length);
    if (readings.length > 0) {
      console.log('Sample reading:', JSON.stringify(readings[0], null, 2));
    }

    // Check alerts
    const alerts = await db.query('SELECT * FROM alerts LIMIT 5');
    console.log('\n🚨 Alerts in database:', alerts.length);
    if (alerts.length > 0) {
      console.log('Sample alert:', JSON.stringify(alerts[0], null, 2));
    }

    // Check station columns
    const stationCols = await db.query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = '${process.env.DB_NAME}' 
      AND TABLE_NAME = 'stations'
    `);
    console.log('\n📋 Station table columns:');
    stationCols.forEach(col => {
      console.log(`  - ${col.COLUMN_NAME} (${col.DATA_TYPE})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking data:', error.message);
    process.exit(1);
  }
}

checkCurrentData();
