const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/User");

const router = express.Router();

/**
 * ✅ GET All Users (NEW)
 * @route GET /api/user
 * @desc Fetch all users from MongoDB
 * @access Public
 */
router.get("/", async (req, res) => {
    try {
        const users = await User.find().select("uid email name");
        res.json(users);
    } catch (error) {
        console.error("❌ Error fetching users:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
router.get("/:uid", async (req, res) => {
    try {
        const user = await User.findOne({ uid: req.params.uid }).select("uid email name");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (error) {
        console.error("❌ Error fetching user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
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
 * @desc Update user profile fields
 * @access Private (Authenticated Users Only)
 */
router.put("/profile", authMiddleware, async (req, res) => {
    try {
        const { name, bio, location, profilePicture } = req.body;
        const user = await User.findOneAndUpdate(
            { uid: req.user.uid }, 
            { $set: { name, bio, location, profilePicture } }, 
            { new: true, upsert: true } 
        );

        res.status(200).json({ message: "Profile updated successfully", user });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});
// ✅ DELETE User by UID
router.delete("/:uid", async (req, res) => {
    try {
        const user = await User.findOneAndDelete({ uid: req.params.uid });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ message: "User deleted successfully" });

    } catch (error) {
        console.error("❌ Error deleting user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
// ✅ Update User Info
router.put("/:uid", async (req, res) => {
    try {
        const { uid } = req.params; // Get UID from URL
        const { name, email } = req.body; // Get updated fields

        // ✅ Find and update user
        const updatedUser = await User.findOneAndUpdate(
            { uid: uid }, // Find user by UID
            { $set: { name, email } }, // Update only provided fields
            { new: true, runValidators: true } // Return updated document & validate
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            message: "User updated successfully",
            user: updatedUser
        });

    } catch (error) {
        console.error("❌ Update Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
})
module.exports = router;
