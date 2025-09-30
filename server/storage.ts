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
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, lt } from "drizzle-orm";

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

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(users.createdAt);
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

  async updateClientProject(id: number, project: Partial<InsertClientProject>): Promise<ClientProject> {
    const [updatedProject] = await db
      .update(clientProjects)
      .set({ ...project, updatedAt: new Date() })
      .where(eq(clientProjects.id, id))
      .returning();
    return updatedProject;
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
}

export const storage = new DatabaseStorage();
