import jwt from 'jsonwebtoken';
// Make sure to import your db client
import { db } from '../libs/db.js';

export const authMiddleware = async (req, res, next) => {
    try {
        // Extract token from Cookie OR Authorization Header
        let token = req.cookies?.jwt;

        if (!token && req.headers.authorization?.startsWith("Bearer ")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({ message: "Unauthorized: No token provided" });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Fetch user details - Fixed `name` to `username`
        const user = await db.user.findUnique({
            where: {
                id: decoded.id
            },
            select: {
                id: true,
                email: true,
                role: true,
                username: true, // <-- Changed from `name: true`
            }
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("JWT Verification Error:", error.message);
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};

export const checkAdmin = async (req, res, next) => {
    try {
        // req.user was already populated by authMiddleware with 'role' included
        if (!req.user || req.user.role !== "ADMIN") {
            return res.status(403).json({ message: "Forbidden - Requires admin privileges" });
        }
        
        next();
    } catch (error) {
        return res.status(500).json({ message: "Error checking admin privileges" });
    }
};