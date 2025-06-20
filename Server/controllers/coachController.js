const Coach = require("../models/Coach");

// Get all coaches
exports.getAllCoaches = async (req, res) => {
  try {
    const coaches = await Coach.find();
    res.json(coaches);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get a specific coach by ID
exports.getCoachById = async (req, res) => {
  try {
    const coach = await Coach.findById(req.params.id);
    if (!coach) {
      return res.status(404).json({ message: "Coach not found" });
    }
    res.json(coach);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a new coach
exports.createCoach = async (req, res) => {
  try {
    const coach = new Coach({
      name: req.body.name,
      specialization: req.body.specialization,
      experience: req.body.experience,
      availability: req.body.availability,
      bio: req.body.bio || "",
      image: req.body.image || "",
      rating: req.body.rating || 0,
    });

    const newCoach = await coach.save();
    res.status(201).json(newCoach);
  } catch (err) {
    console.error("Error creating coach:", err);
    res.status(400).json({ message: err.message });
  }
};

// Update a coach
exports.updateCoach = async (req, res) => {
  try {
    const coach = await Coach.findById(req.params.id);
    if (!coach) {
      return res.status(404).json({ message: "Coach not found" });
    }

    // Update only the fields that are provided
    if (req.body.name) coach.name = req.body.name;
    if (req.body.specialization) coach.specialization = req.body.specialization;
    if (req.body.experience) coach.experience = req.body.experience;
    if (req.body.availability) coach.availability = req.body.availability;
    if (req.body.bio !== undefined) coach.bio = req.body.bio;
    if (req.body.image !== undefined) coach.image = req.body.image;
    if (req.body.rating !== undefined) coach.rating = req.body.rating;

    const updatedCoach = await coach.save();
    res.json(updatedCoach);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete a coach
exports.deleteCoach = async (req, res) => {
  try {
    const coach = await Coach.findById(req.params.id);
    if (!coach) {
      return res.status(404).json({ message: "Coach not found" });
    }

    await Coach.findByIdAndDelete(req.params.id);
    res.json({ message: "Coach deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};