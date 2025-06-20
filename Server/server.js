require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

// Import routes
const userRoutes = require("./routes/userRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const premiumTeamRoutes = require("./routes/premiumTeamRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const coachRoutes = require("./routes/coachRoutes");

// Config
const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch((err) => console.log("MongoDB Connection Error:", err));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/premiumTeams", premiumTeamRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/coaches", coachRoutes);

// Basic route for testing
app.get("/", (req, res) => {
  res.send("Gambo Stadium API is running");
});

// Handle 404 errors - must be after all other routes
app.use((req, res) => {
  console.log(`404 Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    message: "Route not found", 
    path: req.originalUrl,
    method: req.method 
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    message: "Internal server error", 
    error: process.env.NODE_ENV === 'production' ? null : err.message 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}✅ `);
});
