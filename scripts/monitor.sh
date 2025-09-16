#!/bin/bash

# Monitor script for Best Lap applications
# This script helps monitor and troubleshoot Docker containers

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

show_help() {
    echo "Best Lap Monitor Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  status    - Show status of all containers"
    echo "  logs      - Show logs for all services"
    echo "  api       - Show API logs"
    echo "  admin     - Show admin logs"
    echo "  metrics   - Show metrics collector logs"
    echo "  db        - Show database logs"
    echo "  redis     - Show Redis logs"
    echo "  health    - Check health of all services"
    echo "  restart   - Restart all services"
    echo "  stop      - Stop all services"
    echo "  clean     - Clean up containers and images"
    echo "  help      - Show this help message"
}

check_container_health() {
    local service=$1
    local port=$2
    local path=${3:-"/health"}

    if docker-compose ps $service | grep -q "Up"; then
        if [ ! -z "$port" ]; then
            if curl -f http://localhost:$port$path > /dev/null 2>&1; then
                print_success "$service is healthy"
            else
                print_warning "$service is running but health check failed"
            fi
        else
            print_success "$service is running"
        fi
    else
        print_error "$service is not running"
    fi
}

case "${1:-status}" in
    "status")
        print_status "📋 Container Status:"
        docker-compose ps
        ;;

    "logs")
        print_status "📜 Showing logs for all services (last 100 lines):"
        docker-compose logs --tail=100 -f
        ;;

    "api")
        print_status "📜 API Logs:"
        docker-compose logs --tail=100 -f api
        ;;

    "admin")
        print_status "📜 Admin Logs:"
        docker-compose logs --tail=100 -f admin
        ;;

    "metrics")
        print_status "📜 Metrics Collector Logs:"
        docker-compose logs --tail=100 -f metrics-collector
        ;;

    "db")
        print_status "📜 Database Logs:"
        docker-compose logs --tail=100 -f timescaledb
        ;;

    "redis")
        print_status "📜 Redis Logs:"
        docker-compose logs --tail=100 -f redis
        ;;

    "health")
        print_status "🔍 Checking service health..."
        echo ""
        check_container_health "timescaledb"
        check_container_health "redis"
        check_container_health "api" "3333"
        check_container_health "admin" "4000"
        check_container_health "metrics-collector"
        echo ""
        print_status "💾 Disk usage:"
        docker system df
        echo ""
        print_status "🧠 Memory usage:"
        docker stats --no-stream
        ;;

    "restart")
        print_status "🔄 Restarting all services..."
        docker-compose restart
        print_success "All services restarted"
        ;;

    "stop")
        print_status "🛑 Stopping all services..."
        docker-compose down
        print_success "All services stopped"
        ;;

    "clean")
        print_warning "🧹 This will remove all containers, images, and volumes!"
        read -p "Are you sure? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_status "Stopping containers..."
            docker-compose down --volumes --remove-orphans
            print_status "Removing images..."
            docker rmi $(docker images "best-lap*" -q) 2>/dev/null || true
            print_status "Cleaning up Docker system..."
            docker system prune -f
            print_success "Cleanup completed"
        else
            print_status "Cleanup cancelled"
        fi
        ;;

    "help")
        show_help
        ;;

    *)
        print_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac