#!/bin/bash

# Inventer Design Studio - Local Setup Script
# This script helps set up the application on your local PC

echo "🚀 Setting up Inventer Design Studio locally..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "Download from: https://nodejs.org/"
    exit 1
fi

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL is not found. You can either:"
    echo "1. Install PostgreSQL locally"
    echo "2. Use Docker (recommended): docker-compose up -d db"
    echo ""
    read -p "Do you want to continue with Docker setup? (y/n): " use_docker
    if [ "$use_docker" != "y" ]; then
        echo "Please install PostgreSQL and run this script again."
        exit 1
    fi
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "✅ .env file created. Please edit it with your Firebase credentials."
    echo ""
    echo "Required Firebase setup:"
    echo "1. Go to https://console.firebase.google.com/"
    echo "2. Create a new project"
    echo "3. Enable Google Sign-In in Authentication"
    echo "4. Get your Firebase config from Project Settings"
    echo "5. Update the .env file with your Firebase credentials"
    echo ""
    read -p "Press Enter after you've updated the .env file..."
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Set up database
if [ "$use_docker" == "y" ]; then
    echo "🐳 Setting up database with Docker..."
    docker-compose up -d db
    echo "⏳ Waiting for database to be ready..."
    sleep 10
else
    echo "🗄️  Setting up local PostgreSQL database..."
    
    # Create database
    read -p "Enter PostgreSQL username (default: postgres): " pg_user
    pg_user=${pg_user:-postgres}
    
    echo "Creating database..."
    createdb -U $pg_user inventer_design_studio 2>/dev/null || echo "Database may already exist"
    
    # Run init script
    echo "Setting up database schema..."
    psql -U $pg_user -d inventer_design_studio -f init.sql
fi

# Push database schema with Drizzle
echo "🔄 Pushing database schema..."
npm run db:push

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 To start the development server:"
echo "   npm run dev"
echo ""
echo "🌐 The application will be available at:"
echo "   http://localhost:5000"
echo ""
echo "📚 For more information, see README.md"