const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const User = require("../models/User");
const verifyToken = require("../middleware/authMiddleware");
// Get all bookings
router.get("/", async (req, res) => {
  try {
    // Find bookings and populate user data
    const bookings = await Booking.find();

    // Enhance bookings with user information
    const enhancedBookings = await Promise.all(
      bookings.map(async (booking) => {
        const user = await User.findById(booking.userId);
        const bookingObj = booking.toObject();
        if (user) {
          bookingObj.userName = user.name;
        }
        return bookingObj;
      })
    );

    res.json(enhancedBookings);
  } catch (err) {
    console.error("Error getting all bookings:", err);
    res.status(500).json({ message: err.message });
  }
});

// Get bookings by user ID
router.get("/user/:userId", async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.params.userId });

    // Enhance bookings with user information
    const enhancedBookings = await Promise.all(
      bookings.map(async (booking) => {
        const user = await User.findById(booking.userId);
        const bookingObj = booking.toObject();

        if (user) {
          bookingObj.userName = user.name;
        }
        return bookingObj;
      })
    );

    res.json(enhancedBookings);
  } catch (err) {
    console.error("Error getting user bookings:", err);
    res.status(500).json({ message: err.message });
  }
});

// Get bookings for the currently logged-in user
router.get("/user", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id; // Get user ID from the token

    // Find bookings for this user
    const bookings = await Booking.find({ userId });

    res.json(bookings);
  } catch (err) {
    console.error("Error getting current user bookings:", err);
    res.status(500).json({ message: err.message });
  }
});

// Create a new booking
// router.post('/', async (req, res) => {
//   try {
//     // First, verify the user exists and get their information
//     const user = await User.findOne({ id: req.body.userId });
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     const booking = new Booking({
//       id: req.body.id,
//       userId: req.body.userId,
//       groundId: req.body.groundId,
//       groundName: req.body.groundName,
//       userName: user.name, // Set userName from the actual user record
//       date: req.body.date,
//       startTime: req.body.startTime,
//       endTime: req.body.endTime,
//       price: req.body.price,
//       status: req.body.status || 'confirmed',
//       paymentId: req.body.paymentId
//     });

//     const newBooking = await booking.save();
//     res.status(201).json(newBooking);
//   } catch (err) {
//     console.error('Error creating booking:', err);
//     res.status(400).json({ message: err.message });
//   }
// });

// Create a new booking ===============
router.post("/", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id; // 👈 From token, not from body
    const {
      groundId,
      groundName,
      date,
      startTime,
      endTime,
      price,
      status,
      paymentId,
      contactEmail,
      specialRequests,
    } = req.body;

    // Enhanced validation with detailed error messages
    const requiredFields = [
      "groundId",
      "groundName",
      "date",
      "startTime",
      "endTime",
      "price",
    ];
    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      console.log("Missing required fields:", missingFields);
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    // Check if the booking already exists
    const existingBooking = await Booking.findOne({
      groundId,
      date,
      startTime,
      endTime,
      status: { $ne: "cancelled" },
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: "This time slot is already booked",
      });
    }

    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // console.log('Creating booking with data:', {
    //   userId,
    //   groundId,
    //   groundName,
    //   date,
    //   startTime,
    //   endTime,
    //   price
    // }); // Debug log

    const booking = new Booking({
      userId,
      groundId,
      groundName,
      userName: user.name,
      date,
      startTime,
      endTime,
      price,
      status: status || "confirmed",
      paymentId: paymentId || null,
      contactEmail,
      specialRequests,
    });

    const newBooking = await booking.save();
    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      booking: newBooking,
    });
  } catch (err) {
    console.error("Error creating booking:", err.message);
    res.status(500).json({
      success: false,
      message: "Error creating booking",
      error: err.message,
    });
  }
});

// Update a booking
router.patch("/:id", async (req, res) => {
  try {
    if (req.body.userId) {
      const user = await User.findById(req.body.userId); // ✅ use _id here
      if (user) {
        req.body.userName = user.name;
      }
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id, // ✅ use native MongoDB _id
      req.body,
      { new: true }
    );

    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.json(booking);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
