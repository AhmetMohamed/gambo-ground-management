const express = require("express");
const router = express.Router();
const coachController = require("../controllers/coachController");
const verifyToken = require("../middleware/authMiddleware");

// Get all coaches
router.get("/", coachController.getAllCoaches);

// Get a specific coach by ID
router.get("/:id", coachController.getCoachById);

// Create a new coach
router.post("/", verifyToken, coachController.createCoach);

// Update a coach
router.patch("/:id", verifyToken, coachController.updateCoach);

// Delete a coach
router.delete("/:id", verifyToken, coachController.deleteCoach);

module.exports = router;