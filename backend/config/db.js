import mongoose from "mongoose";

let isConnected = false;

const connectDB = async () => {
  // If already connected, reuse existing MongoDB connection
  if (mongoose.connections?.[0]?.readyState >= 1 || isConnected) {
    return mongoose.connection;
  }

  try {
    const connection = await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;

    console.log(
      `MongoDB Connected: ${connection.connection.host}`
    );
    return connection;
  } catch (error) {
    console.error("MongoDB Connection Failed:", error.message);
    throw error;
  }
};

export default connectDB;