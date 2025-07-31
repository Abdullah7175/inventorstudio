-- Inventer Design Studio - Complete Database Schema
-- Updated: 2025-01-31
-- For local deployment on PostgreSQL

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (for fresh deployment)
DROP TABLE IF EXISTS project_messages CASCADE;
DROP TABLE IF EXISTS project_files CASCADE;
DROP TABLE IF EXISTS project_tasks CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS client_projects CASCADE;
DROP TABLE IF EXISTS contact_submissions CASCADE;
DROP TABLE IF EXISTS blog_posts CASCADE;
DROP TABLE IF EXISTS portfolio_projects CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS faq_items CASCADE;
DROP TABLE IF EXISTS certifications CASCADE;
DROP TABLE IF EXISTS partnerships CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table (core authentication)
CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    email VARCHAR(255) UNIQUE,
    "firstName" VARCHAR(255),
    "lastName" VARCHAR(255),
    "profileImageUrl" VARCHAR(500),
    role VARCHAR(50) DEFAULT 'client' CHECK (role IN ('client', 'editor', 'admin', 'team')),
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Sessions table (for authentication)
CREATE TABLE sessions (
    sid VARCHAR(255) PRIMARY KEY,
    sess JSONB NOT NULL,
    expire TIMESTAMP NOT NULL
);
CREATE INDEX "IDX_session_expire" ON sessions(expire);

-- Services table
CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(100),
    technologies TEXT[] DEFAULT '{}',
    featured BOOLEAN DEFAULT FALSE,
    "createdAt" TIMESTAMP DEFAULT NOW()
);

-- Portfolio projects table
CREATE TABLE portfolio_projects (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    "imageUrl" VARCHAR(500) NOT NULL,
    category VARCHAR(100) NOT NULL,
    technologies TEXT[] DEFAULT '{}',
    "projectUrl" VARCHAR(500),
    featured BOOLEAN DEFAULT FALSE,
    "createdAt" TIMESTAMP DEFAULT NOW()
);

-- Blog posts table
CREATE TABLE blog_posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL,
    "featuredImage" VARCHAR(500),
    "authorId" VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
    published BOOLEAN DEFAULT FALSE,
    "publishedAt" TIMESTAMP,
    "metaTitle" VARCHAR(255),
    "metaDescription" TEXT,
    tags TEXT[] DEFAULT '{}',
    "readingTime" INTEGER DEFAULT 5,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Contact submissions table
CREATE TABLE contact_submissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    phone VARCHAR(50),
    message TEXT NOT NULL,
    services TEXT[] DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'converted', 'closed')),
    "createdAt" TIMESTAMP DEFAULT NOW()
);

-- Client projects table (project management)
CREATE TABLE client_projects (
    id SERIAL PRIMARY KEY,
    "clientId" VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'on_hold')),
    "startDate" DATE,
    "endDate" DATE,
    budget DECIMAL(10,2),
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Project tasks table (Kanban board)
CREATE TABLE project_tasks (
    id SERIAL PRIMARY KEY,
    "projectId" INTEGER REFERENCES client_projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'done')),
    priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    "assignedTo" VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
    "dueDate" DATE,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Project files table
CREATE TABLE project_files (
    id SERIAL PRIMARY KEY,
    "projectId" INTEGER REFERENCES client_projects(id) ON DELETE CASCADE,
    "fileName" VARCHAR(255) NOT NULL,
    "fileUrl" VARCHAR(500) NOT NULL,
    "fileSize" BIGINT,
    "mimeType" VARCHAR(100),
    "uploadedBy" VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
    "visibleToClient" BOOLEAN DEFAULT TRUE,
    "createdAt" TIMESTAMP DEFAULT NOW()
);

-- Project messages table (chat system)
CREATE TABLE project_messages (
    id SERIAL PRIMARY KEY,
    "projectId" INTEGER REFERENCES client_projects(id) ON DELETE CASCADE,
    "senderId" VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    "messageType" VARCHAR(50) DEFAULT 'text' CHECK ("messageType" IN ('text', 'file', 'system')),
    "isInternal" BOOLEAN DEFAULT FALSE,
    "createdAt" TIMESTAMP DEFAULT NOW()
);

-- Invoices table
CREATE TABLE invoices (
    id SERIAL PRIMARY KEY,
    "clientId" VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
    "projectId" INTEGER REFERENCES client_projects(id) ON DELETE SET NULL,
    "invoiceNumber" VARCHAR(100) UNIQUE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
    "dueDate" DATE NOT NULL,
    "paidAt" TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- FAQ items table
CREATE TABLE faq_items (
    id SERIAL PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(100) DEFAULT 'general',
    "order" INTEGER DEFAULT 0,
    published BOOLEAN DEFAULT TRUE,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Certifications table (for about page)
CREATE TABLE certifications (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    issuer VARCHAR(255) NOT NULL,
    "issueDate" DATE,
    "expiryDate" DATE,
    "credentialUrl" VARCHAR(500),
    "badgeUrl" VARCHAR(500),
    "createdAt" TIMESTAMP DEFAULT NOW()
);

-- Partnerships table (for about page)
CREATE TABLE partnerships (
    id SERIAL PRIMARY KEY,
    "companyName" VARCHAR(255) NOT NULL,
    "logoUrl" VARCHAR(500),
    "websiteUrl" VARCHAR(500),
    description TEXT,
    "partnershipType" VARCHAR(100),
    active BOOLEAN DEFAULT TRUE,
    "createdAt" TIMESTAMP DEFAULT NOW()
);

-- Insert sample data for development/testing

-- Sample admin user
INSERT INTO users (id, email, "firstName", "lastName", role) VALUES 
('admin-dev', 'admin@inventerdesign.com', 'Admin', 'User', 'admin');

-- Sample services
INSERT INTO services (title, description, icon, technologies, featured) VALUES
('Web Development', 'Custom web applications built with modern technologies for optimal performance and user experience.', 'Code', '{"React", "TypeScript", "Node.js", "PostgreSQL"}', true),
('UI/UX Design', 'User-centered design solutions that create intuitive and engaging digital experiences.', 'Palette', '{"Figma", "Adobe XD", "Sketch", "Principle"}', true),
('Digital Marketing', 'Strategic marketing campaigns to boost your online presence and drive conversions.', 'Megaphone', '{"Google Ads", "SEO", "Social Media", "Analytics"}', false),
('Video Production', 'Professional video content creation from concept to final delivery.', 'Video', '{"After Effects", "Premiere Pro", "Cinema 4D", "DaVinci Resolve"}', false);

-- Sample portfolio projects
INSERT INTO portfolio_projects (title, description, "imageUrl", category, technologies, "projectUrl", featured) VALUES
('E-commerce Platform', 'A full-featured e-commerce solution with inventory management and payment processing.', 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800', 'web', '{"React", "Node.js", "Stripe", "MongoDB"}', 'https://example-ecommerce.com', true),
('Mobile Banking App', 'Secure and intuitive mobile banking application with biometric authentication.', 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800', 'mobile', '{"React Native", "Node.js", "PostgreSQL", "JWT"}', null, true),
('Brand Identity Package', 'Complete brand identity design including logo, guidelines, and marketing materials.', 'https://images.unsplash.com/photo-1558655156-b4023e709a52?w=800', 'design', '{"Illustrator", "Photoshop", "InDesign"}', null, false),
('Corporate Video', 'Professional corporate video showcasing company values and services.', 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800', 'video', '{"After Effects", "Premiere Pro", "Cinema 4D"}', 'https://vimeo.com/example', false);

-- Sample blog posts
INSERT INTO blog_posts (title, slug, excerpt, content, "authorId", published, "publishedAt", tags) VALUES
('The Future of Web Development', 'future-of-web-development', 'Exploring upcoming trends and technologies that will shape web development in 2025.', 'Web development is constantly evolving...\n\nThis is a comprehensive article about web development trends.', 'admin-dev', true, NOW(), '{"web development", "trends", "technology"}'),
('Design Systems Best Practices', 'design-systems-best-practices', 'How to create and maintain effective design systems for consistent user experiences.', 'Design systems are crucial for scaling design...\n\nThis article covers best practices for design systems.', 'admin-dev', true, NOW() - INTERVAL '1 week', '{"design", "UI/UX", "best practices"}'),
('Digital Marketing ROI', 'digital-marketing-roi', 'Measuring and maximizing return on investment in digital marketing campaigns.', 'Understanding ROI in digital marketing...\n\nThis article explores marketing ROI strategies.', 'admin-dev', false, null, '{"marketing", "ROI", "analytics"}');

-- Sample FAQ items
INSERT INTO faq_items (question, answer, category, "order") VALUES
('What services do you offer?', 'We offer web development, UI/UX design, digital marketing, and video production services. Our team specializes in creating comprehensive digital solutions for businesses of all sizes.', 'services', 1),
('How long does a typical project take?', 'Project timelines vary depending on scope and complexity. Simple websites typically take 2-4 weeks, while complex web applications can take 2-3 months. We provide detailed timelines during the planning phase.', 'process', 2),
('Do you offer ongoing support and maintenance?', 'Yes, we provide ongoing support and maintenance packages for all our projects. This includes regular updates, security monitoring, performance optimization, and technical support.', 'support', 3),
('What is your pricing structure?', 'Our pricing is project-based and depends on the specific requirements and complexity. We provide detailed quotes after an initial consultation to understand your needs and goals.', 'pricing', 4);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_blog_posts_published ON blog_posts(published);
CREATE INDEX idx_blog_posts_author ON blog_posts("authorId");
CREATE INDEX idx_portfolio_projects_category ON portfolio_projects(category);
CREATE INDEX idx_portfolio_projects_featured ON portfolio_projects(featured);
CREATE INDEX idx_services_featured ON services(featured);
CREATE INDEX idx_client_projects_client ON client_projects("clientId");
CREATE INDEX idx_client_projects_status ON client_projects(status);
CREATE INDEX idx_project_tasks_project ON project_tasks("projectId");
CREATE INDEX idx_project_tasks_assigned ON project_tasks("assignedTo");
CREATE INDEX idx_project_messages_project ON project_messages("projectId");
CREATE INDEX idx_project_files_project ON project_files("projectId");
CREATE INDEX idx_invoices_client ON invoices("clientId");
CREATE INDEX idx_contact_submissions_status ON contact_submissions(status);

-- Add triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_projects_updated_at BEFORE UPDATE ON client_projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_tasks_updated_at BEFORE UPDATE ON project_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_faq_items_updated_at BEFORE UPDATE ON faq_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions (adjust as needed for your environment)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_app_user;

-- Database setup complete
SELECT 'Database schema created successfully! ' || 
       'Total tables: ' || count(*) || 
       ' | Sample data inserted for development.' as setup_status
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';