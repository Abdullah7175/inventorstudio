# Inventer Design Studio - Project Overview

## Overview

This is a comprehensive digital agency website built for **inventerdesignstudio.com** using custom code (React/Node.js) and deployed on Replit. The application is a full-stack TypeScript project featuring a React frontend with a Node.js/Express backend, designed to showcase the company's services, portfolio, and provide both client and admin portal functionality.

## User Preferences

Preferred communication style: Simple, everyday language.

## Project Scope Alignment

Based on the final structure document, our implementation includes:

### ✅ Completed Core Pages
- `/` - Home page with hero, services preview, portfolio showcase
- `/about` - Company information, team, timeline, values
- `/services` - Comprehensive service listings with detailed descriptions
- `/portfolio` - Project showcase with filtering and detailed views
- `/blog` - Content management system for articles
- `/contact` - Contact form with service selection
- `/client-portal` - Project tracking and file access for clients
- `/admin-portal` - Content and client project management
- `/faq` - Frequently asked questions with collapsible interface
- `/privacy-policy` - Legal compliance page
- `/recommendations` - **NEW** Personalized design recommendation engine

### ✅ Completed Features
- **Authentication**: Replit Auth integration with role-based access
- **Database**: PostgreSQL with comprehensive schema for all content types
- **File Management**: Admin can manage client projects and file attachments
- **Content Management**: Full CRUD operations for services, portfolio, blog, FAQ
- **Responsive Design**: Mobile-first design with dark/light theme support
- **SEO Ready**: Meta tags, structured content, clean URLs
- **Clean UI**: Professional design with lime green accent, no blur effects

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **Routing**: Wouter for lightweight client-side routing
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Animations**: Framer Motion for smooth animations and transitions
- **State Management**: TanStack Query (React Query) for server state management

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL via Neon serverless
- **ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Replit Auth integration with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL storage

### Key Design Decisions
- **Monorepo Structure**: Client, server, and shared code in a single repository for easier development
- **Type Safety**: Full TypeScript coverage from database schema to frontend components
- **Modern UI**: Dark theme with lime green accent color for a modern tech aesthetic
- **Responsive Design**: Mobile-first approach with Tailwind CSS breakpoints

## Key Components

### Public Pages
- **Landing Page**: Hero section with company overview for non-authenticated users
- **Home Page**: Full featured homepage for authenticated users with services, portfolio preview
- **About**: Company information, timeline, values, and team details (Lahore, UAE locations)
- **Services**: Comprehensive service listings covering:
  - Website & App Development
  - DevOps / SysOps / AiOps
  - Video Editing / Motion Graphics
  - System Admin & IT Services
  - Digital Marketing / SMM
- **Portfolio**: Project showcase with category filtering, tech stack details, client feedback
- **Blog**: SEO-focused content management system with pagination
- **Contact**: Contact form with Google Map integration and social media links
- **FAQ**: Frequently asked questions covering payment terms, formats, turnaround time
- **Privacy Policy**: Legal compliance for data protection and cookies
- **Recommendations**: **NEW** Personalized design recommendation engine with AI-powered suggestions

### Protected Areas
- **Client Portal**: Project tracking, file downloads, status updates, feedback forms
- **Admin Portal**: Content management, client project management, file uploads, contact submissions

### Shared Components
- **Navigation**: Responsive navigation with authentication state awareness
- **Footer**: Company links, social media, and contact information
- **AnimatedSection**: Reusable component for scroll-triggered animations
- **Service/Portfolio/Blog Cards**: Consistent card layouts across content types
- **Theme System**: Dual theme with automatic time-based switching

## Data Flow

### Authentication Flow
1. Users authenticate via Replit Auth (OAuth/OpenID Connect)
2. Sessions stored in PostgreSQL with automatic cleanup
3. Role-based access control (client/admin roles)
4. Protected routes redirect unauthenticated users

### Content Management Flow
1. Admin creates/manages services, portfolio projects, blog posts
2. Content stored in PostgreSQL with proper relationships
3. Public API endpoints serve content to frontend
4. Real-time updates via React Query invalidation

### Client Project Flow
1. Admin creates projects and assigns to clients
2. Clients view projects in their portal
3. File attachments and project updates managed through admin interface
4. Status tracking (pending, in-progress, completed, on-hold)

## External Dependencies

### Database & Infrastructure
- **Neon**: Serverless PostgreSQL hosting
- **Replit**: Development and deployment platform
- **WebSocket Support**: For Neon database connections

### UI & Styling
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Animation library
- **Lucide React**: Icon library

### Development Tools
- **Drizzle Kit**: Database migration management
- **TSX**: TypeScript execution for development
- **ESBuild**: Fast bundling for production
- **PostCSS**: CSS processing with Autoprefixer

## Deployment Strategy

### Development Environment
- **Local Development**: `npm run dev` starts both frontend and backend
- **Hot Reload**: Vite HMR for frontend, TSX watch mode for backend
- **Database**: Drizzle Kit for schema changes with `npm run db:push`

### Production Deployment
- **Build Process**: Vite builds frontend, ESBuild bundles backend
- **Static Assets**: Frontend compiled to `dist/public`
- **Server Bundle**: Backend compiled to `dist/index.js`
- **Environment Variables**: `DATABASE_URL`, `SESSION_SECRET`, `REPL_ID` required
- **Replit Deployment**: Configured for seamless Replit hosting

### Database Management
- **Schema**: Defined in `shared/schema.ts` with Drizzle ORM
- **Migrations**: Generated automatically and stored in `migrations/` folder
- **Connection**: Neon serverless with WebSocket support for edge deployment
- **Session Storage**: Dedicated sessions table for Express session management

## Recent Changes (Latest Session)

### ✅ Completed: Personalized Design Recommendation Engine
- **Database Schema**: Added user_preferences, design_templates, user_recommendations, user_interactions tables
- **API Routes**: Complete CRUD operations for preferences, recommendations, templates, and interactions
- **Frontend Components**: PreferencesForm, RecommendationsDisplay, and Recommendations page
- **UI Components**: Created Badge, Checkbox, Textarea, Tabs components
- **Sample Data**: Populated 5 design templates covering different industries and styles
- **Navigation**: Added recommendations link to main navigation

### ✅ Fixed: Website Visibility Issues
- **Text Contrast**: Improved foreground colors from very light to strong contrast
- **Typography**: Enhanced gradient text with better color combinations and bold weight
- **Readability**: Fixed faded/blurred text appearance across all pages

## Future Enhancements (Based on Scope Document)

### Potential Free Add-ons Integration
- **Live Chat**: Tawk.to or Crisp integration (site-wide footer)
- **File Hosting**: Enhanced Google Drive or Firebase Storage integration
- **Client Notifications**: Zapier integration for automated notifications
- **Advanced Analytics**: Google Analytics integration with conversion tracking
- **Security**: Cloudflare SSL implementation
- **Backup System**: Automated Google Drive sync for data protection

The application follows modern full-stack development practices with emphasis on type safety, performance, and maintainability. The current implementation fully satisfies the scope requirements for a professional digital agency website with both client and admin portals, deployed on Replit with PostgreSQL database.