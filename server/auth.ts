import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { Express, RequestHandler } from 'express';
import cookieParser from 'cookie-parser';
import { storage } from './storage';
import { z } from 'zod';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface AuthenticatedRequest extends Request {
  user?: any;
}

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Setup authentication routes
export const setupAuth = (app: Express) => {
  app.use(cookieParser());

  // Register endpoint
  app.post('/api/auth/register', async (req, res) => {
    try {
      const validatedData = registerSchema.parse(req.body);
      const { email, password, firstName, lastName, phone } = validatedData;

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists with this email' });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 12);

      // Check if this is the first user (they become admin)
      const existingUsers = await storage.getAllUsers();
      const isFirstUser = existingUsers.length === 0;

      // Create user data
      const userData = {
        email,
        firstName,
        lastName,
        phone: phone || null,
        passwordHash,
        role: isFirstUser ? 'admin' : 'customer',
        emailVerified: false,
        isActive: true,
        createdAt: new Date(),
      };

      // Create user in database
      const dbUser = await storage.createUser(userData);

      // Create JWT token
      const jwtToken = jwt.sign(
        { 
          uid: dbUser.id, 
          email: dbUser.email, 
          role: dbUser.role 
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

      // Remove password hash from response
      const { passwordHash: _, ...userResponse } = dbUser;

      res.status(201).json({ 
        message: 'Registration successful',
        user: userResponse 
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Validation error',
          errors: error.errors 
        });
      }
      
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Registration failed' });
    }
  });

  // Login endpoint
  app.post('/api/auth/login', async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      const { email, password } = validatedData;

      // Get user from database
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({ message: 'Account is deactivated' });
      }

      // Verify password
      if (!user.passwordHash) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Update last login
      await storage.updateUser(user.id, { lastLogin: new Date() });

      // Create JWT token
      const jwtToken = jwt.sign(
        { 
          uid: user.id, 
          email: user.email, 
          role: user.role 
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

      // Remove password hash from response
      const { passwordHash: _, ...userResponse } = user;

      res.json({ 
        message: 'Login successful',
        user: userResponse 
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Validation error',
          errors: error.errors 
        });
      }
      
      console.error('Login error:', error);
      res.status(500).json({ message: 'Login failed' });
    }
  });

  // Logout endpoint
  app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('authToken');
    res.json({ message: 'Logged out successfully' });
  });

  // Get current user endpoint
  app.get('/api/auth/user', verifyJWT, async (req: any, res) => {
    try {
      // Get fresh user data from database
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      // Remove password hash from response
      const { passwordHash: _, ...userResponse } = user;
      res.json(userResponse);
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ message: 'Failed to get user data' });
    }
  });

  // Change password endpoint
  app.post('/api/auth/change-password', verifyJWT, async (req: any, res) => {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Current password and new password are required' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ message: 'New password must be at least 6 characters' });
      }

      // Get user from database
      const user = await storage.getUser(req.user.id);
      if (!user || !user.passwordHash) {
        return res.status(401).json({ message: 'User not found' });
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }

      // Hash new password
      const newPasswordHash = await bcrypt.hash(newPassword, 12);

      // Update password
      await storage.updateUser(user.id, { passwordHash: newPasswordHash });

      res.json({ message: 'Password changed successfully' });

    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ message: 'Failed to change password' });
    }
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

// Role-based access control middleware
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
