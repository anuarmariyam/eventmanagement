const Event = require("../models/Event");

function normalizeCity(city) {
  return String(city || "").trim();
}

exports.getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    return res.json(event);
  } catch (err) {
    next(err);
  }
};

exports.createEvent = async (req, res, next) => {
  try {
    const { title, type, date, location, capacity, price, description, imageUrl, imageData } = req.body;

    const event = await Event.create({
      title: String(title).trim(),
      type,
      date: new Date(date),
      location: normalizeCity(location),
      capacity: Number(capacity),
      price: Number(price ?? 0),
      description: description || "",
      imageUrl: imageUrl || "",
      imageData: imageData || "",
      createdBy: req.user.id
    });

    return res.status(201).json(event);
  } catch (err) {
    next(err);
  }
};

exports.getEvents = async (req, res, next) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    return res.json(events);
  } catch (err) {
    next(err);
  }
};

exports.getMyEvents = async (req, res, next) => {
  try {
    const myEvents = await Event.find({ createdBy: req.user.id }).sort({ date: 1 });
    return res.json(myEvents);
  } catch (err) {
    next(err);
  }
};

exports.updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (String(event.createdBy) !== req.user.id) {
      return res.status(403).json({ message: "Forbidden: not your event" });
    }

    const fields = ["title", "type", "date", "location", "capacity", "price", "description", "imageUrl", "imageData"];
    for (const f of fields) {
      if (req.body[f] !== undefined) {
        if (f === "capacity") event[f] = Number(req.body[f]);
        else if (f === "price") event[f] = Number(req.body[f]);
        else if (f === "date") event[f] = new Date(req.body[f]);
        else if (f === "location") event[f] = normalizeCity(req.body[f]);
        else if (f === "title") event[f] = String(req.body[f]).trim();
        else event[f] = req.body[f];
      }
    }

    await event.save();
    return res.json(event);
  } catch (err) {
    next(err);
  }
};

exports.deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (String(event.createdBy) !== req.user.id) {
      return res.status(403).json({ message: "Forbidden: not your event" });
    }

    await event.deleteOne();
    return res.json({ message: "Event deleted" });
  } catch (err) {
    next(err);
  }
};

exports.getEventWeather = async (req, res, next) => {
  try {
    const apiKey = process.env.OPENWEATHER_API_KEY || process.env.WEATHER_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        message: "OpenWeather API key missing in .env (OPENWEATHER_API_KEY)"
      });
    }

    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const city = normalizeCity(event.location);
    if (!city) return res.status(400).json({ message: "Event city is empty. Please update location." });

    // forecast ~5 days only
    const eventTime = new Date(event.date).getTime();
    const fiveDaysMs = 5 * 24 * 60 * 60 * 1000;
    if (eventTime - Date.now() > fiveDaysMs) {
      return res.status(400).json({
        message: "Forecast is available only for the next ~5 days. Choose a nearer date."
      });
    }

    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(
      city
    )}&appid=${apiKey}&units=metric`;

    const r = await fetch(url);
    const data = await r.json();

    if (!r.ok) {
      return res.status(400).json({
        message: data?.message ? `Weather API: ${data.message}` : "Weather API error"
      });
    }

    const list = Array.isArray(data.list) ? data.list : [];
    if (list.length === 0) return res.status(400).json({ message: "Weather data not available" });

    let best = list[0];
    let bestDiff = Math.abs(new Date(best.dt_txt).getTime() - eventTime);

    for (const item of list) {
      const diff = Math.abs(new Date(item.dt_txt).getTime() - eventTime);
      if (diff < bestDiff) {
        best = item;
        bestDiff = diff;
      }
    }

    return res.json({
      location: city,
      forecastTime: best.dt_txt,
      temperature: best.main?.temp,
      feelsLike: best.main?.feels_like,
      humidity: best.main?.humidity,
      windSpeed: best.wind?.speed,
      description: best.weather?.[0]?.description
    });
  } catch (err) {
    next(err);
  }
};
