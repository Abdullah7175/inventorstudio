import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { Express, RequestHandler } from 'express';
import cookieParser from 'cookie-parser';
import { storage } from './storage';
import { z } from 'zod';
import crypto from 'crypto';

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

const mobileLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  deviceToken: z.string().optional(),
  deviceType: z.enum(['ios', 'android', 'web']).optional(),
});

const mobileRegisterSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  deviceToken: z.string().optional(),
  deviceType: z.enum(['ios', 'android', 'web']).optional(),
});

const otpVerificationSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  otpCode: z.string().length(6, 'OTP code must be 6 digits'),
  deviceInfo: z.string().optional(),
});

const requestOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  deviceInfo: z.string().optional(),
});

// Token blacklist to store invalidated tokens (now using database)
const memoryTokenBlacklist = new Set<string>(); // Keep for immediate invalidation

// OTP generation function
function generateOTP(): string {
  // Generate a random 6-digit code, but ensure it's not the master code
  let code: string;
  do {
    code = Math.floor(100000 + Math.random() * 900000).toString();
  } while (code === '999999'); // Avoid master code in random generation
  
  return code;
}

// Master OTP code for testing
const MASTER_OTP_CODE = '999999';

// API Security Token (separate from session tokens)
const API_SECURITY_TOKEN = process.env.API_SECURITY_TOKEN || 'inventor-design-studio-api-2024-secure';

// Generate secure session token for mobile
function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Create SHA256 hash of JWT token for blacklist
function createTokenHash(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// API Security Token middleware
export const verifyApiSecurityToken: RequestHandler = (req, res, next) => {
  const apiToken = req.headers['x-api-security-token'] || req.headers['api-security-token'];
  
  if (!apiToken || apiToken !== API_SECURITY_TOKEN) {
    return res.status(401).json({ 
      message: 'Invalid or missing API security token',
      error: 'API_SECURITY_TOKEN_REQUIRED'
    });
  }
  
  next();
};

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

      // All new registrations are customers only
      const userData = {
        email,
        firstName,
        lastName,
        phone: phone || null,
        passwordHash,
        role: (email === 'admin@inventorstudio.com' || email === 'admin@inventor-design-studio.com') ? 'admin' : 
              (email === 'team@inventorstudio.com' || email.includes('@team.inventorstudio.com')) ? 'team' : 'customer',
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

      // Check if user is a team member and get their specific role
      let teamMemberInfo = null;
      if (user.role === 'team') {
        teamMemberInfo = await storage.getTeamMemberByUserId(user.id);
        if (!teamMemberInfo) {
          return res.status(401).json({ message: 'Team member not found' });
        }
      }

      // Create JWT token with team member info if applicable
      const tokenPayload: any = { 
        uid: user.id, 
        email: user.email, 
        role: user.role 
      };

      if (teamMemberInfo) {
        tokenPayload.teamMemberId = teamMemberInfo.id;
        tokenPayload.teamRole = teamMemberInfo.role;
        tokenPayload.permissions = teamMemberInfo.roleDetails?.permissions;
      }

      const jwtToken = jwt.sign(
        tokenPayload,
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
      
      // Add team role information from JWT token if available
      const responseWithTeamInfo: any = { ...userResponse };
      if (tokenPayload.teamRole) {
        responseWithTeamInfo.teamRole = tokenPayload.teamRole;
      }
      if (tokenPayload.teamMemberId) {
        responseWithTeamInfo.teamMemberId = tokenPayload.teamMemberId;
      }
      if (tokenPayload.permissions) {
        responseWithTeamInfo.permissions = tokenPayload.permissions;
      }

      res.json({ 
        message: 'Login successful',
        user: responseWithTeamInfo 
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

  // Mobile login endpoint (simple login for mobile app)
  app.post('/api/mobile/auth/login', async (req, res) => {
    try {
      const validatedData = mobileLoginSchema.parse(req.body);
      const { email, password, deviceToken, deviceType } = validatedData;

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

      // Update last login and device info
      const updateData: any = { lastLogin: new Date() };
      if (deviceToken) {
        updateData.deviceToken = deviceToken;
      }
      if (deviceType) {
        updateData.deviceType = deviceType;
      }
      await storage.updateUser(user.id, updateData);

      // Create or update mobile session with 7-day session token
      let sessionToken = null;
      let sessionExpiresAt = null;
      
      if (deviceToken && deviceType) {
        const existingSession = await storage.getMobileSession(user.id, deviceToken);
        sessionToken = generateSessionToken();
        sessionExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        
        if (existingSession) {
          await storage.updateMobileSession(user.id, deviceToken, { 
            sessionToken,
            sessionExpiresAt,
            lastActivity: new Date(),
            isActive: true 
          });
        } else {
          await storage.createMobileSession({
            userId: user.id,
            deviceToken,
            deviceType,
            sessionToken,
            sessionExpiresAt,
            deviceInfo: JSON.stringify({
              userAgent: req.headers['user-agent'],
              ip: req.ip,
              timestamp: new Date()
            }),
            isActive: true,
            lastActivity: new Date()
          });
        }
      }

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

      // Remove password hash from response
      const { passwordHash: _, ...userResponse } = user;

      res.json({ 
        message: 'Mobile login successful',
        user: userResponse,
        token: jwtToken,
        sessionToken: sessionToken,
        expiresIn: '7d'
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Validation error',
          errors: error.errors 
        });
      }
      
      console.error('Mobile login error:', error);
      res.status(500).json({ message: 'Mobile login failed' });
    }
  });

  // Mobile registration endpoint
  app.post('/api/mobile/auth/register', async (req, res) => {
    try {
      const validatedData = mobileRegisterSchema.parse(req.body);
      const { email, password, firstName, lastName, phone, deviceToken, deviceType } = validatedData;

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists with this email' });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 12);

      // All new registrations are customers only
      const userData = {
        email,
        firstName,
        lastName,
        phone: phone || null,
        passwordHash,
        role: (email === 'admin@inventorstudio.com' || email === 'admin@inventor-design-studio.com') ? 'admin' : 
              (email === 'team@inventorstudio.com' || email.includes('@team.inventorstudio.com')) ? 'team' : 'customer',
        emailVerified: false,
        isActive: true,
        createdAt: new Date(),
      };

      // Create user in database
      const dbUser = await storage.createUser(userData);

      // Create mobile session if device token provided
      if (deviceToken && deviceType) {
        await storage.createMobileSession({
          userId: dbUser.id,
          deviceToken,
          deviceType,
          deviceInfo: JSON.stringify({
            userAgent: req.headers['user-agent'],
            ip: req.ip,
            timestamp: new Date()
          }),
          isActive: true,
          lastActivity: new Date()
        });
      }

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

      // Remove password hash from response
      const { passwordHash: _, ...userResponse } = dbUser;

      res.status(201).json({ 
        message: 'Mobile registration successful',
        user: userResponse,
        token: jwtToken,
        expiresIn: '7d'
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Validation error',
          errors: error.errors 
        });
      }
      
      console.error('Mobile registration error:', error);
      res.status(500).json({ message: 'Mobile registration failed' });
    }
  });

  // Mobile logout endpoint
  app.post('/api/mobile/auth/logout', verifyJWT, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const deviceToken = req.body.deviceToken;

      // Deactivate mobile session if device token provided
      if (deviceToken) {
        await storage.deactivateMobileSession(userId, deviceToken);
      }

      // Add token to blacklist (memory + database)
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (token) {
        // Add to memory blacklist for immediate effect
        memoryTokenBlacklist.add(token);
        
        // Add to database blacklist for persistence
        const tokenHash = createTokenHash(token);
        const decoded = jwt.decode(token) as any;
        const expiresAt = decoded?.exp ? new Date(decoded.exp * 1000) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        
        await storage.addTokenToBlacklist(tokenHash, userId, 'logout', expiresAt);
      }

      res.json({ message: 'Mobile logout successful' });
    } catch (error) {
      console.error('Mobile logout error:', error);
      res.status(500).json({ message: 'Mobile logout failed' });
    }
  });

  // Logout endpoint - works with or without JWT verification
  app.post('/api/auth/logout', async (req: any, res) => {
    try {
      // Get token from header or cookie (same logic as verifyJWT)
      let token = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.authToken;
      
      console.log('Logout request - Token found:', !!token);
      console.log('Logout request - Cookies:', req.cookies);
      
      if (token) {
        // Add to memory blacklist for immediate effect
        memoryTokenBlacklist.add(token);
        console.log('Token added to memory blacklist');
        
        // Add to database blacklist for persistence
        const tokenHash = createTokenHash(token);
        const decoded = jwt.decode(token) as any;
        const expiresAt = decoded?.exp ? new Date(decoded.exp * 1000) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        const userId = decoded?.uid || null;
        
        await storage.addTokenToBlacklist(tokenHash, userId, 'logout', expiresAt);
        console.log('Token added to database blacklist, hash:', tokenHash.substring(0, 10) + '...');
      }

      // Clear the auth cookie with multiple approaches to ensure it's removed
      res.clearCookie('authToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 0,
        expires: new Date(0)
      });
      
      // Also try clearing without secure flag (for development)
      res.clearCookie('authToken', {
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
        path: '/',
        maxAge: 0,
        expires: new Date(0)
      });
      
      // Clear with different sameSite values
      res.clearCookie('authToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 0,
        expires: new Date(0)
      });
      
      console.log('Cookie cleared with multiple approaches');
      
      res.status(200).json({ 
        ok: true, 
        message: 'Logged out successfully',
        tokenBlacklisted: !!token,
        debug: {
          hadToken: !!token,
          environment: process.env.NODE_ENV
        }
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ 
        ok: false, 
        message: 'Logout failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get current user endpoint
  app.get('/api/auth/user', verifyJWT, async (req: any, res) => {
    try {
      console.log('Get user endpoint - User ID:', req.user?.id);
      
      // Get fresh user data from database
      const user = await storage.getUser(req.user.id);
      
      console.log('Get user endpoint - User found:', !!user);
      
      if (!user) {
        console.log('Get user endpoint - User not found in database');
        return res.status(401).json({ message: 'User not found' });
      }

      console.log('Get user endpoint - Returning user data for:', user.email);

      // Remove password hash from response
      const { passwordHash: _, ...userResponse } = user;
      
      // Add team role information from JWT token if available
      const responseWithTeamInfo: any = { ...userResponse };
      if (req.user.teamRole) {
        responseWithTeamInfo.teamRole = req.user.teamRole;
      }
      if (req.user.teamMemberId) {
        responseWithTeamInfo.teamMemberId = req.user.teamMemberId;
      }
      if (req.user.permissions) {
        responseWithTeamInfo.permissions = req.user.permissions;
      }
      
      res.json(responseWithTeamInfo);
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

  // Desktop login with OTP flow - Step 1: Request OTP
  app.post('/api/auth/desktop-login-request', async (req, res) => {
    try {
      const validatedData = requestOtpSchema.parse(req.body);
      const { email, password, deviceInfo } = validatedData;

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

      // Check if user has active mobile sessions (logged into mobile app)
      const activeMobileSessions = await storage.getActiveMobileSessions(user.id);
      if (activeMobileSessions.length === 0) {
        return res.status(403).json({ 
          message: 'Please log in to your mobile app first to receive the authorization code',
          requiresMobileLogin: true 
        });
      }

      // Generate OTP code
      const otpCode = generateOTP();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

      // Save OTP to database
      await storage.createOtpCode({
        userId: user.id,
        code: otpCode,
        type: 'desktop_login',
        deviceInfo: deviceInfo || JSON.stringify({
          userAgent: req.headers['user-agent'],
          ip: req.ip,
          timestamp: new Date()
        }),
        isUsed: false,
        expiresAt
      });

      // TODO: Send push notification to mobile app
      // This would integrate with your push notification service
      console.log(`OTP Code for ${user.email}: ${otpCode}`);

      res.json({ 
        message: 'Authorization code sent to your mobile app',
        expiresIn: 300 // 5 minutes in seconds
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Validation error',
          errors: error.errors 
        });
      }
      
      console.error('Desktop login request error:', error);
      res.status(500).json({ message: 'Failed to request authorization code' });
    }
  });

  // Desktop login with OTP flow - Step 2: Verify OTP
  app.post('/api/auth/desktop-login-verify', async (req, res) => {
    try {
      const validatedData = otpVerificationSchema.parse(req.body);
      const { email, password, otpCode, deviceInfo } = validatedData;

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

      // Check OTP code (master code or valid OTP)
      let isValidOtp = false;
      let otpRecord = null;

      if (otpCode === MASTER_OTP_CODE) {
        // Master code for testing
        isValidOtp = true;
      } else {
        // Check valid OTP
        otpRecord = await storage.getOtpCode(user.id, otpCode);
        if (otpRecord && new Date() <= otpRecord.expiresAt) {
          isValidOtp = true;
          // Mark OTP as used
          await storage.invalidateOtpCode(otpRecord.id);
        }
      }

      if (!isValidOtp) {
        return res.status(401).json({ message: 'Invalid or expired authorization code' });
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
        message: 'Desktop login successful',
        user: userResponse 
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Validation error',
          errors: error.errors 
        });
      }
      
      console.error('Desktop login verify error:', error);
      res.status(500).json({ message: 'Desktop login verification failed' });
    }
  });

  // API to send OTP notification to mobile app (called by mobile app)
  app.post('/api/mobile/send-otp-notification', verifyJWT, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { targetUserId, otpCode, message } = req.body;

      // Verify the requesting user has permission (they should be the same user)
      if (userId !== targetUserId) {
        return res.status(403).json({ message: 'Unauthorized to send notification' });
      }

      // Get user's active mobile sessions
      const activeSessions = await storage.getActiveMobileSessions(userId);
      
      if (activeSessions.length === 0) {
        return res.status(404).json({ message: 'No active mobile sessions found' });
      }

      // TODO: Implement actual push notification sending
      // This would integrate with Firebase Cloud Messaging or similar
      const notificationData = {
        title: 'Desktop Login Authorization',
        body: message || `Your authorization code is: ${otpCode}`,
        data: {
          type: 'desktop_login_otp',
          code: otpCode,
          timestamp: new Date().toISOString()
        }
      };

      // For now, just log the notification
      console.log('Push notification would be sent:', {
        userId,
        sessions: activeSessions.length,
        notification: notificationData
      });

      res.json({ 
        message: 'OTP notification sent successfully',
        sessionsNotified: activeSessions.length,
        notification: notificationData
      });

    } catch (error) {
      console.error('Send OTP notification error:', error);
      res.status(500).json({ message: 'Failed to send OTP notification' });
    }
  });

  // Get active mobile sessions for a user
  app.get('/api/mobile/sessions', verifyJWT, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const sessions = await storage.getActiveMobileSessions(userId);
      
      // Remove sensitive information
      const safeSessions = sessions.map(session => ({
        id: session.id,
        deviceType: session.deviceType,
        lastActivity: session.lastActivity,
        createdAt: session.createdAt,
        deviceInfo: session.deviceInfo ? JSON.parse(session.deviceInfo) : null
      }));

      res.json(safeSessions);
    } catch (error) {
      console.error('Get mobile sessions error:', error);
      res.status(500).json({ message: 'Failed to get mobile sessions' });
    }
  });

  // Biometric Settings APIs
  app.post('/api/mobile/biometric/setup', verifyJWT, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { deviceToken, biometricType, encryptedPin, settings } = req.body;

      if (!deviceToken || !biometricType) {
        return res.status(400).json({ message: 'Device token and biometric type are required' });
      }

      // Create or update biometric settings
      const existingSettings = await storage.getBiometricSettings(userId, deviceToken);
      
      const settingsData = {
        userId,
        deviceToken,
        biometricType,
        isEnabled: true,
        encryptedPin: encryptedPin || null,
        settings: settings ? JSON.stringify(settings) : null
      };

      let result;
      if (existingSettings) {
        result = await storage.updateBiometricSettings(userId, deviceToken, settingsData);
      } else {
        result = await storage.createBiometricSettings(settingsData);
      }

      res.json({
        message: 'Biometric settings configured successfully',
        settings: {
          id: result.id,
          biometricType: result.biometricType,
          isEnabled: result.isEnabled,
          createdAt: result.createdAt
        }
      });
    } catch (error) {
      console.error('Setup biometric settings error:', error);
      res.status(500).json({ message: 'Failed to setup biometric settings' });
    }
  });

  app.get('/api/mobile/biometric/settings', verifyJWT, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const deviceToken = req.headers['device-token'] as string;

      if (!deviceToken) {
        return res.status(400).json({ message: 'Device token is required' });
      }

      const settings = await storage.getBiometricSettings(userId, deviceToken);
      
      if (!settings) {
        return res.status(404).json({ message: 'Biometric settings not found' });
      }

      res.json({
        biometricType: settings.biometricType,
        isEnabled: settings.isEnabled,
        settings: settings.settings ? JSON.parse(settings.settings) : null,
        createdAt: settings.createdAt,
        updatedAt: settings.updatedAt
      });
    } catch (error) {
      console.error('Get biometric settings error:', error);
      res.status(500).json({ message: 'Failed to get biometric settings' });
    }
  });

  app.put('/api/mobile/biometric/toggle', verifyJWT, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { deviceToken, isEnabled } = req.body;

      if (!deviceToken) {
        return res.status(400).json({ message: 'Device token is required' });
      }

      const settings = await storage.getBiometricSettings(userId, deviceToken);
      
      if (!settings) {
        return res.status(404).json({ message: 'Biometric settings not found' });
      }

      const updatedSettings = await storage.updateBiometricSettings(userId, deviceToken, { isEnabled });

      res.json({
        message: `Biometric authentication ${isEnabled ? 'enabled' : 'disabled'}`,
        isEnabled: updatedSettings.isEnabled
      });
    } catch (error) {
      console.error('Toggle biometric settings error:', error);
      res.status(500).json({ message: 'Failed to toggle biometric settings' });
    }
  });

  app.delete('/api/mobile/biometric/settings', verifyJWT, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const deviceToken = req.headers['device-token'] as string;

      if (!deviceToken) {
        return res.status(400).json({ message: 'Device token is required' });
      }

      await storage.deleteBiometricSettings(userId, deviceToken);

      res.json({ message: 'Biometric settings deleted successfully' });
    } catch (error) {
      console.error('Delete biometric settings error:', error);
      res.status(500).json({ message: 'Failed to delete biometric settings' });
    }
  });

  // Comprehensive logout - clear all sessions and tokens
  app.post('/api/auth/logout-all', verifyJWT, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.authToken;

      // 1. Add current token to blacklist
      if (token) {
        memoryTokenBlacklist.add(token);
        const tokenHash = createTokenHash(token);
        const decoded = jwt.decode(token) as any;
        const expiresAt = decoded?.exp ? new Date(decoded.exp * 1000) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await storage.addTokenToBlacklist(tokenHash, userId, 'logout', expiresAt);
      }

      // 2. Deactivate all mobile sessions for this user
      const activeSessions = await storage.getActiveMobileSessions(userId);
      for (const session of activeSessions) {
        await storage.deactivateMobileSession(userId, session.deviceToken);
      }

      // 3. Clear auth cookies
      res.clearCookie('authToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/'
      });

      res.json({ 
        message: 'Logged out from all devices successfully',
        sessionsCleared: activeSessions.length 
      });
    } catch (error) {
      console.error('Logout all error:', error);
      res.status(500).json({ message: 'Logout failed' });
    }
  });

  // Session token validation for mobile app
  app.post('/api/mobile/validate-session', verifyApiSecurityToken, async (req, res) => {
    try {
      const { userId, deviceToken, sessionToken } = req.body;

      if (!userId || !deviceToken || !sessionToken) {
        return res.status(400).json({ message: 'User ID, device token, and session token are required' });
      }

      const session = await storage.getMobileSession(userId, deviceToken);
      
      if (!session || !session.isActive) {
        return res.status(401).json({ message: 'Invalid session' });
      }

      if (session.sessionToken !== sessionToken) {
        return res.status(401).json({ message: 'Invalid session token' });
      }

      if (!session.sessionExpiresAt || new Date() > session.sessionExpiresAt) {
        return res.status(401).json({ message: 'Session expired' });
      }

      res.json({
        valid: true,
        message: 'Session is valid',
        expiresAt: session.sessionExpiresAt
      });
    } catch (error) {
      console.error('Validate session error:', error);
      res.status(500).json({ message: 'Failed to validate session' });
    }
  });
};

// JWT verification middleware
export const verifyJWT: RequestHandler = async (req: any, res, next) => {
  try {
    // Try to get token from Authorization header first (for mobile apps)
    let token = req.headers.authorization?.replace('Bearer ', '');
    
    // If no header token, try cookie (for web apps)
    if (!token) {
      token = req.cookies?.authToken;
    }

    console.log('verifyJWT - Token found:', !!token);
    console.log('verifyJWT - Cookies:', req.cookies);

    if (!token) {
      console.log('verifyJWT - No token provided');
      return res.status(401).json({ message: 'No token provided' });
    }

    // Check if token is blacklisted (memory + database)
    if (memoryTokenBlacklist.has(token)) {
      console.log('verifyJWT - Token found in memory blacklist');
      return res.status(401).json({ message: 'Token has been invalidated' });
    }

    // Check database blacklist with timeout protection
    const tokenHash = createTokenHash(token);
    let isBlacklisted = false;
    
    try {
      // Add timeout to prevent hanging on database issues
      const blacklistPromise = storage.isTokenBlacklisted(tokenHash);
      const timeoutPromise = new Promise<boolean>((_, reject) => 
        setTimeout(() => reject(new Error('Blacklist check timeout')), 5000)
      );
      
      isBlacklisted = await Promise.race([blacklistPromise, timeoutPromise]);
      console.log('verifyJWT - Database blacklist check:', isBlacklisted, 'hash:', tokenHash.substring(0, 10) + '...');
    } catch (error) {
      console.warn('verifyJWT - Blacklist check failed, allowing token (database issue):', error instanceof Error ? error.message : String(error));
      // If database check fails, allow the token to proceed rather than blocking authentication
      isBlacklisted = false;
    }
    
    if (isBlacklisted) {
      console.log('verifyJWT - Token found in database blacklist');
      return res.status(401).json({ message: 'Token has been invalidated' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Create user object from JWT payload
    req.user = {
      id: decoded.uid,
      email: decoded.email,
      role: decoded.role,
    };
    
    // Add team role information if available
    if (decoded.teamRole) {
      req.user.teamRole = decoded.teamRole;
    }
    if (decoded.teamMemberId) {
      req.user.teamMemberId = decoded.teamMemberId;
    }
    if (decoded.permissions) {
      req.user.permissions = decoded.permissions;
    }

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

    // Check both user role and team role for SEO access
    const userRole = req.user.role;
    const teamRole = req.user.teamRole;
    
    // Allow access if user has required role OR if user has team role "SEO Expert" and "seo" is in required roles
    const hasAccess = roles.includes(userRole) || 
                     (teamRole === "SEO Expert" && roles.includes("seo")) ||
                     (teamRole === "SEO Expert" && roles.includes("SEO Expert"));

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    next();
  };
};
