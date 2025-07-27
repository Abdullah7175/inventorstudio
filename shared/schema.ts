import { sql } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  varchar,
  boolean,
  serial,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table - mandatory for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

// User storage table - mandatory for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("client"), // client, admin
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Services table
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  icon: varchar("icon").notNull(),
  technologies: text("technologies").array(),
  featured: boolean("featured").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Portfolio projects table
export const portfolioProjects = pgTable("portfolio_projects", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  imageUrl: varchar("image_url").notNull(),
  category: varchar("category").notNull(), // web, mobile, video, marketing
  technologies: text("technologies").array(),
  projectUrl: varchar("project_url"),
  featured: boolean("featured").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Blog posts table
export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  excerpt: text("excerpt").notNull(),
  slug: varchar("slug").unique().notNull(),
  imageUrl: varchar("image_url"),
  published: boolean("published").default(false),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Client projects table
export const clientProjects = pgTable("client_projects", {
  id: serial("id").primaryKey(),
  clientId: varchar("client_id").references(() => users.id).notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  status: varchar("status").default("pending"), // pending, in-progress, review, completed
  files: text("files").array(), // Array of file URLs
  feedback: text("feedback"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Contact submissions table
export const contactSubmissions = pgTable("contact_submissions", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  email: varchar("email").notNull(),
  service: varchar("service"),
  message: text("message").notNull(),
  responded: boolean("responded").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// FAQ items table
export const faqItems = pgTable("faq_items", {
  id: serial("id").primaryKey(),
  question: varchar("question").notNull(),
  answer: text("answer").notNull(),
  order: serial("order"),
});

// User preferences table for design recommendations
export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  industry: varchar("industry"), // tech, fashion, healthcare, finance, etc.
  businessType: varchar("business_type"), // startup, corporate, personal, nonprofit
  stylePreference: varchar("style_preference"), // modern, classic, minimalist, bold, creative
  colorScheme: varchar("color_scheme"), // bright, muted, monochrome, vibrant
  targetAudience: varchar("target_audience"), // young, professional, general, luxury
  budget: varchar("budget"), // basic, standard, premium, enterprise
  timeline: varchar("timeline"), // rush, standard, extended
  features: text("features").array(), // e-commerce, blog, portfolio, booking, etc.
  inspiration: text("inspiration"), // websites or brands they like
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Design templates/styles table
export const designTemplates = pgTable("design_templates", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description").notNull(),
  category: varchar("category").notNull(), // web, mobile, branding, marketing
  styleType: varchar("style_type").notNull(), // modern, classic, minimalist, bold, creative
  industry: varchar("industry").notNull(),
  colorSchemes: text("color_schemes").array(),
  features: text("features").array(),
  imageUrl: varchar("image_url"),
  previewUrl: varchar("preview_url"),
  difficulty: varchar("difficulty").default("medium"), // easy, medium, hard
  estimatedHours: serial("estimated_hours"),
  price: varchar("price"), // basic, standard, premium
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// User recommendations table
export const userRecommendations = pgTable("user_recommendations", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  templateId: serial("template_id").references(() => designTemplates.id).notNull(),
  score: serial("score"), // recommendation score out of 100
  reason: text("reason"), // why this was recommended
  viewed: boolean("viewed").default(false),
  liked: boolean("liked").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// User interactions for improving recommendations
export const userInteractions = pgTable("user_interactions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  templateId: serial("template_id").references(() => designTemplates.id),
  projectId: serial("project_id").references(() => portfolioProjects.id),
  action: varchar("action").notNull(), // view, like, dislike, save, request_quote
  data: jsonb("data"), // additional interaction data
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
  createdAt: true,
});

export const insertPortfolioProjectSchema = createInsertSchema(portfolioProjects).omit({
  id: true,
  createdAt: true,
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertClientProjectSchema = createInsertSchema(clientProjects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertContactSubmissionSchema = createInsertSchema(contactSubmissions).omit({
  id: true,
  createdAt: true,
});

export const insertFaqItemSchema = createInsertSchema(faqItems).omit({
  id: true,
});

export const insertUserPreferencesSchema = createInsertSchema(userPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDesignTemplateSchema = createInsertSchema(designTemplates).omit({
  id: true,
  createdAt: true,
});

export const insertUserRecommendationSchema = createInsertSchema(userRecommendations).omit({
  id: true,
  createdAt: true,
});

export const insertUserInteractionSchema = createInsertSchema(userInteractions).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Service = typeof services.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;
export type PortfolioProject = typeof portfolioProjects.$inferSelect;
export type InsertPortfolioProject = z.infer<typeof insertPortfolioProjectSchema>;
export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type ClientProject = typeof clientProjects.$inferSelect;
export type InsertClientProject = z.infer<typeof insertClientProjectSchema>;
export type ContactSubmission = typeof contactSubmissions.$inferSelect;
export type InsertContactSubmission = z.infer<typeof insertContactSubmissionSchema>;
export type FaqItem = typeof faqItems.$inferSelect;
export type InsertFaqItem = z.infer<typeof insertFaqItemSchema>;
export type UserPreferences = typeof userPreferences.$inferSelect;
export type InsertUserPreferences = z.infer<typeof insertUserPreferencesSchema>;
export type DesignTemplate = typeof designTemplates.$inferSelect;
export type InsertDesignTemplate = z.infer<typeof insertDesignTemplateSchema>;
export type UserRecommendation = typeof userRecommendations.$inferSelect;
export type InsertUserRecommendation = z.infer<typeof insertUserRecommendationSchema>;
export type UserInteraction = typeof userInteractions.$inferSelect;
export type InsertUserInteraction = z.infer<typeof insertUserInteractionSchema>;
