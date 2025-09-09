#!/bin/bash

# Best Lap - Backup Script
# Creates backups of database and important files

set -e

echo "💾 Best Lap - Creating Backup..."

# Create backup directory
mkdir -p backups

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backups/backup_$TIMESTAMP"
mkdir -p $BACKUP_DIR

# Backup database
echo "📦 Backing up PostgreSQL database..."
if docker compose -f docker-compose.prod.yml ps | grep -q "best-lap-postgres"; then
    docker run --rm \
      --network best-lap-network \
      -v $(pwd)/$BACKUP_DIR:/backup \
      -e PGPASSWORD=best_lap \
      postgres:15-alpine \
      pg_dump -h best-lap-postgres -U best_lap best_lap_db > $BACKUP_DIR/database.sql
    
    echo "✅ Database backup created: $BACKUP_DIR/database.sql"
else
    echo "⚠️  PostgreSQL container not running, skipping database backup"
fi

# Backup environment files
echo "📦 Backing up configuration files..."
cp .env $BACKUP_DIR/.env 2>/dev/null || echo "⚠️  .env file not found"
cp docker-compose.prod.yml $BACKUP_DIR/
cp -r scripts $BACKUP_DIR/ 2>/dev/null || echo "⚠️  scripts directory not found"

# Create archive
echo "🗜️  Creating compressed archive..."
cd backups
tar -czf "backup_$TIMESTAMP.tar.gz" "backup_$TIMESTAMP/"
rm -rf "backup_$TIMESTAMP/"
cd ..

echo "✅ Backup completed: backups/backup_$TIMESTAMP.tar.gz"

# Clean old backups (keep last 7 days)
echo "🧹 Cleaning old backups..."
find backups -name "backup_*.tar.gz" -type f -mtime +7 -delete 2>/dev/null || true

echo "📋 Available backups:"
ls -lah backups/backup_*.tar.gz 2>/dev/null || echo "No backups found"