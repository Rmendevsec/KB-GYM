const express = require("express");
const app = express();
const cors = require("cors");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");

const qrRoutes = require('./routes/qr.routes');


// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors()); // allows any origin

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use('/api/qr', qrRoutes);
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
const packageRoutes = require("./routes/package.routes");
app.use("/api/packages", packageRoutes);

const adminRoutes = require('./routes/admin.routes');

app.use('/api/admin', adminRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

module.exports = app;