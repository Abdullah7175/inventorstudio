import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";

// Role-based middleware
const requireRole = (roles: string[]) => {
  return async (req: any, res: any, next: any) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || !roles.includes(user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      req.currentUser = user;
      next();
    } catch (error) {
      console.error("Role check error:", error);
      res.status(500).json({ message: "Authorization check failed" });
    }
  };
};
import {
  insertContactSubmissionSchema,
  insertClientProjectSchema,
  insertServiceSchema,
  insertPortfolioProjectSchema,
  insertBlogPostSchema,
  insertFaqItemSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Simple logout endpoint for frontend
  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Logout failed" });
      }
      
      // Destroy session
      req.session.destroy((sessionErr) => {
        if (sessionErr) {
          console.error("Session destroy error:", sessionErr);
        }
        
        // Clear session cookie
        res.clearCookie('connect.sid');
        res.json({ message: "Logged out successfully" });
      });
    });
  });

  // Quick setup endpoint - set user role (for development)
  app.post("/api/setup/role", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { role } = req.body; // "admin", "team", or "client"
      
      if (!["admin", "team", "client"].includes(role)) {
        return res.status(400).json({ message: "Invalid role. Must be admin, team, or client" });
      }

      // Update user role
      const updatedUser = await storage.updateUserRole(userId, role);
      
      res.json({ 
        message: `Role updated to ${role}`,
        user: updatedUser
      });
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update role" });
    }
  });

  // Public routes
  
  // Services
  app.get("/api/services", async (req, res) => {
    try {
      const services = await storage.getServices();
      res.json(services);
    } catch (error) {
      console.error("Error fetching services:", error);
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });

  app.get("/api/services/featured", async (req, res) => {
    try {
      const services = await storage.getFeaturedServices();
      res.json(services);
    } catch (error) {
      console.error("Error fetching featured services:", error);
      res.status(500).json({ message: "Failed to fetch featured services" });
    }
  });

  // Portfolio
  app.get("/api/portfolio", async (req, res) => {
    try {
      const category = req.query.category as string;
      const projects = await storage.getPortfolioProjects(category);
      res.json(projects);
    } catch (error) {
      console.error("Error fetching portfolio:", error);
      res.status(500).json({ message: "Failed to fetch portfolio" });
    }
  });

  app.get("/api/portfolio/featured", async (req, res) => {
    try {
      const projects = await storage.getFeaturedProjects();
      res.json(projects);
    } catch (error) {
      console.error("Error fetching featured projects:", error);
      res.status(500).json({ message: "Failed to fetch featured projects" });
    }
  });

  app.get("/api/portfolio/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const project = await storage.getProjectById(id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  // Blog
  app.get("/api/blog", async (req, res) => {
    try {
      const published = req.query.published === "true";
      const posts = await storage.getBlogPosts(published);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      res.status(500).json({ message: "Failed to fetch blog posts" });
    }
  });

  app.get("/api/blog/:slug", async (req, res) => {
    try {
      const post = await storage.getBlogPostBySlug(req.params.slug);
      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      res.json(post);
    } catch (error) {
      console.error("Error fetching blog post:", error);
      res.status(500).json({ message: "Failed to fetch blog post" });
    }
  });

  // FAQ
  app.get("/api/faq", async (req, res) => {
    try {
      const faqItems = await storage.getFaqItems();
      res.json(faqItems);
    } catch (error) {
      console.error("Error fetching FAQ items:", error);
      res.status(500).json({ message: "Failed to fetch FAQ items" });
    }
  });

  // Contact
  app.post("/api/contact", async (req, res) => {
    try {
      const validatedData = insertContactSubmissionSchema.parse(req.body);
      const submission = await storage.createContactSubmission(validatedData);
      res.json({ message: "Contact submission received", id: submission.id });
    } catch (error: any) {
      console.error("Error creating contact submission:", error);
      res.status(400).json({ message: error.message || "Failed to submit contact form" });
    }
  });

  // Protected routes - Client Portal
  app.get("/api/client/projects", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const projects = await storage.getClientProjects(userId);
      res.json(projects);
    } catch (error) {
      console.error("Error fetching client projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.get("/api/client/projects/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const project = await storage.getClientProjectById(id);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Ensure client can only access their own projects
      const userId = req.user.claims.sub;
      if (project.clientId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(project);
    } catch (error) {
      console.error("Error fetching client project:", error);
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  app.patch("/api/client/projects/:id/feedback", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const { feedback } = req.body;
      const userId = req.user.claims.sub;

      const project = await storage.getClientProjectById(id);
      if (!project || project.clientId !== userId) {
        return res.status(404).json({ message: "Project not found" });
      }

      const updatedProject = await storage.updateClientProject(id, { feedback });
      res.json(updatedProject);
    } catch (error) {
      console.error("Error updating project feedback:", error);
      res.status(500).json({ message: "Failed to update feedback" });
    }
  });

  // Admin routes
  app.get("/api/admin/projects", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const projects = await storage.getAllClientProjects();
      res.json(projects);
    } catch (error) {
      console.error("Error fetching admin projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.post("/api/admin/projects", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const validatedData = insertClientProjectSchema.parse(req.body);
      const project = await storage.createClientProject(validatedData);
      res.json(project);
    } catch (error: any) {
      console.error("Error creating client project:", error);
      res.status(400).json({ message: error.message || "Failed to create project" });
    }
  });

  app.patch("/api/admin/projects/:id", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const id = parseInt(req.params.id);
      const updatedProject = await storage.updateClientProject(id, req.body);
      res.json(updatedProject);
    } catch (error) {
      console.error("Error updating project:", error);
      res.status(500).json({ message: "Failed to update project" });
    }
  });

  app.get("/api/admin/contacts", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const submissions = await storage.getContactSubmissions();
      res.json(submissions);
    } catch (error) {
      console.error("Error fetching contact submissions:", error);
      res.status(500).json({ message: "Failed to fetch contact submissions" });
    }
  });

  // Admin CRUD operations for content management
  app.post("/api/admin/services", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const validatedData = insertServiceSchema.parse(req.body);
      const service = await storage.createService(validatedData);
      res.json(service);
    } catch (error: any) {
      console.error("Error creating service:", error);
      res.status(400).json({ message: error.message || "Failed to create service" });
    }
  });

  app.post("/api/admin/portfolio", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const validatedData = insertPortfolioProjectSchema.parse(req.body);
      const project = await storage.createProject(validatedData);
      res.json(project);
    } catch (error: any) {
      console.error("Error creating portfolio project:", error);
      res.status(400).json({ message: error.message || "Failed to create portfolio project" });
    }
  });

  // Enhanced blog management routes for SEO team
  app.post("/api/admin/blog", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || (user.role !== "admin" && user.role !== "editor")) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const blogPost = insertBlogPostSchema.parse(req.body);
      const newPost = await storage.createBlogPost({
        ...blogPost,
        authorId: userId,
        publishedAt: blogPost.published ? new Date() : null,
      });
      
      res.json(newPost);
    } catch (error: any) {
      console.error("Error creating blog post:", error);
      res.status(400).json({ message: error.message || "Failed to create blog post" });
    }
  });

  app.put("/api/admin/blog/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || (user.role !== "admin" && user.role !== "editor")) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

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

  app.delete("/api/admin/blog/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const id = parseInt(req.params.id);
      await storage.deleteBlogPost(id);
      res.json({ message: "Blog post deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting blog post:", error);
      res.status(500).json({ message: "Failed to delete blog post" });
    }
  });

  // Get all blog posts for admin (including unpublished)
  app.get("/api/admin/blog", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || (user.role !== "admin" && user.role !== "editor")) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const posts = await storage.getBlogPosts(); // All posts regardless of published status
      res.json(posts);
    } catch (error: any) {
      console.error("Error fetching admin blog posts:", error);
      res.status(500).json({ message: "Failed to fetch blog posts" });
    }
  });

  // Certifications routes
  app.get("/api/certifications", async (req, res) => {
    try {
      const certifications = await storage.getCertifications();
      res.json(certifications);
    } catch (error) {
      console.error("Error fetching certifications:", error);
      res.status(500).json({ message: "Failed to fetch certifications" });
    }
  });

  // Partnerships routes
  app.get("/api/partnerships", async (req, res) => {
    try {
      const partnerships = await storage.getPartnerships();
      res.json(partnerships);
    } catch (error) {
      console.error("Error fetching partnerships:", error);
      res.status(500).json({ message: "Failed to fetch partnerships" });
    }
  });

  // Project Management System Routes

  // Service Cart Routes
  app.post("/api/cart/submit", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const requestData = {
        clientId: userId,
        projectName: req.body.projectName,
        serviceIds: req.body.serviceIds,
        description: req.body.notes,
        budget: req.body.budget,
        timeline: req.body.timeline,
        status: "pending"
      };
      
      console.log("Cart submission data:", requestData);
      res.json({ success: true, message: "Project request submitted successfully" });
    } catch (error) {
      console.error("Error submitting cart:", error);
      res.status(500).json({ message: "Failed to submit cart" });
    }
  });

  // Client Project Routes
  app.get("/api/client/requests", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      res.json([]);
    } catch (error) {
      console.error("Error fetching client requests:", error);
      res.status(500).json({ message: "Failed to fetch requests" });
    }
  });

  app.get("/api/client/invoices", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      res.json([]);
    } catch (error) {
      console.error("Error fetching client invoices:", error);
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  // Admin Project Management Routes
  app.get("/api/admin/requests", isAuthenticated, async (req: any, res) => {
    try {
      res.json([]);
    } catch (error) {
      console.error("Error fetching project requests:", error);
      res.status(500).json({ message: "Failed to fetch project requests" });
    }
  });

  // Project Task Routes
  app.get("/api/projects/:projectId/tasks", isAuthenticated, async (req, res) => {
    try {
      const { projectId } = req.params;
      res.json([]);
    } catch (error) {
      console.error("Error fetching project tasks:", error);
      res.status(500).json({ message: "Failed to fetch project tasks" });
    }
  });

  app.post("/api/tasks", isAuthenticated, async (req, res) => {
    try {
      res.json({ id: 1, ...req.body, createdAt: new Date() });
    } catch (error) {
      console.error("Error creating task:", error);
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  app.patch("/api/tasks/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      res.json({ id: parseInt(id), ...req.body, updatedAt: new Date() });
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(500).json({ message: "Failed to update task" });
    }
  });

  app.delete("/api/tasks/:id", isAuthenticated, async (req, res) => {
    try {
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting task:", error);
      res.status(500).json({ message: "Failed to delete task" });
    }
  });

  // Team Routes
  app.get("/api/team/members", isAuthenticated, async (req, res) => {
    try {
      res.json([]);
    } catch (error) {
      console.error("Error fetching team members:", error);
      res.status(500).json({ message: "Failed to fetch team members" });
    }
  });

  app.get("/api/team/assigned-projects", isAuthenticated, async (req: any, res) => {
    try {
      res.json([]);
    } catch (error) {
      console.error("Error fetching assigned projects:", error);
      res.status(500).json({ message: "Failed to fetch assigned projects" });
    }
  });

  app.get("/api/team/my-tasks", isAuthenticated, async (req: any, res) => {
    try {
      res.json([]);
    } catch (error) {
      console.error("Error fetching my tasks:", error);
      res.status(500).json({ message: "Failed to fetch my tasks" });
    }
  });

  // Service Cart routes
  app.post("/api/service-cart/submit", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const requestData = {
        clientId: userId,
        projectName: req.body.projectName,
        serviceIds: req.body.serviceIds,
        description: req.body.notes,
        budget: req.body.budget,
        timeline: req.body.timeline,
        status: "pending"
      };
      
      // Note: This would create a project request from service cart
      res.json({ success: true, message: "Project request submitted successfully" });
    } catch (error) {
      console.error("Service cart submission error:", error);
      res.status(500).json({ message: "Failed to submit service request" });
    }
  });

  // Client Project routes
  app.get("/api/client/projects", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      // Mock data for demonstration - would fetch from project requests table
      const mockProjects = [
        {
          id: 1,
          projectName: "Website Redesign",
          status: "active",
          budget: "$5000",
          timeline: "3 months",
          createdAt: new Date().toISOString()
        }
      ];
      res.json(mockProjects);
    } catch (error) {
      console.error("Client projects error:", error);
      res.status(500).json({ message: "Failed to fetch client projects" });
    }
  });

  app.get("/api/client/invoices", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      // Mock data for demonstration
      const mockInvoices = [
        {
          id: 1,
          invoiceNumber: "INV-001",
          total: "2500.00",
          status: "unpaid",
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString()
        }
      ];
      res.json(mockInvoices);
    } catch (error) {
      console.error("Client invoices error:", error);
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  // Project Messages routes
  app.get("/api/project-messages/:projectId", isAuthenticated, async (req: any, res) => {
    try {
      const { projectId } = req.params;
      // Mock data for demonstration
      const mockMessages = [
        {
          id: 1,
          message: "Project has started. We'll keep you updated on progress.",
          senderId: "team-001",
          senderRole: "team",
          createdAt: new Date().toISOString(),
          attachments: []
        }
      ];
      res.json(mockMessages);
    } catch (error) {
      console.error("Project messages error:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post("/api/project-messages", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const messageData = {
        id: Date.now(),
        projectId: parseInt(req.body.projectId),
        senderId: userId,
        senderRole: "client",
        message: req.body.message,
        createdAt: new Date().toISOString(),
        attachments: []
      };
      
      res.json(messageData);
    } catch (error) {
      console.error("Message creation error:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Project Files routes
  app.get("/api/project-files/:projectId", isAuthenticated, async (req: any, res) => {
    try {
      const { projectId } = req.params;
      // Mock data for demonstration
      const mockFiles: any[] = [];
      res.json(mockFiles);
    } catch (error) {
      console.error("Project files error:", error);
      res.status(500).json({ message: "Failed to fetch files" });
    }
  });

  // Admin Portal routes
  app.get("/api/admin/project-requests", isAuthenticated, requireRole(["admin"]), async (req: any, res) => {
    try {
      // Mock admin access check
      const mockRequests = [
        {
          id: 1,
          projectName: "E-commerce Platform",
          clientId: "client-001",
          serviceIds: ["1", "2"],
          description: "Need a modern e-commerce solution",
          budget: "$10000",
          timeline: "6 months",
          status: "pending",
          createdAt: new Date().toISOString()
        }
      ];
      res.json(mockRequests);
    } catch (error) {
      console.error("Admin requests error:", error);
      res.status(500).json({ message: "Failed to fetch project requests" });
    }
  });

  app.post("/api/admin/project-requests/:id/approve", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { adminNotes, assignedTeamId } = req.body;
      
      // Mock approval response
      const approvedRequest = {
        id: parseInt(id),
        status: "approved",
        adminNotes,
        assignedTeamId,
        updatedAt: new Date().toISOString()
      };
        
      res.json(approvedRequest);
    } catch (error) {
      console.error("Request approval error:", error);
      res.status(500).json({ message: "Failed to approve request" });
    }
  });

  app.post("/api/admin/project-requests/:id/reject", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { adminNotes } = req.body;
      
      // Mock rejection response
      const rejectedRequest = {
        id: parseInt(id),
        status: "rejected",
        adminNotes,
        updatedAt: new Date().toISOString()
      };
        
      res.json(rejectedRequest);
    } catch (error) {
      console.error("Request rejection error:", error);
      res.status(500).json({ message: "Failed to reject request" });
    }
  });

  app.get("/api/admin/team-members", isAuthenticated, async (req: any, res) => {
    try {
      // Mock team members data
      const mockTeamMembers = [
        {
          id: 1,
          name: "Sarah Johnson",
          role: "Frontend Developer",
          skills: ["React", "TypeScript", "CSS"],
          isActive: true
        },
        {
          id: 2,
          name: "Mike Chen",
          role: "Backend Developer", 
          skills: ["Node.js", "PostgreSQL", "API Design"],
          isActive: true
        }
      ];
      res.json(mockTeamMembers);
    } catch (error) {
      console.error("Team members error:", error);
      res.status(500).json({ message: "Failed to fetch team members" });
    }
  });

  app.get("/api/admin/all-projects", isAuthenticated, async (req: any, res) => {
    try {
      // Mock all projects data
      const mockProjects = [
        {
          id: 1,
          projectName: "Portfolio Website",
          status: "completed",
          createdAt: new Date().toISOString()
        }
      ];
      res.json(mockProjects);
    } catch (error) {
      console.error("All projects error:", error);
      res.status(500).json({ message: "Failed to fetch all projects" });
    }
  });

  app.post("/api/admin/invoices", isAuthenticated, async (req: any, res) => {
    try {
      const invoiceData = {
        id: Date.now(),
        invoiceNumber: `INV-${Date.now()}`,
        ...req.body,
        status: "unpaid",
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString()
      };
      
      res.json(invoiceData);
    } catch (error) {
      console.error("Invoice creation error:", error);
      res.status(500).json({ message: "Failed to create invoice" });
    }
  });

  // Team Portal routes
  app.get("/api/team/assigned-projects", isAuthenticated, async (req: any, res) => {
    try {
      // Mock assigned projects for team members
      const mockProjects = [
        {
          id: 1,
          projectName: "Mobile App Development",
          status: "active",
          priority: "high",
          dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
          taskCount: 15,
          completedTasks: 8
        }
      ];
      res.json(mockProjects);
    } catch (error) {
      console.error("Team projects error:", error);
      res.status(500).json({ message: "Failed to fetch assigned projects" });
    }
  });

  app.get("/api/team/tasks", isAuthenticated, async (req: any, res) => {
    try {
      // Mock team tasks
      const mockTasks = [
        {
          id: 1,
          title: "Design user interface mockups",
          description: "Create high-fidelity mockups for the main application screens",
          status: "in-progress",
          priority: "high",
          projectId: 1,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString()
        }
      ];
      res.json(mockTasks);
    } catch (error) {
      console.error("Team tasks error:", error);
      res.status(500).json({ message: "Failed to fetch team tasks" });
    }
  });

  app.patch("/api/team/tasks/:taskId/progress", isAuthenticated, async (req: any, res) => {
    try {
      const { taskId } = req.params;
      const { status } = req.body;
      
      const updatedTask = {
        id: parseInt(taskId),
        status,
        updatedAt: new Date().toISOString()
      };
        
      res.json(updatedTask);
    } catch (error) {
      console.error("Task progress error:", error);
      res.status(500).json({ message: "Failed to update task progress" });
    }
  });

  app.post("/api/team/upload-file", isAuthenticated, async (req: any, res) => {
    try {
      // Mock file upload response
      res.json({ 
        message: "File uploaded successfully",
        filename: "uploaded-file.jpg",
        uploadedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("File upload error:", error);
      res.status(500).json({ message: "Failed to upload file" });
    }
  });

  // Project Task CRUD routes
  app.get("/api/project-tasks/:projectId?", isAuthenticated, async (req: any, res) => {
    try {
      const { projectId } = req.params;
      
      // Mock project tasks
      const mockTasks = [
        {
          id: 1,
          title: "Setup project repository",
          description: "Initialize Git repository and project structure",
          status: "done",
          priority: "high",
          projectId: projectId ? parseInt(projectId) : 1,
          position: 1,
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          title: "Design database schema",
          description: "Create ERD and define table structures",
          status: "in-progress",
          priority: "medium",
          projectId: projectId ? parseInt(projectId) : 1,
          position: 2,
          createdAt: new Date().toISOString()
        }
      ];
      
      res.json(mockTasks);
    } catch (error) {
      console.error("Project tasks error:", error);
      res.status(500).json({ message: "Failed to fetch project tasks" });
    }
  });

  app.post("/api/project-tasks", isAuthenticated, async (req: any, res) => {
    try {
      const taskData = {
        id: Date.now(),
        ...req.body,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      res.json(taskData);
    } catch (error) {
      console.error("Task creation error:", error);
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  app.patch("/api/project-tasks/:taskId", isAuthenticated, async (req: any, res) => {
    try {
      const { taskId } = req.params;
      
      const updatedTask = {
        id: parseInt(taskId),
        ...req.body,
        updatedAt: new Date().toISOString()
      };
        
      res.json(updatedTask);
    } catch (error) {
      console.error("Task update error:", error);
      res.status(500).json({ message: "Failed to update task" });
    }
  });

  const httpServer = createServer(app);
  
  // Setup WebSocket server for real-time chat
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Store active connections with user info
  const connections = new Map<string, { ws: WebSocket; userId: string; role: string }>();
  
  wss.on('connection', (ws: WebSocket, req) => {
    console.log('New WebSocket connection');
    
    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message);
        
        if (data.type === 'auth') {
          // Store user connection info
          connections.set(data.userId, {
            ws,
            userId: data.userId,
            role: data.role
          });
          console.log(`User ${data.userId} (${data.role}) connected to WebSocket`);
        } else if (data.type === 'chat_message') {
          // Broadcast message to all connected users in the same project
          const messageData = {
            type: 'chat_message',
            projectId: data.projectId,
            message: data.message,
            senderId: data.senderId,
            senderRole: data.senderRole,
            timestamp: new Date().toISOString(),
            id: Date.now()
          };
          
          // Send to all connections (in a real app, filter by project access)
          connections.forEach(({ ws: clientWs }) => {
            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify(messageData));
            }
          });
        } else if (data.type === 'typing') {
          // Broadcast typing indicator
          const typingData = {
            type: 'typing',
            projectId: data.projectId,
            senderId: data.senderId,
            senderRole: data.senderRole,
            isTyping: data.isTyping
          };
          
          connections.forEach(({ ws: clientWs, userId }) => {
            if (clientWs.readyState === WebSocket.OPEN && userId !== data.senderId) {
              clientWs.send(JSON.stringify(typingData));
            }
          });
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
    
    ws.on('close', () => {
      // Remove connection on close
      for (const [userId, connection] of Array.from(connections.entries())) {
        if (connection.ws === ws) {
          connections.delete(userId);
          console.log(`User ${userId} disconnected from WebSocket`);
          break;
        }
      }
    });
  });
  
  return httpServer;
}
