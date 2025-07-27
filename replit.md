# Inventer Design Studio - Project Overview

## Overview

This is a comprehensive digital agency website built for Inventer Design Studio. The application is a full-stack TypeScript project featuring a React frontend with a Node.js/Express backend, designed to showcase the company's services, portfolio, and provide client management capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

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
- **About**: Company information, timeline, values, and team details
- **Services**: Comprehensive service listings with process breakdown
- **Portfolio**: Project showcase with category filtering and detailed project views
- **Blog**: Content management system for articles and insights
- **Contact**: Contact form with service selection and company location info
- **FAQ**: Frequently asked questions with collapsible interface
- **Privacy Policy**: Legal compliance page

### Protected Areas
- **Client Portal**: Project tracking, file downloads, communication for clients
- **Admin Portal**: Content management, client project management, contact submissions

### Shared Components
- **Navigation**: Responsive navigation with authentication state awareness
- **Footer**: Company links, social media, and contact information
- **AnimatedSection**: Reusable component for scroll-triggered animations
- **Service/Portfolio/Blog Cards**: Consistent card layouts across content types

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

The application follows modern full-stack development practices with emphasis on type safety, performance, and maintainability. The architecture supports both development and production environments while providing a solid foundation for future feature additions.