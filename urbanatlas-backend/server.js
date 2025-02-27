require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const admin = require("firebase-admin");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

// Initialize Express
const app = express();
const PORT = process.env.PORT || 5000;

// Debugging logs
console.log("🚀 Initializing server components...");

// Security Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Initialize Firebase Admin SDK
try {
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(require("./firebase-admin-key.json")),
        });
        console.log("✔ Firebase Admin SDK initialized");
    }
} catch (error) {
    console.error("❌ Firebase initialization error:", error);
    process.exit(1);
}

// Import Routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const itineraryRoutes = require("./routes/itineraryRoutes");

// Apply routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/itinerary", itineraryRoutes);
console.log("✔ Routes initialized");

// Environment validation
if (!process.env.MONGO_URI) {
    console.error("❌ ERROR: MONGO_URI is not set in .env file!");
    process.exit(1);
}

// Global error handler
app.use((err, req, res, next) => {
    console.error("❌ Unhandled Error:", err);
    res.status(500).json({ error: "Internal server error" });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
})
.then(() => console.log("✅ MongoDB connected successfully"))
.catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1);
});

// Basic test route
app.get("/", (req, res) => {
    res.send("Server is running...");
});

// Graceful shutdown handling
const server = app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

function gracefulShutdown() {
    console.log('🔄 Received shutdown signal. Closing server...');
    server.close(() => {
        console.log('✔ Server closed');
        mongoose.connection.close(false, () => {
            console.log('✔ MongoDB connection closed');
            process.exit(0);
        });
    });
}
