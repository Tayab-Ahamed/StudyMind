const mongoose = require("mongoose");

let isConnected = false;

async function connectDB() {
  if (isConnected) return;
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log("✅ MongoDB connected:", mongoose.connection.host);
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
}

mongoose.connection.on("disconnected", () => {
  isConnected = false;
  console.warn("⚠️  MongoDB disconnected");
});

module.exports = connectDB;
