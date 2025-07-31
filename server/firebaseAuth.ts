import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import jwt from 'jsonwebtoken';
import type { Express, RequestHandler } from 'express';
import cookieParser from 'cookie-parser';
import { storage } from './storage';

// Initialize Firebase Admin (only if not already initialized)
if (!getApps().length) {
  initializeApp({
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  });
}

const adminAuth = getAuth();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface AuthenticatedRequest extends Request {
  user?: any;
}

// Middleware to verify Firebase ID token and create JWT session
export const setupFirebaseAuth = (app: Express) => {
  app.use(cookieParser());

  // Google OAuth login endpoint
  app.post('/api/auth/google', async (req: any, res) => {
    try {
      const { idToken } = req.body;

      if (!idToken) {
        return res.status(400).json({ message: 'ID token is required' });
      }

      // Verify the Firebase ID token
      const decodedToken = await adminAuth.verifyIdToken(idToken);
      const { uid, email, name, picture } = decodedToken;

      // Check if this is the first user (they become admin)
      const existingUsers = await storage.getAllUsers();
      const isFirstUser = existingUsers.length === 0;
      
      // Create user data
      const userData = {
        id: uid,
        email: email || '',
        firstName: name?.split(' ')[0] || '',
        lastName: name?.split(' ').slice(1).join(' ') || '',
        avatar: picture || '',
        role: isFirstUser ? 'admin' : 'client', // First user becomes admin
        createdAt: new Date().toISOString(),
      };

      // Create JWT token
      const jwtToken = jwt.sign(
        { 
          uid, 
          email, 
          role: userData.role 
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Set JWT as httpOnly cookie
      res.cookie('authToken', jwtToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Store user in database or update if exists
      try {
        const existingUser = await storage.getUser(uid);
        let dbUser;
        
        if (existingUser) {
          // Update existing user with latest info from Google
          dbUser = await storage.updateUser(uid, {
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            avatar: userData.avatar,
          });
        } else {
          // Create new user
          dbUser = await storage.createUser(userData);
        }

        res.json({ 
          message: 'Authentication successful',
          user: dbUser 
        });
      } catch (dbError) {
        console.error('Database error:', dbError);
        // Still return success even if DB fails
        res.json({ 
          message: 'Authentication successful',
          user: userData 
        });
      }

    } catch (error) {
      console.error('Firebase auth error:', error);
      res.status(401).json({ message: 'Invalid token' });
    }
  });

  // Logout endpoint
  app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('authToken');
    res.json({ message: 'Logged out successfully' });
  });

  // Get current user endpoint
  app.get('/api/auth/user', verifyJWT, (req: any, res) => {
    res.json(req.user);
  });
};

// JWT verification middleware
export const verifyJWT: RequestHandler = (req: any, res, next) => {
  try {
    const token = req.cookies?.authToken;

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Create user object from JWT payload
    req.user = {
      id: decoded.uid,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    console.error('JWT verification error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Optional: Middleware to get user info from database
export const requireRole = (roles: string[]) => {
  return (req: any, res: any, next: any) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    next();
  };
};