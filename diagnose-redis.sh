#!/bin/bash
# Script to diagnose Redis issues on EC2

echo "========================================="
echo "Redis Diagnostic Script"
echo "========================================="
echo ""

echo "[1] Docker Compose Status"
echo "========================================="
docker-compose -f docker-compose.ec2.yml ps
echo ""

echo "[2] All Docker Containers"
echo "========================================="
docker ps -a
echo ""

echo "[3] Redis Container Logs (last 100 lines)"
echo "========================================="
docker logs redis --tail 100 2>&1 || echo "Redis container not found or not started"
echo ""

echo "[4] Redis Container Inspect (State & Health)"
echo "========================================="
docker inspect redis 2>&1 | grep -A 20 '"State"' || echo "Redis container not found"
echo ""

echo "[5] Port 6379 Usage"
echo "========================================="
sudo netstat -tulpn | grep 6379 || echo "Port 6379 not in use"
echo ""

echo "[6] Redis Volume Status"
echo "========================================="
docker volume ls | grep redis
docker volume inspect best-lap_redis_data 2>&1 || echo "Redis volume not found"
echo ""

echo "[7] Memory and CPU Status"
echo "========================================="
free -h
echo ""
echo "CPU Info:"
nproc
echo ""

echo "[8] Docker System Status"
echo "========================================="
docker system df
echo ""

echo "[9] Try to Start Redis Manually"
echo "========================================="
echo "Attempting to start Redis container..."
docker-compose -f docker-compose.ec2.yml up -d redis
sleep 5
echo ""
echo "Redis container status after manual start:"
docker ps -a | grep redis
echo ""
echo "Redis logs after manual start:"
docker logs redis --tail 30 2>&1
echo ""

echo "[10] Test Redis Connection"
echo "========================================="
docker exec redis redis-cli ping 2>&1 || echo "Cannot connect to Redis"
echo ""

echo "========================================="
echo "Diagnostic Complete"
echo "========================================="
echo ""
echo "Please share the output above to help diagnose the issue."
