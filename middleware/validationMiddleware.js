const validator = require("validator");

function isNonEmptyString(v) {
  return typeof v === "string" && v.trim().length > 0;
}

function isValidEventType(type) {
  return ["concert", "conference", "sports"].includes(type);
}

function isValidOptionalUrl(v) {
  if (v === undefined || v === null || v === "") return true;
  if (typeof v !== "string") return false;
  return validator.isURL(v.trim(), { require_protocol: true });
}

function isValidOptionalDataUrl(v) {
  if (v === undefined || v === null || v === "") return true;
  if (typeof v !== "string") return false;
  return v.startsWith("data:image/");
}

exports.validateRegister = (req, res, next) => {
  const { username, email, password } = req.body;

  if (!isNonEmptyString(username)) return res.status(400).json({ message: "Username is required" });
  if (!isNonEmptyString(email) || !validator.isEmail(email.trim()))
    return res.status(400).json({ message: "Valid email is required" });

  if (!isNonEmptyString(password) || password.length < 6)
    return res.status(400).json({ message: "Password must be at least 6 characters" });

  next();
};

exports.validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!isNonEmptyString(email) || !validator.isEmail(email.trim()))
    return res.status(400).json({ message: "Valid email is required" });

  if (!isNonEmptyString(password))
    return res.status(400).json({ message: "Password is required" });

  next();
};

exports.validateEventCreate = (req, res, next) => {
  const { title, type, date, location, capacity, price, imageUrl, imageData } = req.body;

  if (!isNonEmptyString(title)) return res.status(400).json({ message: "Title is required" });

  if (!isNonEmptyString(type) || !isValidEventType(type))
    return res.status(400).json({ message: "Type must be one of: concert, conference, sports" });

  if (!isNonEmptyString(date) || Number.isNaN(Date.parse(date)))
    return res.status(400).json({ message: "Valid date is required" });

  if (!isNonEmptyString(location))
    return res.status(400).json({ message: "Location (city) is required" });

  const cap = Number(capacity);
  if (!Number.isFinite(cap) || cap <= 0)
    return res.status(400).json({ message: "Capacity must be a positive number" });

  const pr = Number(price ?? 0);
  if (!Number.isFinite(pr) || pr < 0)
    return res.status(400).json({ message: "Price must be 0 or a positive number" });

  if (!isValidOptionalUrl(imageUrl))
    return res.status(400).json({ message: "Image URL must be a valid URL (with https://)" });

  if (!isValidOptionalDataUrl(imageData))
    return res.status(400).json({ message: "Invalid uploaded image format" });

  next();
};

exports.validateEventUpdate = (req, res, next) => {
  const { title, type, date, location, capacity, price, imageUrl, imageData } = req.body;

  if (title !== undefined && !isNonEmptyString(title))
    return res.status(400).json({ message: "Title cannot be empty" });

  if (type !== undefined && (!isNonEmptyString(type) || !isValidEventType(type)))
    return res.status(400).json({ message: "Type must be one of: concert, conference, sports" });

  if (date !== undefined && (typeof date !== "string" || Number.isNaN(Date.parse(date))))
    return res.status(400).json({ message: "Date must be valid" });

  if (location !== undefined && !isNonEmptyString(location))
    return res.status(400).json({ message: "Location (city) cannot be empty" });

  if (capacity !== undefined) {
    const cap = Number(capacity);
    if (!Number.isFinite(cap) || cap <= 0)
      return res.status(400).json({ message: "Capacity must be a positive number" });
  }

  if (price !== undefined) {
    const pr = Number(price);
    if (!Number.isFinite(pr) || pr < 0)
      return res.status(400).json({ message: "Price must be 0 or a positive number" });
  }

  if (!isValidOptionalUrl(imageUrl))
    return res.status(400).json({ message: "Image URL must be a valid URL (with https://)" });

  if (!isValidOptionalDataUrl(imageData))
    return res.status(400).json({ message: "Invalid uploaded image format" });

  next();
};

//profile update validation 
exports.validateProfileUpdate = (req, res, next) => {
  const { username, email, password } = req.body;

  if (username !== undefined && !isNonEmptyString(username)) {
    return res.status(400).json({ message: "Username cannot be empty" });
  }

  if (email !== undefined) {
    if (!isNonEmptyString(email) || !validator.isEmail(email.trim())) {
      return res.status(400).json({ message: "Email must be valid" });
    }
  }

  if (password !== undefined && password !== "" && String(password).length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  next();
};
