const express = require("express");
const multer = require("multer");
const Itinerary = require("../models/Itinerary");
const router = express.Router();

const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});

const upload = multer({ storage });

router.post("/add", upload.single("image"), async (req, res) => {
    const { title, description, location, user } = req.body;
    const itinerary = new Itinerary({
        title,
        description,
        location,
        imageUrl: `/uploads/${req.file.filename}`,
        user
    });

    try {
        await itinerary.save();
        res.json({ message: "Itinerary posted successfully!" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.get("/all", async (req, res) => {
    const itineraries = await Itinerary.find().populate("user", "name email");
    res.json(itineraries);
});

module.exports = router;
