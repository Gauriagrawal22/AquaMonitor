import db from '../config/database.js';

async function checkDatabase() {
  try {
    console.log('🔍 Checking existing database structure...\n');
    
    // Check connection
    const isConnected = await db.testConnection();
    if (!isConnected) {
      console.error('❌ Cannot connect to database');
      process.exit(1);
    }

    // Get all tables
    const tables = await db.query('SHOW TABLES');
    console.log('📋 Existing Tables:');
    console.log(tables);
    console.log('');

    // Check if stations table exists
    const stationsTables = tables.filter(t => Object.values(t)[0] === 'stations');
    
    if (stationsTables.length > 0) {
      console.log('🔍 Stations table structure:');
      const stationsStructure = await db.query('DESCRIBE stations');
      console.log(stationsStructure);
      console.log('');
    }

    // Check if water_readings table exists
    const readingsTables = tables.filter(t => Object.values(t)[0] === 'water_readings');
    
    if (readingsTables.length > 0) {
      console.log('🔍 Water_readings table structure:');
      const readingsStructure = await db.query('DESCRIBE water_readings');
      console.log(readingsStructure);
      console.log('');
    }

    // Check if users table exists
    const usersTables = tables.filter(t => Object.values(t)[0] === 'users');
    
    if (usersTables.length > 0) {
      console.log('🔍 Users table structure:');
      const usersStructure = await db.query('DESCRIBE users');
      console.log(usersStructure);
      console.log('');
    }

    // Check if alerts table exists
    const alertsTables = tables.filter(t => Object.values(t)[0] === 'alerts');
    
    if (alertsTables.length > 0) {
      console.log('🔍 Alerts table structure:');
      const alertsStructure = await db.query('DESCRIBE alerts');
      console.log(alertsStructure);
      console.log('');
    }

    console.log('✅ Database check complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking database:', error);
    process.exit(1);
  }
}

checkDatabase();