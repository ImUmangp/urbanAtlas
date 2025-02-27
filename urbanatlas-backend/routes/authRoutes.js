const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const admin = require("firebase-admin");
const router = express.Router();

// ✅ Verify Firebase Token (User Login)
router.post("/verify-token", async (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ message: "Token is required" });
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        return res.status(200).json({ message: "User authenticated", user: decodedToken });
    } catch (error) {
        return res.status(401).json({ message: "Invalid Token", error: error.message });
    }
});

// User Registration
router.post("/register", async (req, res) => {
    try {
        const { email, password, username } = req.body;

        if (!email || !password || !username) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Create user in Firebase Auth
        const userRecord = await admin.auth().createUser({
            email,
            password,
            displayName: username
        });

        console.log("✅ Firebase user created:", userRecord);

        // Save user in MongoDB with Firebase UID
        const newUser = new User({
            uid: userRecord.uid,
            email: userRecord.email,
            username
        });

        await newUser.save();

        res.status(201).json({
            message: "User registered successfully",
            uid: userRecord.uid
        });

    } catch (error) {
        console.error("❌ Registration Error:", error);

        if (error.code === "auth/email-already-exists") {
            return res.status(400).json({ message: "Email already registered" });
        }

        res.status(500).json({ message: "Internal server error" });
    }
});

// User Login with Firebase
router.post("/login", async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ message: "Token is required" });
        }

        // Verify Firebase token
        const decodedToken = await admin.auth().verifyIdToken(token);
        
        // Get user from MongoDB using Firebase UID
        const user = await User.findOne({ uid: decodedToken.uid });
        if (!user) {
            return res.status(404).json({ message: "User not found in database" });
        }

        res.json({ 
            message: "Login successful",
            user: {
                uid: user.uid,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error("❌ Login Error:", error);
        res.status(500).json({ message: "Authentication failed" });
    }
});

// Protected Route Example
router.get("/profile", authMiddleware, async (req, res) => {
    try {
        const user = await User.findOne({ uid: req.user.uid });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (error) {
        console.error("❌ Profile Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;