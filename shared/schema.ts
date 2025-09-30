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
  integer,
} from "drizzle-orm/pg-core";

import { relations } from "drizzle-orm";
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

// User storage table - Enhanced for custom authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("customer").notNull(), // customer, client, admin, team, seo, manager, developer, mobile_developer
  phone: varchar("phone"),
  department: varchar("department"),
  skills: text("skills").array(),
  isActive: boolean("is_active").default(true),
  lastLogin: timestamp("last_login"),
  passwordHash: varchar("password_hash"),
  emailVerified: boolean("email_verified").default(false),
  verificationToken: varchar("verification_token"),
  deviceToken: varchar("device_token"), // For push notifications
  deviceType: varchar("device_type"), // ios, android, web
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

// Blog posts table - Enhanced for SEO team
export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).unique().notNull(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  featuredImage: varchar("featured_image"),
  authorId: varchar("author_id").references(() => users.id),
  published: boolean("published").default(false),
  publishedAt: timestamp("published_at"),
  metaTitle: varchar("meta_title", { length: 255 }),
  metaDescription: text("meta_description"),
  tags: text("tags").array(),
  readTime: integer("read_time"), // estimated read time in minutes
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

// Certifications table
export const certifications = pgTable("certifications", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  issuer: varchar("issuer", { length: 255 }).notNull(),
  description: text("description"),
  certificateImage: varchar("certificate_image"),
  issueDate: timestamp("issue_date"),
  expiryDate: timestamp("expiry_date"),
  credentialId: varchar("credential_id"),
  verificationUrl: varchar("verification_url"),
  category: varchar("category"), // 'web', 'mobile', 'design', 'cloud', 'security'
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Partnerships table
export const partnerships = pgTable("partnerships", {
  id: serial("id").primaryKey(),
  companyName: varchar("company_name", { length: 255 }).notNull(),
  logo: varchar("logo"),
  description: text("description"),
  partnershipType: varchar("partnership_type"), // 'technology', 'strategic', 'integration', 'reseller'
  website: varchar("website"),
  status: varchar("status").default("active"), // 'active', 'inactive'
  startDate: timestamp("start_date"),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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

export const insertCertificationSchema = createInsertSchema(certifications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPartnershipSchema = createInsertSchema(partnerships).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
// Project Management System Tables

// Service cart/bucket for clients
export const serviceCarts = pgTable("service_carts", {
  id: serial("id").primaryKey(),
  clientId: varchar("client_id").notNull(),
  serviceIds: text("service_ids").array(),
  projectName: varchar("project_name").notNull(),
  notes: text("notes"),
  budget: varchar("budget"),
  timeline: varchar("timeline"),
  files: text("files").array(), // File URLs or paths
  status: varchar("status").default("pending"), // pending, approved, rejected, in-progress, completed
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Project requests (from cart to admin review)
export const projectRequests = pgTable("project_requests", {
  id: serial("id").primaryKey(),
  cartId: integer("cart_id").references(() => serviceCarts.id),
  clientId: varchar("client_id").notNull(),
  projectName: varchar("project_name").notNull(),
  serviceIds: text("service_ids").array(),
  description: text("description"),
  budget: varchar("budget"),
  timeline: varchar("timeline"),
  attachedFiles: text("attached_files").array(),
  status: varchar("status").default("pending"), // pending, approved, rejected, in-review
  adminNotes: text("admin_notes"),
  assignedTeamId: varchar("assigned_team_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Project tasks (Kanban board style)
export const projectTasks = pgTable("project_tasks", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projectRequests.id),
  title: varchar("title").notNull(),
  description: text("description"),
  assignedTo: varchar("assigned_to"), // team member ID
  status: varchar("status").default("todo"), // todo, in-progress, review, done
  priority: varchar("priority").default("medium"), // low, medium, high
  dueDate: timestamp("due_date"),
  files: text("files").array(),
  position: integer("position").default(0), // for Kanban ordering
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Team members (separate from users for security)
export const teamMembers = pgTable("team_members", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  name: varchar("name").notNull(),
  role: varchar("role").notNull(), // developer, designer, manager
  skills: text("skills").array(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Project files with role-based access
export const projectFiles = pgTable("project_files", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projectRequests.id),
  fileName: varchar("file_name").notNull(),
  filePath: varchar("file_path").notNull(),
  fileType: varchar("file_type"), // image, document, archive
  uploadedBy: varchar("uploaded_by").notNull(),
  uploadedByRole: varchar("uploaded_by_role").notNull(), // client, admin, team
  isVisible: boolean("is_visible").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Invoicing system
export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projectRequests.id),
  clientId: varchar("client_id").notNull(),
  invoiceNumber: varchar("invoice_number").notNull().unique(),
  serviceBreakdown: text("service_breakdown"), // JSON string
  subtotal: varchar("subtotal"),
  tax: varchar("tax"),
  discount: varchar("discount"),
  total: varchar("total").notNull(),
  status: varchar("status").default("unpaid"), // unpaid, paid, pending, overdue
  dueDate: timestamp("due_date"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Chat/messaging system
export const projectMessages = pgTable("project_messages", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projectRequests.id),
  senderId: varchar("sender_id").notNull(),
  senderRole: varchar("sender_role").notNull(), // client, admin, team
  message: text("message").notNull(),
  isInternal: boolean("is_internal").default(false), // true = admin/team only
  attachments: text("attachments").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Project feedback and ratings
export const projectFeedback = pgTable("project_feedback", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projectRequests.id),
  clientId: varchar("client_id").notNull(),
  rating: integer("rating"), // 1-5 stars
  feedback: text("feedback"),
  isPublic: boolean("is_public").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// OTP codes for desktop login authorization
export const otpCodes = pgTable("otp_codes", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  code: varchar("code", { length: 6 }).notNull(), // 6-digit code
  type: varchar("type").default("desktop_login"), // desktop_login, mobile_verification
  deviceInfo: text("device_info"), // Browser/device info for desktop login
  isUsed: boolean("is_used").default(false),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  usedAt: timestamp("used_at"),
});

// Mobile app sessions for tracking logged-in devices
export const mobileSessions = pgTable("mobile_sessions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  deviceToken: varchar("device_token").notNull(),
  deviceType: varchar("device_type").notNull(), // ios, android
  deviceInfo: text("device_info"), // JSON string with device details
  sessionToken: varchar("session_token"), // 7-day login session token
  sessionExpiresAt: timestamp("session_expires_at"), // Session expiration
  isActive: boolean("is_active").default(true),
  lastActivity: timestamp("last_activity").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Mobile biometric security settings
export const mobileBiometricSettings = pgTable("mobile_biometric_settings", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  deviceToken: varchar("device_token").notNull(), // Device-specific settings
  biometricType: varchar("biometric_type").notNull(), // fingerprint, pin, face_id, touch_id
  isEnabled: boolean("is_enabled").default(false),
  encryptedPin: varchar("encrypted_pin"), // Encrypted PIN if using PIN
  biometricData: text("biometric_data"), // Encrypted biometric template (if needed)
  settings: text("settings"), // JSON string with additional settings
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Token blacklist for invalidated JWT tokens
export const tokenBlacklist = pgTable("token_blacklist", {
  id: serial("id").primaryKey(),
  tokenHash: varchar("token_hash").notNull(), // SHA256 hash of the JWT token
  userId: varchar("user_id").references(() => users.id),
  reason: varchar("reason").default("logout"), // logout, security, expired
  expiresAt: timestamp("expires_at"), // When the token would naturally expire
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const serviceCartsRelations = relations(serviceCarts, ({ many }) => ({
  requests: many(projectRequests),
}));

export const projectRequestsRelations = relations(projectRequests, ({ one, many }) => ({
  cart: one(serviceCarts, { fields: [projectRequests.cartId], references: [serviceCarts.id] }),
  tasks: many(projectTasks),
  files: many(projectFiles),
  messages: many(projectMessages),
  invoice: one(invoices, { fields: [projectRequests.id], references: [invoices.projectId] }),
  feedback: one(projectFeedback, { fields: [projectRequests.id], references: [projectFeedback.projectId] }),
}));

export const projectTasksRelations = relations(projectTasks, ({ one }) => ({
  project: one(projectRequests, { fields: [projectTasks.projectId], references: [projectRequests.id] }),
}));

export const projectFilesRelations = relations(projectFiles, ({ one }) => ({
  project: one(projectRequests, { fields: [projectFiles.projectId], references: [projectRequests.id] }),
}));

export const invoicesRelations = relations(invoices, ({ one }) => ({
  project: one(projectRequests, { fields: [invoices.projectId], references: [projectRequests.id] }),
}));

export const projectMessagesRelations = relations(projectMessages, ({ one }) => ({
  project: one(projectRequests, { fields: [projectMessages.projectId], references: [projectRequests.id] }),
}));

export const projectFeedbackRelations = relations(projectFeedback, ({ one }) => ({
  project: one(projectRequests, { fields: [projectFeedback.projectId], references: [projectRequests.id] }),
}));

// Insert schemas for forms
export const insertServiceCartSchema = createInsertSchema(serviceCarts);
export const insertProjectRequestSchema = createInsertSchema(projectRequests);
export const insertProjectTaskSchema = createInsertSchema(projectTasks);
export const insertTeamMemberSchema = createInsertSchema(teamMembers);
export const insertProjectFileSchema = createInsertSchema(projectFiles);
export const insertInvoiceSchema = createInsertSchema(invoices);
export const insertProjectMessageSchema = createInsertSchema(projectMessages);
export const insertProjectFeedbackSchema = createInsertSchema(projectFeedback);
export const insertOtpCodeSchema = createInsertSchema(otpCodes);
export const insertMobileSessionSchema = createInsertSchema(mobileSessions);
export const insertMobileBiometricSettingsSchema = createInsertSchema(mobileBiometricSettings);
export const insertTokenBlacklistSchema = createInsertSchema(tokenBlacklist);

// Types
export type ServiceCart = typeof serviceCarts.$inferSelect;
export type InsertServiceCart = z.infer<typeof insertServiceCartSchema>;
export type ProjectRequest = typeof projectRequests.$inferSelect;
export type InsertProjectRequest = z.infer<typeof insertProjectRequestSchema>;
export type ProjectTask = typeof projectTasks.$inferSelect;
export type InsertProjectTask = z.infer<typeof insertProjectTaskSchema>;
export type TeamMember = typeof teamMembers.$inferSelect;
export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;
export type ProjectFile = typeof projectFiles.$inferSelect;
export type InsertProjectFile = z.infer<typeof insertProjectFileSchema>;
export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type ProjectMessage = typeof projectMessages.$inferSelect;
export type InsertProjectMessage = z.infer<typeof insertProjectMessageSchema>;
export type ProjectFeedback = typeof projectFeedback.$inferSelect;
export type InsertProjectFeedback = z.infer<typeof insertProjectFeedbackSchema>;
export type OtpCode = typeof otpCodes.$inferSelect;
export type InsertOtpCode = z.infer<typeof insertOtpCodeSchema>;
export type MobileSession = typeof mobileSessions.$inferSelect;
export type InsertMobileSession = z.infer<typeof insertMobileSessionSchema>;
export type MobileBiometricSettings = typeof mobileBiometricSettings.$inferSelect;
export type InsertMobileBiometricSettings = z.infer<typeof insertMobileBiometricSettingsSchema>;
export type TokenBlacklist = typeof tokenBlacklist.$inferSelect;
export type InsertTokenBlacklist = z.infer<typeof insertTokenBlacklistSchema>;

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
export type Certification = typeof certifications.$inferSelect;
export type InsertCertification = z.infer<typeof insertCertificationSchema>;
export type Partnership = typeof partnerships.$inferSelect;
export type InsertPartnership = z.infer<typeof insertPartnershipSchema>;
