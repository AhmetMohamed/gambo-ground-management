require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");

// Import routes
const userRoutes = require("./routes/userRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const premiumTeamRoutes = require("./routes/premiumTeamRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes"); // Add this line
const coachRoutes = require("./routes/coachRoutes");

// Config
dotenv.config();
const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

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
app.use("/api/analytics", analyticsRoutes); // Add this line
app.use("/api/coaches", coachRoutes);

// Basic route for testing
app.get("/", (req, res) => {
  res.send("Gambo Stadium API is running");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}✅ `);
});
