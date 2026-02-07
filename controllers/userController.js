const Event = require("../models/Event");
const User = require("../models/User");

exports.getProfile = async (req, res) => {
  const eventsCreated = await Event.countDocuments({ createdBy: req.user.id });

  return res.json({
    username: req.user.username,
    email: req.user.email,
    eventsCreated
  });
};

// update profile 
exports.updateProfile = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (username !== undefined) user.username = String(username).trim();
    if (email !== undefined) user.email = String(email).toLowerCase().trim();

    // password is optional
    if (password !== undefined && password !== "") {
      const bcrypt = require("bcryptjs");
      user.password = await bcrypt.hash(String(password), 10);
    }

    await user.save();

    // return updated public data (no password)
    return res.json({
      id: String(user._id),
      username: user.username,
      email: user.email
    });
  } catch (err) {
    next(err);
  }
};
