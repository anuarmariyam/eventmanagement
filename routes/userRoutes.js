const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { getProfile, updateProfile } = require("../controllers/userController");
const { validateProfileUpdate } = require("../middleware/validationMiddleware");

const router = express.Router();

router.get("/profile", protect, getProfile);

router.put("/profile", protect, validateProfileUpdate, updateProfile);

module.exports = router;
