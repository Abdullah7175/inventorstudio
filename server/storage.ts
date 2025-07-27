import {
  users,
  services,
  portfolioProjects,
  blogPosts,
  clientProjects,
  contactSubmissions,
  faqItems,
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
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // User operations - mandatory for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

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

  // FAQ
  getFaqItems(): Promise<FaqItem[]>;
  createFaqItem(item: InsertFaqItem): Promise<FaqItem>;
  updateFaqItem(id: number, item: Partial<InsertFaqItem>): Promise<FaqItem>;
  deleteFaqItem(id: number): Promise<void>;
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
}

export const storage = new DatabaseStorage();
