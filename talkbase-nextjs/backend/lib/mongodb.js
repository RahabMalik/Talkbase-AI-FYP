const mongoose = require("mongoose");

// Don't buffer queries forever when DB is down — fail fast so routes return
// a proper 500 (with CORS headers) instead of hanging or killing the process.
mongoose.set("bufferCommands", false);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Atlas Connected ✅");
  } catch (error) {
    // Log but DO NOT exit — the HTTP server must stay alive so the browser
    // receives proper CORS headers on every response, including error ones.
    console.error("MongoDB connection failed ❌", error.message);
  }
};

module.exports = connectDB;










// const mongoose = require("mongoose");

// const connectDB = async () => {
//   try {
//     await mongoose.connect(process.env.MONGODB_URI);
//     console.log("MongoDB Connected 🚀");
//   } catch (error) {
//     console.log("DB Connection Error:", error.message);
//   }
// };

// module.exports = connectDB;