import db from '../config/database.js';

const checkAndCreateMissingTables = async () => {
  try {
    console.log('🔍 Checking database structure...\n');

    // Get existing tables
    const tables = await db.query('SHOW TABLES');
    const tableNames = tables.map(t => Object.values(t)[0]);

    console.log('📋 Existing tables:', tableNames.join(', '));

    // Check if we need to add any missing columns to stations
    if (tableNames.includes('stations')) {
      const stationsColumns = await db.query('DESCRIBE stations');
      const columnNames = stationsColumns.map(c => c.Field);

      // Add location column if missing
      if (!columnNames.includes('location')) {
        console.log('➕ Adding location column to stations...');
        await db.query('ALTER TABLE stations ADD COLUMN location VARCHAR(200) AFTER name');
      }

      // Add status column if missing
      if (!columnNames.includes('status')) {
        console.log('➕ Adding status column to stations...');
        await db.query(`
          ALTER TABLE stations 
          ADD COLUMN status ENUM('active', 'inactive', 'warning', 'error') DEFAULT 'active' AFTER is_active
        `);
      }

      // Add install_date if missing
      if (!columnNames.includes('install_date')) {
        console.log('➕ Adding install_date column to stations...');
        await db.query('ALTER TABLE stations ADD COLUMN install_date DATE AFTER longitude');
      }

      // Add battery_level if missing
      if (!columnNames.includes('battery_level')) {
        console.log('➕ Adding battery_level column to stations...');
        await db.query('ALTER TABLE stations ADD COLUMN battery_level INT DEFAULT 100 AFTER install_date');
      }

      // Add created_at if missing
      if (!columnNames.includes('created_at')) {
        console.log('➕ Adding created_at column to stations...');
        await db.query('ALTER TABLE stations ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
      }

      // Add updated_at if missing
      if (!columnNames.includes('updated_at')) {
        console.log('➕ Adding updated_at column to stations...');
        await db.query('ALTER TABLE stations ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
      }
    }

    // Check readings table and add columns if needed
    if (tableNames.includes('readings')) {
      const readingsColumns = await db.query('DESCRIBE readings');
      const columnNames = readingsColumns.map(c => c.Field);

      console.log('📊 Readings table columns:', columnNames.join(', '));
    }

    // Check alerts table
    if (tableNames.includes('alerts')) {
      const alertsColumns = await db.query('DESCRIBE alerts');
      const columnNames = alertsColumns.map(c => c.Field);

      // Add alert_type if missing
      if (!columnNames.includes('alert_type')) {
        console.log('➕ Adding alert_type column to alerts...');
        await db.query(`
          ALTER TABLE alerts 
          ADD COLUMN alert_type ENUM('low_water', 'high_water', 'battery_low', 'sensor_error', 'maintenance') 
          DEFAULT 'sensor_error' AFTER level
        `);
      }

      // Add is_acknowledged if missing
      if (!columnNames.includes('is_acknowledged')) {
        console.log('➕ Adding is_acknowledged column to alerts...');
        await db.query('ALTER TABLE alerts ADD COLUMN is_acknowledged BOOLEAN DEFAULT FALSE');
      }

      // Add acknowledged_by if missing
      if (!columnNames.includes('acknowledged_by')) {
        console.log('➕ Adding acknowledged_by column to alerts...');
        await db.query('ALTER TABLE alerts ADD COLUMN acknowledged_by INT');
      }

      // Add acknowledged_at if missing
      if (!columnNames.includes('acknowledged_at')) {
        console.log('➕ Adding acknowledged_at column to alerts...');
        await db.query('ALTER TABLE alerts ADD COLUMN acknowledged_at TIMESTAMP NULL');
      }
    }

    console.log('\n✅ Database structure adapted successfully!');
    console.log('✅ Your existing data is preserved!');
    
  } catch (error) {
    console.error('❌ Error updating database:', error.message);
    throw error;
  }
};

const initDatabase = async () => {
  console.log('🔄 Initializing database for existing schema...\n');
  
  if (await db.testConnection()) {
    await checkAndCreateMissingTables();
    console.log('\n🎉 Database initialization completed!');
    console.log('📌 Your existing tables and data are intact.');
    console.log('📌 Additional columns have been added where needed.');
  } else {
    console.error('❌ Database initialization failed - connection error');
    process.exit(1);
  }
};

// Run if called directly
if (process.argv[1].endsWith('initDatabaseExisting.js')) {
  initDatabase().then(() => process.exit(0)).catch(() => process.exit(1));
}

export { checkAndCreateMissingTables };