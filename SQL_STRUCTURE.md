# Complete PostgreSQL Database Structure

This document provides the complete SQL commands to create the Inventer Design Studio database structure for local deployment.

## Create Database Commands

```sql
-- Create database (run as PostgreSQL superuser)
CREATE DATABASE inventer_design_studio;

-- Connect to the database
\c inventer_design_studio;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

## Core Tables

### 1. Sessions Table (Express Session Storage)
```sql
CREATE TABLE sessions (
    sid VARCHAR PRIMARY KEY,
    sess JSONB NOT NULL,
    expire TIMESTAMP NOT NULL
);

CREATE INDEX "IDX_session_expire" ON sessions(expire);
```

### 2. Users Table (Authentication & Role Management)
```sql
CREATE TABLE users (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR UNIQUE,
    first_name VARCHAR,
    last_name VARCHAR,
    profile_image_url VARCHAR,
    role VARCHAR DEFAULT 'client' NOT NULL CHECK (role IN ('client', 'admin', 'team')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

### 3. Services Table (Company Services Catalog)
```sql
CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    title VARCHAR NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR NOT NULL,
    technologies TEXT[],
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 4. Portfolio Projects Table
```sql
CREATE TABLE portfolio_projects (
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
```

### 5. Blog Posts Table (SEO Optimized)
```sql
CREATE TABLE blog_posts (
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

CREATE INDEX idx_blog_posts_published ON blog_posts(published);
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
```

### 6. Client Projects Table
```sql
CREATE TABLE client_projects (
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

CREATE INDEX idx_client_projects_client_id ON client_projects(client_id);
CREATE INDEX idx_client_projects_status ON client_projects(status);
```

### 7. Contact Submissions Table
```sql
CREATE TABLE contact_submissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    email VARCHAR NOT NULL,
    service VARCHAR,
    message TEXT NOT NULL,
    responded BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 8. FAQ Items Table
```sql
CREATE TABLE faq_items (
    id SERIAL PRIMARY KEY,
    question VARCHAR NOT NULL,
    answer TEXT NOT NULL,
    "order" SERIAL
);
```

## Project Management System

### 9. Service Carts Table (Client Requests)
```sql
CREATE TABLE service_carts (
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
```

### 10. Project Requests Table (Admin Review)
```sql
CREATE TABLE project_requests (
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

CREATE INDEX idx_project_requests_client_id ON project_requests(client_id);
CREATE INDEX idx_project_requests_status ON project_requests(status);
```

### 11. Project Tasks Table (Kanban Board)
```sql
CREATE TABLE project_tasks (
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

CREATE INDEX idx_project_tasks_project_id ON project_tasks(project_id);
CREATE INDEX idx_project_tasks_status ON project_tasks(status);
```

### 12. Team Members Table
```sql
CREATE TABLE team_members (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR NOT NULL,
    name VARCHAR NOT NULL,
    role VARCHAR NOT NULL,
    skills TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 13. Project Files Table (Role-Based Access)
```sql
CREATE TABLE project_files (
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

CREATE INDEX idx_project_files_project_id ON project_files(project_id);
```

### 14. Invoices Table (Billing System)
```sql
CREATE TABLE invoices (
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

CREATE INDEX idx_invoices_client_id ON invoices(client_id);
CREATE INDEX idx_invoices_status ON invoices(status);
```

### 15. Project Messages Table (Real-Time Chat)
```sql
CREATE TABLE project_messages (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES project_requests(id),
    sender_id VARCHAR NOT NULL,
    sender_role VARCHAR NOT NULL CHECK (sender_role IN ('client', 'admin', 'team')),
    message TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE,
    attachments TEXT[],
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_project_messages_project_id ON project_messages(project_id);
```

### 16. Project Feedback Table
```sql
CREATE TABLE project_feedback (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES project_requests(id),
    client_id VARCHAR NOT NULL,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    feedback TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## Content Management Extensions

### 17. Certifications Table
```sql
CREATE TABLE certifications (
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
```

### 18. Partnerships Table
```sql
CREATE TABLE partnerships (
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
```

## Triggers for Automatic Timestamps

```sql
-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to relevant tables
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at 
    BEFORE UPDATE ON blog_posts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_projects_updated_at 
    BEFORE UPDATE ON client_projects 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_certifications_updated_at 
    BEFORE UPDATE ON certifications 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_partnerships_updated_at 
    BEFORE UPDATE ON partnerships 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_carts_updated_at 
    BEFORE UPDATE ON service_carts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_requests_updated_at 
    BEFORE UPDATE ON project_requests 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_tasks_updated_at 
    BEFORE UPDATE ON project_tasks 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Sample Data for Development

```sql
-- Insert sample services
INSERT INTO services (title, description, icon, technologies, featured) VALUES
('Web Development', 'Custom websites and web applications', 'Code', ARRAY['React', 'Node.js', 'TypeScript'], true),
('Mobile App Development', 'Native and cross-platform mobile apps', 'Smartphone', ARRAY['React Native', 'Flutter'], true),
('UI/UX Design', 'User interface and experience design', 'Palette', ARRAY['Figma', 'Adobe XD'], true),
('Digital Marketing', 'SEO and online marketing strategies', 'TrendingUp', ARRAY['SEO', 'Google Ads'], false),
('E-commerce Solutions', 'Online store development', 'ShoppingCart', ARRAY['Shopify', 'WooCommerce'], false),
('Cloud Solutions', 'Cloud infrastructure services', 'Cloud', ARRAY['AWS', 'Google Cloud'], false);

-- Insert sample portfolio projects
INSERT INTO portfolio_projects (title, description, image_url, category, technologies, featured) VALUES
('E-commerce Platform', 'Modern e-commerce solution', '/images/portfolio/ecommerce.jpg', 'web', ARRAY['React', 'Node.js'], true),
('Mobile Banking App', 'Secure mobile banking application', '/images/portfolio/banking.jpg', 'mobile', ARRAY['React Native'], true),
('Corporate Website', 'Professional corporate website', '/images/portfolio/corporate.jpg', 'web', ARRAY['Next.js'], false),
('Food Delivery App', 'Real-time food delivery app', '/images/portfolio/food.jpg', 'mobile', ARRAY['Flutter'], false);

-- Insert sample FAQ items
INSERT INTO faq_items (question, answer) VALUES
('How long does a project take?', 'Project timelines vary from 2-4 weeks for simple websites to 3-6 months for complex applications.'),
('Do you provide ongoing support?', 'Yes, we offer maintenance and support packages for all projects.'),
('What technologies do you use?', 'We use modern technologies including React, Node.js, PostgreSQL, and cloud platforms.'),
('Can you work with existing systems?', 'Absolutely! We specialize in integrating with existing systems and modernizing legacy applications.');
```

## Complete Setup Command

To set up the entire database structure in one command:

```bash
# Create database and run all SQL commands
psql -c "CREATE DATABASE inventer_design_studio;"
psql inventer_design_studio < init.sql
```

Or for Docker:
```bash
# Start PostgreSQL with Docker
docker run -d --name postgres-ids \
  -e POSTGRES_DB=inventer_design_studio \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=secure_password \
  -p 5432:5432 postgres:15-alpine

# Run SQL setup
docker exec -i postgres-ids psql -U admin -d inventer_design_studio < init.sql
```