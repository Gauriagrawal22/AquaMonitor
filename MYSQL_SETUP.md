# AquaMonitor MySQL Integration Setup Guide

## 🗄️ Database Setup

### Prerequisites
- MySQL Server 8.0+ installed and running
- Node.js 18+ and npm
- Git

### 1. Create MySQL Database

```sql
-- Connect to MySQL as root
mysql -u root -p

-- Create database
CREATE DATABASE aquamonitor;

-- Create user (optional, for better security)
CREATE USER 'aquamonitor_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON aquamonitor.* TO 'aquamonitor_user'@'localhost';
FLUSH PRIVILEGES;

-- Exit MySQL
EXIT;
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file from example
copy .env.example .env

# Edit .env file with your database credentials
# Update the following values:
# DB_HOST=localhost
# DB_PORT=3306
# DB_USER=root (or aquamonitor_user)
# DB_PASSWORD=your_mysql_password
# DB_NAME=aquamonitor
# JWT_SECRET=your_super_secure_jwt_secret_key_here
```

### 3. Initialize Database Tables

```bash
# Run database initialization script
npm run init-db
```

This will create all necessary tables and insert sample data:
- **users** - User authentication and profiles
- **stations** - Water monitoring stations
- **water_readings** - Sensor data from stations
- **alerts** - System alerts and notifications

### 4. Start Backend Server

```bash
# Development mode (with auto-restart)
npm run dev

# Or production mode
npm start
```

The backend API will be available at: `http://localhost:3001`

### 5. Test Backend API

Check if everything is working:
```bash
# Health check
curl http://localhost:3001/api/health

# Expected response:
{
  "status": "OK",
  "timestamp": "2025-10-01T...",
  "database": "Connected",
  "environment": "development"
}
```

## 🌐 Frontend Integration

The frontend has been updated to use the new MySQL backend API instead of Supabase.

### API Service

A new `ApiService` class has been created in `src/services/api.ts` that handles:
- Authentication (login/register)
- Station management
- Water readings
- Alerts system
- Analytics

### Environment Variables

Create `.env` in the root directory (if needed):
```env
VITE_API_URL=http://localhost:3001/api
```

## 🚀 Running the Full Application

### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

### Terminal 2 - Frontend
```bash
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001

## 📊 Database Schema

### Users Table
- Authentication and user management
- Roles: admin, operator, viewer

### Stations Table
- Station information and location data
- Status tracking and battery levels

### Water Readings Table
- Sensor data (water level, temperature, pH)
- Timestamped readings

### Alerts Table
- System notifications and warnings
- Acknowledgment tracking

## 🔐 API Authentication

The API uses JWT tokens for authentication:

1. **Register/Login** - Get JWT token
2. **Include token** in Authorization header: `Bearer <token>`
3. **Token expires** in 24 hours (configurable)

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get current user

### Stations
- `GET /api/stations` - List all stations
- `GET /api/stations/:id` - Get single station
- `POST /api/stations` - Create station
- `PUT /api/stations/:id` - Update station
- `DELETE /api/stations/:id` - Delete station

### Readings
- `GET /api/readings/station/:id` - Get station readings
- `GET /api/readings/latest` - Get latest readings
- `POST /api/readings` - Add new reading
- `GET /api/readings/analytics/:id` - Get analytics

### Alerts
- `GET /api/alerts` - List alerts
- `POST /api/alerts` - Create alert
- `PATCH /api/alerts/:id/acknowledge` - Acknowledge alert

## 🛠️ Development Notes

### Database Connection
- Connection pooling is used for better performance
- Automatic reconnection on connection loss
- Query logging in development mode

### Security Features
- Password hashing with bcrypt
- JWT token authentication
- CORS protection
- Rate limiting
- Input validation with Joi
- SQL injection prevention

### Error Handling
- Structured error responses
- Database connection monitoring
- Graceful error recovery

## 🔧 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check MySQL service is running
   - Verify credentials in .env file
   - Ensure database exists

2. **Port Already in Use**
   - Change PORT in .env file
   - Kill existing processes on port 3001

3. **CORS Errors**
   - Update FRONTEND_URL in backend .env
   - Check API base URL in frontend

4. **JWT Token Issues**
   - Check JWT_SECRET is set
   - Verify token expiration settings

### Reset Database
```bash
# Drop and recreate database
mysql -u root -p -e "DROP DATABASE aquamonitor; CREATE DATABASE aquamonitor;"

# Re-run initialization
cd backend
npm run init-db
```

## 📈 Next Steps

1. **Production Deployment**
   - Set up production MySQL server
   - Configure environment variables
   - Set up SSL/HTTPS
   - Deploy backend and frontend

2. **Enhanced Features**
   - Real-time WebSocket connections
   - Advanced analytics
   - Data export functionality
   - Mobile app integration

3. **Monitoring**
   - Database performance monitoring
   - API endpoint analytics
   - Error tracking and logging