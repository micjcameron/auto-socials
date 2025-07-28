#!/bin/bash

# Database initialization script for Auto-Socials
# This script creates the database user and database

set -e

echo "🔧 Initializing PostgreSQL database..."

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
until pg_isready -h localhost -p 5432 -U postgres; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 2
done

echo "✅ PostgreSQL is ready!"

# Create user and database
echo "👤 Creating database user..."
psql -h localhost -p 5432 -U postgres -c "CREATE USER auto_socials WITH PASSWORD 'auto_socials_password';" || echo "User might already exist"

echo "🗄️ Creating database..."
psql -h localhost -p 5432 -U postgres -c "CREATE DATABASE auto_socials OWNER auto_socials;" || echo "Database might already exist"

echo "🔐 Granting privileges..."
psql -h localhost -p 5432 -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE auto_socials TO auto_socials;"

echo "✅ Database initialization complete!"
echo "📊 You can now connect to the database at localhost:5432"
echo "   Database: auto_socials"
echo "   User: auto_socials"
echo "   Password: auto_socials_password" 