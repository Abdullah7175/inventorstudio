# Deployment Guide

This guide covers deploying Inventer Design Studio on your local PC with complete cross-environment support.

## 🏗️ Complete Database Structure

The application uses a comprehensive PostgreSQL database with the following structure:

### Core Tables

1. **users** - User management with role-based access
2. **sessions** - Express session storage for authentication
3. **services** - Company services catalog
4. **portfolio_projects** - Portfolio showcase items
5. **blog_posts** - Blog content with SEO optimization
6. **contact_submissions** - Contact form submissions
7. **faq_items** - Frequently asked questions

### Project Management System

8. **service_carts** - Client service selection and requests
9. **project_requests** - Admin-reviewed project requests
10. **project_tasks** - Kanban-style task management
11. **team_members** - Team member profiles and skills
12. **project_files** - File management with role-based access
13. **invoices** - Billing and invoicing system
14. **project_messages** - Real-time messaging between stakeholders
15. **project_feedback** - Client feedback and project ratings

### Content Management

16. **certifications** - Company certifications and credentials
17. **partnerships** - Business partnerships and integrations

## 🚀 Quick Local Deployment

### Option 1: Automated Setup (Recommended)

```bash
# Clone the repository
git clone <your-repo-url>
cd inventer-design-studio

# Run the automated setup script
chmod +x local-setup.sh
./local-setup.sh
```

The script will:
- Check prerequisites (Node.js, PostgreSQL)
- Create `.env` file from template
- Install dependencies
- Set up database (Docker or local PostgreSQL)
- Run database migrations
- Provide next steps

### Option 2: Manual Setup

#### Step 1: Prerequisites
- Node.js 18+
- PostgreSQL 15+ (or Docker)
- Firebase project with Google OAuth

#### Step 2: Environment Setup
```bash
cp .env.example .env
# Edit .env with your configuration
```

#### Step 3: Database Setup

**With Docker (Recommended):**
```bash
docker-compose up -d db
```

**With Local PostgreSQL:**
```bash
# Create database
createdb inventer_design_studio

# Run schema setup
psql inventer_design_studio < init.sql
```

#### Step 4: Application Setup
```bash
# Install dependencies
npm install

# Push database schema
npm run db:push

# Start development server
npm run dev
```

## 🔐 Firebase Configuration

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create new project

2. **Enable Authentication**
   - Go to Authentication → Sign-in method
   - Enable Google provider
   - Add authorized domains:
     - `localhost` (for development)
     - Your production domain

3. **Get Configuration**
   - Project Settings → General
   - Copy these values to your `.env`:
     - `VITE_FIREBASE_API_KEY`
     - `VITE_FIREBASE_PROJECT_ID`
     - `VITE_FIREBASE_APP_ID`

## 🐳 Docker Deployment

### Development with Docker Compose
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

### Production Deployment
```bash
# Build and start production containers
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Or build custom image
docker build -t inventer-design-studio .
docker run -p 5000:5000 --env-file .env inventer-design-studio
```

## 🗄️ Database Management

### Backup Database
```bash
# With Docker
docker-compose exec db pg_dump -U admin inventer_design_studio > backup.sql

# Local PostgreSQL
pg_dump inventer_design_studio > backup.sql
```

### Restore Database
```bash
# With Docker
docker-compose exec -T db psql -U admin inventer_design_studio < backup.sql

# Local PostgreSQL
psql inventer_design_studio < backup.sql
```

### Schema Updates
```bash
# Apply schema changes
npm run db:push

# Generate migrations (if needed)
npx drizzle-kit generate:pg
```

## 🔧 Environment Variables

### Required Variables
```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/inventer_design_studio

# Firebase Authentication
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_APP_ID=your_app_id

# Security
JWT_SECRET=your_secure_jwt_secret_at_least_32_characters
```

### Optional Variables
```env
# Environment
NODE_ENV=development
PORT=5000

# AI Features
OPENAI_API_KEY=your_openai_key

# File Upload (future enhancement)
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
```

## 📱 First User Setup

1. **Start the application**
2. **Access the homepage** (http://localhost:5000)
3. **Sign in with Google** - First user automatically becomes admin
4. **Access admin portal** to configure:
   - Services catalog
   - Portfolio projects
   - Team members
   - Blog content

## 🔒 Security Considerations

### JWT Configuration
- Use a strong JWT secret (32+ characters)
- Set appropriate cookie expiration
- Use httpOnly cookies in production

### Database Security
- Use strong database passwords
- Limit database user permissions
- Enable SSL in production

### Firebase Security
- Restrict API keys to specific domains
- Configure proper security rules
- Monitor authentication logs

## 📊 Performance Optimization

### Database
- Indexes are automatically created for optimal performance
- Connection pooling configured for both Neon and PostgreSQL
- Query optimization with Drizzle ORM

### Frontend
- Vite for fast builds and HMR
- Code splitting and lazy loading
- Optimized bundle sizes

### Caching
- TanStack Query for client-side caching
- Static asset caching
- Database query optimization

## 🔍 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   ```bash
   # Check if PostgreSQL is running
   pg_isready -h localhost -p 5432
   
   # Check database exists
   psql -l | grep inventer_design_studio
   ```

2. **Firebase Auth Not Working**
   - Verify Firebase configuration in .env
   - Check authorized domains in Firebase Console
   - Ensure Google Sign-In is enabled

3. **Port Already in Use**
   ```bash
   # Kill process on port 5000
   lsof -ti:5000 | xargs kill -9
   
   # Or use different port
   PORT=3000 npm run dev
   ```

4. **Build Errors**
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   
   # Check TypeScript errors
   npm run check
   ```

### Logs and Debugging

- Application logs: `docker-compose logs -f app`
- Database logs: `docker-compose logs -f db`
- Development logs: Console output when running `npm run dev`

## 📈 Monitoring

### Health Checks
- Health endpoint: `GET /api/health`
- Database connectivity check
- Service status monitoring

### Analytics
- User authentication metrics
- Project completion rates
- API response times

## 🚀 Production Deployment

### Environment Setup
1. Set `NODE_ENV=production`
2. Use production database
3. Configure proper domain in Firebase
4. Set up SSL certificates
5. Configure reverse proxy (nginx)

### Build Process
```bash
# Build production assets
npm run build

# Start production server
npm start
```

## 📞 Support

For deployment issues:
1. Check the troubleshooting section
2. Verify environment variables
3. Check application logs
4. Test database connectivity
5. Validate Firebase configuration