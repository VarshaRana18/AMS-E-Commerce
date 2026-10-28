import mongoose from "mongoose";

export const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return;

  try {
    const options = {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    };

    // Explicitly target database name if specified to prevent case-mismatch conflicts (MongoDB Error 13297)
    if (process.env.DB_NAME) {
      options.dbName = process.env.DB_NAME;
    }

    await mongoose.connect(process.env.MONGO_URI, options);

    console.log(`MongoDB connected successfully to database: [${mongoose.connection.name}]`);
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    throw error;
  }
};
