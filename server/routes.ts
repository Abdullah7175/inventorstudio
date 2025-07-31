import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupFirebaseAuth, verifyJWT, requireRole } from "./firebaseAuth";
import { generateDesignRecommendations, analyzeProjectHealth, generateCommunicationContent } from "./ai";

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
  // Setup Firebase auth middleware
  setupFirebaseAuth(app);

  // Auth routes
  app.get("/api/auth/user", verifyJWT, attachUserFromDB, async (req: any, res) => {
    try {
      // If user doesn't exist in DB, create them
      if (!req.currentUser && req.user) {
        const newUser = {
          id: req.user.id,
          email: req.user.email,
          firstName: req.user.email.split('@')[0], // Fallback
          lastName: '',
          role: 'client',
          createdAt: new Date().toISOString(),
        };
        await storage.createUser(newUser);
        req.currentUser = newUser;
      }
      
      res.json(req.currentUser || req.user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Admin endpoint to get all users
  app.get("/api/admin/users", verifyJWT, requireRole(['admin']), async (req: any, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Admin endpoint to promote users to admin/team roles
  app.post("/api/admin/promote-user", verifyJWT, requireRole(['admin']), async (req: any, res) => {
    try {
      const { userId, role } = req.body;
      
      if (!["admin", "team", "client"].includes(role)) {
        return res.status(400).json({ message: "Invalid role. Must be admin, team, or client" });
      }

      // Update user role
      const updatedUser = await storage.updateUser(userId, { role });
      res.json({ message: `User promoted to ${role}`, user: updatedUser });
    } catch (error) {
      console.error("Error promoting user:", error);
      res.status(500).json({ message: "Failed to promote user" });
    }
  });

  // Quick setup endpoint - set user role (for development/first setup)
  app.post("/api/setup/role", verifyJWT, attachUserFromDB, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { role } = req.body; // "admin", "team", or "client"
      
      if (!["admin", "team", "client"].includes(role)) {
        return res.status(400).json({ message: "Invalid role. Must be admin, team, or client" });
      }

      // Update user role
      const updatedUser = await storage.updateUser(userId, { role });
      res.json({ message: `Role updated to ${role}`, user: updatedUser });
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update role" });
    }
  });

  // Admin Blog Management Routes
  app.get("/api/admin/blog", verifyJWT, requireRole(["admin", "editor"]), async (req: any, res) => {
    try {
      const posts = await storage.getBlogPosts(); // Get all posts, published and draft
      res.json(posts);
    } catch (error) {
      console.error("Error fetching admin blog posts:", error);
      res.status(500).json({ message: "Failed to fetch blog posts" });
    }
  });

  app.post("/api/admin/blog", verifyJWT, requireRole(["admin", "editor"]), async (req: any, res) => {
    try {
      const userId = req.user.id;
      const postData = req.body;
      
      // Add author ID
      postData.authorId = userId;
      
      const newPost = await storage.createBlogPost(postData);
      res.json(newPost);
    } catch (error: any) {
      console.error("Error creating blog post:", error);
      res.status(400).json({ message: error.message || "Failed to create blog post" });
    }
  });

  app.put("/api/admin/blog/:id", verifyJWT, requireRole(["admin", "editor"]), async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      // If publishing for the first time, set publishedAt
      if (updates.published && !updates.publishedAt) {
        updates.publishedAt = new Date();
      }
      
      const updatedPost = await storage.updateBlogPost(id, updates);
      res.json(updatedPost);
    } catch (error: any) {
      console.error("Error updating blog post:", error);
      res.status(500).json({ message: "Failed to update blog post" });
    }
  });

  app.delete("/api/admin/blog/:id", verifyJWT, requireRole(["admin", "editor"]), async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteBlogPost(id);
      res.json({ message: "Blog post deleted successfully" });
    } catch (error) {
      console.error("Error deleting blog post:", error);
      res.status(500).json({ message: "Failed to delete blog post" });
    }
  });

  // Admin Service Management Routes
  app.get("/api/admin/services", verifyJWT, requireRole(["admin"]), async (req: any, res) => {
    try {
      const services = await storage.getServices();
      res.json(services);
    } catch (error) {
      console.error("Error fetching admin services:", error);
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });

  app.post("/api/admin/services", verifyJWT, requireRole(["admin"]), async (req: any, res) => {
    try {
      const serviceData = insertServiceSchema.parse(req.body);
      const newService = await storage.createService(serviceData);
      res.json(newService);
    } catch (error: any) {
      console.error("Error creating service:", error);
      res.status(400).json({ message: error.message || "Failed to create service" });
    }
  });

  app.put("/api/admin/services/:id", verifyJWT, requireRole(["admin"]), async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const updatedService = await storage.updateService(id, updates);
      res.json(updatedService);
    } catch (error) {
      console.error("Error updating service:", error);
      res.status(500).json({ message: "Failed to update service" });
    }
  });

  app.delete("/api/admin/services/:id", verifyJWT, requireRole(["admin"]), async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteService(id);
      res.json({ message: "Service deleted successfully" });
    } catch (error) {
      console.error("Error deleting service:", error);
      res.status(500).json({ message: "Failed to delete service" });
    }
  });

  // Admin Portfolio Management Routes
  app.get("/api/admin/portfolio", verifyJWT, requireRole(["admin"]), async (req: any, res) => {
    try {
      const projects = await storage.getPortfolioProjects();
      res.json(projects);
    } catch (error) {
      console.error("Error fetching admin portfolio:", error);
      res.status(500).json({ message: "Failed to fetch portfolio projects" });
    }
  });

  app.post("/api/admin/portfolio", verifyJWT, requireRole(["admin"]), async (req: any, res) => {
    try {
      const projectData = insertPortfolioProjectSchema.parse(req.body);
      const newProject = await storage.createPortfolioProject(projectData);
      res.json(newProject);
    } catch (error: any) {
      console.error("Error creating portfolio project:", error);
      res.status(400).json({ message: error.message || "Failed to create portfolio project" });
    }
  });

  app.put("/api/admin/portfolio/:id", verifyJWT, requireRole(["admin"]), async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const updatedProject = await storage.updatePortfolioProject(id, updates);
      res.json(updatedProject);
    } catch (error) {
      console.error("Error updating portfolio project:", error);
      res.status(500).json({ message: "Failed to update portfolio project" });
    }
  });

  app.delete("/api/admin/portfolio/:id", verifyJWT, requireRole(["admin"]), async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deletePortfolioProject(id);
      res.json({ message: "Portfolio project deleted successfully" });
    } catch (error) {
      console.error("Error deleting portfolio project:", error);
      res.status(500).json({ message: "Failed to delete portfolio project" });
    }
  });

  // Admin FAQ Management Routes
  app.get("/api/admin/faq", verifyJWT, requireRole(["admin"]), async (req: any, res) => {
    try {
      const faqs = await storage.getFaqItems();
      res.json(faqs);
    } catch (error) {
      console.error("Error fetching admin FAQ:", error);
      res.status(500).json({ message: "Failed to fetch FAQ items" });
    }
  });

  app.post("/api/admin/faq", verifyJWT, requireRole(["admin"]), async (req: any, res) => {
    try {
      const faqData = insertFaqItemSchema.parse(req.body);
      const newFaq = await storage.createFaqItem(faqData);
      res.json(newFaq);
    } catch (error: any) {
      console.error("Error creating FAQ item:", error);
      res.status(400).json({ message: error.message || "Failed to create FAQ item" });
    }
  });

  app.put("/api/admin/faq/:id", verifyJWT, requireRole(["admin"]), async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const updatedFaq = await storage.updateFaqItem(id, updates);
      res.json(updatedFaq);
    } catch (error) {
      console.error("Error updating FAQ item:", error);
      res.status(500).json({ message: "Failed to update FAQ item" });
    }
  });

  app.delete("/api/admin/faq/:id", verifyJWT, requireRole(["admin"]), async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteFaqItem(id);
      res.json({ message: "FAQ item deleted successfully" });
    } catch (error) {
      console.error("Error deleting FAQ item:", error);
      res.status(500).json({ message: "Failed to delete FAQ item" });
    }
  });

  // Admin Contact Management Routes
  app.get("/api/admin/contacts", verifyJWT, requireRole(["admin"]), async (req: any, res) => {
    try {
      const contacts = await storage.getContactSubmissions();
      res.json(contacts);
    } catch (error) {
      console.error("Error fetching contact submissions:", error);
      res.status(500).json({ message: "Failed to fetch contact submissions" });
    }
  });

  app.delete("/api/admin/contacts/:id", verifyJWT, requireRole(["admin"]), async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteContactSubmission(id);
      res.json({ message: "Contact submission deleted successfully" });
    } catch (error) {
      console.error("Error deleting contact submission:", error);
      res.status(500).json({ message: "Failed to delete contact submission" });
    }
  });

  // Admin Client Project Management Routes
  app.get("/api/admin/client-projects", verifyJWT, requireRole(["admin", "team"]), async (req: any, res) => {
    try {
      const projects = await storage.getClientProjects();
      res.json(projects);
    } catch (error) {
      console.error("Error fetching client projects:", error);
      res.status(500).json({ message: "Failed to fetch client projects" });
    }
  });

  app.post("/api/admin/client-projects", verifyJWT, requireRole(["admin", "team"]), async (req: any, res) => {
    try {
      const projectData = insertClientProjectSchema.parse(req.body);
      const newProject = await storage.createClientProject(projectData);
      res.json(newProject);
    } catch (error: any) {
      console.error("Error creating client project:", error);
      res.status(400).json({ message: error.message || "Failed to create client project" });
    }
  });

  app.put("/api/admin/client-projects/:id", verifyJWT, requireRole(["admin", "team"]), async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const updatedProject = await storage.updateClientProject(id, updates);
      res.json(updatedProject);
    } catch (error) {
      console.error("Error updating client project:", error);
      res.status(500).json({ message: "Failed to update client project" });
    }
  });

  app.delete("/api/admin/client-projects/:id", verifyJWT, requireRole(["admin", "team"]), async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteClientProject(id);
      res.json({ message: "Client project deleted successfully" });
    } catch (error) {
      console.error("Error deleting client project:", error);
      res.status(500).json({ message: "Failed to delete client project" });
    }
  });

  // Client routes
  app.get("/api/client/projects", verifyJWT, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const projects = await storage.getClientProjectsByUserId(userId);
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
      const posts = await storage.getPublishedBlogPosts();
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

  // AI-powered features
  app.post("/api/ai/design-recommendations", verifyJWT, requireRole(["admin", "team"]), async (req: any, res) => {
    try {
      const { projectData, designElements } = req.body;
      const recommendations = await generateDesignRecommendations(projectData, designElements);
      res.json(recommendations);
    } catch (error) {
      console.error("Error generating design recommendations:", error);
      res.status(500).json({ message: "Failed to generate design recommendations" });
    }
  });

  app.post("/api/ai/project-health", verifyJWT, requireRole(["admin", "team"]), async (req: any, res) => {
    try {
      const { projectId } = req.body;
      const project = await storage.getClientProject(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      const healthAnalysis = await analyzeProjectHealth(project);
      res.json(healthAnalysis);
    } catch (error) {
      console.error("Error analyzing project health:", error);
      res.status(500).json({ message: "Failed to analyze project health" });
    }
  });

  app.post("/api/ai/communication", verifyJWT, requireRole(["admin", "team"]), async (req: any, res) => {
    try {
      const { clientId, projectId, communicationType, context } = req.body;
      const content = await generateCommunicationContent(clientId, projectId, communicationType, context);
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