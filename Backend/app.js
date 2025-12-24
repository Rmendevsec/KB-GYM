const express = require("express");
const app = express();
const cors = require("cors");
// Import routes
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const qrRoutes = require('./routes/qr.routes');
const adminRoutes = require("./routes/admin.routes");
const packageRoutes = require("./routes/packages.routes");




// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors()); // allows any origin

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use('/api/qr', qrRoutes);
// Health check
app.get("/", (req, res) => {
  res.json({
    message: "KB Gym API",
    version: "1.0.0",
    endpoints: {
      auth: {
        register: "POST /api/auth/register",
        login: "POST /api/auth/login"
      },
      users: {
        profile: "GET /api/users/me"
      }
    }
  });
});
app.use("/api/admin", adminRoutes);
app.use("/api/packages", packageRoutes);
// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

module.exports = app;