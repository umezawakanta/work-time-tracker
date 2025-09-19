const mongooseInstance = require('mongoose');
const jsonwebtoken = require('jsonwebtoken');

// User schema
const UserSchemaDef = new mongooseInstance.Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    displayName: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, default: "user" },
    isVerified: { type: Boolean, default: false },
    isAdmin: { type: Boolean, default: false },
    roles: [{ type: String }],
    avatar: { type: String },
    preferences: { type: mongooseInstance.Schema.Types.Mixed, default: {} },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for user ID
UserSchemaDef.virtual("id").get(function () {
  return this._id.toHexString();
});

// Ensure virtual fields are serialized
UserSchemaDef.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret) {
    const { _id, __v, password, ...cleanRet } = ret;
    return cleanRet;
  },
});

const UserModel = mongooseInstance.models.User || mongooseInstance.model("User", UserSchemaDef);

// Database connection utility
const initDatabaseConnection = async () => {
  const isConnected = mongooseInstance.connection.readyState === 1;
  
  if (isConnected) {
    return;
  }

  console.warn('[database] Database not connected, attempting to connect...');
  
  try {
    const { MONGODB_URI } = process.env;
    
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    if (MONGODB_URI === "memory://") {
      return;
    }

    await mongooseInstance.connect(MONGODB_URI, {
      dbName: 'workTimeTracker',
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
      connectTimeoutMS: 10000,
      maxIdleTimeMS: 30000,
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[database] Failed to connect to database:', message);
    throw new Error(`Database connection failed: ${message}`);
  }
};

// JWT verification utility
const verifyJWTToken = async (req) => {
  // リクエストオブジェクトとヘッダーの存在チェック
  if (!req || !req.headers) {
    console.log('Request or headers object is undefined');
    return null;
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  
  try {
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-for-development';
    return jsonwebtoken.verify(token, jwtSecret);
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
};

// Error handler utility
const handleError = (res, error, message = 'Internal server error') => {
  console.error('API Error:', error);
  const statusCode = error.statusCode || 500;
  const errorMessage = error.message || message;
  
  res.status(statusCode).json({
    success: false,
    message: errorMessage,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};

module.exports = {
  ensureDatabaseConnection: initDatabaseConnection,
  verifyJWT: verifyJWTToken,
  handleError,
  mongoose: mongooseInstance,
  jwt: jsonwebtoken,
  User: UserModel
};
