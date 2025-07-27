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
  insertUserPreferencesSchema,
  insertDesignTemplateSchema,
  insertUserInteractionSchema,
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

  app.post("/api/admin/blog", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const validatedData = insertBlogPostSchema.parse(req.body);
      const post = await storage.createBlogPost(validatedData);
      res.json(post);
    } catch (error: any) {
      console.error("Error creating blog post:", error);
      res.status(400).json({ message: error.message || "Failed to create blog post" });
    }
  });

  // Recommendation Engine Routes
  
  // Get user preferences
  app.get("/api/recommendations/preferences", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const preferences = await storage.getUserPreferences(userId);
      res.json(preferences || null);
    } catch (error) {
      console.error("Error fetching user preferences:", error);
      res.status(500).json({ message: "Failed to fetch preferences" });
    }
  });

  // Save/update user preferences
  app.post("/api/recommendations/preferences", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertUserPreferencesSchema.parse({
        ...req.body,
        userId,
      });
      const preferences = await storage.upsertUserPreferences(validatedData);
      res.json(preferences);
    } catch (error: any) {
      console.error("Error saving user preferences:", error);
      res.status(400).json({ message: error.message || "Failed to save preferences" });
    }
  });

  // Get user recommendations
  app.get("/api/recommendations", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const recommendations = await storage.getUserRecommendations(userId);
      
      // If no recommendations exist, generate them
      if (recommendations.length === 0) {
        const newRecommendations = await storage.generateRecommendations(userId);
        return res.json(newRecommendations);
      }
      
      res.json(recommendations);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      res.status(500).json({ message: "Failed to fetch recommendations" });
    }
  });

  // Generate new recommendations
  app.post("/api/recommendations/generate", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const recommendations = await storage.generateRecommendations(userId);
      res.json(recommendations);
    } catch (error) {
      console.error("Error generating recommendations:", error);
      res.status(500).json({ message: "Failed to generate recommendations" });
    }
  });

  // Get design templates (public)
  app.get("/api/design-templates", async (req, res) => {
    try {
      const { industry, styleType, category } = req.query;
      const templates = await storage.getDesignTemplates({
        industry: industry as string,
        styleType: styleType as string,
        category: category as string,
      });
      res.json(templates);
    } catch (error) {
      console.error("Error fetching design templates:", error);
      res.status(500).json({ message: "Failed to fetch design templates" });
    }
  });

  // Get popular templates (public)
  app.get("/api/design-templates/popular", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const templates = await storage.getPopularTemplates(limit);
      res.json(templates);
    } catch (error) {
      console.error("Error fetching popular templates:", error);
      res.status(500).json({ message: "Failed to fetch popular templates" });
    }
  });

  // Record user interaction
  app.post("/api/recommendations/interact", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertUserInteractionSchema.parse({
        ...req.body,
        userId,
      });
      const interaction = await storage.createUserInteraction(validatedData);
      res.json(interaction);
    } catch (error: any) {
      console.error("Error recording interaction:", error);
      res.status(400).json({ message: error.message || "Failed to record interaction" });
    }
  });

  // Admin routes for design templates
  app.post("/api/admin/design-templates", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const validatedData = insertDesignTemplateSchema.parse(req.body);
      const template = await storage.createDesignTemplate(validatedData);
      res.json(template);
    } catch (error: any) {
      console.error("Error creating design template:", error);
      res.status(400).json({ message: error.message || "Failed to create design template" });
    }
  });

  app.patch("/api/admin/design-templates/:id", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const id = parseInt(req.params.id);
      const template = await storage.updateDesignTemplate(id, req.body);
      res.json(template);
    } catch (error) {
      console.error("Error updating design template:", error);
      res.status(500).json({ message: "Failed to update design template" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
