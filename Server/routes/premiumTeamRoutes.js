const express = require("express");
const router = express.Router();
const PremiumTeam = require("../models/PremiumTeam");
const verifyToken = require("../middleware/authMiddleware");

// Get all premium teams
router.get("/", async (req, res) => {
  try {
    const teams = await PremiumTeam.find();
    res.json(teams);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get premium teams by user ID
router.get("/user/:userId", async (req, res) => {
  try {
    const teams = await PremiumTeam.find({ userId: req.params.userId });
    res.json(teams);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get premium teams for current authenticated user
router.get("/user", verifyToken, async (req, res) => {
  try {
    // Extract user ID from JWT token (attached to req.user by auth middleware)
    const userId = req.user.id;

    const teams = await PremiumTeam.find({ userId: userId });
    res.json(teams);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new premium team
router.post("/", async (req, res) => {
  const team = new PremiumTeam({
    userId: req.body.userId,
    coach: req.body.coach,
    package: req.body.package,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
    trainingDays: req.body.trainingDays,
    players: req.body.players || [],
    status: req.body.status || "active",
  });

  try {
    const newTeam = await team.save();
    res.status(201).json(newTeam);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a premium team
router.patch("/:id", async (req, res) => {
  try {
    const team = await PremiumTeam.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    if (!team)
      return res.status(404).json({ message: "Premium team not found" });
    res.json(team);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Cancel a premium team membership
router.patch("/cancel/:id", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Find the team and verify it belongs to the current user
    const team = await PremiumTeam.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ message: "Premium team not found" });
    }

    // Check if the team belongs to the current user
    if (team.userId.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to cancel this membership" });
    }

    // Update the status to cancelled
    team.status = "cancelled";
    await team.save();

    res.json({ message: "Membership cancelled successfully", team });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
