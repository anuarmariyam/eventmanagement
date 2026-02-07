const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  validateEventCreate,
  validateEventUpdate
} = require("../middleware/validationMiddleware");

const {
  createEvent,
  getEvents,
  getMyEvents,
  getEventById,      
  updateEvent,
  deleteEvent,
  getEventWeather
} = require("../controllers/eventController");

const router = express.Router();

router.get("/", protect, getEvents);
router.get("/my", protect, getMyEvents);

// get one event by id 
router.get("/:id", protect, getEventById);

router.post("/", protect, validateEventCreate, createEvent);
router.put("/:id", protect, validateEventUpdate, updateEvent);
router.delete("/:id", protect, deleteEvent);

router.get("/:id/weather", protect, getEventWeather);

module.exports = router;
