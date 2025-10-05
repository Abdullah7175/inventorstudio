import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import jwt from 'jsonwebtoken';
import { storage } from "./storage";
import { setupAuth, verifyJWT, requireRole, verifyApiSecurityToken } from "./auth";
import { generateDesignRecommendations, analyzeProjectHealth, generateCommunicationContent } from "./ai";
import bcrypt from "bcryptjs";

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

      // Verify project exists
      const project = await storage.getClientProjectById(parseInt(projectId));
      if (!project) {
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