const mongoose = require('mongoose');

// Database connection utility
export const ensureDatabaseConnection = async () => {
  const isConnected = mongoose.connection.readyState === 1;
  
  if (isConnected) {
    return;
  }

  console.warn('[database] Database not connected, attempting to connect...');
  
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    if (MONGODB_URI === "memory://") {
      console.log("🧪 MongoDB connection skipped (memory mode for testing)");
      return;
    }

    await mongoose.connect(MONGODB_URI, {
      dbName: 'workTimeTracker',
    });

    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[database] Failed to connect to database:', message);
    throw new Error(`Database connection failed: ${message}`);
  }
};

// JWT verification utility
export const verifyJWT = async (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  
  try {
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-for-development';
    const decoded = jwt.verify(token, jwtSecret);
    return decoded;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
};

// Error handler utility
export const handleError = (res, error, message = 'Internal server error') => {
  console.error('API Error:', error);
  const statusCode = error.statusCode || 500;
  const errorMessage = error.message || message;
  
  res.status(statusCode).json({
    success: false,
    message: errorMessage,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};
