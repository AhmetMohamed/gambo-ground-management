const mongoose = require("mongoose");

const PlayerSchema = new mongoose.Schema({
  name: String,
  age: String,
});

const PremiumTeamSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    type: mongoose.Schema.ObjectId,
  },
  coach: {
    type: String,
    required: true,
  },
  coachImage: {
    type: String,
    default: "",
  },
  package: {
    type: String,
    required: true,
  },
  startDate: {
    type: String,
    required: true,
  },
  endDate: {
    type: String,
    required: true,
  },
  trainingDays: [String],
  players: [PlayerSchema],
  status: {
    type: String,
    enum: ["active", "pending", "cancelled"],
    default: "active",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("PremiumTeam", PremiumTeamSchema);
