const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    type: { type: String, required: true, enum: ["concert", "conference", "sports"] },
    date: { type: Date, required: true },
    location: { type: String, required: true, trim: true }, // city
    capacity: { type: Number, required: true, min: 1 },
    price: { type: Number, default: 0, min: 0 },            
    description: { type: String, default: "" },

    imageUrl: { type: String, default: "" },  // link
    imageData: { type: String, default: "" }, // base64 (data URL)

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);
