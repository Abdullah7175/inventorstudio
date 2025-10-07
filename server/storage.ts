import {
  users,
  services,
  portfolioProjects,
  blogPosts,
  clientProjects,
  contactSubmissions,
  faqItems,
  certifications,
  partnerships,
  otpCodes,
  mobileSessions,
  mobileBiometricSettings,
  tokenBlacklist,
  projectRequests,
  invoices,
  notifications,
  chatMessages,
  projectMessages,
  projectAssignments,
  projectTasks,
  teamMembers,
  teamRoles,
  type User,
  type UpsertUser,
  type Service,
  type InsertService,
  type PortfolioProject,
  type InsertPortfolioProject,
  type BlogPost,
  type InsertBlogPost,
  type ClientProject,
  type InsertClientProject,
  type ContactSubmission,
  type InsertContactSubmission,
  type FaqItem,
  type InsertFaqItem,
  type Certification,
  type InsertCertification,
  type Partnership,
  type InsertPartnership,
  type OtpCode,
  type InsertOtpCode,
  type MobileSession,
  type InsertMobileSession,
  type MobileBiometricSettings,
  type InsertMobileBiometricSettings,
  type TokenBlacklist,
  type InsertTokenBlacklist,
  type ChatMessage,
  type InsertChatMessage,
  seoContent,
  type InsertSEOContent,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, lt, inArray, gt, asc, isNull } from "drizzle-orm";

export interface IStorage {
  // User operations - mandatory for Firebase Auth
  getUser(id: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: UpsertUser): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  updateUserRole(id: string, role: string): Promise<User>;

  // Services
  getServices(): Promise<Service[]>;
  getFeaturedServices(): Promise<Service[]>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: number, service: Partial<InsertService>): Promise<Service>;
  deleteService(id: number): Promise<void>;

  // Portfolio
  getPortfolioProjects(category?: string): Promise<PortfolioProject[]>;
  getFeaturedProjects(): Promise<PortfolioProject[]>;
  getProjectById(id: number): Promise<PortfolioProject | undefined>;
  createProject(project: InsertPortfolioProject): Promise<PortfolioProject>;
  updateProject(id: number, project: Partial<InsertPortfolioProject>): Promise<PortfolioProject>;
  deleteProject(id: number): Promise<void>;

  // Blog
  getBlogPosts(published?: boolean): Promise<BlogPost[]>;
  getBlogPostBySlug(slug: string): Promise<BlogPost | undefined>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: number, post: Partial<InsertBlogPost>): Promise<BlogPost>;
  deleteBlogPost(id: number): Promise<void>;

  // Client Projects
  getClientProjects(clientId: string): Promise<ClientProject[]>;
  getClientProjectById(id: number): Promise<ClientProject | undefined>;
  createClientProject(project: InsertClientProject): Promise<ClientProject>;
  updateClientProject(id: number, project: Partial<InsertClientProject>): Promise<ClientProject>;
  deleteClientProject(id: number): Promise<void>;
  getAllClientProjects(): Promise<ClientProject[]>;

  // Contact
  createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission>;
  getContactSubmissions(): Promise<ContactSubmission[]>;
  markContactSubmissionResponded(id: number): Promise<void>;
  deleteContactSubmission(id: number): Promise<void>;

  // FAQ
  getFaqItems(): Promise<FaqItem[]>;
  createFaqItem(item: InsertFaqItem): Promise<FaqItem>;
  updateFaqItem(id: number, item: Partial<InsertFaqItem>): Promise<FaqItem>;
  deleteFaqItem(id: number): Promise<void>;

  // OTP operations
  createOtpCode(otpData: InsertOtpCode): Promise<OtpCode>;
  getOtpCode(userId: string, code: string): Promise<OtpCode | undefined>;
  invalidateOtpCode(id: number): Promise<void>;
  cleanupExpiredOtpCodes(): Promise<void>;

  // Mobile session operations
  createMobileSession(sessionData: InsertMobileSession): Promise<MobileSession>;
  getMobileSession(userId: string, deviceToken: string): Promise<MobileSession | undefined>;
  updateMobileSession(userId: string, deviceToken: string, updates: Partial<MobileSession>): Promise<MobileSession>;
  deactivateMobileSession(userId: string, deviceToken: string): Promise<void>;
  getActiveMobileSessions(userId: string): Promise<MobileSession[]>;

  // Mobile biometric settings operations
  createBiometricSettings(settingsData: InsertMobileBiometricSettings): Promise<MobileBiometricSettings>;
  getBiometricSettings(userId: string, deviceToken: string): Promise<MobileBiometricSettings | undefined>;
  updateBiometricSettings(userId: string, deviceToken: string, updates: Partial<MobileBiometricSettings>): Promise<MobileBiometricSettings>;
  deleteBiometricSettings(userId: string, deviceToken: string): Promise<void>;

  // Token blacklist operations
  addTokenToBlacklist(tokenHash: string, userId?: string, reason?: string, expiresAt?: Date): Promise<TokenBlacklist>;
  isTokenBlacklisted(tokenHash: string): Promise<boolean>;
  cleanupExpiredTokens(): Promise<void>;

  // Chat Messages
  getChatMessages(projectId?: number, conversationId?: string, userId?: string): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  markChatMessageAsRead(messageId: number): Promise<void>;
  getUnreadChatMessagesCount(userId: string, projectId?: number): Promise<number>;
  getChatConversations(userId: string, projectId?: number): Promise<any[]>;

  // Notifications
  createNotification(notification: any): Promise<any>;
  getNotifications(userId: string): Promise<any[]>;
  markNotificationAsRead(notificationId: number): Promise<void>;
  markAllNotificationsAsRead(userId: string): Promise<void>;

  // SEO Content Management
  getSEOContent(): Promise<any[]>;
  createSEOContent(content: any): Promise<any>;
  updateSEOContent(id: number, updates: any): Promise<any>;
  deleteSEOContent(id: number): Promise<void>;

  // Certifications Management
  getCertifications(): Promise<Certification[]>;
  createCertification(certification: InsertCertification): Promise<Certification>;
  updateCertification(id: number, certification: Partial<InsertCertification>): Promise<Certification>;
  deleteCertification(id: number): Promise<void>;

  // Partnerships Management
  getPartnerships(): Promise<Partnership[]>;
  createPartnership(partnership: InsertPartnership): Promise<Partnership>;
  updatePartnership(id: number, partnership: Partial<InsertPartnership>): Promise<Partnership>;
  deletePartnership(id: number): Promise<void>;

  // FAQ Management
  moveFAQItem(id: number, direction: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations - mandatory for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }


  async createUser(userData: UpsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserRole(id: string, role: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Admin-specific methods
  async getAllUsers(): Promise<User[]> {
    try {
      return await db.select().from(users);
    } catch (error) {
      console.error('Error fetching all users:', error);
      return [];
    }
  }

  async getAllProjects(): Promise<any[]> {
    try {
      return await db.select().from(projectRequests);
    } catch (error) {
      console.error('Error fetching all projects:', error);
      return [];
    }
  }

  async createProjectRequest(projectData: any): Promise<any> {
    try {
      const [newProject] = await db.insert(projectRequests).values(projectData).returning();
      return newProject;
    } catch (error) {
      console.error('Error creating project request:', error);
      throw error;
    }
  }

  async getAllInvoices(): Promise<any[]> {
    try {
      return await db.select().from(invoices);
    } catch (error) {
      console.error('Error fetching all invoices:', error);
      return [];
    }
  }

  async getAllNotifications(): Promise<any[]> {
    try {
      return await db.select().from(notifications);
    } catch (error) {
      console.error('Error fetching all notifications:', error);
      return [];
    }
  }

  async getAllProjectMessages(): Promise<any[]> {
    try {
      return await db.select().from(projectMessages);
    } catch (error) {
      console.error('Error fetching all project messages:', error);
      return [];
    }
  }

  async getRecentActivities(limit: number = 10): Promise<any[]> {
    try {
      // Get recent activities from various sources
      const recentProjects = await db.select().from(projectRequests).orderBy(desc(projectRequests.createdAt)).limit(limit);
      const recentUsers = await db.select().from(users).orderBy(desc(users.createdAt)).limit(limit);
      const recentInvoices = await db.select().from(invoices).orderBy(desc(invoices.createdAt)).limit(limit);
      
      const activities = [
        ...recentProjects.map(p => ({
          id: `project_${p.id}`,
          type: 'project_completed',
          description: `Project "${p.projectName}" completed`,
          customer: 'Unknown', // Will be enriched by API
          timestamp: p.updatedAt || p.createdAt,
          value: 0
        })),
        ...recentUsers.map(u => ({
          id: `user_${u.id}`,
          type: 'new_customer',
          description: 'New customer registered',
          customer: `${u.firstName} ${u.lastName}`,
          timestamp: u.createdAt,
          value: 0
        })),
        ...recentInvoices.map(inv => ({
          id: `invoice_${inv.id}`,
          type: 'payment_received',
          description: 'Payment received',
          customer: 'Unknown', // Will be enriched by API
          timestamp: inv.paidAt || inv.createdAt,
          value: parseFloat(inv.total || '0')
        }))
      ];

      return activities
        .sort((a, b) => {
          const dateA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
          const dateB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
          return dateB - dateA;
        })
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      return [];
    }
  }

  async getInvoicesByClientId(clientId: string): Promise<any[]> {
    try {
      return await db.select().from(invoices).where(eq(invoices.clientId, clientId));
    } catch (error) {
      console.error('Error fetching invoices by client ID:', error);
      return [];
    }
  }

  async getProjectsByTeamMember(teamMemberId: string): Promise<any[]> {
    try {
      // Get projects assigned to team member
      const assignments = await db.select().from(projectAssignments).where(eq(projectAssignments.teamMemberId, teamMemberId));
      const projectIds = assignments.map(a => a.projectId);
      
      if (projectIds.length === 0) return [];
      
      return await db.select().from(projectRequests).where(inArray(projectRequests.id, projectIds));
    } catch (error) {
      console.error('Error fetching projects by team member:', error);
      return [];
    }
  }

  async assignProjectToTeamMember(projectId: number, teamMemberId: string, role: string): Promise<any> {
    try {
      const [assignment] = await db.insert(projectAssignments).values({
        projectId,
        teamMemberId,
        role,
        assignedAt: new Date()
      }).returning();
      return assignment;
    } catch (error) {
      console.error('Error assigning project to team member:', error);
      throw error;
    }
  }

  async removeProjectAssignment(projectId: number, teamMemberId: string): Promise<void> {
    try {
      await db.delete(projectAssignments).where(
        and(
          eq(projectAssignments.projectId, projectId),
          eq(projectAssignments.teamMemberId, teamMemberId)
        )
      );
    } catch (error) {
      console.error('Error removing project assignment:', error);
      throw error;
    }
  }

  async getProjectAssignments(projectId: number): Promise<any[]> {
    try {
      return await db.select().from(projectAssignments).where(eq(projectAssignments.projectId, projectId));
    } catch (error) {
      console.error('Error fetching project assignments:', error);
      return [];
    }
  }

  async getProjectTasks(projectId: number): Promise<any[]> {
    try {
      return await db.select().from(projectTasks).where(eq(projectTasks.projectId, projectId));
    } catch (error) {
      console.error('Error fetching project tasks:', error);
      return [];
    }
  }

  async getProjectMessages(projectId: number): Promise<any[]> {
    try {
      return await db.select().from(projectMessages).where(eq(projectMessages.projectId, projectId));
    } catch (error) {
      console.error('Error fetching project messages:', error);
      return [];
    }
  }

  async updateClientProject(projectId: number, updates: any): Promise<any> {
    try {
      const [updatedProject] = await db.update(projectRequests)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(projectRequests.id, projectId))
        .returning();
      return updatedProject;
    } catch (error) {
      console.error('Error updating client project:', error);
      throw error;
    }
  }

  // Team Member Management
  async getAllTeamRoles(): Promise<any[]> {
    try {
      return await db.select().from(teamRoles).orderBy(teamRoles.id);
    } catch (error) {
      console.error('Error fetching team roles:', error);
      return [];
    }
  }

  async getTeamRoleById(roleId: number): Promise<any> {
    try {
      const [role] = await db.select().from(teamRoles).where(eq(teamRoles.id, roleId));
      return role;
    } catch (error) {
      console.error('Error fetching team role:', error);
      return null;
    }
  }

  async createTeamMember(userId: string, name: string, roleId: number, skills?: string[]): Promise<any> {
    try {
      const role = await this.getTeamRoleById(roleId);
      if (!role) {
        throw new Error('Team role not found');
      }

      const [teamMember] = await db.insert(teamMembers).values({
        userId,
        name,
        role: role.name,
        skills: skills || [],
        isActive: true,
        createdAt: new Date()
      }).returning();

      // Update user role to 'team' and set department
      await this.updateUser(userId, {
        role: 'team',
        department: role.name.toLowerCase().replace(/\s+/g, '_')
      });

      return teamMember;
    } catch (error) {
      console.error('Error creating team member:', error);
      throw error;
    }
  }

  async getAllTeamMembers(): Promise<any[]> {
    try {
      const members = await db.select().from(teamMembers);
      
      // Enrich with user data
      const enrichedMembers = await Promise.all(
        members.map(async (member) => {
          const user = await this.getUser(member.userId);
          const role = await this.getTeamRoleById(
            (await db.select().from(teamRoles).where(eq(teamRoles.name, member.role)))[0]?.id
          );
          
          return {
            ...member,
            user,
            roleDetails: role
          };
        })
      );

      return enrichedMembers;
    } catch (error) {
      console.error('Error fetching team members:', error);
      return [];
    }
  }

  async getTeamMemberByUserId(userId: string): Promise<any> {
    try {
      const [member] = await db.select().from(teamMembers).where(eq(teamMembers.userId, userId));
      if (!member) return null;

      const user = await this.getUser(userId);
      const role = await db.select().from(teamRoles).where(eq(teamRoles.name, member.role));
      
      return {
        ...member,
        user,
        roleDetails: role[0]
      };
    } catch (error) {
      console.error('Error fetching team member:', error);
      return null;
    }
  }

  async updateTeamMember(userId: string, updates: any): Promise<any> {
    try {
      const [updatedMember] = await db.update(teamMembers)
        .set(updates)
        .where(eq(teamMembers.userId, userId))
        .returning();
      return updatedMember;
    } catch (error) {
      console.error('Error updating team member:', error);
      throw error;
    }
  }

  async deactivateTeamMember(userId: string): Promise<void> {
    try {
      await db.update(teamMembers)
        .set({ isActive: false })
        .where(eq(teamMembers.userId, userId));
      
      // Also update user to inactive
      await this.updateUser(userId, { isActive: false });
    } catch (error) {
      console.error('Error deactivating team member:', error);
      throw error;
    }
  }

  // Services
  async getServices(): Promise<Service[]> {
    return await db.select().from(services).orderBy(services.id);
  }

  async getFeaturedServices(): Promise<Service[]> {
    return await db.select().from(services).where(eq(services.featured, true));
  }

  async createService(service: InsertService): Promise<Service> {
    const [newService] = await db.insert(services).values(service).returning();
    return newService;
  }

  async updateService(id: number, service: Partial<InsertService>): Promise<Service> {
    const [updatedService] = await db
      .update(services)
      .set(service)
      .where(eq(services.id, id))
      .returning();
    return updatedService;
  }

  async deleteService(id: number): Promise<void> {
    await db.delete(services).where(eq(services.id, id));
  }

  // Portfolio
  async getPortfolioProjects(category?: string): Promise<PortfolioProject[]> {
    const query = db.select().from(portfolioProjects);
    if (category && category !== "all") {
      return await query.where(eq(portfolioProjects.category, category)).orderBy(desc(portfolioProjects.createdAt));
    }
    return await query.orderBy(desc(portfolioProjects.createdAt));
  }

  async getFeaturedProjects(): Promise<PortfolioProject[]> {
    return await db
      .select()
      .from(portfolioProjects)
      .where(eq(portfolioProjects.featured, true))
      .orderBy(desc(portfolioProjects.createdAt));
  }

  async getProjectById(id: number): Promise<PortfolioProject | undefined> {
    const [project] = await db.select().from(portfolioProjects).where(eq(portfolioProjects.id, id));
    return project;
  }

  async createProject(project: InsertPortfolioProject): Promise<PortfolioProject> {
    const [newProject] = await db.insert(portfolioProjects).values(project).returning();
    return newProject;
  }

  async updateProject(id: number, project: Partial<InsertPortfolioProject>): Promise<PortfolioProject> {
    const [updatedProject] = await db
      .update(portfolioProjects)
      .set(project)
      .where(eq(portfolioProjects.id, id))
      .returning();
    return updatedProject;
  }

  async deleteProject(id: number): Promise<void> {
    await db.delete(portfolioProjects).where(eq(portfolioProjects.id, id));
  }

  // Blog
  async getBlogPosts(published?: boolean): Promise<BlogPost[]> {
    const query = db.select().from(blogPosts);
    if (published !== undefined) {
      return await query.where(eq(blogPosts.published, published)).orderBy(desc(blogPosts.publishedAt));
    }
    return await query.orderBy(desc(blogPosts.createdAt));
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug));
    return post;
  }

  async createBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    const [newPost] = await db.insert(blogPosts).values(post).returning();
    return newPost;
  }

  async updateBlogPost(id: number, post: Partial<InsertBlogPost>): Promise<BlogPost> {
    const [updatedPost] = await db
      .update(blogPosts)
      .set({ ...post, updatedAt: new Date() })
      .where(eq(blogPosts.id, id))
      .returning();
    return updatedPost;
  }

  async deleteBlogPost(id: number): Promise<void> {
    await db.delete(blogPosts).where(eq(blogPosts.id, id));
  }

  // Client Projects
  async getClientProjects(clientId: string): Promise<ClientProject[]> {
    return await db
      .select()
      .from(clientProjects)
      .where(eq(clientProjects.clientId, clientId))
      .orderBy(desc(clientProjects.updatedAt));
  }

  async getClientProjectById(id: number): Promise<ClientProject | undefined> {
    const [project] = await db.select().from(clientProjects).where(eq(clientProjects.id, id));
    return project;
  }

  async createClientProject(project: InsertClientProject): Promise<ClientProject> {
    const [newProject] = await db.insert(clientProjects).values(project).returning();
    return newProject;
  }


  async deleteClientProject(id: number): Promise<void> {
    await db.delete(clientProjects).where(eq(clientProjects.id, id));
  }

  async getAllClientProjects(): Promise<ClientProject[]> {
    return await db.select().from(clientProjects).orderBy(desc(clientProjects.updatedAt));
  }

  // Contact
  async createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission> {
    const [newSubmission] = await db.insert(contactSubmissions).values(submission).returning();
    return newSubmission;
  }

  async getContactSubmissions(): Promise<ContactSubmission[]> {
    return await db.select().from(contactSubmissions).orderBy(desc(contactSubmissions.createdAt));
  }

  async markContactSubmissionResponded(id: number): Promise<void> {
    await db.update(contactSubmissions).set({ responded: true }).where(eq(contactSubmissions.id, id));
  }

  async deleteContactSubmission(id: number): Promise<void> {
    await db.delete(contactSubmissions).where(eq(contactSubmissions.id, id));
  }

  // FAQ
  async getFaqItems(): Promise<FaqItem[]> {
    return await db.select().from(faqItems).orderBy(faqItems.order);
  }

  async createFaqItem(item: InsertFaqItem): Promise<FaqItem> {
    const [newItem] = await db.insert(faqItems).values(item).returning();
    return newItem;
  }

  async updateFaqItem(id: number, item: Partial<InsertFaqItem>): Promise<FaqItem> {
    const [updatedItem] = await db.update(faqItems).set(item).where(eq(faqItems.id, id)).returning();
    return updatedItem;
  }

  async deleteFaqItem(id: number): Promise<void> {
    await db.delete(faqItems).where(eq(faqItems.id, id));
  }

  // Certifications
  async getCertifications(): Promise<Certification[]> {
    return await db.select().from(certifications).orderBy(certifications.order, certifications.createdAt);
  }

  async getCertificationById(id: number): Promise<Certification | undefined> {
    const [cert] = await db.select().from(certifications).where(eq(certifications.id, id));
    return cert;
  }

  async createCertification(certification: InsertCertification): Promise<Certification> {
    const [newCert] = await db.insert(certifications).values(certification).returning();
    return newCert;
  }

  async updateCertification(id: number, certification: Partial<InsertCertification>): Promise<Certification> {
    const [updatedCert] = await db
      .update(certifications)
      .set({ ...certification, updatedAt: new Date() })
      .where(eq(certifications.id, id))
      .returning();
    return updatedCert;
  }

  async deleteCertification(id: number): Promise<void> {
    await db.delete(certifications).where(eq(certifications.id, id));
  }

  // Partnerships
  async getPartnerships(): Promise<Partnership[]> {
    return await db.select().from(partnerships).where(eq(partnerships.status, "active")).orderBy(partnerships.order, partnerships.createdAt);
  }

  async getPartnershipById(id: number): Promise<Partnership | undefined> {
    const [partnership] = await db.select().from(partnerships).where(eq(partnerships.id, id));
    return partnership;
  }

  async createPartnership(partnership: InsertPartnership): Promise<Partnership> {
    const [newPartnership] = await db.insert(partnerships).values(partnership).returning();
    return newPartnership;
  }

  async updatePartnership(id: number, partnership: Partial<InsertPartnership>): Promise<Partnership> {
    const [updatedPartnership] = await db
      .update(partnerships)
      .set({ ...partnership, updatedAt: new Date() })
      .where(eq(partnerships.id, id))
      .returning();
    return updatedPartnership;
  }

  async deletePartnership(id: number): Promise<void> {
    await db.delete(partnerships).where(eq(partnerships.id, id));
  }

  // Admin user management removed for security

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  // OTP operations
  async createOtpCode(otpData: InsertOtpCode): Promise<OtpCode> {
    const [otpCode] = await db.insert(otpCodes).values(otpData).returning();
    return otpCode;
  }

  async getOtpCode(userId: string, code: string): Promise<OtpCode | undefined> {
    const [otpCode] = await db
      .select()
      .from(otpCodes)
      .where(and(
        eq(otpCodes.userId, userId),
        eq(otpCodes.code, code),
        eq(otpCodes.isUsed, false)
      ));
    return otpCode;
  }

  async invalidateOtpCode(id: number): Promise<void> {
    await db
      .update(otpCodes)
      .set({ isUsed: true, usedAt: new Date() })
      .where(eq(otpCodes.id, id));
  }

  async cleanupExpiredOtpCodes(): Promise<void> {
    await db
      .delete(otpCodes)
      .where(eq(otpCodes.expiresAt, new Date()));
  }

  // Mobile session operations
  async createMobileSession(sessionData: InsertMobileSession): Promise<MobileSession> {
    const [session] = await db.insert(mobileSessions).values(sessionData).returning();
    return session;
  }

  async getMobileSession(userId: string, deviceToken: string): Promise<MobileSession | undefined> {
    const [session] = await db
      .select()
      .from(mobileSessions)
      .where(and(
        eq(mobileSessions.userId, userId),
        eq(mobileSessions.deviceToken, deviceToken),
        eq(mobileSessions.isActive, true)
      ));
    return session;
  }

  async updateMobileSession(userId: string, deviceToken: string, updates: Partial<MobileSession>): Promise<MobileSession> {
    const [session] = await db
      .update(mobileSessions)
      .set(updates)
      .where(and(
        eq(mobileSessions.userId, userId),
        eq(mobileSessions.deviceToken, deviceToken)
      ))
      .returning();
    return session;
  }

  async deactivateMobileSession(userId: string, deviceToken: string): Promise<void> {
    await db
      .update(mobileSessions)
      .set({ isActive: false })
      .where(and(
        eq(mobileSessions.userId, userId),
        eq(mobileSessions.deviceToken, deviceToken)
      ));
  }

  async getActiveMobileSessions(userId: string): Promise<MobileSession[]> {
    return await db
      .select()
      .from(mobileSessions)
      .where(and(
        eq(mobileSessions.userId, userId),
        eq(mobileSessions.isActive, true)
      ))
      .orderBy(desc(mobileSessions.lastActivity));
  }

  // Mobile biometric settings operations
  async createBiometricSettings(settingsData: InsertMobileBiometricSettings): Promise<MobileBiometricSettings> {
    const [settings] = await db.insert(mobileBiometricSettings).values(settingsData).returning();
    return settings;
  }

  async getBiometricSettings(userId: string, deviceToken: string): Promise<MobileBiometricSettings | undefined> {
    const [settings] = await db
      .select()
      .from(mobileBiometricSettings)
      .where(and(
        eq(mobileBiometricSettings.userId, userId),
        eq(mobileBiometricSettings.deviceToken, deviceToken)
      ));
    return settings;
  }

  async updateBiometricSettings(userId: string, deviceToken: string, updates: Partial<MobileBiometricSettings>): Promise<MobileBiometricSettings> {
    const [settings] = await db
      .update(mobileBiometricSettings)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(
        eq(mobileBiometricSettings.userId, userId),
        eq(mobileBiometricSettings.deviceToken, deviceToken)
      ))
      .returning();
    return settings;
  }

  async deleteBiometricSettings(userId: string, deviceToken: string): Promise<void> {
    await db
      .delete(mobileBiometricSettings)
      .where(and(
        eq(mobileBiometricSettings.userId, userId),
        eq(mobileBiometricSettings.deviceToken, deviceToken)
      ));
  }

  // Token blacklist operations
  async addTokenToBlacklist(tokenHash: string, userId?: string, reason?: string, expiresAt?: Date): Promise<TokenBlacklist> {
    const [blacklistEntry] = await db.insert(tokenBlacklist).values({
      tokenHash,
      userId: userId || null,
      reason: reason || 'logout',
      expiresAt: expiresAt || null
    }).returning();
    return blacklistEntry;
  }

  async isTokenBlacklisted(tokenHash: string): Promise<boolean> {
    const [blacklistEntry] = await db
      .select()
      .from(tokenBlacklist)
      .where(eq(tokenBlacklist.tokenHash, tokenHash));
    return !!blacklistEntry;
  }

  async cleanupExpiredTokens(): Promise<void> {
    // Clean up tokens that have expired
    await db
      .delete(tokenBlacklist)
      .where(lt(tokenBlacklist.expiresAt, new Date()));
  }

  // ==================== SEO PORTAL STORAGE METHODS ====================

  // Services Management (reusing existing methods)

  // Portfolio Projects Management
  async getAllPortfolioProjects(): Promise<any[]> {
    try {
      const projects = await db.select().from(portfolioProjects);
      return projects;
    } catch (error) {
      console.error('Error fetching portfolio projects:', error);
      throw error;
    }
  }

  async getPortfolioProjectsByCategory(category: string): Promise<any[]> {
    try {
      const projects = await db.select().from(portfolioProjects).where(eq(portfolioProjects.category, category));
      return projects;
    } catch (error) {
      console.error('Error fetching portfolio projects by category:', error);
      throw error;
    }
  }

  async createPortfolioProject(projectData: any): Promise<any> {
    try {
      const [newProject] = await db.insert(portfolioProjects).values(projectData).returning();
      return newProject;
    } catch (error) {
      console.error('Error creating portfolio project:', error);
      throw error;
    }
  }

  async updatePortfolioProject(id: number, updates: any): Promise<any> {
    try {
      const [updatedProject] = await db.update(portfolioProjects)
        .set({ ...updates })
        .where(eq(portfolioProjects.id, id))
        .returning();
      return updatedProject;
    } catch (error) {
      console.error('Error updating portfolio project:', error);
      throw error;
    }
  }

  async deletePortfolioProject(id: number): Promise<void> {
    try {
      await db.delete(portfolioProjects).where(eq(portfolioProjects.id, id));
    } catch (error) {
      console.error('Error deleting portfolio project:', error);
      throw error;
    }
  }

  // FAQ Items Management
  async getAllFAQItems(): Promise<any[]> {
    try {
      const items = await db.select().from(faqItems);
      return items;
    } catch (error) {
      console.error('Error fetching FAQ items:', error);
      throw error;
    }
  }

  async createFAQItem(faqData: any): Promise<any> {
    try {
      const [newFAQ] = await db.insert(faqItems).values(faqData).returning();
      return newFAQ;
    } catch (error) {
      console.error('Error creating FAQ item:', error);
      throw error;
    }
  }

  async updateFAQItem(id: number, updates: any): Promise<any> {
    try {
      const [updatedFAQ] = await db.update(faqItems)
        .set(updates)
        .where(eq(faqItems.id, id))
        .returning();
      return updatedFAQ;
    } catch (error) {
      console.error('Error updating FAQ item:', error);
      throw error;
    }
  }

  async deleteFAQItem(id: number): Promise<void> {
    try {
      await db.delete(faqItems).where(eq(faqItems.id, id));
    } catch (error) {
      console.error('Error deleting FAQ item:', error);
      throw error;
    }
  }

  async moveFAQItem(id: number, direction: 'up' | 'down'): Promise<void> {
    try {
      const currentItem = await db.select().from(faqItems).where(eq(faqItems.id, id)).limit(1);
      if (!currentItem.length) return;

      const currentOrder = currentItem[0].order;
      
      if (direction === 'up') {
        // Move up: swap with previous item
        const previousItem = await db.select().from(faqItems)
          .where(lt(faqItems.order, currentOrder))
          .orderBy(desc(faqItems.order))
          .limit(1);
        
        if (previousItem.length) {
          // Swap orders
          await db.update(faqItems).set({ order: previousItem[0].order }).where(eq(faqItems.id, id));
          await db.update(faqItems).set({ order: currentOrder }).where(eq(faqItems.id, previousItem[0].id));
        }
      } else {
        // Move down: swap with next item
        const nextItem = await db.select().from(faqItems)
          .where(gt(faqItems.order, currentOrder))
          .orderBy(asc(faqItems.order))
          .limit(1);
        
        if (nextItem.length) {
          // Swap orders
          await db.update(faqItems).set({ order: nextItem[0].order }).where(eq(faqItems.id, id));
          await db.update(faqItems).set({ order: currentOrder }).where(eq(faqItems.id, nextItem[0].id));
        }
      }
    } catch (error) {
      console.error('Error moving FAQ item:', error);
      throw error;
    }
  }

  // Chat Messages
  async getChatMessages(projectId?: number, conversationId?: string, userId?: string): Promise<ChatMessage[]> {
    try {
      let messages: ChatMessage[] = [];
      
      if (projectId) {
        // Project-based messages
        messages = await db.select().from(chatMessages)
          .where(eq(chatMessages.projectId, projectId))
          .orderBy(desc(chatMessages.createdAt));
      } else if (conversationId && userId) {
        // Direct messages between users
        const parts = conversationId.split('-');
        if (parts.length >= 2) {
          const recipientId = parts.slice(1).join('-');
          
          // Get messages where current user is sender and recipient is target
          const sentMessages = await db.select().from(chatMessages)
            .where(
              and(
                eq(chatMessages.senderId, userId),
                eq(chatMessages.recipientId, recipientId)
              )
            );
          
          // Get messages where target is sender and current user is recipient
          const receivedMessages = await db.select().from(chatMessages)
            .where(
              and(
                eq(chatMessages.senderId, recipientId),
                eq(chatMessages.recipientId, userId)
              )
            );
          
          // Combine and sort messages
          messages = [...sentMessages, ...receivedMessages]
            .sort((a, b) => {
              const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
              const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
              return dateA - dateB;
            });
        }
      } else {
        // Get all messages for the user (fallback)
        if (!userId) {
          messages = [];
        } else {
          const sentMessages = await db.select().from(chatMessages)
            .where(eq(chatMessages.senderId, userId));
          
          const receivedMessages = await db.select().from(chatMessages)
            .where(eq(chatMessages.recipientId, userId));
          
          messages = [...sentMessages, ...receivedMessages]
            .sort((a, b) => {
              const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
              const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
              return dateA - dateB;
            });
        }
      }
      
      // Enrich messages with sender information
      const enrichedMessages = await Promise.all(
        messages.map(async (message) => {
          try {
            const sender = await this.getUser(message.senderId);
            return {
              ...message,
              sender: sender ? {
                id: sender.id,
                firstName: sender.firstName || '',
                lastName: sender.lastName || '',
                email: sender.email || '',
                role: sender.role,
                profileImageUrl: sender.profileImageUrl || undefined
              } : undefined
            };
          } catch (error) {
            console.error('Error fetching sender info:', error);
            return message;
          }
        })
      );
      
      return enrichedMessages;
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      return [];
    }
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    try {
      const [newMessage] = await db.insert(chatMessages).values(message).returning();
      return newMessage;
    } catch (error) {
      console.error('Error creating chat message:', error);
      throw error;
    }
  }

  async markChatMessageAsRead(messageId: number): Promise<void> {
    try {
      await db.update(chatMessages).set({ isRead: true }).where(eq(chatMessages.id, messageId));
    } catch (error) {
      console.error('Error marking chat message as read:', error);
      throw error;
    }
  }

  async getUnreadChatMessagesCount(userId: string, projectId?: number): Promise<number> {
    try {
      let whereConditions;
      
      if (projectId) {
        whereConditions = and(eq(chatMessages.isRead, false), eq(chatMessages.projectId, projectId));
      } else {
        whereConditions = eq(chatMessages.isRead, false);
      }
      
      const messages = await db.select().from(chatMessages).where(whereConditions);
      return messages.length;
    } catch (error) {
      console.error('Error getting unread chat messages count:', error);
      return 0;
    }
  }

  async getChatConversations(userId: string, projectId?: number): Promise<any[]> {
    try {
      // Get current user info
      const currentUserResult = await db.select().from(users).where(eq(users.id, userId));
      const currentUser = currentUserResult[0];
      
      if (!currentUser) {
        return [];
      }

      const conversations = [];

      // Helper function to get last message and unread count for a conversation
      const getConversationData = async (participantId: string, conversationId: string) => {
        // Get messages between current user and participant
        const sentMessages = await db.select().from(chatMessages)
          .where(
            and(
              eq(chatMessages.senderId, userId),
              eq(chatMessages.recipientId, participantId),
              isNull(chatMessages.projectId) // Direct messages only
            )
          )
          .orderBy(desc(chatMessages.createdAt));
        
        const receivedMessages = await db.select().from(chatMessages)
          .where(
            and(
              eq(chatMessages.senderId, participantId),
              eq(chatMessages.recipientId, userId),
              isNull(chatMessages.projectId) // Direct messages only
            )
          )
          .orderBy(desc(chatMessages.createdAt));

        // Combine and get the most recent message
        const allMessages = [...sentMessages, ...receivedMessages]
          .sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA; // Most recent first
          });

        const lastMessage = allMessages.length > 0 ? allMessages[0] : null;
        const unreadCount = receivedMessages.filter(msg => !msg.isRead).length;

        return { lastMessage, unreadCount };
      };

      // Add admin conversation if user is not admin
      const adminUser = await db.select().from(users).where(eq(users.role, 'admin')).limit(1);
      if (adminUser.length > 0 && adminUser[0].id !== currentUser.id) {
        const { lastMessage, unreadCount } = await getConversationData(adminUser[0].id, `admin-${adminUser[0].id}`);
        
        conversations.push({
          id: `admin-${adminUser[0].id}`,
          participantId: adminUser[0].id,
          participantName: `${adminUser[0].firstName || ''} ${adminUser[0].lastName || ''}`.trim() || adminUser[0].email || 'Admin',
          participantRole: 'admin',
          projectId: null,
          projectName: 'General Support',
          lastMessage: lastMessage ? {
            id: lastMessage.id,
            message: lastMessage.message,
            createdAt: lastMessage.createdAt,
            senderId: lastMessage.senderId
          } : null,
          unreadCount,
          isOnline: false
        });
      }

      // Add team member conversations if user is admin
      if (currentUser && currentUser.role === 'admin') {
        const teamMembers = await db.select().from(users).where(
          and(
            eq(users.role, 'team'),
            eq(users.isActive, true)
          )
        );

        console.log(`Found ${teamMembers.length} team members for admin conversations`);

        for (const member of teamMembers) {
          const { lastMessage, unreadCount } = await getConversationData(member.id, `team-${member.id}`);
          
          conversations.push({
            id: `team-${member.id}`,
            participantId: member.id,
            participantName: `${member.firstName || ''} ${member.lastName || ''}`.trim() || member.email || 'Team Member',
            participantRole: 'team',
            projectId: null,
            projectName: 'Team Communication',
            lastMessage: lastMessage ? {
              id: lastMessage.id,
              message: lastMessage.message,
              createdAt: lastMessage.createdAt,
              senderId: lastMessage.senderId
            } : null,
            unreadCount,
            isOnline: false
          });
        }
      }

      // Add customer conversations if user is admin or team
      if (currentUser && ['admin', 'team', 'developer', 'manager', 'seo'].includes(currentUser.role)) {
        const customers = await db.select().from(users).where(
          and(
            eq(users.role, 'customer'),
            eq(users.isActive, true)
          )
        );

        console.log(`Found ${customers.length} customers for admin/team conversations`);

        for (const customer of customers) {
          const { lastMessage, unreadCount } = await getConversationData(customer.id, `customer-${customer.id}`);
          
          conversations.push({
            id: `customer-${customer.id}`,
            participantId: customer.id,
            participantName: `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || customer.email || 'Customer',
            participantRole: 'customer',
            projectId: null,
            projectName: 'Customer Support',
            lastMessage: lastMessage ? {
              id: lastMessage.id,
              message: lastMessage.message,
              createdAt: lastMessage.createdAt,
              senderId: lastMessage.senderId
            } : null,
            unreadCount,
            isOnline: false
          });
        }
      }

      // Sort conversations by last message time (most recent first)
      conversations.sort((a, b) => {
        if (!a.lastMessage && !b.lastMessage) return 0;
        if (!a.lastMessage) return 1;
        if (!b.lastMessage) return -1;
        
        const dateA = a.lastMessage && a.lastMessage.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0;
        const dateB = b.lastMessage && b.lastMessage.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0;
        return dateB - dateA;
      });

      console.log(`Returning ${conversations.length} conversations with last messages`);
      return conversations;
    } catch (error) {
      console.error('Error getting chat conversations:', error);
      return [];
    }
  }

  async createNotification(notification: any): Promise<any> {
    try {
      const [newNotification] = await db.insert(notifications).values(notification).returning();
      return newNotification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  async getNotifications(userId: string): Promise<any[]> {
    try {
      const userNotifications = await db.select().from(notifications)
        .where(eq(notifications.userId, userId))
        .orderBy(desc(notifications.createdAt));
      return userNotifications;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  async markNotificationAsRead(notificationId: number): Promise<void> {
    try {
      await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, notificationId));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    try {
      await db.update(notifications).set({ isRead: true }).where(eq(notifications.userId, userId));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  // ==================== SEO CONTENT MANAGEMENT ====================

  async getSEOContent(): Promise<any[]> {
    try {
      const content = await db.select().from(seoContent);
      return content;
    } catch (error) {
      console.error('Error fetching SEO content:', error);
      throw error;
    }
  }

  async createSEOContent(contentData: any): Promise<any> {
    try {
      const [content] = await db.insert(seoContent).values(contentData).returning();
      return content;
    } catch (error) {
      console.error('Error creating SEO content:', error);
      throw error;
    }
  }

  async updateSEOContent(id: number, updates: any): Promise<any> {
    try {
      const [content] = await db.update(seoContent)
        .set({ ...updates, updated_at: new Date() })
        .where(eq(seoContent.id, id))
        .returning();
      return content;
    } catch (error) {
      console.error('Error updating SEO content:', error);
      throw error;
    }
  }

  async deleteSEOContent(id: number): Promise<void> {
    try {
      await db.delete(seoContent).where(eq(seoContent.id, id));
    } catch (error) {
      console.error('Error deleting SEO content:', error);
      throw error;
    }
  }



  async updateContactSubmission(id: number, updates: Partial<ContactSubmission>): Promise<ContactSubmission> {
    try {
      const [submission] = await db.update(contactSubmissions)
        .set(updates)
        .where(eq(contactSubmissions.id, id))
        .returning();
      return submission;
    } catch (error) {
      console.error('Error updating contact submission:', error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();
