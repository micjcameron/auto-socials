#!/bin/bash

# Database wipe script for Auto-Socials
# This script drops and recreates the public schema using the auto_socials user
# WARNING: This will WIPE ALL TABLES AND DATA in the database!

set -e

DB_USER=auto_socials
DB_PASSWORD=auto_socials_password
DB_NAME=auto_socials
DB_HOST=localhost
DB_PORT=5432

export PGPASSWORD=$DB_PASSWORD

echo "⚠️  WARNING: This will DROP and RECREATE the public schema, wiping ALL tables and data!"
echo "🔧 Wiping PostgreSQL database..."

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
until pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USER; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 2
done

echo "✅ PostgreSQL is ready!"

echo "🧹 Dropping and recreating public schema (wiping all tables)..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

echo "✅ Database wipe complete!" 