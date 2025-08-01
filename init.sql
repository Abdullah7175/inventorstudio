-- Inventer Design Studio - Complete Database Schema
-- PostgreSQL Database Structure for Local Deployment

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create database (already created by Docker, but included for manual setup)
-- CREATE DATABASE inventer_design_studio;

-- Session storage table (for Express sessions)
CREATE TABLE IF NOT EXISTS sessions (
    sid VARCHAR PRIMARY KEY,
    sess JSONB NOT NULL,
    expire TIMESTAMP NOT NULL
);

-- Create index for session expiration
CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON sessions(expire);

-- User storage table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR UNIQUE,
    first_name VARCHAR,
    last_name VARCHAR,
    profile_image_url VARCHAR,
    role VARCHAR DEFAULT 'client' NOT NULL CHECK (role IN ('client', 'admin', 'team')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Services table
CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    title VARCHAR NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR NOT NULL,
    technologies TEXT[],
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Portfolio projects table
CREATE TABLE IF NOT EXISTS portfolio_projects (
    id SERIAL PRIMARY KEY,
    title VARCHAR NOT NULL,
    description TEXT NOT NULL,
    image_url VARCHAR NOT NULL,
    category VARCHAR NOT NULL CHECK (category IN ('web', 'mobile', 'video', 'marketing')),
    technologies TEXT[],
    project_url VARCHAR,
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Blog posts table
CREATE TABLE IF NOT EXISTS blog_posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL,
    featured_image VARCHAR,
    author_id VARCHAR REFERENCES users(id),
    published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP,
    meta_title VARCHAR(255),
    meta_description TEXT,
    tags TEXT[],
    read_time INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Client projects table
CREATE TABLE IF NOT EXISTS client_projects (
    id SERIAL PRIMARY KEY,
    client_id VARCHAR REFERENCES users(id) NOT NULL,
    title VARCHAR NOT NULL,
    description TEXT,
    status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'review', 'completed')),
    files TEXT[],
    feedback TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Contact submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    email VARCHAR NOT NULL,
    service VARCHAR,
    message TEXT NOT NULL,
    responded BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- FAQ items table
CREATE TABLE IF NOT EXISTS faq_items (
    id SERIAL PRIMARY KEY,
    question VARCHAR NOT NULL,
    answer TEXT NOT NULL,
    "order" SERIAL
);

-- Certifications table
CREATE TABLE IF NOT EXISTS certifications (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    issuer VARCHAR(255) NOT NULL,
    description TEXT,
    certificate_image VARCHAR,
    issue_date TIMESTAMP,
    expiry_date TIMESTAMP,
    credential_id VARCHAR,
    verification_url VARCHAR,
    category VARCHAR CHECK (category IN ('web', 'mobile', 'design', 'cloud', 'security')),
    "order" INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Partnerships table
CREATE TABLE IF NOT EXISTS partnerships (
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    logo VARCHAR,
    description TEXT,
    partnership_type VARCHAR CHECK (partnership_type IN ('technology', 'strategic', 'integration', 'reseller')),
    website VARCHAR,
    status VARCHAR DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    start_date TIMESTAMP,
    "order" INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Service carts table (for project requests)
CREATE TABLE IF NOT EXISTS service_carts (
    id SERIAL PRIMARY KEY,
    client_id VARCHAR NOT NULL,
    service_ids TEXT[],
    project_name VARCHAR NOT NULL,
    notes TEXT,
    budget VARCHAR,
    timeline VARCHAR,
    files TEXT[],
    status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'in-progress', 'completed')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Project requests table
CREATE TABLE IF NOT EXISTS project_requests (
    id SERIAL PRIMARY KEY,
    cart_id INTEGER REFERENCES service_carts(id),
    client_id VARCHAR NOT NULL,
    project_name VARCHAR NOT NULL,
    service_ids TEXT[],
    description TEXT,
    budget VARCHAR,
    timeline VARCHAR,
    attached_files TEXT[],
    status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'in-review')),
    admin_notes TEXT,
    assigned_team_id VARCHAR,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Project tasks table (Kanban board)
CREATE TABLE IF NOT EXISTS project_tasks (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES project_requests(id),
    title VARCHAR NOT NULL,
    description TEXT,
    assigned_to VARCHAR,
    status VARCHAR DEFAULT 'todo' CHECK (status IN ('todo', 'in-progress', 'review', 'done')),
    priority VARCHAR DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    due_date TIMESTAMP,
    files TEXT[],
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Team members table
CREATE TABLE IF NOT EXISTS team_members (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR NOT NULL,
    name VARCHAR NOT NULL,
    role VARCHAR NOT NULL,
    skills TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Project files table
CREATE TABLE IF NOT EXISTS project_files (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES project_requests(id),
    file_name VARCHAR NOT NULL,
    file_path VARCHAR NOT NULL,
    file_type VARCHAR,
    uploaded_by VARCHAR NOT NULL,
    uploaded_by_role VARCHAR NOT NULL CHECK (uploaded_by_role IN ('client', 'admin', 'team')),
    is_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES project_requests(id),
    client_id VARCHAR NOT NULL,
    invoice_number VARCHAR NOT NULL UNIQUE,
    service_breakdown TEXT,
    subtotal VARCHAR,
    tax VARCHAR,
    discount VARCHAR,
    total VARCHAR NOT NULL,
    status VARCHAR DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'paid', 'pending', 'overdue')),
    due_date TIMESTAMP,
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Project messages table (chat system)
CREATE TABLE IF NOT EXISTS project_messages (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES project_requests(id),
    sender_id VARCHAR NOT NULL,
    sender_role VARCHAR NOT NULL CHECK (sender_role IN ('client', 'admin', 'team')),
    message TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE,
    attachments TEXT[],
    created_at TIMESTAMP DEFAULT NOW()
);

-- Project feedback table
CREATE TABLE IF NOT EXISTS project_feedback (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES project_requests(id),
    client_id VARCHAR NOT NULL,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    feedback TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_client_projects_client_id ON client_projects(client_id);
CREATE INDEX IF NOT EXISTS idx_client_projects_status ON client_projects(status);
CREATE INDEX IF NOT EXISTS idx_project_requests_client_id ON project_requests(client_id);
CREATE INDEX IF NOT EXISTS idx_project_requests_status ON project_requests(status);
CREATE INDEX IF NOT EXISTS idx_project_tasks_project_id ON project_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_status ON project_tasks(status);
CREATE INDEX IF NOT EXISTS idx_project_files_project_id ON project_files(project_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_project_messages_project_id ON project_messages(project_id);

-- Insert sample data for development
INSERT INTO services (title, description, icon, technologies, featured) VALUES
('Web Development', 'Custom websites and web applications built with modern technologies', 'Code', ARRAY['React', 'Node.js', 'TypeScript', 'PostgreSQL'], true),
('Mobile App Development', 'Native and cross-platform mobile applications', 'Smartphone', ARRAY['React Native', 'Flutter', 'iOS', 'Android'], true),
('UI/UX Design', 'User interface and user experience design services', 'Palette', ARRAY['Figma', 'Adobe XD', 'Sketch', 'Photoshop'], true),
('Digital Marketing', 'SEO, social media, and online marketing strategies', 'TrendingUp', ARRAY['SEO', 'Google Ads', 'Social Media', 'Analytics'], false),
('E-commerce Solutions', 'Online store development and management', 'ShoppingCart', ARRAY['Shopify', 'WooCommerce', 'Stripe', 'PayPal'], false),
('Cloud Solutions', 'Cloud infrastructure and deployment services', 'Cloud', ARRAY['AWS', 'Google Cloud', 'Azure', 'Docker'], false);

INSERT INTO portfolio_projects (title, description, image_url, category, technologies, featured) VALUES
('E-commerce Platform', 'Modern e-commerce solution with advanced features', '/images/portfolio/ecommerce.jpg', 'web', ARRAY['React', 'Node.js', 'Stripe', 'PostgreSQL'], true),
('Mobile Banking App', 'Secure mobile banking application', '/images/portfolio/banking-app.jpg', 'mobile', ARRAY['React Native', 'Firebase', 'Biometric Auth'], true),
('Corporate Website', 'Professional corporate website with CMS', '/images/portfolio/corporate.jpg', 'web', ARRAY['Next.js', 'Tailwind CSS', 'Sanity CMS'], false),
('Food Delivery App', 'Real-time food delivery mobile application', '/images/portfolio/food-app.jpg', 'mobile', ARRAY['Flutter', 'Google Maps', 'Real-time tracking'], false);

INSERT INTO faq_items (question, answer) VALUES
('How long does a typical project take?', 'Project timelines vary depending on complexity. Simple websites take 2-4 weeks, while complex applications can take 3-6 months.'),
('Do you provide ongoing support?', 'Yes, we offer maintenance and support packages for all our projects to ensure they stay updated and secure.'),
('What technologies do you use?', 'We use modern technologies including React, Node.js, PostgreSQL, and cloud platforms like AWS and Google Cloud.'),
('Can you work with existing systems?', 'Absolutely! We specialize in integrating with existing systems and can help modernize legacy applications.');

-- Create a trigger to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply the trigger to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_client_projects_updated_at BEFORE UPDATE ON client_projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_certifications_updated_at BEFORE UPDATE ON certifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_partnerships_updated_at BEFORE UPDATE ON partnerships FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_service_carts_updated_at BEFORE UPDATE ON service_carts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_project_requests_updated_at BEFORE UPDATE ON project_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_project_tasks_updated_at BEFORE UPDATE ON project_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Database setup complete
SELECT 'Database schema created successfully!' as status;