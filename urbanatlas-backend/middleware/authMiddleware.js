const admin = require("firebase-admin");

const authMiddleware = async (req, res, next) => {
    const token = req.header("Authorization");

    if (!token) {
        return res.status(401).json({ message: "Access Denied. No Token Provided." });
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(token.replace("Bearer ", ""));
        req.user = decodedToken; // Attach user details to request
        next();
    } catch (err) {
        res.status(401).json({ message: "Invalid Firebase Token", error: err.message });
    }
};

module.exports = authMiddleware;
