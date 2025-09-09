#!/bin/bash

# Best Lap - Docker Deployment Script

set -e

echo "🚀 Best Lap - Starting Docker Deployment..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "📝 Please copy .env.example to .env and configure your variables:"
    echo "   cp .env.example .env"
    exit 1
fi

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker compose -f docker-compose.prod.yml down

# Remove old images (optional - uncomment if you want to force rebuild)
# echo "🧹 Removing old images..."
# docker compose -f docker-compose.prod.yml down --rmi all

# Build and start all services
echo "🏗️  Building and starting services..."
docker compose -f docker-compose.prod.yml up --build -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
sleep 10

# Check service health
echo "🔍 Checking service status..."
docker compose -f docker-compose.prod.yml ps

echo ""
echo "✅ Deployment completed!"
echo ""
echo "🌐 Services available at:"
echo "   • API: http://localhost:3333"
echo "   • API Docs: http://localhost:3333/docs"
echo "   • Bull Board: http://localhost:4000"
echo ""
echo "📊 Logs:"
echo "   docker compose -f docker-compose.prod.yml logs -f"
echo ""
echo "🛑 Stop all services:"
echo "   docker compose -f docker-compose.prod.yml down"