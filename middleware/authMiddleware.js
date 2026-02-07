const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function protect(req, res, next) {
  try {
    const auth = req.headers.authorization || "";
    if (!auth.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized: missing token" });
    }

    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(401).json({ message: "Not authorized: user not found" });

    req.user = { id: String(user._id), username: user.username, email: user.email };
    next();
  } catch (e) {
    return res.status(401).json({ message: "Not authorized: invalid token" });
  }
}

module.exports = { protect };
