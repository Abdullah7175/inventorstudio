import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
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
      res.json({ message: "Cart submitted successfully", userId });
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

  const httpServer = createServer(app);
  return httpServer;
}
