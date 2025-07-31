import type { Express, RequestHandler } from "express";
import { storage } from "./storage";
import admin from "firebase-admin";

// Initialize Firebase Admin SDK (server-side)
let adminApp: admin.app.App;
try {
  adminApp = admin.app();
} catch (error) {
  adminApp = admin.initializeApp({
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  });
}

// Middleware to verify Firebase tokens
export const verifyFirebaseToken: RequestHandler = async (req: any, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Store Firebase user info in request
    req.firebaseUser = decodedToken;
    
    // Get or create user in our database
    const user = await storage.getUser(decodedToken.uid);
    if (!user) {
      // Create new user with Google info
      const newUser = await storage.upsertUser({
        id: decodedToken.uid,
        email: decodedToken.email || "",
        firstName: decodedToken.name?.split(' ')[0] || "",
        lastName: decodedToken.name?.split(' ').slice(1).join(' ') || "",
        profileImageUrl: decodedToken.picture || "",
        role: "client", // Default role
      });
      req.user = { claims: { sub: newUser.id }, ...newUser };
    } else {
      req.user = { claims: { sub: user.id }, ...user };
    }
    
    next();
  } catch (error) {
    console.error("Firebase token verification error:", error);
    return res.status(401).json({ message: "Unauthorized" });
  }
};

export async function setupGoogleAuth(app: Express) {
  // Set up session middleware for temp admin access
  const session = (await import('express-session')).default;
  const MemoryStore = (await import('memorystore')).default(session);
  
  app.use(session({
    secret: process.env.SESSION_SECRET || 'dev-secret-key',
    resave: false,
    saveUninitialized: false,
    store: new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    cookie: {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Google auth routes
  app.post("/api/auth/google", async (req, res) => {
    try {
      const { token } = req.body;
      
      if (!token) {
        return res.status(400).json({ message: "Token required" });
      }

      // Verify the token
      const decodedToken = await admin.auth().verifyIdToken(token);
      
      // Get or create user in our database
      let user = await storage.getUser(decodedToken.uid);
      
      if (!user) {
        // Create new user with Google info
        user = await storage.upsertUser({
          id: decodedToken.uid,
          email: decodedToken.email || "",
          firstName: decodedToken.name?.split(' ')[0] || "",
          lastName: decodedToken.name?.split(' ').slice(1).join(' ') || "",
          profileImageUrl: decodedToken.picture || "",
          role: "client", // Default role
        });
      }

      res.json(user);
    } catch (error) {
      console.error("Google auth error:", error);
      res.status(401).json({ message: "Invalid token" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    // Clear temp admin session if exists
    if (req.session) {
      (req.session as any).tempAdmin = undefined;
      req.session.destroy((err) => {
        if (err) {
          console.error("Session destruction error:", err);
        }
      });
    }
    
    res.clearCookie("connect.sid");
    res.json({ message: "Logged out successfully" });
  });
}

// Updated isAuthenticated middleware that works with both Firebase and temp admin
export const isAuthenticated: RequestHandler = async (req: any, res, next) => {
  try {
    // Check temp admin first
    if ((req.session as any).tempAdmin) {
      req.user = (req.session as any).tempAdmin;
      return next();
    }

    // Check Firebase token
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Get user from our database
    const user = await storage.getUser(decodedToken.uid);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    
    req.user = { claims: { sub: user.id }, ...user };
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(401).json({ message: "Unauthorized" });
  }
};