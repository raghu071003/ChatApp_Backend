import jwt from "jsonwebtoken";
import { User } from "../Models/user.model.js";

const VerifyJwt = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken; // Get token from cookies
    
    if (!token) {
      return res.status(401).json({ message: "Unauthorized. No token provided." });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    
    // Find user by ID
    const user = await User.findById(decoded._id).select("-password"); // Exclude password

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user; // Attach user data to request object
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export default VerifyJwt;
