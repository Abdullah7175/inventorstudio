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
  role: varchar("role").default("customer").notNull(), // customer, client, admin, team, seo, manager, developer, mobile_developer, salesmanager, businessmanager
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
export const insertServiceSchema = createInsertSchema(services, {
  id: undefined,
  createdAt: undefined,
});

export const insertPortfolioProjectSchema = createInsertSchema(portfolioProjects, {
  id: undefined,
  createdAt: undefined,
});

export const insertBlogPostSchema = createInsertSchema(blogPosts, {
  id: undefined,
  createdAt: undefined,
  updatedAt: undefined,
});

export const insertClientProjectSchema = createInsertSchema(clientProjects, {
  id: undefined,
  createdAt: undefined,
  updatedAt: undefined,
});

export const insertContactSubmissionSchema = createInsertSchema(contactSubmissions, {
  id: undefined,
  createdAt: undefined,
});

export const insertFaqItemSchema = createInsertSchema(faqItems, {
  id: undefined,
});

export const insertCertificationSchema = createInsertSchema(certifications, {
  id: undefined,
  createdAt: undefined,
  updatedAt: undefined,
});

export const insertPartnershipSchema = createInsertSchema(partnerships, {
  id: undefined,
  createdAt: undefined,
  updatedAt: undefined,
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
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projectRequests.id),
  senderId: varchar("sender_id").notNull(),
  recipientId: varchar("recipient_id"), // For direct messages
  message: text("message").notNull(),
  messageType: varchar("message_type").default("text"), // text, file, image, system
  attachments: jsonb("attachments"),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

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

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  type: varchar("type").notNull(),
  projectId: integer("project_id"),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const projectAssignments = pgTable("project_assignments", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  teamMemberId: varchar("team_member_id").notNull(),
  role: varchar("role").notNull(),
  assignedAt: timestamp("assigned_at").defaultNow(),
  assignedBy: varchar("assigned_by"),
});

export const teamRoles = pgTable("team_roles", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull().unique(),
  description: text("description"),
  permissions: jsonb("permissions"),
  createdAt: timestamp("created_at").defaultNow(),
});

// SEO Content table
export const seoContent = pgTable("seo_content", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  slug: varchar("slug").notNull().unique(),
  content: text("content").notNull(),
  metaDescription: text("meta_description"),
  metaKeywords: text("meta_keywords").array(),
  status: varchar("status").default("draft").notNull(), // draft, published, archived
  authorId: varchar("author_id").notNull(),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  project: one(projectRequests, { fields: [chatMessages.projectId], references: [projectRequests.id] }),
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
export const insertChatMessageSchema = createInsertSchema(chatMessages);
export const insertProjectFeedbackSchema = createInsertSchema(projectFeedback);
export const insertOtpCodeSchema = createInsertSchema(otpCodes);
export const insertMobileSessionSchema = createInsertSchema(mobileSessions);
export const insertMobileBiometricSettingsSchema = createInsertSchema(mobileBiometricSettings);
export const insertTokenBlacklistSchema = createInsertSchema(tokenBlacklist);
export const insertSEOContentSchema = createInsertSchema(seoContent);

// ==================== SALES/BD PORTAL TABLES ====================

// Leads table
export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  firstName: varchar("first_name", { length: 255 }).notNull(),
  lastName: varchar("last_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  company: varchar("company", { length: 255 }),
  jobTitle: varchar("job_title", { length: 255 }),
  industry: varchar("industry", { length: 100 }),
  source: varchar("source", { length: 100 }).notNull(),
  status: varchar("status", { length: 50 }).default("new").notNull(),
  priority: varchar("priority", { length: 20 }).default("medium").notNull(),
  assignedTo: varchar("assigned_to").references(() => users.id),
  estimatedValue: integer("estimated_value"), // Using integer for simplicity, can be changed to decimal
  notes: text("notes"),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Opportunities table
export const opportunities = pgTable("opportunities", {
  id: serial("id").primaryKey(),
  leadId: integer("lead_id").references(() => leads.id),
  clientId: varchar("client_id").references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  stage: varchar("stage", { length: 50 }).default("prospecting").notNull(),
  probability: integer("probability").default(0).notNull(),
  estimatedValue: integer("estimated_value").notNull(),
  actualValue: integer("actual_value"),
  expectedCloseDate: timestamp("expected_close_date"),
  actualCloseDate: timestamp("actual_close_date"),
  assignedTo: varchar("assigned_to").references(() => users.id).notNull(),
  source: varchar("source", { length: 100 }),
  priority: varchar("priority", { length: 20 }).default("medium").notNull(),
  notes: text("notes"),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Proposals table
export const proposals = pgTable("proposals", {
  id: serial("id").primaryKey(),
  opportunityId: integer("opportunity_id").references(() => opportunities.id),
  clientId: varchar("client_id").references(() => users.id).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  proposalNumber: varchar("proposal_number", { length: 100 }).notNull().unique(),
  status: varchar("status", { length: 50 }).default("draft").notNull(),
  totalAmount: integer("total_amount").notNull(),
  validUntil: timestamp("valid_until"),
  sentAt: timestamp("sent_at"),
  viewedAt: timestamp("viewed_at"),
  respondedAt: timestamp("responded_at"),
  createdBy: varchar("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Proposal Items table
export const proposalItems = pgTable("proposal_items", {
  id: serial("id").primaryKey(),
  proposalId: integer("proposal_id").references(() => proposals.id).notNull(),
  serviceName: varchar("service_name", { length: 255 }).notNull(),
  description: text("description"),
  quantity: integer("quantity").default(1).notNull(),
  unitPrice: integer("unit_price").notNull(),
  totalPrice: integer("total_price").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Follow-ups table
export const followUps = pgTable("follow_ups", {
  id: serial("id").primaryKey(),
  leadId: integer("lead_id").references(() => leads.id),
  opportunityId: integer("opportunity_id").references(() => opportunities.id),
  clientId: varchar("client_id").references(() => users.id),
  type: varchar("type", { length: 50 }).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  description: text("description"),
  scheduledDate: timestamp("scheduled_date").notNull(),
  completedDate: timestamp("completed_date"),
  status: varchar("status", { length: 50 }).default("scheduled").notNull(),
  priority: varchar("priority", { length: 20 }).default("medium").notNull(),
  assignedTo: varchar("assigned_to").references(() => users.id).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Communication Logs table
export const communicationLogs = pgTable("communication_logs", {
  id: serial("id").primaryKey(),
  leadId: integer("lead_id").references(() => leads.id),
  opportunityId: integer("opportunity_id").references(() => opportunities.id),
  clientId: varchar("client_id").references(() => users.id),
  type: varchar("type", { length: 50 }).notNull(),
  subject: varchar("subject", { length: 255 }),
  content: text("content"),
  direction: varchar("direction", { length: 20 }).default("outbound").notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Sales Targets table
export const salesTargets = pgTable("sales_targets", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  period: varchar("period", { length: 20 }).notNull(),
  year: integer("year").notNull(),
  month: integer("month"),
  quarter: integer("quarter"),
  targetType: varchar("target_type", { length: 50 }).notNull(),
  targetValue: integer("target_value").notNull(),
  achievedValue: integer("achieved_value").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Business Development Opportunities table
export const businessDevelopmentOpportunities = pgTable("business_development_opportunities", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  type: varchar("type", { length: 50 }).notNull(),
  status: varchar("status", { length: 50 }).default("active").notNull(),
  priority: varchar("priority", { length: 20 }).default("medium").notNull(),
  companyName: varchar("company_name", { length: 255 }),
  contactPerson: varchar("contact_person", { length: 255 }),
  contactEmail: varchar("contact_email", { length: 255 }),
  contactPhone: varchar("contact_phone", { length: 50 }),
  estimatedValue: integer("estimated_value"),
  expectedTimeline: varchar("expected_timeline", { length: 100 }),
  assignedTo: varchar("assigned_to").references(() => users.id).notNull(),
  notes: text("notes"),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Insert schemas for Sales/BD tables
export const insertLeadSchema = createInsertSchema(leads);
export const insertOpportunitySchema = createInsertSchema(opportunities);
export const insertProposalSchema = createInsertSchema(proposals);
export const insertProposalItemSchema = createInsertSchema(proposalItems);
export const insertFollowUpSchema = createInsertSchema(followUps);
export const insertCommunicationLogSchema = createInsertSchema(communicationLogs);
export const insertSalesTargetSchema = createInsertSchema(salesTargets);
export const insertBusinessDevelopmentOpportunitySchema = createInsertSchema(businessDevelopmentOpportunities);

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
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
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
export type SEOContent = typeof seoContent.$inferSelect;
export type InsertSEOContent = z.infer<typeof insertSEOContentSchema>;

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

// Sales/BD Portal types
export type Lead = typeof leads.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Opportunity = typeof opportunities.$inferSelect;
export type InsertOpportunity = z.infer<typeof insertOpportunitySchema>;
export type Proposal = typeof proposals.$inferSelect;
export type InsertProposal = z.infer<typeof insertProposalSchema>;
export type ProposalItem = typeof proposalItems.$inferSelect;
export type InsertProposalItem = z.infer<typeof insertProposalItemSchema>;
export type FollowUp = typeof followUps.$inferSelect;
export type InsertFollowUp = z.infer<typeof insertFollowUpSchema>;
export type CommunicationLog = typeof communicationLogs.$inferSelect;
export type InsertCommunicationLog = z.infer<typeof insertCommunicationLogSchema>;
export type SalesTarget = typeof salesTargets.$inferSelect;
export type InsertSalesTarget = z.infer<typeof insertSalesTargetSchema>;
export type BusinessDevelopmentOpportunity = typeof businessDevelopmentOpportunities.$inferSelect;
export type InsertBusinessDevelopmentOpportunity = z.infer<typeof insertBusinessDevelopmentOpportunitySchema>;
