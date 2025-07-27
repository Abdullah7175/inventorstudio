import {
  users,
  services,
  portfolioProjects,
  blogPosts,
  clientProjects,
  contactSubmissions,
  faqItems,
  userPreferences,
  designTemplates,
  userRecommendations,
  userInteractions,
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
  type UserPreferences,
  type InsertUserPreferences,
  type DesignTemplate,
  type InsertDesignTemplate,
  type UserRecommendation,
  type InsertUserRecommendation,
  type UserInteraction,
  type InsertUserInteraction,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

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

  // Recommendation Engine
  getUserPreferences(userId: string): Promise<UserPreferences | undefined>;
  upsertUserPreferences(preferences: InsertUserPreferences): Promise<UserPreferences>;
  getDesignTemplates(filters?: { industry?: string; styleType?: string; category?: string }): Promise<DesignTemplate[]>;
  createDesignTemplate(template: InsertDesignTemplate): Promise<DesignTemplate>;
  updateDesignTemplate(id: number, template: Partial<InsertDesignTemplate>): Promise<DesignTemplate>;
  getUserRecommendations(userId: string): Promise<UserRecommendation[]>;
  generateRecommendations(userId: string): Promise<UserRecommendation[]>;
  createUserInteraction(interaction: InsertUserInteraction): Promise<UserInteraction>;
  getPopularTemplates(limit?: number): Promise<DesignTemplate[]>;
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

  // Recommendation Engine
  async getUserPreferences(userId: string): Promise<UserPreferences | undefined> {
    const [preferences] = await db.select().from(userPreferences).where(eq(userPreferences.userId, userId));
    return preferences;
  }

  async upsertUserPreferences(preferences: InsertUserPreferences): Promise<UserPreferences> {
    const existing = await this.getUserPreferences(preferences.userId);
    if (existing) {
      const [updated] = await db
        .update(userPreferences)
        .set({ ...preferences, updatedAt: new Date() })
        .where(eq(userPreferences.userId, preferences.userId))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(userPreferences).values(preferences).returning();
      return created;
    }
  }

  async getDesignTemplates(filters?: { industry?: string; styleType?: string; category?: string }): Promise<DesignTemplate[]> {
    let query = db.select().from(designTemplates).where(eq(designTemplates.active, true));
    
    if (filters?.industry) {
      query = query.where(eq(designTemplates.industry, filters.industry));
    }
    if (filters?.styleType) {
      query = query.where(eq(designTemplates.styleType, filters.styleType));
    }
    if (filters?.category) {
      query = query.where(eq(designTemplates.category, filters.category));
    }
    
    return await query.orderBy(designTemplates.createdAt);
  }

  async createDesignTemplate(template: InsertDesignTemplate): Promise<DesignTemplate> {
    const [newTemplate] = await db.insert(designTemplates).values(template).returning();
    return newTemplate;
  }

  async updateDesignTemplate(id: number, template: Partial<InsertDesignTemplate>): Promise<DesignTemplate> {
    const [updated] = await db
      .update(designTemplates)
      .set(template)
      .where(eq(designTemplates.id, id))
      .returning();
    return updated;
  }

  async getUserRecommendations(userId: string): Promise<UserRecommendation[]> {
    return await db
      .select()
      .from(userRecommendations)
      .where(eq(userRecommendations.userId, userId))
      .orderBy(desc(userRecommendations.score));
  }

  async generateRecommendations(userId: string): Promise<UserRecommendation[]> {
    // Clear existing recommendations
    await db.delete(userRecommendations).where(eq(userRecommendations.userId, userId));

    const preferences = await this.getUserPreferences(userId);
    if (!preferences) {
      return [];
    }

    // Get all templates and calculate scores
    const templates = await this.getDesignTemplates();
    const recommendations: InsertUserRecommendation[] = [];

    for (const template of templates) {
      let score = 0;
      const reasons: string[] = [];

      // Industry match (highest weight - 30 points)
      if (preferences.industry && template.industry === preferences.industry) {
        score += 30;
        reasons.push(`Perfect match for ${preferences.industry} industry`);
      }

      // Style preference match (25 points)
      if (preferences.stylePreference && template.styleType === preferences.stylePreference) {
        score += 25;
        reasons.push(`Matches your ${preferences.stylePreference} style preference`);
      }

      // Budget match (20 points)
      if (preferences.budget && template.price === preferences.budget) {
        score += 20;
        reasons.push(`Fits your ${preferences.budget} budget`);
      }

      // Features overlap (15 points)
      if (preferences.features && template.features) {
        const featureOverlap = preferences.features.filter(f => template.features.includes(f));
        if (featureOverlap.length > 0) {
          score += Math.min(15, featureOverlap.length * 5);
          reasons.push(`Includes ${featureOverlap.length} features you need`);
        }
      }

      // Timeline/difficulty match (10 points)
      if (preferences.timeline === 'rush' && template.difficulty === 'easy') {
        score += 10;
        reasons.push('Quick to implement for your timeline');
      } else if (preferences.timeline === 'extended' && template.difficulty === 'hard') {
        score += 10;
        reasons.push('Complex design perfect for extended timeline');
      }

      // Only recommend if score is above threshold
      if (score >= 25) {
        recommendations.push({
          userId,
          templateId: template.id,
          score,
          reason: reasons.join(', '),
        });
      }
    }

    // Insert recommendations
    if (recommendations.length > 0) {
      await db.insert(userRecommendations).values(recommendations);
    }

    return await this.getUserRecommendations(userId);
  }

  async createUserInteraction(interaction: InsertUserInteraction): Promise<UserInteraction> {
    const [newInteraction] = await db.insert(userInteractions).values(interaction).returning();
    return newInteraction;
  }

  async getPopularTemplates(limit: number = 10): Promise<DesignTemplate[]> {
    // Get templates with most positive interactions
    const popularTemplateIds = await db
      .select({
        templateId: userInteractions.templateId,
        count: sql<number>`count(*)`.as('count')
      })
      .from(userInteractions)
      .where(sql`${userInteractions.action} IN ('like', 'save', 'request_quote')`)
      .groupBy(userInteractions.templateId)
      .orderBy(sql`count(*) DESC`)
      .limit(limit);

    if (popularTemplateIds.length === 0) {
      return await db.select().from(designTemplates)
        .where(eq(designTemplates.active, true))
        .limit(limit);
    }

    return await db.select().from(designTemplates)
      .where(sql`${designTemplates.id} IN (${popularTemplateIds.map(t => t.templateId).join(',')})`);
  }
}

export const storage = new DatabaseStorage();
