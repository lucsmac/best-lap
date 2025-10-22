#!/bin/bash

# Quick Restart Script
# Use this when you only updated code (no dependency changes)
# This is the FASTEST way to deploy on t2.micro

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔄 Quick Restart - Backend Services${NC}"
echo ""

# Restart services
echo "Restarting API..."
docker-compose restart api

echo "Restarting Admin..."
docker-compose restart admin

echo "Restarting Metrics Collector..."
docker-compose restart metrics-collector

echo ""
echo -e "${GREEN}✓ All services restarted${NC}"
echo ""

# Show status
docker-compose ps

echo ""
echo "View logs with: docker-compose logs -f"
