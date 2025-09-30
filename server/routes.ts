import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import jwt from 'jsonwebtoken';
import { storage } from "./storage";
import { setupAuth, verifyJWT, requireRole, verifyApiSecurityToken } from "./auth";
import { generateDesignRecommendations, analyzeProjectHealth, generateCommunicationContent } from "./ai";

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

import {
  insertContactSubmissionSchema,
  insertClientProjectSchema,
  insertServiceSchema,
  insertPortfolioProjectSchema,
  insertBlogPostSchema,
  insertFaqItemSchema,
} from "@shared/schema";

// Middleware to get user from database and attach to request
const attachUserFromDB = async (req: any, res: any, next: any) => {
  try {
    if (req.user?.id) {
      const user = await storage.getUser(req.user.id);
      if (user) {
        req.currentUser = user;
        req.user = { ...req.user, ...user }; // Merge JWT data with DB data
      }
    }
    next();
  } catch (error) {
    console.error("User lookup error:", error);
    next();
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup auth middleware
  setupAuth(app);

  // Admin endpoints removed for security

  // Quick setup endpoint - set user role (for development/first setup)
  app.post("/api/setup/role", verifyJWT, attachUserFromDB, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { role } = req.body; // "team" or "client"
      
      if (!["team", "client"].includes(role)) {
        return res.status(400).json({ message: "Invalid role. Must be team or client" });
      }

      // Update user role
      const updatedUser = await storage.updateUser(userId, { role });
      res.json({ message: `Role updated to ${role}`, user: updatedUser });
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update role" });
    }
  });

  // Admin endpoints removed for security

  // Client routes
  app.get("/api/client/projects", verifyJWT, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const projects = await storage.getClientProjects(userId);
      res.json(projects);
    } catch (error) {
      console.error("Error fetching user projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  // Public API Routes (no authentication required)
  app.get("/api/services", async (req, res) => {
    try {
      const services = await storage.getServices();
      res.json(services);
    } catch (error) {
      console.error("Error fetching services:", error);
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });

  app.get("/api/portfolio", async (req, res) => {
    try {
      const projects = await storage.getPortfolioProjects();
      res.json(projects);
    } catch (error) {
      console.error("Error fetching portfolio:", error);
      res.status(500).json({ message: "Failed to fetch portfolio" });
    }
  });

  app.get("/api/blog", async (req, res) => {
    try {
      const posts = await storage.getBlogPosts(true);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      res.status(500).json({ message: "Failed to fetch blog posts" });
    }
  });

  app.get("/api/blog/:slug", async (req, res) => {
    try {
      const slug = req.params.slug;
      const post = await storage.getBlogPostBySlug(slug);
      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      res.json(post);
    } catch (error) {
      console.error("Error fetching blog post:", error);
      res.status(500).json({ message: "Failed to fetch blog post" });
    }
  });

  app.get("/api/faq", async (req, res) => {
    try {
      const faqs = await storage.getFaqItems();
      res.json(faqs);
    } catch (error) {
      console.error("Error fetching FAQ:", error);
      res.status(500).json({ message: "Failed to fetch FAQ" });
    }
  });

  app.post("/api/contact", async (req, res) => {
    try {
      const contactData = insertContactSubmissionSchema.parse(req.body);
      await storage.createContactSubmission(contactData);
      res.json({ message: "Contact submission received successfully" });
    } catch (error: any) {
      console.error("Error creating contact submission:", error);
      res.status(400).json({ message: error.message || "Failed to submit contact form" });
    }
  });

  // Mobile-specific API endpoints (all require API security token)
  app.post('/api/mobile/refresh-token', verifyApiSecurityToken, verifyJWT, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user || !user.isActive) {
        return res.status(401).json({ message: 'User not found or inactive' });
      }

      // Create new JWT token
      const jwtToken = jwt.sign(
        { 
          uid: user.id, 
          email: user.email, 
          role: user.role 
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        message: 'Token refreshed successfully',
        token: jwtToken,
        expiresIn: '7d'
      });
    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(500).json({ message: 'Failed to refresh token' });
    }
  });

  app.post('/api/mobile/update-device-token', verifyApiSecurityToken, verifyJWT, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { deviceToken, deviceType } = req.body;

      if (!deviceToken) {
        return res.status(400).json({ message: 'Device token is required' });
      }

      await storage.updateUser(userId, { 
        deviceToken, 
        deviceType: deviceType || 'unknown' 
      });

      res.json({ message: 'Device token updated successfully' });
    } catch (error) {
      console.error('Device token update error:', error);
      res.status(500).json({ message: 'Failed to update device token' });
    }
  });

  app.get('/api/mobile/user-profile', verifyApiSecurityToken, verifyJWT, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Remove sensitive information
      const { passwordHash, verificationToken, deviceToken, ...userProfile } = user;
      
      res.json(userProfile);
    } catch (error) {
      console.error('Get user profile error:', error);
      res.status(500).json({ message: 'Failed to get user profile' });
    }
  });

  app.put('/api/mobile/user-profile', verifyApiSecurityToken, verifyJWT, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { firstName, lastName, phone } = req.body;

      const updateData: any = {};
      if (firstName) updateData.firstName = firstName;
      if (lastName) updateData.lastName = lastName;
      if (phone) updateData.phone = phone;

      const updatedUser = await storage.updateUser(userId, updateData);
      
      // Remove sensitive information
      const { passwordHash, verificationToken, deviceToken, ...userProfile } = updatedUser;
      
      res.json({
        message: 'Profile updated successfully',
        user: userProfile
      });
    } catch (error) {
      console.error('Update user profile error:', error);
      res.status(500).json({ message: 'Failed to update profile' });
    }
  });

  // Mobile project APIs
  app.get('/api/mobile/projects', verifyApiSecurityToken, verifyJWT, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const projects = await storage.getClientProjects(userId);
      res.json(projects);
    } catch (error) {
      console.error('Error fetching mobile user projects:', error);
      res.status(500).json({ message: 'Failed to fetch projects' });
    }
  });

  app.get('/api/mobile/projects/:id', verifyApiSecurityToken, verifyJWT, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const projectId = parseInt(req.params.id);
      const project = await storage.getClientProjectById(projectId);
      
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      // Verify user owns this project
      if (project.clientId !== userId) {
        return res.status(403).json({ message: 'Access denied' });
      }

      res.json(project);
    } catch (error) {
      console.error('Error fetching mobile project:', error);
      res.status(500).json({ message: 'Failed to fetch project' });
    }
  });

  app.post('/api/mobile/projects', verifyApiSecurityToken, verifyJWT, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { title, description, files, feedback } = req.body;

      const projectData = {
        clientId: userId,
        title,
        description: description || null,
        files: files || [],
        feedback: feedback || null,
        status: 'pending'
      };

      const newProject = await storage.createClientProject(projectData);
      res.status(201).json(newProject);
    } catch (error) {
      console.error('Error creating mobile project:', error);
      res.status(500).json({ message: 'Failed to create project' });
    }
  });

  app.put('/api/mobile/projects/:id', verifyApiSecurityToken, verifyJWT, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const projectId = parseInt(req.params.id);
      const { title, description, feedback } = req.body;

      // Verify project exists and user owns it
      const existingProject = await storage.getClientProjectById(projectId);
      if (!existingProject) {
        return res.status(404).json({ message: 'Project not found' });
      }

      if (existingProject.clientId !== userId) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const updateData: any = {};
      if (title) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (feedback !== undefined) updateData.feedback = feedback;

      const updatedProject = await storage.updateClientProject(projectId, updateData);
      res.json(updatedProject);
    } catch (error) {
      console.error('Error updating mobile project:', error);
      res.status(500).json({ message: 'Failed to update project' });
    }
  });

  // Mobile dashboard data
  app.get('/api/mobile/dashboard', verifyApiSecurityToken, verifyJWT, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Get user profile
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Get user's projects
      const projects = await storage.getClientProjects(userId);
      
      // Get active mobile sessions
      const activeSessions = await storage.getActiveMobileSessions(userId);

      // Calculate project statistics
      const projectStats = {
        total: projects.length,
        pending: projects.filter(p => p.status === 'pending').length,
        inProgress: projects.filter(p => p.status === 'in-progress').length,
        review: projects.filter(p => p.status === 'review').length,
        completed: projects.filter(p => p.status === 'completed').length
      };

      const dashboardData = {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt
        },
        projects: projects.slice(0, 5), // Recent 5 projects
        projectStats,
        activeSessions: activeSessions.length,
        recentActivity: projects
          .sort((a, b) => {
            const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
            const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
            return dateB - dateA;
          })
          .slice(0, 3)
      };

      res.json(dashboardData);
    } catch (error) {
      console.error('Error fetching mobile dashboard:', error);
      res.status(500).json({ message: 'Failed to fetch dashboard data' });
    }
  });

  // Mobile services and portfolio (public data)
  app.get('/api/mobile/services', async (req, res) => {
    try {
      const services = await storage.getServices();
      res.json(services);
    } catch (error) {
      console.error('Error fetching mobile services:', error);
      res.status(500).json({ message: 'Failed to fetch services' });
    }
  });

  app.get('/api/mobile/portfolio', async (req, res) => {
    try {
      const projects = await storage.getPortfolioProjects();
      res.json(projects);
    } catch (error) {
      console.error('Error fetching mobile portfolio:', error);
      res.status(500).json({ message: 'Failed to fetch portfolio' });
    }
  });

  // Mobile contact submission
  app.post('/api/mobile/contact', async (req, res) => {
    try {
      const contactData = insertContactSubmissionSchema.parse(req.body);
      await storage.createContactSubmission(contactData);
      res.json({ message: 'Contact submission received successfully' });
    } catch (error: any) {
      console.error('Error creating mobile contact submission:', error);
      res.status(400).json({ message: error.message || 'Failed to submit contact form' });
    }
  });

  // Health check endpoint for Docker
  app.get("/api/health", (req, res) => {
    res.status(200).json({ 
      status: "healthy", 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development"
    });
  });

  // AI-powered features
  app.post("/api/ai/design-recommendations", verifyJWT, requireRole(["team"]), async (req: any, res) => {
    try {
      const { projectData, designElements } = req.body;
      const recommendations = await generateDesignRecommendations({
        projectType: projectData.projectType || 'website',
        targetAudience: projectData.targetAudience || 'general',
        brandGuidelines: projectData.brandGuidelines || '',
        currentDesigns: designElements || []
      });
      res.json(recommendations);
    } catch (error) {
      console.error("Error generating design recommendations:", error);
      res.status(500).json({ message: "Failed to generate design recommendations" });
    }
  });

  app.post("/api/ai/project-health", verifyJWT, requireRole(["team"]), async (req: any, res) => {
    try {
      const { projectId } = req.body;
      const project = await storage.getClientProjectById(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      const healthAnalysis = await analyzeProjectHealth({
        projectData: project,
        timelineData: {},
        teamData: {},
        clientFeedback: {}
      });
      res.json(healthAnalysis);
    } catch (error) {
      console.error("Error analyzing project health:", error);
      res.status(500).json({ message: "Failed to analyze project health" });
    }
  });

  app.post("/api/ai/communication", verifyJWT, requireRole(["team"]), async (req: any, res) => {
    try {
      const { clientId, projectId, communicationType, context } = req.body;
      const content = await generateCommunicationContent({
        type: communicationType,
        context: context,
        clientInfo: { id: clientId },
        projectInfo: { id: projectId },
        tone: 'professional'
      });
      res.json({ content });
    } catch (error) {
      console.error("Error generating communication content:", error);
      res.status(500).json({ message: "Failed to generate communication content" });
    }
  });

  // WebSocket setup for real-time chat
  const server = createServer(app);
  const wss = new WebSocketServer({ server, path: "/ws" });

  // Store active connections
  const connections = new Map<string, WebSocket>();
  const userSockets = new Map<string, Set<WebSocket>>();

  wss.on("connection", (ws: WebSocket, req) => {
    console.log("New WebSocket connection");

    const connectionId = Math.random().toString(36).substring(7);
    connections.set(connectionId, ws);

    ws.on("message", async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        switch (message.type) {
          case "auth":
            // Handle authentication
            const { token } = message;
            // Verify JWT token here if needed
            if (token) {
              if (!userSockets.has(token)) {
                userSockets.set(token, new Set());
              }
              userSockets.get(token)!.add(ws);
            }
            break;

          case "message":
            // Broadcast message to all connected clients
            const messageData = {
              type: "message",
              ...message,
              timestamp: new Date().toISOString(),
            };

            // Store message in database if needed
            // await storage.createChatMessage(messageData);

            // Broadcast to all connections
            connections.forEach((clientWs) => {
              if (clientWs.readyState === WebSocket.OPEN) {
                clientWs.send(JSON.stringify(messageData));
              }
            });
            break;

          case "typing":
            // Broadcast typing indicator
            connections.forEach((clientWs) => {
              if (clientWs !== ws && clientWs.readyState === WebSocket.OPEN) {
                clientWs.send(JSON.stringify({
                  type: "typing",
                  user: message.user,
                  isTyping: message.isTyping,
                }));
              }
            });
            break;
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
      }
    });

    ws.on("close", () => {
      console.log("WebSocket connection closed");
      connections.delete(connectionId);
      
      // Remove from user sockets
      userSockets.forEach((sockets, userId) => {
        sockets.delete(ws);
        if (sockets.size === 0) {
          userSockets.delete(userId);
        }
      });
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
    });
  });

  return server;
}