const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

function signToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d"
  });
}

exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists) return res.status(400).json({ message: "User already exists with this email" });

    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password: hash
    });

    return res.status(201).json({
      token: signToken(user._id),
      user: { id: user._id, username: user.username, email: user.email }
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    return res.json({
      token: signToken(user._id),
      user: { id: user._id, username: user.username, email: user.email }
    });
  } catch (err) {
    next(err);
  }
};
