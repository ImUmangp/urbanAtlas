const mongoose = require("mongoose");

const ItinerarySchema = new mongoose.Schema({
    title: String,
    description: String,
    location: String,
    imageUrl: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Itinerary", ItinerarySchema);
