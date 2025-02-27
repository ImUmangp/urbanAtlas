const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/User");

const router = express.Router();

/**
 * ✅ GET User Profile
 * @route GET /api/user/profile
 * @desc Fetch user profile from MongoDB
 * @access Private (Authenticated Users Only)
 */
router.get("/profile", authMiddleware, async (req, res) => {
    try {
        const user = await User.findOne({ uid: req.user.uid });

        if (!user) {
            return res.status(404).json({ message: "User profile not found" });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

/**
 * ✅ UPDATE User Profile
 * @route PUT /api/user/profile
 * @desc Update user profile fields (name, bio, location, profilePicture)
 * @access Private (Authenticated Users Only)
 */
router.put("/profile", authMiddleware, async (req, res) => {
    try {
        const { name, bio, location, profilePicture } = req.body;
        const user = await User.findOneAndUpdate(
            { uid: req.user.uid }, // Find by Firebase UID
            { $set: { name, bio, location, profilePicture } }, // Update fields
            { new: true, upsert: true } // Return updated user & create if not exists
        );

        res.status(200).json({ message: "Profile updated successfully", user });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

module.exports = router;
