const jwt = require("jsonwebtoken"); // Import jsonwebtoken
const User = require("../models/User"); // Import User model

const verifyToken = async (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1]; // Extract the token from the header

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify and decode the token
    req.user = decoded; // Attach the decoded user info to the request
    
    // Check if user is still active
    const user = await User.findById(decoded.id);
    if (!user || !user.active) {
      return res.status(403).json({ message: "Account is inactive or not found" });
    }
    
    next(); // Proceed to the next middleware or route handler
  } catch (err) {
    return res.status(403).json({ message: "Invalid token" });
  }
};

module.exports = verifyToken;
