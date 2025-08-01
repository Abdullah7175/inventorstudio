# Inventer Design Studio - Project Overview

## Overview
This project is a comprehensive digital agency website for Inventer Design Studio, offering full-stack capabilities with a React frontend and Node.js/Express backend. Its purpose is to showcase the company's services and portfolio, and provide robust client and project management features. The platform aims to be a comprehensive project collaboration tool, enhancing client interaction and internal workflow efficiency with advanced AI capabilities.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Core Technologies
- **Frontend**: React 18 with TypeScript, Vite, Wouter for routing, shadcn/ui (Radix UI) for components, Tailwind CSS for styling, Framer Motion for animations, and TanStack Query for state management.
- **Backend**: Node.js with Express.js, TypeScript, PostgreSQL (Neon serverless) with Drizzle ORM, and Express sessions for session management.
- **Authentication**: Firebase Authentication with Google OAuth and JWT tokens.
- **Monorepo Structure**: Client, server, and shared code are unified for streamlined development.
- **Type Safety**: End-to-end TypeScript implementation.
- **UI/UX**: Modern dark theme with lime green accents, responsive design with a mobile-first approach.

### Key Features
- **Public Pages**: Landing, Home, About, Services, Portfolio, Blog, Contact, FAQ, Privacy Policy.
- **Protected Areas**: Client Portal (project tracking, file downloads, communication) and Admin Portal (content, client, and contact management).
- **Authentication Flow**: Firebase Google OAuth, JWT token-based sessions, role-based access control.
- **Content Management**: Admin-managed services, portfolio, blog, with public API access.
- **Client Project Flow**: Admin assigns projects, clients track progress, file management, status tracking (pending, in-progress, completed, on-hold).
- **Project Management System**: Service cart for client requests, Kanban board for tasks (To Do, In Progress, Review, Done), role-based access for clients, team members, and admin. Includes features for project tasks, team management, file sharing, invoicing, messaging, and feedback.
- **Real-Time Communication**: WebSocket-based chat system with message broadcasting, typing indicators, and message persistence.
- **AI-Powered Features**:
    - **AI Design Recommendations**: Intelligent design analysis (color, layout, typography, UX, branding) using OpenAI (GPT-4o).
    - **Project Health Analysis**: AI assessment of project status (timeline, budget, team performance, quality, risk).
    - **Personalized Communication Generation**: AI-assisted client communication with context-aware content.
    - **Advanced Project Management**: Drag-and-drop timeline, visual project health indicators, one-click design version comparison.

### Design Decisions & Enhancements
- **Background Elements**: Low-opacity, animated background patterns (floating icons, geometric shapes, code patterns) designed with specific page contexts (services, tech stack, marketing, design) for visual appeal without distracting from content.
- **Mobile Responsiveness**: Comprehensive mobile-first CSS architecture, touch-optimized interfaces, safe area support, GPU acceleration, and a dedicated slide-out mobile navigation system.
- **Navigation**: Smart, role-based navigation displaying different items based on authentication status and user role (Public, Authenticated, Client, Team, Admin).

## External Dependencies

### Database & Infrastructure
- **Cross-Environment Database**: Supports both Neon (serverless) and standard PostgreSQL for local development.
- **Docker Support**: Complete Docker Compose setup with PostgreSQL container.
- **Replit**: Development and deployment platform.

### UI & Styling
- **Radix UI**: Accessible component primitives.
- **Tailwind CSS**: Utility-first CSS framework.
- **Framer Motion**: Animation library.
- **Lucide React**: Icon library.

### Development & AI
- **Drizzle Kit**: Database migration management.
- **TSX**: TypeScript execution for development.
- **ESBuild**: Fast bundling for production.
- **PostCSS**: CSS processing.
- **OpenAI**: For AI-powered features (e.g., GPT-4o).
- **WebSocket**: For real-time communication.

## Cross-Environment Deployment

### Local Development Support
- **Automated Setup Script**: `local-setup.sh` for easy local deployment
- **Environment Templates**: `.env.example` with all required configurations
- **Docker Support**: Complete `docker-compose.yml` for containerized development
- **Database Flexibility**: Automatic detection and support for both Neon and PostgreSQL
- **Health Checks**: Built-in health monitoring for Docker deployments

### Deployment Options
- **Local PostgreSQL**: Direct connection to local PostgreSQL database
- **Docker Compose**: Containerized setup with PostgreSQL and application
- **Hybrid**: Local development with Docker database
- **Cloud**: Neon serverless PostgreSQL for production

### Configuration Management
- **Environment Variables**: Comprehensive `.env.example` template
- **Cross-Platform**: Works on Windows, macOS, and Linux
- **Security**: JWT-based authentication with configurable secrets
- **Firebase Integration**: Complete Firebase Authentication setup guide