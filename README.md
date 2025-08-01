# Inventer Design Studio

A comprehensive digital agency platform built with React, Node.js, and PostgreSQL, featuring Firebase authentication, project management, and AI-powered tools.

## 🚀 Features

- **Authentication**: Firebase Google OAuth with JWT sessions
- **Role-Based Access**: Admin, Team, and Client portals
- **Project Management**: Kanban boards, file sharing, messaging
- **Content Management**: Blog, portfolio, services, certifications
- **AI-Powered Tools**: Design recommendations, project health analysis
- **Real-Time Communication**: WebSocket chat system
- **Responsive Design**: Mobile-first approach with dark theme

## 🛠 Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Wouter for routing
- Tailwind CSS + shadcn/ui components
- Framer Motion for animations
- TanStack Query for state management

### Backend
- Node.js with Express.js
- PostgreSQL with Drizzle ORM
- Firebase Authentication
- JWT tokens with httpOnly cookies
- WebSocket for real-time features

### Infrastructure
- Docker & Docker Compose
- PostgreSQL database
- File upload handling
- Environment-based configuration

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL 15+ (or Docker)
- Firebase project with Google OAuth enabled

## 🚀 Quick Start

### Option 1: Docker Compose (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd inventer-design-studio
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your Firebase credentials:
   ```env
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_PROJECT_ID=your_firebase_project_id  
   VITE_FIREBASE_APP_ID=your_firebase_app_id
   JWT_SECRET=your_secure_jwt_secret_at_least_32_chars
   ```

3. **Start with Docker Compose**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:5000
   - Database: localhost:5432

### Option 2: Local Development

1. **Set up PostgreSQL database**
   ```bash
   # Create database
   createdb inventer_design_studio
   
   # Run the init script
   psql inventer_design_studio < init.sql
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Push database schema**
   ```bash
   npm run db:push
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## 🔐 Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Google Sign-In in Authentication
4. Add your domain to authorized domains
5. Get your Firebase config values from Project Settings

## 📊 Database Structure

The application uses a comprehensive PostgreSQL schema with the following main tables:

### Core Tables
- `users` - User accounts with role-based access
- `sessions` - Express session storage
- `services` - Company services catalog
- `portfolio_projects` - Portfolio showcase
- `blog_posts` - Blog content with SEO features

### Project Management
- `project_requests` - Client project requests
- `project_tasks` - Kanban-style task management
- `project_files` - File management with role-based access
- `project_messages` - Real-time messaging system
- `invoices` - Billing and invoicing
- `project_feedback` - Client feedback and ratings

### Content Management
- `contact_submissions` - Contact form submissions
- `faq_items` - FAQ management
- `certifications` - Company certifications
- `partnerships` - Business partnerships

## 🔧 Environment Variables

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/inventer_design_studio

# Firebase (Required)
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_APP_ID=your_app_id

# JWT Secret (Required)
JWT_SECRET=your_secure_secret_key

# Optional
NODE_ENV=development
PORT=5000
OPENAI_API_KEY=your_openai_key_for_ai_features
```

## 📱 User Roles & Access

### Admin
- Full system access
- User role management
- Content management (blog, portfolio, services)
- Project approval and assignment
- Analytics and reporting

### Team
- Assigned project access
- Task management
- File uploads
- Client communication
- Project progress updates

### Client
- Own project viewing
- File downloads
- Project communication
- Service requests
- Invoice viewing

## 🛠 Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run check

# Database operations
npm run db:push        # Push schema changes
```

## 🐳 Docker Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild and start
docker-compose up --build -d

# Database backup
docker-compose exec db pg_dump -U admin inventer_design_studio > backup.sql
```

## 🔄 API Endpoints

### Authentication
- `POST /api/auth/google` - Google OAuth login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/user` - Get current user

### Public API
- `GET /api/services` - List services
- `GET /api/portfolio` - Portfolio projects
- `GET /api/blog` - Blog posts
- `POST /api/contact` - Contact form

### Protected Routes
- `/api/admin/*` - Admin-only endpoints
- `/api/team/*` - Team member endpoints  
- `/api/client/*` - Client-specific endpoints

## 🎨 Customization

### Styling
- Edit `client/src/index.css` for global styles
- Modify `tailwind.config.ts` for theme customization
- Update component styles in `client/src/components/ui/`

### Content
- Update company information in the footer component
- Modify hero sections in page components
- Add/edit services in the admin portal

## 🔍 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check DATABASE_URL format
   - Ensure PostgreSQL is running
   - Verify database exists

2. **Firebase Auth Not Working**
   - Check Firebase config values
   - Verify authorized domains in Firebase console
   - Ensure Google Sign-In is enabled

3. **JWT Token Issues**
   - Verify JWT_SECRET is set and consistent
   - Check cookie settings in browser

4. **Build Errors**
   - Clear node_modules and reinstall
   - Check TypeScript errors with `npm run check`

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For issues and questions:
- Check the troubleshooting section
- Review logs: `docker-compose logs -f app`
- Create an issue in the repository