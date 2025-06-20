const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const User = require("../models/User");
const PremiumTeam = require("../models/PremiumTeam");
const verifyToken = require("../middleware/authMiddleware");

// User analytics endpoint
router.get("/users", verifyToken, async (req, res) => {
  try {
    const users = await User.find();
    
    // Calculate total and active users
    const totalUsers = users.length;
    const activeUsers = users.filter((user) => user.active).length;

    // Calculate new users this month
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const newUsersThisMonth = users.filter((user) => {
      const createdAt = new Date(user.createdAt);
      return createdAt >= thisMonth;
    }).length;

    // Calculate user growth over the last 6 months
    const userGrowth = [];

    for (let i = 0; i < 6; i++) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = month.toLocaleString("default", { month: "short" });

      const usersInMonth = users.filter((user) => {
        const createdAt = new Date(user.createdAt);
        return (
          createdAt.getMonth() === month.getMonth() &&
          createdAt.getFullYear() === month.getFullYear()
        );
      }).length;

      userGrowth.push({ month: monthName, users: usersInMonth });
    }

    res.json({
      totalUsers,
      activeUsers,
      newUsersThisMonth,
      userGrowth: userGrowth.reverse(), // Most recent month first
    });
  } catch (error) {
    console.error("Error generating user analytics:", error);
    res.status(500).json({ message: error.message });
  }
});

// Revenue analytics endpoint
router.get("/revenue", verifyToken, async (req, res) => {
  try {
    const bookings = await Booking.find();

    // Calculate total revenue
    const totalRevenue = bookings.reduce((sum, booking) => {
      return booking.status !== "cancelled" ? sum + booking.price : sum;
    }, 0);

    // Calculate monthly revenue for the last 6 months
    const now = new Date();
    const monthlyRevenue = [];

    for (let i = 0; i < 6; i++) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = month.toLocaleString("default", { month: "short" });

      const revenue = bookings.reduce((sum, booking) => {
        const bookingDate = new Date(booking.date);
        if (
          bookingDate.getMonth() === month.getMonth() &&
          bookingDate.getFullYear() === month.getFullYear() &&
          booking.status !== "cancelled"
        ) {
          return sum + booking.price;
        }
        return sum;
      }, 0);

      monthlyRevenue.push({ month: monthName, revenue });
    }

    // Calculate revenue by ground
    const groundMap = new Map();

    bookings.forEach((booking) => {
      if (booking.status !== "cancelled") {
        const currentRevenue = groundMap.get(booking.groundName) || 0;
        groundMap.set(booking.groundName, currentRevenue + booking.price);
      }
    });

    const revenueByGround = Array.from(groundMap.entries()).map(
      ([ground, revenue]) => ({
        ground,
        revenue,
      })
    );

    res.json({
      totalRevenue,
      monthlyRevenue: monthlyRevenue.reverse(), // Most recent month first
      revenueByGround: revenueByGround.sort((a, b) => b.revenue - a.revenue), // Highest revenue first
    });
  } catch (error) {
    console.error("Error generating revenue analytics:", error);
    res.status(500).json({ message: error.message });
  }
});

// Teams analytics endpoint
router.get("/teams", verifyToken, async (req, res) => {
  try {
    const teams = await PremiumTeam.find();

    // Calculate total teams and players
    const totalTeams = teams.length;
    const totalPlayers = teams.reduce(
      (sum, team) => sum + team.players.length,
      0
    );

    // Calculate teams by program
    const programMap = new Map();

    teams.forEach((team) => {
      const currentCount = programMap.get(team.package) || 0;
      programMap.set(team.package, currentCount + 1);
    });

    const teamsByProgram = Array.from(programMap.entries()).map(
      ([program, teams]) => ({
        program,
        teams,
      })
    );

    // Calculate popular training days
    const daysMap = new Map();
    const daysOfWeek = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    // Initialize all days with 0
    daysOfWeek.forEach((day) => daysMap.set(day, 0));

    // Count occurrences of each day
    teams.forEach((team) => {
      team.trainingDays.forEach((day) => {
        const currentCount = daysMap.get(day) || 0;
        daysMap.set(day, currentCount + 1);
      });
    });

    // Convert to array and sort by count
    const popularTrainingDays = Array.from(daysMap.entries())
      .map(([day, count]) => ({ day, count }))
      .sort((a, b) => {
        // First sort by count (descending)
        if (b.count !== a.count) return b.count - a.count;

        // If counts are equal, sort by day of week order
        return daysOfWeek.indexOf(a.day) - daysOfWeek.indexOf(b.day);
      });

    res.json({
      totalTeams,
      totalPlayers,
      teamsByProgram: teamsByProgram.sort((a, b) => b.teams - a.teams), // Most teams first
      popularTrainingDays,
    });
  } catch (error) {
    console.error("Error generating team analytics:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;