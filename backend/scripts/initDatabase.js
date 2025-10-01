import db from '../config/database.js';

const createTables = async () => {
  try {
    // Users table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(100),
        role ENUM('admin', 'operator', 'viewer') DEFAULT 'viewer',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Stations table
    await db.query(`
      CREATE TABLE IF NOT EXISTS stations (
        id VARCHAR(20) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        location VARCHAR(200) NOT NULL,
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        status ENUM('active', 'inactive', 'warning', 'error') DEFAULT 'active',
        install_date DATE,
        battery_level INT DEFAULT 100,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Water level readings table
    await db.query(`
      CREATE TABLE IF NOT EXISTS water_readings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        station_id VARCHAR(20),
        water_level DECIMAL(8, 2),
        temperature DECIMAL(5, 2),
        ph_level DECIMAL(4, 2),
        reading_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE
      )
    `);

    // Alerts table
    await db.query(`
      CREATE TABLE IF NOT EXISTS alerts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        station_id VARCHAR(20),
        alert_type ENUM('low_water', 'high_water', 'battery_low', 'sensor_error', 'maintenance') NOT NULL,
        severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
        message TEXT,
        is_acknowledged BOOLEAN DEFAULT FALSE,
        acknowledged_by INT,
        acknowledged_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE,
        FOREIGN KEY (acknowledged_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    console.log('✅ All database tables created successfully!');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  }
};

const insertSampleData = async () => {
  try {
    // Insert sample stations
    const stations = [
      ['DWLR-2341', 'Delhi North Station', 'Rohini, Delhi', 28.7041, 77.1025, 'active', '2023-01-15', 87],
      ['DWLR-2342', 'Gurgaon Central', 'Sector 14, Gurgaon', 28.4595, 77.0266, 'warning', '2023-02-10', 23],
      ['DWLR-2343', 'Noida Extension', 'Greater Noida', 28.4744, 77.5040, 'inactive', '2022-11-20', 0],
      ['DWLR-2344', 'Faridabad South', 'Sector 21, Faridabad', 28.4089, 77.3178, 'active', '2023-03-05', 92],
      ['DWLR-2345', 'Ghaziabad East', 'Vaishali, Ghaziabad', 28.6411, 77.3840, 'active', '2023-01-28', 78]
    ];

    for (const station of stations) {
      await db.query(`
        INSERT IGNORE INTO stations (id, name, location, latitude, longitude, status, install_date, battery_level)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, station);
    }

    // Insert sample water readings
    const readings = [
      ['DWLR-2341', 22.5, 18.5, 7.2],
      ['DWLR-2342', 18.2, 19.1, 6.8],
      ['DWLR-2344', 25.8, 17.9, 7.5],
      ['DWLR-2345', 20.1, 18.8, 7.1]
    ];

    for (const reading of readings) {
      await db.query(`
        INSERT INTO water_readings (station_id, water_level, temperature, ph_level)
        VALUES (?, ?, ?, ?)
      `, reading);
    }

    console.log('✅ Sample data inserted successfully!');
  } catch (error) {
    console.error('❌ Error inserting sample data:', error);
  }
};

const initDatabase = async () => {
  console.log('🔄 Initializing database...');
  
  if (await db.testConnection()) {
    await createTables();
    await insertSampleData();
    console.log('🎉 Database initialization completed!');
  } else {
    console.error('❌ Database initialization failed - connection error');
    process.exit(1);
  }
};

export { createTables, insertSampleData };

// Run if called directly
if (process.argv[1].endsWith('initDatabase.js')) {
  initDatabase().then(() => process.exit(0));
}