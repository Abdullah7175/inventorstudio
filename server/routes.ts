import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import jwt from 'jsonwebtoken';
import { storage } from "./storage";
import { setupAuth, verifyJWT, requireRole, verifyApiSecurityToken, createApiKey, validateApiKey } from "./auth";
import { generateDesignRecommendations, analyzeProjectHealth, generateCommunicationContent } from "./ai";
import bcrypt from "bcryptjs";
import rateLimit from "express-rate-limit";

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Rate limiting configurations
const mobileApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: {
    error: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const mobileAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: {
    error: 'LOGIN_RATE_LIMIT_EXCEEDED',
    message: 'Too many login attempts, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const mobileChatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 chat messages per minute
  message: {
    error: 'CHAT_RATE_LIMIT_EXCEEDED',
    message: 'Too many chat messages, please slow down.',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

import {
  insertContactSubmissionSchema,
  insertClientProjectSchema,
  insertServiceSchema,
  insertPortfolioProjectSchema,
  insertBlogPostSchema,
  insertFaqItemSchema,
  insertChatMessageSchema,
} from "@shared/schema";

// Middleware to get user from database and attach to request
const attachUserFromDB = async (req: any, res: any, next: any) => {
  try {
    if (req.user?.id) {
      // Add timeout protection for user lookup
      const userPromise = storage.getUser(req.user.id);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('User lookup timeout')), 5000)
      );
      
      try {
        const user = await Promise.race([userPromise, timeoutPromise]);
        if (user) {
          req.currentUser = user;
          req.user = { ...req.user, ...user }; // Merge JWT data with DB data
        }
      } catch (timeoutError) {
        console.warn("User lookup timeout, proceeding with JWT data only:", timeoutError instanceof Error ? timeoutError.message : String(timeoutError));
        // Continue with JWT data only if database lookup fails
      }
    }
    next();
  } catch (error) {
    console.error("User lookup error:", error);
    next();
  }
};

// Helper function to create notifications for chat messages
async function createChatNotifications(senderId: string, message: any, projectId?: number) {
  try {
    const sender = await storage.getUser(senderId);
    if (!sender) return;

    const notifications = [];

    // For direct messages (no projectId but has recipientId)
    if (!projectId && message.recipientId) {
      const recipient = await storage.getUser(message.recipientId);
      if (recipient) {
        notifications.push({
          userId: message.recipientId,
          title: 'New Direct Message',
          message: `${sender.firstName || sender.email} sent you a direct message`,
          type: 'message',
          projectId: null,
          isRead: false
        });
      }
    }
    // For project-based messages
    else if (projectId) {
      // Get all users to notify based on roles and project assignments
      const allUsers = await storage.getAllUsers();

      for (const user of allUsers) {
        let shouldNotify = false;
        let notificationTitle = '';
        let notificationMessage = '';

        // Skip sender
        if (user.id === senderId) continue;

        // Admin gets all project messages
        if (user.role === 'admin') {
          shouldNotify = true;
          notificationTitle = 'New Project Message';
          notificationMessage = `${sender.firstName || sender.email} sent a message in a project`;
        }
        // Team members get messages related to their assigned projects
        else if (['team', 'developer', 'manager', 'seo'].includes(user.role)) {
          const assignments = await storage.getProjectAssignments(projectId);
          const isAssigned = assignments.some(assignment => assignment.teamMemberId === user.id);
          if (isAssigned) {
            shouldNotify = true;
            notificationTitle = 'New Project Message';
            notificationMessage = `${sender.firstName || sender.email} sent a message in your assigned project`;
          }
        }
        // Customers get messages related to their projects
        else if (['customer', 'client'].includes(user.role)) {
          const project = await storage.getClientProjectById(projectId);
          if (project && project.clientId === user.id) {
            shouldNotify = true;
            notificationTitle = 'Project Update';
            notificationMessage = `${sender.firstName || sender.email} sent a message about your project`;
          }
        }

        if (shouldNotify) {
          notifications.push({
            userId: user.id,
            title: notificationTitle,
            message: notificationMessage,
            type: 'message',
            projectId: projectId,
            isRead: false
          });
        }
      }
    }

    // Create all notifications
    for (const notification of notifications) {
      await storage.createNotification(notification);
    }
    
    console.log(`Created ${notifications.length} notifications for message from ${senderId}`);
  } catch (error) {
    console.error('Error creating chat notifications:', error);
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup auth middleware
  setupAuth(app);

  // Admin API endpoints
  // Admin Dashboard
  app.get("/api/admin/dashboard", verifyJWT, requireRole(["admin"]), async (req: any, res) => {
    try {
      // Get all users count
      const allUsers = await storage.getAllUsers();
      const activeUsers = allUsers.filter(u => u.isActive);
      const customers = allUsers.filter(u => u.role === 'customer');
      const teamMembers = allUsers.filter(u => ['team', 'admin', 'developer', 'manager'].includes(u.role));

      // Get all projects count
      const allProjects = await storage.getAllProjects();
      const activeProjects = allProjects.filter(p => ['in_progress', 'reviewing', 'approved'].includes(p.status));
      const completedProjects = allProjects.filter(p => p.status === 'completed');

      // Get total revenue (from invoices)
      const allInvoices = await storage.getAllInvoices();
      const totalRevenue = allInvoices
        .filter(inv => inv.status === 'paid')
        .reduce((sum, inv) => sum + parseFloat(inv.total || '0'), 0);

      // Get pending messages/notifications
      const allNotifications = await storage.getAllNotifications();
      const unreadNotifications = allNotifications.filter(n => !n.isRead);

      // Get recent activities
      const recentActivities = await storage.getRecentActivities(10);

      // Get recent projects
      const recentProjects = allProjects
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);

      const dashboardData = {
        stats: {
          totalUsers: allUsers.length,
          activeUsers: activeUsers.length,
          activeProjects: activeProjects.length,
          completedProjects: completedProjects.length,
          monthlyRevenue: totalRevenue,
          pendingMessages: unreadNotifications.length
        },
        recentActivities,
        recentProjects: recentProjects.map(p => {
          const customer = allUsers.find(u => u.id === p.clientId);
          return {
            id: p.id,
            name: p.title || p.projectName,
            customer: customer ? `${customer.firstName || ''} ${customer.lastName || ''}`.trim() : 'Unknown',
            status: p.status,
            progress: p.status === 'completed' ? 100 : p.status === 'in_progress' ? 75 : p.status === 'reviewing' ? 50 : 25,
            dueDate: p.createdAt,
            createdAt: p.createdAt
          };
        })
      };

      res.json(dashboardData);
    } catch (error) {
      console.error("Error fetching admin dashboard:", error);
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  // Admin Users Management
  app.get("/api/admin/users", verifyJWT, requireRole(["admin"]), async (req: any, res) => {
    try {
      const { role, status, search } = req.query;
      const users = await storage.getAllUsers();

      let filteredUsers = users;

      // Filter by role
      if (role && role !== 'all') {
        filteredUsers = filteredUsers.filter(u => u.role === role);
      }

      // Filter by status
      if (status && status !== 'all') {
        if (status === 'active') {
          filteredUsers = filteredUsers.filter(u => u.isActive);
        } else if (status === 'inactive') {
          filteredUsers = filteredUsers.filter(u => !u.isActive);
        }
      }

      // Filter by search term
      if (search) {
        const searchLower = search.toLowerCase();
        filteredUsers = filteredUsers.filter(u => 
          u.firstName?.toLowerCase().includes(searchLower) ||
          u.lastName?.toLowerCase().includes(searchLower) ||
          u.email?.toLowerCase().includes(searchLower)
        );
      }

      // Get project counts for each user
      const usersWithProjects = await Promise.all(
        filteredUsers.map(async (user) => {
          if (!user.id) return user;
          const userProjects = await storage.getClientProjects(user.id);
          return {
            ...user,
            projectsCount: userProjects.length,
            activeProjects: userProjects.filter(p => p.status && ['in_progress', 'reviewing'].includes(p.status)).length
          };
        })
      );

      res.json(usersWithProjects);
    } catch (error) {
      console.error("Error fetching admin users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Admin Projects Management
  app.post("/api/admin/projects", verifyJWT, requireRole(["admin"]), async (req: any, res) => {
    try {
      const { clientId, title, description, budget, timeline, priority, categoryId } = req.body;

      if (!clientId || !title || !description) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const projectData = {
        clientId,
        projectName: title,
        title,
        description,
        budget: budget || '0',
        timeline: timeline || 'Not specified',
        priority: priority || 'medium',
        categoryId: categoryId || null,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const newProject = await storage.createProjectRequest(projectData);
      res.json({ message: "Project created successfully", project: newProject });
    } catch (error) {
      console.error("Error creating project:", error);
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  app.get("/api/admin/projects", verifyJWT, requireRole(["admin"]), async (req: any, res) => {
    try {
      const { status, priority, search } = req.query;
      const projects = await storage.getAllProjects();
      const users = await storage.getAllUsers();

      let filteredProjects = projects;

      // Filter by status
      if (status && status !== 'all') {
        filteredProjects = filteredProjects.filter(p => p.status === status);
      }

      // Filter by priority
      if (priority && priority !== 'all') {
        filteredProjects = filteredProjects.filter(p => p.priority === priority);
      }

      // Filter by search term
      if (search) {
        const searchLower = search.toLowerCase();
        filteredProjects = filteredProjects.filter(p => 
          p.title?.toLowerCase().includes(searchLower) ||
          p.projectName?.toLowerCase().includes(searchLower) ||
          p.description?.toLowerCase().includes(searchLower)
        );
      }

      // Enrich with customer and team data
      const enrichedProjects = filteredProjects.map(project => {
        const customer = users.find(u => u.id === project.clientId);
        const progress = project.status === 'completed' ? 100 : 
                        project.status === 'in_progress' ? 75 : 
                        project.status === 'reviewing' ? 50 : 25;

        return {
          id: project.id,
          name: project.title || project.projectName,
          description: project.description,
          customer: {
            id: customer?.id,
            name: customer ? `${customer.firstName} ${customer.lastName}` : 'Unknown',
            email: customer?.email
          },
          status: project.status,
          priority: project.priority || 'medium',
          progress,
          budget: project.budget || 0,
          startDate: project.createdAt,
          dueDate: project.createdAt, // You might want to add a due date field
          teamMembers: [], // You might want to add team assignments
          createdAt: project.createdAt
        };
      });

      res.json(enrichedProjects);
    } catch (error) {
      console.error("Error fetching admin projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  // Admin Customers Management
  app.get("/api/admin/customers", verifyJWT, requireRole(["admin"]), async (req: any, res) => {
    try {
      const { status, tier, search } = req.query;
      const users = await storage.getAllUsers();
      const customers = users.filter(u => ['customer', 'client'].includes(u.role));

      let filteredCustomers = customers;

      // Filter by status
      if (status && status !== 'all') {
        if (status === 'active') {
          filteredCustomers = filteredCustomers.filter(c => c.isActive);
        } else if (status === 'inactive') {
          filteredCustomers = filteredCustomers.filter(c => !c.isActive);
        } else if (status === 'prospect') {
          // You might want to add a prospect field to users table
          filteredCustomers = filteredCustomers.filter(c => !c.isActive);
        }
      }

      // Filter by search term
      if (search) {
        const searchLower = search.toLowerCase();
        filteredCustomers = filteredCustomers.filter(c => 
          c.firstName?.toLowerCase().includes(searchLower) ||
          c.lastName?.toLowerCase().includes(searchLower) ||
          c.email?.toLowerCase().includes(searchLower)
        );
      }

      // Enrich with project and revenue data
      let enrichedCustomers = await Promise.all(
        filteredCustomers.map(async (customer) => {
          if (!customer.id) return customer;
          const customerProjects = await storage.getClientProjects(customer.id);
          const customerInvoices = await storage.getInvoicesByClientId(customer.id);
          
          const totalSpent = customerInvoices
            .filter(inv => inv.status === 'paid')
            .reduce((sum, inv) => sum + parseFloat(inv.total || '0'), 0);

          // Determine tier based on total spent
          let tier = 'bronze';
          if (totalSpent >= 10000) tier = 'platinum';
          else if (totalSpent >= 5000) tier = 'gold';
          else if (totalSpent >= 1000) tier = 'silver';

          return {
            id: customer.id,
            firstName: customer.firstName,
            lastName: customer.lastName,
            email: customer.email,
            phone: customer.phone,
            company: customer.department, // Using department as company
            status: customer.isActive ? 'active' : 'inactive',
            tier,
            totalSpent,
            projectsCount: customerProjects.length,
            activeProjects: customerProjects.filter(p => p.status && ['in_progress', 'reviewing'].includes(p.status)).length,
            lastActivity: customer.lastLogin || customer.updatedAt,
            createdAt: customer.createdAt,
            location: {
              city: 'Unknown', // You might want to add location fields
              country: 'Unknown'
            }
          };
        })
      );

      // Filter by tier after calculation
      if (tier && tier !== 'all') {
        enrichedCustomers = enrichedCustomers.filter(c => (c as any).tier === tier);
      }

      res.json(enrichedCustomers);
    } catch (error) {
      console.error("Error fetching admin customers:", error);
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  // Admin Teams Management
  app.get("/api/admin/teams", verifyJWT, requireRole(["admin"]), async (req: any, res) => {
    try {
      const users = await storage.getAllUsers();
      const teamMembers = users.filter(u => ['team', 'admin', 'developer', 'manager'].includes(u.role));

      // Enrich with project and workload data
      const enrichedMembers = await Promise.all(
        teamMembers.map(async (member) => {
          const memberProjects = await storage.getProjectsByTeamMember(member.id);
          const workload = Math.min(memberProjects.length * 20, 100); // Simple workload calculation

          return {
            id: member.id,
            firstName: member.firstName,
            lastName: member.lastName,
            email: member.email,
            role: member.role,
            department: member.department || 'development',
            status: member.isActive ? 'active' : 'inactive',
            joinedDate: member.createdAt,
            lastActive: member.lastLogin || member.updatedAt,
            projectsCount: memberProjects.length,
            workload,
            skills: member.skills || [],
            phone: member.phone
          };
        })
      );

      res.json(enrichedMembers);
    } catch (error) {
      console.error("Error fetching admin teams:", error);
      res.status(500).json({ message: "Failed to fetch team members" });
    }
  });

  // Admin Communications Management
  app.get("/api/admin/communications", verifyJWT, requireRole(["admin"]), async (req: any, res) => {
    try {
      const { type, status, search } = req.query;
      const messages = await storage.getAllProjectMessages();
      const notifications = await storage.getAllNotifications();
      const users = await storage.getAllUsers();

      // Combine messages and notifications
      const allCommunications = [
        ...messages.map(msg => ({
          id: `msg_${msg.id}`,
          sender: {
            id: msg.senderId,
            name: users.find(u => u.id === msg.senderId)?.firstName + ' ' + users.find(u => u.id === msg.senderId)?.lastName,
            email: users.find(u => u.id === msg.senderId)?.email,
            type: msg.senderRole
          },
          recipient: {
            id: 'admin',
            name: 'Admin',
            email: 'admin@inventorstudio.com',
            type: 'admin'
          },
          subject: `Project Message - ${msg.projectId}`,
          content: msg.message,
          type: 'chat',
          status: 'sent',
          priority: 'medium',
          timestamp: msg.createdAt,
          tags: ['project', 'message']
        })),
        ...notifications.map(notif => ({
          id: `notif_${notif.id}`,
          sender: {
            id: 'system',
            name: 'System',
            email: 'system@inventorstudio.com',
            type: 'system'
          },
          recipient: {
            id: notif.userId,
            name: users.find(u => u.id === notif.userId)?.firstName + ' ' + users.find(u => u.id === notif.userId)?.lastName,
            email: users.find(u => u.id === notif.userId)?.email,
            type: 'user'
          },
          subject: notif.title,
          content: notif.message,
          type: 'notification',
          status: notif.isRead ? 'read' : 'sent',
          priority: 'medium',
          timestamp: notif.createdAt,
          tags: [notif.type]
        }))
      ];

      let filteredCommunications = allCommunications;

      // Filter by type
      if (type && type !== 'all') {
        filteredCommunications = filteredCommunications.filter(c => c.type === type);
      }

      // Filter by status
      if (status && status !== 'all') {
        filteredCommunications = filteredCommunications.filter(c => c.status === status);
      }

      // Filter by search term
      if (search) {
        const searchLower = search.toLowerCase();
        filteredCommunications = filteredCommunications.filter(c => 
          c.subject?.toLowerCase().includes(searchLower) ||
          c.content?.toLowerCase().includes(searchLower) ||
          c.sender.name?.toLowerCase().includes(searchLower) ||
          c.recipient.name?.toLowerCase().includes(searchLower)
        );
      }

      // Sort by timestamp (most recent first)
      filteredCommunications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      res.json(filteredCommunications);
    } catch (error) {
      console.error("Error fetching admin communications:", error);
      res.status(500).json({ message: "Failed to fetch communications" });
    }
  });

  // Admin Project Assignment
  app.post("/api/admin/projects/:projectId/assign", verifyJWT, requireRole(["admin"]), async (req: any, res) => {
    try {
      const { projectId } = req.params;
      const { teamMemberIds, role = 'developer' } = req.body;

      if (!teamMemberIds || !Array.isArray(teamMemberIds) || teamMemberIds.length === 0) {
        return res.status(400).json({ message: "Team member IDs are required" });
      }

      // Verify project exists - try multiple lookup methods
      let project = await storage.getClientProjectById(parseInt(projectId));
      
      // If not found, try getting from portfolio projects
      if (!project) {
        try {
          project = await storage.getPortfolioProjectById(parseInt(projectId));
        } catch (error) {
          console.log('Project not found in portfolio projects either');
        }
      }
      
      if (!project) {
        console.error(`Project not found with ID: ${projectId}`);
        return res.status(404).json({ message: "Project not found" });
      }

      // Assign project to team members
      const assignments = [];
      for (const teamMemberId of teamMemberIds) {
        try {
          await storage.assignProjectToTeamMember(parseInt(projectId), teamMemberId, role);
          assignments.push({ projectId: parseInt(projectId), teamMemberId, role });
        } catch (error) {
          console.error(`Failed to assign project ${projectId} to team member ${teamMemberId}:`, error);
        }
      }

      res.json({ 
        message: "Project assigned successfully", 
        assignments,
        projectId: parseInt(projectId)
      });
    } catch (error) {
      console.error("Error assigning project:", error);
      res.status(500).json({ message: "Failed to assign project" });
    }
  });

  app.delete("/api/admin/projects/:projectId/assignments/:teamMemberId", verifyJWT, requireRole(["admin"]), async (req: any, res) => {
    try {
      const { projectId, teamMemberId } = req.params;

      await storage.removeProjectAssignment(parseInt(projectId), teamMemberId);

      res.json({ 
        message: "Project assignment removed successfully",
        projectId: parseInt(projectId),
        teamMemberId
      });
    } catch (error) {
      console.error("Error removing project assignment:", error);
      res.status(500).json({ message: "Failed to remove project assignment" });
    }
  });

  app.get("/api/admin/projects/:projectId/assignments", verifyJWT, requireRole(["admin"]), async (req: any, res) => {
    try {
      const { projectId } = req.params;
      const assignments = await storage.getProjectAssignments(parseInt(projectId));
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching project assignments:", error);
      res.status(500).json({ message: "Failed to fetch project assignments" });
    }
  });

  // Team Portal API endpoints
  app.get("/api/team/dashboard", verifyJWT, requireRole(["team", "developer", "manager"]), async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Get team member information
      const teamMember = await storage.getTeamMemberByUserId(userId);
      if (!teamMember) {
        return res.status(404).json({ message: "Team member not found" });
      }
      
      // Get team member's assigned projects
      const assignedProjects = await storage.getProjectsByTeamMember(userId);
      
      // Get user profile
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get project statistics
      const projectStats = {
        total: assignedProjects.length,
        pending: assignedProjects.filter(p => p.status === 'pending').length,
        inProgress: assignedProjects.filter(p => p.status === 'in_progress').length,
        review: assignedProjects.filter(p => p.status === 'reviewing').length,
        completed: assignedProjects.filter(p => p.status === 'completed').length
      };

      // Get recent activities (project updates, messages, etc.)
      const recentActivities = await storage.getRecentActivities(5);

      const dashboardData = {
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          email: user.email,
          department: user.department,
          skills: user.skills
        },
        teamMember: {
          id: teamMember.id,
          name: teamMember.name,
          role: teamMember.role,
          skills: teamMember.skills,
          permissions: teamMember.roleDetails?.permissions
        },
        projectStats,
        assignedProjects: assignedProjects.slice(0, 5), // Recent 5 projects
        recentActivities
      };

      res.json(dashboardData);
    } catch (error) {
      console.error("Error fetching team dashboard:", error);
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  app.get("/api/team/projects", verifyJWT, requireRole(["team", "developer", "manager"]), async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { status, priority } = req.query;
      
      let projects = await storage.getProjectsByTeamMember(userId);
      
      // Filter by status
      if (status && status !== 'all') {
        projects = projects.filter(p => p.status === status);
      }
      
      // Filter by priority
      if (priority && priority !== 'all') {
        projects = projects.filter(p => p.priority === priority);
      }

      // Enrich with customer data
      const users = await storage.getAllUsers();
      const enrichedProjects = projects.map(project => {
        const customer = users.find(u => u.id === project.clientId);
        return {
          ...project,
          customer: customer ? {
            id: customer.id,
            name: `${customer.firstName} ${customer.lastName}`,
            email: customer.email
          } : null
        };
      });

      res.json(enrichedProjects);
    } catch (error) {
      console.error("Error fetching team projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.get("/api/team/projects/:projectId", verifyJWT, requireRole(["team", "developer", "manager"]), async (req: any, res) => {
    try {
      const { projectId } = req.params;
      const userId = req.user.id;
      
      // Get project details
      const project = await storage.getClientProjectById(parseInt(projectId));
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Check if user is assigned to this project
      const assignments = await storage.getProjectAssignments(parseInt(projectId));
      const isAssigned = assignments.some(a => a.teamMemberId === userId);
      
      if (!isAssigned) {
        return res.status(403).json({ message: "Access denied - not assigned to this project" });
      }

      // Get customer info
      const customer = await storage.getUser(project.clientId);
      
      // Get project tasks
      const tasks = await storage.getProjectTasks(parseInt(projectId));
      
      // Get project messages
      const messages = await storage.getProjectMessages(parseInt(projectId));

      const projectDetails = {
        ...project,
        customer: customer ? {
          id: customer.id,
          name: `${customer.firstName} ${customer.lastName}`,
          email: customer.email,
          phone: customer.phone
        } : null,
        tasks,
        messages,
        assignments
      };

      res.json(projectDetails);
    } catch (error) {
      console.error("Error fetching team project details:", error);
      res.status(500).json({ message: "Failed to fetch project details" });
    }
  });

  app.put("/api/team/projects/:projectId/status", verifyJWT, requireRole(["team", "developer", "manager"]), async (req: any, res) => {
    try {
      const { projectId } = req.params;
      const { status, notes } = req.body;
      const userId = req.user.id;
      
      // Check if user is assigned to this project
      const assignments = await storage.getProjectAssignments(parseInt(projectId));
      const isAssigned = assignments.some(a => a.teamMemberId === userId);
      
      if (!isAssigned) {
        return res.status(403).json({ message: "Access denied - not assigned to this project" });
      }

      // Update project status
      await storage.updateClientProject(parseInt(projectId), { 
        status,
        feedback: notes || null
      });

      res.json({ 
        message: "Project status updated successfully",
        projectId: parseInt(projectId),
        status
      });
    } catch (error) {
      console.error("Error updating project status:", error);
      res.status(500).json({ message: "Failed to update project status" });
    }
  });

  // Team Profile endpoints
  app.get("/api/team/profile", verifyJWT, requireRole(["team", "developer", "manager"]), async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(user);
    } catch (error) {
      console.error("Error fetching team profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.put("/api/team/profile", verifyJWT, requireRole(["team", "developer", "manager"]), async (req: any, res) => {
    try {
      const userId = req.user.id;
      const updates = req.body;

      // Remove fields that shouldn't be updated via this endpoint
      const allowedUpdates = {
        firstName: updates.firstName,
        lastName: updates.lastName,
        phone: updates.phone,
        department: updates.department,
        skills: updates.skills
      };

      // Remove undefined values
      Object.keys(allowedUpdates).forEach(key => 
        (allowedUpdates as any)[key] === undefined && delete (allowedUpdates as any)[key]
      );

      const updatedUser = await storage.updateUser(userId, allowedUpdates);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating team profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // User Management CRUD Operations
  app.post("/api/admin/users", verifyJWT, requireRole(["admin"]), async (req: any, res) => {
    try {
      const { email, firstName, lastName, phone, role, department, skills, password } = req.body;

      if (!email || !firstName || !lastName || !password) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }

      const userData = {
        email,
        firstName,
        lastName,
        phone: phone || null,
        role: role || 'customer',
        department: department || null,
        skills: skills || [],
        passwordHash: await bcrypt.hash(password, 10),
        emailVerified: false,
        isActive: true,
        createdAt: new Date(),
      };

      const newUser = await storage.createUser(userData);
      res.json({ message: "User created successfully", user: newUser });
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.put("/api/admin/users/:userId", verifyJWT, requireRole(["admin"]), async (req: any, res) => {
    try {
      const { userId } = req.params;
      const updates = req.body;

      // Remove password from updates if it exists
      if (updates.password) {
        updates.passwordHash = await bcrypt.hash(updates.password, 10);
        delete updates.password;
      }

      const updatedUser = await storage.updateUser(userId, updates);
      res.json({ message: "User updated successfully", user: updatedUser });
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.delete("/api/admin/users/:userId", verifyJWT, requireRole(["admin"]), async (req: any, res) => {
    try {
      const { userId } = req.params;

      await storage.updateUser(userId, { isActive: false });
      res.json({ message: "User deactivated successfully" });
    } catch (error) {
      console.error("Error deactivating user:", error);
      res.status(500).json({ message: "Failed to deactivate user" });
    }
  });

  // Temporary endpoint to update user role for testing
  app.put("/api/admin/users/:userId/role", verifyJWT, requireRole(["admin"]), async (req: any, res) => {
    try {
      const { userId } = req.params;
      const { role } = req.body;
      
      await storage.updateUser(userId, { role });
      res.json({ message: "User role updated successfully" });
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  // Team Role Management
  app.get("/api/admin/team-roles", verifyJWT, requireRole(["admin"]), async (req: any, res) => {
    try {
      const roles = await storage.getAllTeamRoles();
      res.json(roles);
    } catch (error) {
      console.error("Error fetching team roles:", error);
      res.status(500).json({ message: "Failed to fetch team roles" });
    }
  });

  // Team Member Management
  app.get("/api/admin/team-members", verifyJWT, requireRole(["admin"]), async (req: any, res) => {
    try {
      const members = await storage.getAllTeamMembers();
      res.json(members);
    } catch (error) {
      console.error("Error fetching team members:", error);
      res.status(500).json({ message: "Failed to fetch team members" });
    }
  });

  app.post("/api/admin/team-members", verifyJWT, requireRole(["admin"]), async (req: any, res) => {
    try {
      const { userId, name, roleId, skills } = req.body;

      if (!userId || !name || !roleId) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Check if user exists and is not already a team member
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const existingTeamMember = await storage.getTeamMemberByUserId(userId);
      if (existingTeamMember) {
        return res.status(400).json({ message: "User is already a team member" });
      }

      const teamMember = await storage.createTeamMember(userId, name, roleId, skills);
      res.json({ message: "Team member created successfully", teamMember });
    } catch (error) {
      console.error("Error creating team member:", error);
      res.status(500).json({ message: "Failed to create team member" });
    }
  });

  app.put("/api/admin/team-members/:userId", verifyJWT, requireRole(["admin"]), async (req: any, res) => {
    try {
      const { userId } = req.params;
      const updates = req.body;

      const updatedMember = await storage.updateTeamMember(userId, updates);
      res.json({ message: "Team member updated successfully", teamMember: updatedMember });
    } catch (error) {
      console.error("Error updating team member:", error);
      res.status(500).json({ message: "Failed to update team member" });
    }
  });

  app.delete("/api/admin/team-members/:userId", verifyJWT, requireRole(["admin"]), async (req: any, res) => {
    try {
      const { userId } = req.params;

      await storage.deactivateTeamMember(userId);
      res.json({ message: "Team member deactivated successfully" });
    } catch (error) {
      console.error("Error deactivating team member:", error);
      res.status(500).json({ message: "Failed to deactivate team member" });
    }
  });

  // Admin Analytics
  app.get("/api/admin/analytics", verifyJWT, requireRole(["admin"]), async (req: any, res) => {
    try {
      const { timeRange = '30d' } = req.query;
      
      // Get all data
      const users = await storage.getAllUsers();
      const projects = await storage.getAllProjects();
      const invoices = await storage.getAllInvoices();
      const notifications = await storage.getAllNotifications();

      // Calculate date range
      const now = new Date();
      const daysBack = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
      const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

      // Filter data by time range
      const recentUsers = users.filter(u => u.createdAt && new Date(u.createdAt) >= startDate);
      const recentProjects = projects.filter(p => p.createdAt && new Date(p.createdAt) >= startDate);
      const recentInvoices = invoices.filter(inv => inv.createdAt && new Date(inv.createdAt) >= startDate);

      // Calculate metrics
      const totalRevenue = invoices
        .filter(inv => inv.status === 'paid')
        .reduce((sum, inv) => sum + parseFloat(inv.total || '0'), 0);

      const monthlyRevenue = recentInvoices
        .filter(inv => inv.status === 'paid')
        .reduce((sum, inv) => sum + parseFloat(inv.total || '0'), 0);

      const activeUsers = users.filter(u => u.isActive).length;
      const completedProjects = projects.filter(p => p.status === 'completed').length;
      const avgProjectTime = 18.5; // You might want to calculate this from actual data
      const customerSatisfaction = 4.7; // You might want to calculate this from feedback

      // Calculate growth (mock data for now)
      const userGrowth = recentUsers.length > 0 ? 12.5 : 0;
      const projectGrowth = recentProjects.length > 0 ? 8.2 : 0;
      const revenueGrowth = monthlyRevenue > 0 ? 15.3 : 0;
      const satisfactionGrowth = 2.1;

      // Top customers by revenue
      const customerRevenue = new Map();
      invoices.filter(inv => inv.status === 'paid').forEach(inv => {
        const current = customerRevenue.get(inv.clientId) || 0;
        customerRevenue.set(inv.clientId, current + parseFloat(inv.total || '0'));
      });

      const topCustomers = Array.from(customerRevenue.entries())
        .map(([clientId, revenue]) => {
          const customer = users.find(u => u.id === clientId);
          const customerProjects = projects.filter(p => p.clientId === clientId);
          return {
            id: clientId,
            name: customer ? `${customer.firstName} ${customer.lastName}` : 'Unknown',
            revenue,
            projects: customerProjects.length,
            lastActivity: customer?.lastLogin || customer?.updatedAt
          };
        })
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      // Recent activities
      const recentActivities = [
        ...recentProjects.slice(0, 3).map(p => ({
          id: `project_${p.id}`,
          type: 'project_completed',
          description: `Project "${p.title || p.projectName}" completed`,
          customer: users.find(u => u.id === p.clientId)?.firstName + ' ' + users.find(u => u.id === p.clientId)?.lastName,
          timestamp: p.updatedAt,
          value: 0
        })),
        ...recentUsers.slice(0, 2).map(u => ({
          id: `user_${u.id}`,
          type: 'new_customer',
          description: 'New customer registered',
          customer: `${u.firstName} ${u.lastName}`,
          timestamp: u.createdAt,
          value: 0
        })),
        ...recentInvoices.slice(0, 2).map(inv => ({
          id: `invoice_${inv.id}`,
          type: 'payment_received',
          description: 'Payment received',
          customer: users.find(u => u.id === inv.clientId)?.firstName + ' ' + users.find(u => u.id === inv.clientId)?.lastName,
          timestamp: inv.paidAt || inv.createdAt,
          value: parseFloat(inv.total || '0')
        }))
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      // Project status distribution
      const projectStatuses = [
        { status: 'Completed', count: completedProjects, percentage: (completedProjects / projects.length) * 100 },
        { status: 'Active', count: projects.filter(p => ['in_progress', 'reviewing'].includes(p.status)).length, percentage: (projects.filter(p => ['in_progress', 'reviewing'].includes(p.status)).length / projects.length) * 100 },
        { status: 'On Hold', count: projects.filter(p => p.status === 'on_hold').length, percentage: (projects.filter(p => p.status === 'on_hold').length / projects.length) * 100 },
        { status: 'Cancelled', count: projects.filter(p => p.status === 'cancelled').length, percentage: (projects.filter(p => p.status === 'cancelled').length / projects.length) * 100 }
      ];

      const analyticsData = {
        metrics: {
          totalRevenue,
          monthlyRevenue,
          totalUsers: users.length,
          activeUsers,
          totalProjects: projects.length,
          completedProjects,
          avgProjectTime,
          customerSatisfaction,
          revenueGrowth,
          userGrowth,
          projectGrowth,
          satisfactionGrowth
        },
        topCustomers,
        recentActivities,
        projectStatuses,
        chartData: {
          months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          revenue: [32000, 38000, 42000, 39000, 45000, monthlyRevenue],
          users: [950, 1020, 1080, 1120, 1180, users.length],
          projects: [12, 15, 18, 14, 20, projects.length]
        }
      };

      res.json(analyticsData);
    } catch (error) {
      console.error("Error fetching admin analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics data" });
    }
  });

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
      const published = req.query.published === 'true';
      console.log('Blog API called with published:', published);
      const posts = await storage.getBlogPosts(published);
      console.log('Found blog posts:', posts.length);
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

  // Chat API endpoints
  app.get("/api/chat/messages", verifyJWT, async (req: any, res) => {
    try {
      const projectId = req.query.projectId ? parseInt(req.query.projectId) : undefined;
      const conversationId = req.query.conversationId;
      const userId = req.user.id;
      
      console.log(`Fetching messages for user ${userId}, projectId: ${projectId}, conversationId: ${conversationId}`);
      const messages = await storage.getChatMessages(projectId, conversationId, userId);
      console.log(`Found ${messages.length} messages:`, messages);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ message: "Failed to fetch chat messages" });
    }
  });

  app.post("/api/chat/messages", verifyJWT, async (req: any, res) => {
    try {
      const { projectId, message, messageType = 'text', attachments, conversationId } = req.body;
      
      // Determine recipient for direct messages
      let recipientId = null;
      if (!projectId && conversationId) {
        // Extract recipient ID from conversation ID (format: "role-userId" or "admin-userId")
        const parts = conversationId.split('-');
        if (parts.length >= 2) {
          recipientId = parts.slice(1).join('-'); // Handle UUIDs that might contain dashes
        }
      }
      
      const newMessage = await storage.createChatMessage({
        projectId: projectId || null,
        senderId: req.user.id,
        recipientId: recipientId,
        message,
        messageType,
        attachments,
        isRead: false
      });

      // Create notifications for relevant users
      await createChatNotifications(req.user.id, newMessage, projectId);

      res.status(201).json(newMessage);
    } catch (error) {
      console.error("Error creating chat message:", error);
      res.status(500).json({ message: "Failed to create chat message" });
    }
  });

  app.put("/api/chat/messages/:id/read", verifyJWT, async (req: any, res) => {
    try {
      const messageId = parseInt(req.params.id);
      await storage.markChatMessageAsRead(messageId);
      res.json({ message: "Message marked as read" });
    } catch (error) {
      console.error("Error marking message as read:", error);
      res.status(500).json({ message: "Failed to mark message as read" });
    }
  });

  app.get("/api/chat/unread-count", verifyJWT, async (req: any, res) => {
    try {
      const projectId = req.query.projectId ? parseInt(req.query.projectId) : undefined;
      const count = await storage.getUnreadChatMessagesCount(req.user.id, projectId);
      res.json({ count });
    } catch (error) {
      console.error("Error getting unread count:", error);
      res.status(500).json({ message: "Failed to get unread count" });
    }
  });

  app.get("/api/chat/conversations", verifyJWT, async (req: any, res) => {
    try {
      const projectId = req.query.projectId ? parseInt(req.query.projectId) : undefined;
      console.log(`Fetching conversations for user ${req.user.id}, projectId: ${projectId}`);
      
      // Debug: Check user info
      const user = await storage.getUser(req.user.id);
      console.log(`User info:`, user);
      
      // Debug: Check all users in database
      const allUsers = await storage.getAllUsers();
      console.log(`All users in database:`, allUsers.map(u => ({ id: u.id, email: u.email, role: u.role })));
      
      const conversations = await storage.getChatConversations(req.user.id, projectId);
      console.log(`Found ${conversations.length} conversations:`, conversations);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  // Debug endpoint to check notifications
  app.get("/api/debug/notifications", verifyJWT, async (req: any, res) => {
    try {
      console.log(`Checking notifications for user ${req.user.id}`);
      const notifications = await storage.getNotifications(req.user.id);
      console.log(`Found ${notifications.length} notifications:`, notifications);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  // Mark notification as read
  app.put("/api/notifications/:id/read", verifyJWT, async (req: any, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      await storage.markNotificationAsRead(notificationId);
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Mark all notifications as read
  app.put("/api/notifications/mark-all-read", verifyJWT, async (req: any, res) => {
    try {
      await storage.markAllNotificationsAsRead(req.user.id);
      res.json({ message: "All notifications marked as read" });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  });

  // Debug endpoint to create test customer if none exist
  app.post("/api/debug/create-test-customer", verifyJWT, requireRole(["admin"]), async (req: any, res) => {
    try {
      // Check if any customers exist
      const existingCustomers = await storage.getAllUsers();
      const hasCustomers = existingCustomers.some(user => user.role === 'customer');
      
      let testCustomer;
      if (!hasCustomers) {
        // Create a test customer
        testCustomer = await storage.createUser({
          email: 'testcustomer@example.com',
          firstName: 'Test',
          lastName: 'Customer',
          role: 'customer',
          isActive: true,
          passwordHash: '$2b$10$dummy.hash.for.testing',
          emailVerified: true,
          createdAt: new Date(),
        });
        console.log("Created test customer:", testCustomer);
      } else {
        testCustomer = existingCustomers.find(u => u.role === 'customer');
        console.log("Using existing customer:", testCustomer);
      }

      // Create some test messages between admin and customer
      const adminUser = await storage.getUser(req.user.id);
      let messagesCreated = 0;
      
      if (adminUser && testCustomer) {
        // Create a conversation with some test messages
        const testMessages = [
          {
            senderId: testCustomer.id,
            message: "Hello! I'm interested in your web development services. Can you help me with a new project?",
            messageType: 'text' as const,
            recipientId: adminUser.id,
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          },
          {
            senderId: adminUser.id,
            message: "Hello! I'd be happy to help you with your web development project. What kind of website are you looking to build?",
            messageType: 'text' as const,
            recipientId: testCustomer.id,
            createdAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000), // 1.5 hours ago
          },
          {
            senderId: testCustomer.id,
            message: "I need an e-commerce website for my clothing store. Do you have experience with Shopify development?",
            messageType: 'text' as const,
            recipientId: adminUser.id,
            createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
          },
          {
            senderId: adminUser.id,
            message: "Absolutely! We have extensive experience with Shopify development and can create a custom e-commerce solution for your clothing store. Would you like to schedule a call to discuss your requirements in detail?",
            messageType: 'text' as const,
            recipientId: testCustomer.id,
            createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
          }
        ];

        // Create the test messages
        for (const msg of testMessages) {
          await storage.createChatMessage(msg);
        }

        messagesCreated = testMessages.length;
        console.log(`Created ${messagesCreated} test messages between admin and customer`);
      }

      res.json({ 
        message: "Test customer and messages created successfully", 
        customer: testCustomer,
        messagesCreated
      });
    } catch (error) {
      console.error("Error creating test customer and messages:", error);
      res.status(500).json({ message: "Failed to create test customer and messages" });
    }
  });


  // Mobile-specific API endpoints (all require API security token)
  app.post('/api/mobile/refresh-token', mobileApiLimiter, verifyApiSecurityToken, verifyJWT, async (req: any, res) => {
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

  app.post('/api/mobile/update-device-token', mobileApiLimiter, verifyApiSecurityToken, verifyJWT, async (req: any, res) => {
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

  app.get('/api/mobile/user-profile', mobileApiLimiter, verifyApiSecurityToken, verifyJWT, async (req: any, res) => {
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

  app.put('/api/mobile/user-profile', mobileApiLimiter, verifyApiSecurityToken, verifyJWT, async (req: any, res) => {
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

  // ==================== ENHANCED MOBILE APIs ====================

  // Mobile blog posts API
  app.get('/api/mobile/blog', verifyApiSecurityToken, async (req, res) => {
    try {
      const { published, limit } = req.query;
      const posts = await storage.getBlogPosts(published === 'true');
      
      const limitedPosts = limit ? posts.slice(0, parseInt(limit as string)) : posts;
      
      res.json(limitedPosts);
    } catch (error) {
      console.error('Error fetching mobile blog posts:', error);
      res.status(500).json({ message: 'Failed to fetch blog posts' });
    }
  });

  app.get('/api/mobile/blog/:slug', verifyApiSecurityToken, async (req, res) => {
    try {
      const { slug } = req.params;
      const post = await storage.getBlogPostBySlug(slug);
      
      if (!post) {
        return res.status(404).json({ message: 'Blog post not found' });
      }
      
      res.json(post);
    } catch (error) {
      console.error('Error fetching mobile blog post:', error);
      res.status(500).json({ message: 'Failed to fetch blog post' });
    }
  });

  // Mobile chat APIs
  app.get('/api/mobile/chat/:projectId', verifyApiSecurityToken, verifyJWT, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const projectId = parseInt(req.params.projectId);
      
      // Verify user has access to this project
      const project = await storage.getClientProjectById(projectId);
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      if (project.clientId !== userId) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      const messages = await storage.getChatMessages(projectId);
      res.json(messages);
    } catch (error) {
      console.error('Error fetching mobile chat messages:', error);
      res.status(500).json({ message: 'Failed to fetch chat messages' });
    }
  });

  app.post('/api/mobile/chat/send', mobileChatLimiter, verifyApiSecurityToken, verifyJWT, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { projectId, message, messageType = 'text' } = req.body;
      
      if (!projectId || !message) {
        return res.status(400).json({ message: 'Project ID and message are required' });
      }
      
      // Verify user has access to this project
      const project = await storage.getClientProjectById(projectId);
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      if (project.clientId !== userId) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      const messageData = {
        senderId: userId,
        projectId: projectId,
        message: message,
        messageType: messageType,
        isRead: false
      };
      
      const newMessage = await storage.createChatMessage(messageData);
      
      // Create notifications for team members
      await createChatNotifications(userId, newMessage, projectId);
      
      res.status(201).json(newMessage);
    } catch (error) {
      console.error('Error sending mobile chat message:', error);
      res.status(500).json({ message: 'Failed to send message' });
    }
  });

  // Mobile notifications API
  app.get('/api/mobile/notifications', verifyApiSecurityToken, verifyJWT, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const notifications = await storage.getNotifications(userId);
      
      res.json(notifications);
    } catch (error) {
      console.error('Error fetching mobile notifications:', error);
      res.status(500).json({ message: 'Failed to fetch notifications' });
    }
  });

  app.put('/api/mobile/notifications/:id/read', verifyApiSecurityToken, verifyJWT, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const notificationId = parseInt(req.params.id);
      
      await storage.markNotificationAsRead(notificationId);
      
      res.json({ message: 'Notification marked as read' });
    } catch (error) {
      console.error('Error marking mobile notification as read:', error);
      res.status(500).json({ message: 'Failed to mark notification as read' });
    }
  });

  app.put('/api/mobile/notifications/read-all', verifyApiSecurityToken, verifyJWT, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      await storage.markAllNotificationsAsRead(userId);
      
      res.json({ message: 'All notifications marked as read' });
    } catch (error) {
      console.error('Error marking all mobile notifications as read:', error);
      res.status(500).json({ message: 'Failed to mark all notifications as read' });
    }
  });

  // Mobile FAQ API
  app.get('/api/mobile/faq', verifyApiSecurityToken, async (req, res) => {
    try {
      const faqItems = await storage.getFaqItems();
      res.json(faqItems);
    } catch (error) {
      console.error('Error fetching mobile FAQ:', error);
      res.status(500).json({ message: 'Failed to fetch FAQ items' });
    }
  });

  // Mobile portfolio with filtering
  app.get('/api/mobile/portfolio/:category', verifyApiSecurityToken, async (req, res) => {
    try {
      const { category } = req.params;
      const { featured } = req.query;
      
      let projects;
      if (featured === 'true') {
        projects = await storage.getFeaturedProjects();
      } else {
        projects = await storage.getPortfolioProjectsByCategory(category);
      }
      
      res.json(projects);
    } catch (error) {
      console.error('Error fetching mobile portfolio by category:', error);
      res.status(500).json({ message: 'Failed to fetch portfolio projects' });
    }
  });

  // Mobile services with filtering
  app.get('/api/mobile/services/featured', verifyApiSecurityToken, async (req, res) => {
    try {
      const services = await storage.getFeaturedServices();
      res.json(services);
    } catch (error) {
      console.error('Error fetching mobile featured services:', error);
      res.status(500).json({ message: 'Failed to fetch featured services' });
    }
  });

  // Mobile logout with session cleanup
  app.post('/api/mobile/logout', verifyApiSecurityToken, verifyJWT, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { deviceToken } = req.body;
      
      // Deactivate mobile session if device token provided
      if (deviceToken) {
        await storage.deactivateMobileSession(userId, deviceToken);
      }
      
      // Add current JWT to blacklist
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (token) {
        const tokenHash = require('crypto').createHash('sha256').update(token).digest('hex');
        await storage.addTokenToBlacklist(tokenHash, userId, 'Mobile logout');
      }
      
      res.json({ message: 'Logout successful' });
    } catch (error) {
      console.error('Error during mobile logout:', error);
      res.status(500).json({ message: 'Failed to logout' });
    }
  });

  // Mobile password change
  app.post('/api/mobile/change-password', verifyApiSecurityToken, verifyJWT, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Current password and new password are required' });
      }
      
      if (newPassword.length < 6) {
        return res.status(400).json({ message: 'New password must be at least 6 characters' });
      }
      
      const user = await storage.getUser(userId);
      if (!user || !user.passwordHash) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }
      
      // Hash new password
      const newPasswordHash = await bcrypt.hash(newPassword, 12);
      
      // Update password
      await storage.updateUser(userId, { passwordHash: newPasswordHash });
      
      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      console.error('Error changing mobile password:', error);
      res.status(500).json({ message: 'Failed to change password' });
    }
  });

  // Mobile biometric settings
  app.get('/api/mobile/biometric-settings', verifyApiSecurityToken, verifyJWT, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { deviceToken } = req.query;
      
      if (!deviceToken) {
        return res.status(400).json({ message: 'Device token is required' });
      }
      
      const settings = await storage.getBiometricSettings(userId, deviceToken);
      res.json(settings || { enabled: false });
    } catch (error) {
      console.error('Error fetching mobile biometric settings:', error);
      res.status(500).json({ message: 'Failed to fetch biometric settings' });
    }
  });

  app.post('/api/mobile/biometric-settings', verifyApiSecurityToken, verifyJWT, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { deviceToken, enabled, biometricType } = req.body;
      
      if (!deviceToken) {
        return res.status(400).json({ message: 'Device token is required' });
      }
      
      const settingsData = {
        userId,
        deviceToken,
        enabled: enabled || false,
        biometricType: biometricType || 'fingerprint',
        createdAt: new Date()
      };
      
      const settings = await storage.createBiometricSettings(settingsData);
      res.json(settings);
    } catch (error) {
      console.error('Error creating mobile biometric settings:', error);
      res.status(500).json({ message: 'Failed to save biometric settings' });
    }
  });

  app.put('/api/mobile/biometric-settings', verifyApiSecurityToken, verifyJWT, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { deviceToken, enabled, biometricType } = req.body;
      
      if (!deviceToken) {
        return res.status(400).json({ message: 'Device token is required' });
      }
      
      const updateData: any = {};
      if (enabled !== undefined) updateData.enabled = enabled;
      if (biometricType) updateData.biometricType = biometricType;
      
      const settings = await storage.updateBiometricSettings(userId, deviceToken, updateData);
      res.json(settings);
    } catch (error) {
      console.error('Error updating mobile biometric settings:', error);
      res.status(500).json({ message: 'Failed to update biometric settings' });
    }
  });

  // ==================== API KEY MANAGEMENT ====================
  
  // Create API key (Admin only)
  app.post('/api/admin/api-keys', verifyJWT, requireRole(["admin"]), async (req: any, res) => {
    try {
      const { name, permissions, expiresInDays } = req.body;
      
      if (!name || !permissions || !Array.isArray(permissions)) {
        return res.status(400).json({ 
          message: 'Name and permissions array are required' 
        });
      }
      
      const apiKey = createApiKey(name, permissions, expiresInDays);
      
      res.status(201).json({
        message: 'API key created successfully',
        apiKey: {
          id: apiKey.id,
          name: apiKey.name,
          key: apiKey.key,
          permissions: apiKey.permissions,
          expiresAt: apiKey.expiresAt,
          createdAt: apiKey.createdAt
        }
      });
    } catch (error) {
      console.error('Error creating API key:', error);
      res.status(500).json({ message: 'Failed to create API key' });
    }
  });

  // Validate API key endpoint (for testing)
  app.post('/api/validate-api-key', async (req, res) => {
    try {
      const { apiKey, requiredPermission } = req.body;
      
      if (!apiKey) {
        return res.status(400).json({ message: 'API key is required' });
      }
      
      const isValid = validateApiKey(apiKey, requiredPermission);
      
      res.json({
        valid: isValid,
        message: isValid ? 'API key is valid' : 'API key is invalid or expired'
      });
    } catch (error) {
      console.error('Error validating API key:', error);
      res.status(500).json({ message: 'Failed to validate API key' });
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

  // ==================== PORTFOLIO API ENDPOINTS ====================
  
  // Public portfolio endpoints for website
  app.get("/api/portfolio/all", async (req: any, res) => {
    try {
      const projects = await storage.getAllPortfolioProjects();
      res.json(projects);
    } catch (error) {
      console.error("Error fetching all portfolio projects:", error);
      res.status(500).json({ message: "Failed to fetch portfolio projects" });
    }
  });

  app.get("/api/portfolio/:category", async (req: any, res) => {
    try {
      const { category } = req.params;
      const projects = await storage.getPortfolioProjectsByCategory(category);
      res.json(projects);
    } catch (error) {
      console.error(`Error fetching portfolio projects for category ${req.params.category}:`, error);
      res.status(500).json({ message: "Failed to fetch portfolio projects" });
    }
  });

  // ==================== SEO PORTAL API ENDPOINTS ====================

  // Services Management
  app.get("/api/seo/services", verifyJWT, requireRole(["seo", "admin"]), async (req: any, res) => {
    try {
      const services = await storage.getServices();
      res.json(services);
    } catch (error) {
      console.error("Error fetching services:", error);
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });

  app.post("/api/seo/services", verifyJWT, requireRole(["seo", "admin"]), async (req: any, res) => {
    try {
      const { title, description, icon, technologies, featured } = req.body;
      
      if (!title || !description || !icon) {
        return res.status(400).json({ message: "Title, description, and icon are required" });
      }

      const serviceData = {
        title,
        description,
        icon,
        technologies: technologies || [],
        featured: featured || false
      };

      const newService = await storage.createService(serviceData);
      res.json({ message: "Service created successfully", service: newService });
    } catch (error) {
      console.error("Error creating service:", error);
      res.status(500).json({ message: "Failed to create service" });
    }
  });

  app.put("/api/seo/services/:id", verifyJWT, requireRole(["seo", "admin"]), async (req: any, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const updatedService = await storage.updateService(parseInt(id), updates);
      res.json({ message: "Service updated successfully", service: updatedService });
    } catch (error) {
      console.error("Error updating service:", error);
      res.status(500).json({ message: "Failed to update service" });
    }
  });

  app.delete("/api/seo/services/:id", verifyJWT, requireRole(["seo", "admin"]), async (req: any, res) => {
    try {
      const { id } = req.params;
      
      await storage.deleteService(parseInt(id));
      res.json({ message: "Service deleted successfully" });
    } catch (error) {
      console.error("Error deleting service:", error);
      res.status(500).json({ message: "Failed to delete service" });
    }
  });

  // Portfolio Management
  app.get("/api/seo/portfolio", verifyJWT, requireRole(["seo", "admin"]), async (req: any, res) => {
    try {
      const projects = await storage.getAllPortfolioProjects();
      res.json(projects);
    } catch (error) {
      console.error("Error fetching portfolio projects:", error);
      res.status(500).json({ message: "Failed to fetch portfolio projects" });
    }
  });

  app.post("/api/seo/portfolio", verifyJWT, requireRole(["seo", "admin"]), async (req: any, res) => {
    try {
      const { title, description, image_url, category, technologies, project_url, featured } = req.body;
      
      if (!title || !description || !image_url || !category) {
        return res.status(400).json({ message: "Title, description, image URL, and category are required" });
      }

      const projectData = {
        title,
        description,
        image_url,
        category,
        technologies: technologies || [],
        project_url: project_url || null,
        featured: featured || false
      };

      const newProject = await storage.createPortfolioProject(projectData);
      res.json({ message: "Portfolio project created successfully", project: newProject });
    } catch (error) {
      console.error("Error creating portfolio project:", error);
      res.status(500).json({ message: "Failed to create portfolio project" });
    }
  });

  app.put("/api/seo/portfolio/:id", verifyJWT, requireRole(["seo", "admin"]), async (req: any, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const updatedProject = await storage.updatePortfolioProject(parseInt(id), updates);
      res.json({ message: "Portfolio project updated successfully", project: updatedProject });
    } catch (error) {
      console.error("Error updating portfolio project:", error);
      res.status(500).json({ message: "Failed to update portfolio project" });
    }
  });

  app.delete("/api/seo/portfolio/:id", verifyJWT, requireRole(["seo", "admin"]), async (req: any, res) => {
    try {
      const { id } = req.params;
      
      await storage.deletePortfolioProject(parseInt(id));
      res.json({ message: "Portfolio project deleted successfully" });
    } catch (error) {
      console.error("Error deleting portfolio project:", error);
      res.status(500).json({ message: "Failed to delete portfolio project" });
    }
  });

  // FAQ Management
  app.get("/api/seo/faq", verifyJWT, requireRole(["seo", "admin"]), async (req: any, res) => {
    try {
      const faqItems = await storage.getAllFAQItems();
      res.json(faqItems);
    } catch (error) {
      console.error("Error fetching FAQ items:", error);
      res.status(500).json({ message: "Failed to fetch FAQ items" });
    }
  });

  app.post("/api/seo/faq", verifyJWT, requireRole(["seo", "admin"]), async (req: any, res) => {
    try {
      const { question, answer } = req.body;
      
      if (!question || !answer) {
        return res.status(400).json({ message: "Question and answer are required" });
      }

      const faqData = { question, answer };
      const newFAQ = await storage.createFAQItem(faqData);
      res.json({ message: "FAQ item created successfully", faq: newFAQ });
    } catch (error) {
      console.error("Error creating FAQ item:", error);
      res.status(500).json({ message: "Failed to create FAQ item" });
    }
  });

  app.put("/api/seo/faq/:id", verifyJWT, requireRole(["seo", "admin"]), async (req: any, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const updatedFAQ = await storage.updateFAQItem(parseInt(id), updates);
      res.json({ message: "FAQ item updated successfully", faq: updatedFAQ });
    } catch (error) {
      console.error("Error updating FAQ item:", error);
      res.status(500).json({ message: "Failed to update FAQ item" });
    }
  });

  app.delete("/api/seo/faq/:id", verifyJWT, requireRole(["seo", "admin"]), async (req: any, res) => {
    try {
      const { id } = req.params;
      
      await storage.deleteFAQItem(parseInt(id));
      res.json({ message: "FAQ item deleted successfully" });
    } catch (error) {
      console.error("Error deleting FAQ item:", error);
      res.status(500).json({ message: "Failed to delete FAQ item" });
    }
  });

  app.post("/api/seo/faq/:id/move", verifyJWT, requireRole(["seo", "admin"]), async (req: any, res) => {
    try {
      const { id } = req.params;
      const { direction } = req.body;
      
      await storage.moveFAQItem(parseInt(id), direction);
      res.json({ message: "FAQ order updated successfully" });
    } catch (error) {
      console.error("Error moving FAQ item:", error);
      res.status(500).json({ message: "Failed to move FAQ item" });
    }
  });

  // Blog Management
  app.get("/api/seo/blog", verifyJWT, requireRole(["seo", "admin"]), async (req: any, res) => {
    try {
      const posts = await storage.getBlogPosts();
      res.json(posts);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      res.status(500).json({ message: "Failed to fetch blog posts" });
    }
  });

  app.post("/api/seo/blog", verifyJWT, requireRole(["seo", "admin"]), async (req: any, res) => {
    try {
      const { title, slug, excerpt, content, featured_image, meta_title, meta_description, tags, read_time, status } = req.body;
      const author_id = req.user.id;
      
      const post = await storage.createBlogPost({
        title,
        slug,
        excerpt,
        content,
        featuredImage: featured_image,
        authorId: author_id,
        metaTitle: meta_title,
        metaDescription: meta_description,
        tags,
        readTime: read_time,
        published: status === 'published',
        publishedAt: status === 'published' ? new Date() : null
      });
      
      res.status(201).json(post);
    } catch (error) {
      console.error("Error creating blog post:", error);
      res.status(500).json({ message: "Failed to create blog post" });
    }
  });

  app.put("/api/seo/blog/:id", verifyJWT, requireRole(["seo", "admin"]), async (req: any, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const post = await storage.updateBlogPost(parseInt(id), updates);
      res.json(post);
    } catch (error) {
      console.error("Error updating blog post:", error);
      res.status(500).json({ message: "Failed to update blog post" });
    }
  });

  app.delete("/api/seo/blog/:id", verifyJWT, requireRole(["seo", "admin"]), async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteBlogPost(parseInt(id));
      res.json({ message: "Blog post deleted successfully" });
    } catch (error) {
      console.error("Error deleting blog post:", error);
      res.status(500).json({ message: "Failed to delete blog post" });
    }
  });

  // Certifications Management
  app.get("/api/seo/certifications", verifyJWT, requireRole(["seo", "admin"]), async (req: any, res) => {
    try {
      const certifications = await storage.getCertifications();
      res.json(certifications);
    } catch (error) {
      console.error("Error fetching certifications:", error);
      res.status(500).json({ message: "Failed to fetch certifications" });
    }
  });

  app.post("/api/seo/certifications", verifyJWT, requireRole(["seo", "admin"]), async (req: any, res) => {
    try {
      const certification = await storage.createCertification(req.body);
      res.status(201).json(certification);
    } catch (error) {
      console.error("Error creating certification:", error);
      res.status(500).json({ message: "Failed to create certification" });
    }
  });

  app.put("/api/seo/certifications/:id", verifyJWT, requireRole(["seo", "admin"]), async (req: any, res) => {
    try {
      const { id } = req.params;
      const certification = await storage.updateCertification(parseInt(id), req.body);
      res.json(certification);
    } catch (error) {
      console.error("Error updating certification:", error);
      res.status(500).json({ message: "Failed to update certification" });
    }
  });

  app.delete("/api/seo/certifications/:id", verifyJWT, requireRole(["seo", "admin"]), async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteCertification(parseInt(id));
      res.json({ message: "Certification deleted successfully" });
    } catch (error) {
      console.error("Error deleting certification:", error);
      res.status(500).json({ message: "Failed to delete certification" });
    }
  });

  // Partnerships Management
  app.get("/api/seo/partnerships", verifyJWT, requireRole(["seo", "admin"]), async (req: any, res) => {
    try {
      const partnerships = await storage.getPartnerships();
      res.json(partnerships);
    } catch (error) {
      console.error("Error fetching partnerships:", error);
      res.status(500).json({ message: "Failed to fetch partnerships" });
    }
  });

  app.post("/api/seo/partnerships", verifyJWT, requireRole(["seo", "admin"]), async (req: any, res) => {
    try {
      const partnership = await storage.createPartnership(req.body);
      res.status(201).json(partnership);
    } catch (error) {
      console.error("Error creating partnership:", error);
      res.status(500).json({ message: "Failed to create partnership" });
    }
  });

  app.put("/api/seo/partnerships/:id", verifyJWT, requireRole(["seo", "admin"]), async (req: any, res) => {
    try {
      const { id } = req.params;
      const partnership = await storage.updatePartnership(parseInt(id), req.body);
      res.json(partnership);
    } catch (error) {
      console.error("Error updating partnership:", error);
      res.status(500).json({ message: "Failed to update partnership" });
    }
  });

  app.delete("/api/seo/partnerships/:id", verifyJWT, requireRole(["seo", "admin"]), async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deletePartnership(parseInt(id));
      res.json({ message: "Partnership deleted successfully" });
    } catch (error) {
      console.error("Error deleting partnership:", error);
      res.status(500).json({ message: "Failed to delete partnership" });
    }
  });

  // SEO Content Management
  app.get("/api/seo/content", verifyJWT, requireRole(["seo", "admin"]), async (req: any, res) => {
    try {
      const content = await storage.getSEOContent();
      res.json(content);
    } catch (error) {
      console.error("Error fetching SEO content:", error);
      res.status(500).json({ message: "Failed to fetch SEO content" });
    }
  });

  app.post("/api/seo/content", verifyJWT, requireRole(["seo", "admin"]), async (req: any, res) => {
    try {
      const { title, slug, content, meta_description, meta_keywords, status } = req.body;
      const author_id = req.user.id;
      
      const seoContent = await storage.createSEOContent({
        title,
        slug,
        content,
        metaDescription: meta_description,
        metaKeywords: meta_keywords,
        status,
        authorId: author_id,
        publishedAt: status === 'published' ? new Date() : null
      });
      
      res.status(201).json(seoContent);
    } catch (error) {
      console.error("Error creating SEO content:", error);
      res.status(500).json({ message: "Failed to create SEO content" });
    }
  });

  app.put("/api/seo/content/:id", verifyJWT, requireRole(["seo", "admin"]), async (req: any, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const content = await storage.updateSEOContent(parseInt(id), updates);
      res.json(content);
    } catch (error) {
      console.error("Error updating SEO content:", error);
      res.status(500).json({ message: "Failed to update SEO content" });
    }
  });

  app.delete("/api/seo/content/:id", verifyJWT, requireRole(["seo", "admin"]), async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteSEOContent(parseInt(id));
      res.json({ message: "SEO content deleted successfully" });
    } catch (error) {
      console.error("Error deleting SEO content:", error);
      res.status(500).json({ message: "Failed to delete SEO content" });
    }
  });

  // Contact Messages Management
  app.get("/api/seo/contact-messages", verifyJWT, requireRole(["seo", "admin"]), async (req: any, res) => {
    try {
      const messages = await storage.getContactSubmissions();
      res.json(messages);
    } catch (error) {
      console.error("Error fetching contact messages:", error);
      res.status(500).json({ message: "Failed to fetch contact messages" });
    }
  });

  app.put("/api/seo/contact-messages/:id", verifyJWT, requireRole(["seo", "admin"]), async (req: any, res) => {
    try {
      const { id } = req.params;
      const { responded } = req.body;
      
      const message = await storage.updateContactSubmission(parseInt(id), { responded });
      res.json(message);
    } catch (error) {
      console.error("Error updating contact message:", error);
      res.status(500).json({ message: "Failed to update contact message" });
    }
  });

  // ==================== SALES/BD PORTAL API ENDPOINTS ====================

  // Sales Dashboard
  app.get("/api/sales/dashboard", verifyJWT, requireRole(["salesmanager", "businessmanager", "admin"]), async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Get sales statistics
      const leads = await storage.getAllLeads();
      const opportunities = await storage.getAllOpportunities();
      const proposals = await storage.getAllProposals();
      const followUps = await storage.getAllFollowUps();
      
      // Calculate metrics
      const totalLeads = leads.length;
      const activeLeads = leads.filter(l => ['new', 'contacted', 'qualified'].includes(l.status)).length;
      const totalOpportunities = opportunities.length;
      const activeOpportunities = opportunities.filter(o => ['prospecting', 'qualification', 'proposal', 'negotiation'].includes(o.stage)).length;
      const totalProposals = proposals.length;
      const pendingProposals = proposals.filter(p => p.status === 'pending').length;
      const totalFollowUps = followUps.length;
      const overdueFollowUps = followUps.filter(f => new Date(f.scheduledDate) < new Date() && f.status === 'pending').length;
      
      // Calculate revenue metrics
      const totalPipelineValue = opportunities.reduce((sum, o) => sum + parseFloat(o.estimatedValue || '0'), 0);
      const totalProposalValue = proposals.reduce((sum, p) => sum + parseFloat(p.totalAmount || '0'), 0);
      
      // Get recent activities
      const recentLeads = leads.slice(0, 5);
      const recentOpportunities = opportunities.slice(0, 5);
      const recentProposals = proposals.slice(0, 5);
      
      const dashboardData = {
        stats: {
          totalLeads,
          activeLeads,
          totalOpportunities,
          activeOpportunities,
          totalProposals,
          pendingProposals,
          totalFollowUps,
          overdueFollowUps,
          totalPipelineValue,
          totalProposalValue
        },
        recentLeads,
        recentOpportunities,
        recentProposals
      };
      
      res.json(dashboardData);
    } catch (error) {
      console.error("Error fetching sales dashboard:", error);
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  // Lead Management
  app.get("/api/sales/leads", verifyJWT, requireRole(["salesmanager", "businessmanager", "admin"]), async (req: any, res) => {
    try {
      const { status, priority, source, assignedTo } = req.query;
      let leads = await storage.getAllLeads();
      
      // Apply filters
      if (status && status !== 'all') {
        leads = leads.filter(l => l.status === status);
      }
      if (priority && priority !== 'all') {
        leads = leads.filter(l => l.priority === priority);
      }
      if (source && source !== 'all') {
        leads = leads.filter(l => l.source === source);
      }
      if (assignedTo && assignedTo !== 'all') {
        leads = leads.filter(l => l.assignedTo === assignedTo);
      }
      
      res.json(leads);
    } catch (error) {
      console.error("Error fetching leads:", error);
      res.status(500).json({ message: "Failed to fetch leads" });
    }
  });

  app.post("/api/sales/leads", verifyJWT, requireRole(["salesmanager", "businessmanager", "admin"]), async (req: any, res) => {
    try {
      const leadData = req.body;
      const newLead = await storage.createLead(leadData);
      res.status(201).json(newLead);
    } catch (error) {
      console.error("Error creating lead:", error);
      res.status(500).json({ message: "Failed to create lead" });
    }
  });

  app.put("/api/sales/leads/:id", verifyJWT, requireRole(["salesmanager", "businessmanager", "admin"]), async (req: any, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const updatedLead = await storage.updateLead(parseInt(id), updates);
      res.json(updatedLead);
    } catch (error) {
      console.error("Error updating lead:", error);
      res.status(500).json({ message: "Failed to update lead" });
    }
  });

  app.delete("/api/sales/leads/:id", verifyJWT, requireRole(["salesmanager", "businessmanager", "admin"]), async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteLead(parseInt(id));
      res.json({ message: "Lead deleted successfully" });
    } catch (error) {
      console.error("Error deleting lead:", error);
      res.status(500).json({ message: "Failed to delete lead" });
    }
  });

  // Opportunity Management
  app.get("/api/sales/opportunities", verifyJWT, requireRole(["salesmanager", "businessmanager", "admin"]), async (req: any, res) => {
    try {
      const { stage, priority, assignedTo } = req.query;
      let opportunities = await storage.getAllOpportunities();
      
      // Apply filters
      if (stage && stage !== 'all') {
        opportunities = opportunities.filter(o => o.stage === stage);
      }
      if (priority && priority !== 'all') {
        opportunities = opportunities.filter(o => o.priority === priority);
      }
      if (assignedTo && assignedTo !== 'all') {
        opportunities = opportunities.filter(o => o.assignedTo === assignedTo);
      }
      
      res.json(opportunities);
    } catch (error) {
      console.error("Error fetching opportunities:", error);
      res.status(500).json({ message: "Failed to fetch opportunities" });
    }
  });

  app.post("/api/sales/opportunities", verifyJWT, requireRole(["salesmanager", "businessmanager", "admin"]), async (req: any, res) => {
    try {
      const opportunityData = req.body;
      const newOpportunity = await storage.createOpportunity(opportunityData);
      res.status(201).json(newOpportunity);
    } catch (error) {
      console.error("Error creating opportunity:", error);
      res.status(500).json({ message: "Failed to create opportunity" });
    }
  });

  app.put("/api/sales/opportunities/:id", verifyJWT, requireRole(["salesmanager", "businessmanager", "admin"]), async (req: any, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const updatedOpportunity = await storage.updateOpportunity(parseInt(id), updates);
      res.json(updatedOpportunity);
    } catch (error) {
      console.error("Error updating opportunity:", error);
      res.status(500).json({ message: "Failed to update opportunity" });
    }
  });

  app.delete("/api/sales/opportunities/:id", verifyJWT, requireRole(["salesmanager", "businessmanager", "admin"]), async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteOpportunity(parseInt(id));
      res.json({ message: "Opportunity deleted successfully" });
    } catch (error) {
      console.error("Error deleting opportunity:", error);
      res.status(500).json({ message: "Failed to delete opportunity" });
    }
  });

  // Proposal Management
  app.get("/api/sales/proposals", verifyJWT, requireRole(["salesmanager", "businessmanager", "admin"]), async (req: any, res) => {
    try {
      const { status, opportunityId } = req.query;
      let proposals = await storage.getAllProposals();
      
      // Apply filters
      if (status && status !== 'all') {
        proposals = proposals.filter(p => p.status === status);
      }
      if (opportunityId) {
        proposals = proposals.filter(p => p.opportunityId === parseInt(opportunityId));
      }
      
      res.json(proposals);
    } catch (error) {
      console.error("Error fetching proposals:", error);
      res.status(500).json({ message: "Failed to fetch proposals" });
    }
  });

  app.post("/api/sales/proposals", verifyJWT, requireRole(["salesmanager", "businessmanager", "admin"]), async (req: any, res) => {
    try {
      const proposalData = req.body;
      const newProposal = await storage.createProposal(proposalData);
      res.status(201).json(newProposal);
    } catch (error) {
      console.error("Error creating proposal:", error);
      res.status(500).json({ message: "Failed to create proposal" });
    }
  });

  app.put("/api/sales/proposals/:id", verifyJWT, requireRole(["salesmanager", "businessmanager", "admin"]), async (req: any, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const updatedProposal = await storage.updateProposal(parseInt(id), updates);
      res.json(updatedProposal);
    } catch (error) {
      console.error("Error updating proposal:", error);
      res.status(500).json({ message: "Failed to update proposal" });
    }
  });

  app.delete("/api/sales/proposals/:id", verifyJWT, requireRole(["salesmanager", "businessmanager", "admin"]), async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteProposal(parseInt(id));
      res.json({ message: "Proposal deleted successfully" });
    } catch (error) {
      console.error("Error deleting proposal:", error);
      res.status(500).json({ message: "Failed to delete proposal" });
    }
  });

  // Follow-up Management
  app.get("/api/sales/follow-ups", verifyJWT, requireRole(["salesmanager", "businessmanager", "admin"]), async (req: any, res) => {
    try {
      const { status, type, assignedTo } = req.query;
      let followUps = await storage.getAllFollowUps();
      
      // Apply filters
      if (status && status !== 'all') {
        followUps = followUps.filter(f => f.status === status);
      }
      if (type && type !== 'all') {
        followUps = followUps.filter(f => f.type === type);
      }
      if (assignedTo && assignedTo !== 'all') {
        followUps = followUps.filter(f => f.assignedTo === assignedTo);
      }
      
      res.json(followUps);
    } catch (error) {
      console.error("Error fetching follow-ups:", error);
      res.status(500).json({ message: "Failed to fetch follow-ups" });
    }
  });

  app.post("/api/sales/follow-ups", verifyJWT, requireRole(["salesmanager", "businessmanager", "admin"]), async (req: any, res) => {
    try {
      const followUpData = req.body;
      const newFollowUp = await storage.createFollowUp(followUpData);
      res.status(201).json(newFollowUp);
    } catch (error) {
      console.error("Error creating follow-up:", error);
      res.status(500).json({ message: "Failed to create follow-up" });
    }
  });

  app.put("/api/sales/follow-ups/:id", verifyJWT, requireRole(["salesmanager", "businessmanager", "admin"]), async (req: any, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const updatedFollowUp = await storage.updateFollowUp(parseInt(id), updates);
      res.json(updatedFollowUp);
    } catch (error) {
      console.error("Error updating follow-up:", error);
      res.status(500).json({ message: "Failed to update follow-up" });
    }
  });

  app.delete("/api/sales/follow-ups/:id", verifyJWT, requireRole(["salesmanager", "businessmanager", "admin"]), async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteFollowUp(parseInt(id));
      res.json({ message: "Follow-up deleted successfully" });
    } catch (error) {
      console.error("Error deleting follow-up:", error);
      res.status(500).json({ message: "Failed to delete follow-up" });
    }
  });

  // Sales Analytics
  app.get("/api/sales/analytics", verifyJWT, requireRole(["salesmanager", "businessmanager", "admin"]), async (req: any, res) => {
    try {
      const { timeRange = '30d' } = req.query;
      
      // Get all sales data
      const leads = await storage.getAllLeads();
      const opportunities = await storage.getAllOpportunities();
      const proposals = await storage.getAllProposals();
      const followUps = await storage.getAllFollowUps();
      
      // Calculate date range
      const now = new Date();
      const daysBack = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
      const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
      
      // Filter data by time range
      const recentLeads = leads.filter(l => l.createdAt && new Date(l.createdAt) >= startDate);
      const recentOpportunities = opportunities.filter(o => o.createdAt && new Date(o.createdAt) >= startDate);
      const recentProposals = proposals.filter(p => p.createdAt && new Date(p.createdAt) >= startDate);
      
      // Calculate metrics
      const totalPipelineValue = opportunities.reduce((sum, o) => sum + parseFloat(o.estimatedValue || '0'), 0);
      const totalProposalValue = proposals.reduce((sum, p) => sum + parseFloat(p.totalAmount || '0'), 0);
      const conversionRate = leads.length > 0 ? (opportunities.length / leads.length) * 100 : 0;
      const winRate = opportunities.length > 0 ? (proposals.filter(p => p.status === 'accepted').length / opportunities.length) * 100 : 0;
      
      // Lead source analysis
      const leadSources = leads.reduce((acc, lead) => {
        acc[lead.source] = (acc[lead.source] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      // Opportunity stage analysis
      const opportunityStages = opportunities.reduce((acc, opp) => {
        acc[opp.stage] = (acc[opp.stage] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const analyticsData = {
        metrics: {
          totalLeads: leads.length,
          totalOpportunities: opportunities.length,
          totalProposals: proposals.length,
          totalPipelineValue,
          totalProposalValue,
          conversionRate,
          winRate
        },
        leadSources,
        opportunityStages,
        chartData: {
          months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          leads: [12, 15, 18, 14, 20, recentLeads.length],
          opportunities: [8, 10, 12, 9, 14, recentOpportunities.length],
          proposals: [5, 7, 9, 6, 11, recentProposals.length]
        }
      };
      
      res.json(analyticsData);
    } catch (error) {
      console.error("Error fetching sales analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics data" });
    }
  });

  // Sales Analytics - Metrics endpoint
  app.get("/api/sales/analytics/metrics", verifyJWT, requireRole(["salesmanager", "businessmanager", "admin"]), async (req: any, res) => {
    try {
      const { range = '30d' } = req.query;
      
      const leads = await storage.getAllLeads();
      const opportunities = await storage.getAllOpportunities();
      const proposals = await storage.getAllProposals();
      
      const totalPipelineValue = opportunities.reduce((sum, opp) => sum + parseFloat(opp.estimatedValue || '0'), 0);
      const conversionRate = leads.length > 0 ? (opportunities.length / leads.length) * 100 : 0;
      const winRate = opportunities.length > 0 ? (opportunities.filter(opp => opp.stage === 'closed_won').length / opportunities.length) * 100 : 0;
      
      const metrics = {
        totalLeads: leads.length,
        totalOpportunities: opportunities.length,
        totalProposals: proposals.length,
        totalPipelineValue,
        conversionRate,
        winRate,
        averageDealSize: opportunities.length > 0 ? totalPipelineValue / opportunities.length : 0
      };
      
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching analytics metrics:", error);
      res.status(500).json({ message: "Failed to fetch analytics metrics" });
    }
  });

  // Sales Analytics - Performance endpoint
  app.get("/api/sales/analytics/performance", verifyJWT, requireRole(["salesmanager", "businessmanager", "admin"]), async (req: any, res) => {
    try {
      const { range = '30d' } = req.query;
      
      const opportunities = await storage.getAllOpportunities();
      const leads = await storage.getAllLeads();
      
      const performanceData = {
        conversionRate: leads.length > 0 ? (opportunities.length / leads.length) * 100 : 0,
        winRate: opportunities.length > 0 ? (opportunities.filter(opp => opp.stage === 'closed_won').length / opportunities.length) * 100 : 0,
        averageSalesCycle: 45, // Placeholder
        topPerformingReps: [],
        stageConversion: {}
      };
      
      res.json(performanceData);
    } catch (error) {
      console.error("Error fetching performance data:", error);
      res.status(500).json({ message: "Failed to fetch performance data" });
    }
  });

  // Sales Analytics - Pipeline endpoint
  app.get("/api/sales/analytics/pipeline", verifyJWT, requireRole(["salesmanager", "businessmanager", "admin"]), async (req: any, res) => {
    try {
      const { range = '30d' } = req.query;
      
      const opportunities = await storage.getAllOpportunities();
      
      const pipelineData = {
        totalValue: opportunities.reduce((sum, opp) => sum + parseFloat(opp.estimatedValue || '0'), 0),
        stageBreakdown: opportunities.reduce((acc, opp) => {
          acc[opp.stage] = (acc[opp.stage] || 0) + parseFloat(opp.estimatedValue || '0');
          return acc;
        }, {} as Record<string, number>),
        velocity: 0,
        forecast: []
      };
      
      res.json(pipelineData);
    } catch (error) {
      console.error("Error fetching pipeline data:", error);
      res.status(500).json({ message: "Failed to fetch pipeline data" });
    }
  });

  // Sales Analytics - Time Series endpoint
  app.get("/api/sales/analytics/timeseries", verifyJWT, requireRole(["salesmanager", "businessmanager", "admin"]), async (req: any, res) => {
    try {
      const { range = '30d' } = req.query;
      
      const timeSeriesData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          {
            label: 'Leads',
            data: [12, 15, 18, 14, 20, 16],
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)'
          },
          {
            label: 'Opportunities',
            data: [8, 10, 12, 9, 14, 11],
            borderColor: 'rgb(34, 197, 94)',
            backgroundColor: 'rgba(34, 197, 94, 0.1)'
          },
          {
            label: 'Revenue',
            data: [15000, 22000, 28000, 19000, 32000, 25000],
            borderColor: 'rgb(168, 85, 247)',
            backgroundColor: 'rgba(168, 85, 247, 0.1)'
          }
        ]
      };
      
      res.json(timeSeriesData);
    } catch (error) {
      console.error("Error fetching time series data:", error);
      res.status(500).json({ message: "Failed to fetch time series data" });
    }
  });

  // Sales Analytics - Sources endpoint
  app.get("/api/sales/analytics/sources", verifyJWT, requireRole(["salesmanager", "businessmanager", "admin"]), async (req: any, res) => {
    try {
      const { range = '30d' } = req.query;
      
      const leads = await storage.getAllLeads();
      
      const sourceData = leads.reduce((acc, lead) => {
        acc[lead.source] = (acc[lead.source] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      res.json(sourceData);
    } catch (error) {
      console.error("Error fetching source data:", error);
      res.status(500).json({ message: "Failed to fetch source data" });
    }
  });

  // Business Development
  app.get("/api/sales/business-development", verifyJWT, requireRole(["salesmanager", "businessmanager", "admin"]), async (req: any, res) => {
    try {
      const opportunities = await storage.getAllBusinessDevelopmentOpportunities();
      res.json(opportunities);
    } catch (error) {
      console.error("Error fetching business development opportunities:", error);
      res.status(500).json({ message: "Failed to fetch business development opportunities" });
    }
  });

  // Business Development - Opportunities endpoint
  app.get("/api/sales/business-development/opportunities", verifyJWT, requireRole(["salesmanager", "businessmanager", "admin"]), async (req: any, res) => {
    try {
      const opportunities = await storage.getAllBusinessDevelopmentOpportunities();
      res.json(opportunities);
    } catch (error) {
      console.error("Error fetching business development opportunities:", error);
      res.status(500).json({ message: "Failed to fetch business development opportunities" });
    }
  });

  // Business Development - Partnerships endpoint
  app.get("/api/sales/business-development/partnerships", verifyJWT, requireRole(["salesmanager", "businessmanager", "admin"]), async (req: any, res) => {
    try {
      // For now, return empty array since we don't have separate partnerships data
      res.json([]);
    } catch (error) {
      console.error("Error fetching partnerships:", error);
      res.status(500).json({ message: "Failed to fetch partnerships" });
    }
  });

  // Business Development - Insights endpoint
  app.get("/api/sales/business-development/insights", verifyJWT, requireRole(["salesmanager", "businessmanager", "admin"]), async (req: any, res) => {
    try {
      const opportunities = await storage.getAllBusinessDevelopmentOpportunities();
      const totalOpportunities = opportunities.length;
      const activePartnerships = opportunities.filter(opp => opp.status === 'active').length;
      const pipelineValue = opportunities.reduce((sum, opp) => sum + (opp.estimatedValue || 0), 0);
      const conversionRate = opportunities.length > 0 ? (opportunities.filter(opp => opp.status === 'closed_won').length / opportunities.length) * 100 : 0;
      
      const insights = {
        totalOpportunities,
        activePartnerships,
        pipelineValue,
        conversionRate,
        topPerformingTypes: [],
        recentActivities: []
      };
      
      res.json(insights);
    } catch (error) {
      console.error("Error fetching business development insights:", error);
      res.status(500).json({ message: "Failed to fetch business development insights" });
    }
  });

  app.post("/api/sales/business-development", verifyJWT, requireRole(["salesmanager", "businessmanager", "admin"]), async (req: any, res) => {
    try {
      const opportunityData = req.body;
      const newOpportunity = await storage.createBusinessDevelopmentOpportunity(opportunityData);
      res.status(201).json(newOpportunity);
    } catch (error) {
      console.error("Error creating business development opportunity:", error);
      res.status(500).json({ message: "Failed to create business development opportunity" });
    }
  });

  app.put("/api/sales/business-development/:id", verifyJWT, requireRole(["salesmanager", "businessmanager", "admin"]), async (req: any, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const updatedOpportunity = await storage.updateBusinessDevelopmentOpportunity(parseInt(id), updates);
      res.json(updatedOpportunity);
    } catch (error) {
      console.error("Error updating business development opportunity:", error);
      res.status(500).json({ message: "Failed to update business development opportunity" });
    }
  });

  app.delete("/api/sales/business-development/:id", verifyJWT, requireRole(["salesmanager", "businessmanager", "admin"]), async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteBusinessDevelopmentOpportunity(parseInt(id));
      res.json({ message: "Business development opportunity deleted successfully" });
    } catch (error) {
      console.error("Error deleting business development opportunity:", error);
      res.status(500).json({ message: "Failed to delete business development opportunity" });
    }
  });

  // Sales Targets
  app.get("/api/sales/targets", verifyJWT, requireRole(["salesmanager", "businessmanager", "admin"]), async (req: any, res) => {
    try {
      const targets = await storage.getAllSalesTargets();
      res.json(targets);
    } catch (error) {
      console.error("Error fetching sales targets:", error);
      res.status(500).json({ message: "Failed to fetch sales targets" });
    }
  });

  app.post("/api/sales/targets", verifyJWT, requireRole(["salesmanager", "businessmanager", "admin"]), async (req: any, res) => {
    try {
      const targetData = req.body;
      const newTarget = await storage.createSalesTarget(targetData);
      res.status(201).json(newTarget);
    } catch (error) {
      console.error("Error creating sales target:", error);
      res.status(500).json({ message: "Failed to create sales target" });
    }
  });

  app.put("/api/sales/targets/:id", verifyJWT, requireRole(["salesmanager", "businessmanager", "admin"]), async (req: any, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const updatedTarget = await storage.updateSalesTarget(parseInt(id), updates);
      res.json(updatedTarget);
    } catch (error) {
      console.error("Error updating sales target:", error);
      res.status(500).json({ message: "Failed to update sales target" });
    }
  });

  app.delete("/api/sales/targets/:id", verifyJWT, requireRole(["salesmanager", "businessmanager", "admin"]), async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteSalesTarget(parseInt(id));
      res.json({ message: "Sales target deleted successfully" });
    } catch (error) {
      console.error("Error deleting sales target:", error);
      res.status(500).json({ message: "Failed to delete sales target" });
    }
  });

  // Communication Logs
  app.get("/api/sales/communication-logs", verifyJWT, requireRole(["salesmanager", "businessmanager", "admin"]), async (req: any, res) => {
    try {
      const { entityType, entityId } = req.query;
      let logs = await storage.getAllCommunicationLogs();
      
      // Apply filters
      if (entityType) {
        logs = logs.filter(l => l.entityType === entityType);
      }
      if (entityId) {
        logs = logs.filter(l => l.entityId === parseInt(entityId));
      }
      
      res.json(logs);
    } catch (error) {
      console.error("Error fetching communication logs:", error);
      res.status(500).json({ message: "Failed to fetch communication logs" });
    }
  });

  app.post("/api/sales/communication-logs", verifyJWT, requireRole(["salesmanager", "businessmanager", "admin"]), async (req: any, res) => {
    try {
      const logData = req.body;
      const newLog = await storage.createCommunicationLog(logData);
      res.status(201).json(newLog);
    } catch (error) {
      console.error("Error creating communication log:", error);
      res.status(500).json({ message: "Failed to create communication log" });
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
            // Store message in database
            try {
              // Determine recipient for direct messages
              let recipientId = null;
              if (!message.projectId && message.conversationId) {
                const parts = message.conversationId.split('-');
                if (parts.length >= 2) {
                  recipientId = parts.slice(1).join('-');
                }
              }

              const newMessage = await storage.createChatMessage({
                projectId: message.projectId || null,
                senderId: message.senderId,
                recipientId: recipientId,
                message: message.content,
                messageType: message.messageType || 'text',
                attachments: message.attachments,
                isRead: false
              });

              // Create notifications for relevant users
              await createChatNotifications(message.senderId, newMessage, message.projectId);

              // Broadcast to all connections
              const messageData = {
                type: "new_message",
                message: newMessage,
                timestamp: new Date().toISOString(),
              };

              connections.forEach((clientWs) => {
                if (clientWs.readyState === WebSocket.OPEN) {
                  clientWs.send(JSON.stringify(messageData));
                }
              });
            } catch (error) {
              console.error("Error storing message:", error);
            }
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