const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Get all users
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    // Transform the users to match the expected client format
    const transformedUsers = users.map(user => ({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      active: user.active,
      createdAt: user.createdAt
    }));
    res.json(transformedUsers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get user profile (for authenticated user)
router.get("/profile", async (req, res) => {
  try {
    // Get user ID from JWT token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: "No token, authorization denied" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      active: user.active,
      phone: user.phone,
      location: user.location
    });
  } catch (err) {
    console.error("Error getting profile:", err);
    res.status(500).json({ message: err.message });
  }
});

// Update user profile (for authenticated user)
router.put("/profile", async (req, res) => {
  try {
    // Get user ID from JWT token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: "No token, authorization denied" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update fields
    if (req.body.name) user.name = req.body.name;
    if (req.body.email) user.email = req.body.email;
    if (req.body.phone) user.phone = req.body.phone;
    if (req.body.location) user.location = req.body.location;
    
    // If password is being updated, hash it
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    await user.save();

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      active: user.active,
      phone: user.phone,
      location: user.location
    });
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ message: err.message });
  }
});

// Get user by email
router.get("/email/:email", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new user
// router.post("/", async (req, res) => {
//   try {
//     // Check if user already exists
//     const existingUser = await User.findOne({ email: req.body.email });
//     if (existingUser) {
//       return res.status(400).json({ message: "Email already in use" });
//     }

//     // Hash password
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(req.body.password, salt);

//     const user = new User({
//       id: req.body.id,
//       name: req.body.name,
//       email: req.body.email,
//       password: hashedPassword, // Store hashed password
//       role: req.body.role || "user",
//       active: req.body.active !== false,
//       phone: req.body.phone || "",
//       location: req.body.location || "",
//     });

//     const newUser = await user.save();
//     res.status(201).json(newUser);
//   } catch (err) {
//     console.error("Error creating user:", err);
//     res.status(400).json({ message: err.message });
//   }
// });

// Signup route
router.post("/signup", async (req, res) => {
  const { email, password, name } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: "user", // Default role
      active: true,
    });

    const newUser = await user.save();

    const token = jwt.sign(
      { id: newUser.id, role: newUser.role, name: newUser.name },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        active: newUser.active,
      },
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error", message: err.message });
  }
});

// Login route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Check if user is active
    if (!user.active) {
      return res.status(403).json({ message: "Your account is inactive. Please contact an administrator." });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        active: user.active,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update a user
router.patch("/:id", async (req, res) => {
  try {
    // If password is being updated, hash it
    if (req.body.password) {
      // Verify current password if provided
      if (req.body.currentPassword) {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });
        
        const isMatch = await bcrypt.compare(req.body.currentPassword, user.password);
        if (!isMatch) {
          return res.status(400).json({ message: "Current password is incorrect" });
        }
      }
      
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    }

    // Use _id instead of id for MongoDB queries
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update user status
router.patch("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { active } = req.body;
    
    if (!id) {
      return res.status(400).json({ message: "User ID is required" });
    }
    
    if (typeof active !== 'boolean') {
      return res.status(400).json({ message: "Active status must be a boolean" });
    }
    
    // Use findByIdAndUpdate for MongoDB _id field
    const user = await User.findByIdAndUpdate(
      id, 
      { active }, 
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({ message: "User status updated successfully", user });
  } catch (err) {
    console.error("Error updating user status:", err);
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
