#!/bin/bash

# Script de diagnóstico para deployment EC2
# Execute este script no servidor EC2 via SSH

echo "========================================="
echo "🔍 DIAGNÓSTICO DO DEPLOYMENT EC2"
echo "========================================="
echo ""

# 1. Verificar containers em execução
echo "1️⃣  Containers em execução:"
echo "-----------------------------------------"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""

# 2. Verificar containers parados/com erro
echo "2️⃣  Containers parados (últimas 24h):"
echo "-----------------------------------------"
docker ps -a --filter "status=exited" --format "table {{.Names}}\t{{.Status}}"
echo ""

# 3. Testar conectividade local
echo "3️⃣  Testando conectividade local:"
echo "-----------------------------------------"
echo -n "API (3333): "
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3333/health | grep -q "200"; then
    echo "✅ OK"
else
    echo "❌ FALHOU"
fi

echo -n "Admin (4000): "
if curl -s -o /dev/null -w "%{http_code}" http://localhost:4000 | grep -q "200"; then
    echo "✅ OK"
else
    echo "❌ FALHOU"
fi
echo ""

# 4. Verificar portas em uso
echo "4️⃣  Portas em uso pelo Docker:"
echo "-----------------------------------------"
netstat -tulpn | grep docker-proxy | grep -E ":(3333|4000|5432|6379)" || echo "Nenhuma porta Docker encontrada"
echo ""

# 5. Logs recentes da API
echo "5️⃣  Últimas 20 linhas de log da API:"
echo "-----------------------------------------"
if docker ps --format '{{.Names}}' | grep -q "best-lap-api"; then
    docker logs best-lap-api --tail 20 2>&1
else
    echo "❌ Container best-lap-api não está rodando"
fi
echo ""

# 6. Logs recentes do Admin
echo "6️⃣  Últimas 20 linhas de log do Admin:"
echo "-----------------------------------------"
if docker ps --format '{{.Names}}' | grep -q "best-lap-admin"; then
    docker logs best-lap-admin --tail 20 2>&1
else
    echo "❌ Container best-lap-admin não está rodando"
fi
echo ""

# 7. Verificar saúde dos serviços de infra
echo "7️⃣  Saúde da infraestrutura:"
echo "-----------------------------------------"
echo -n "PostgreSQL: "
if docker exec timescaledb pg_isready -U best_lap > /dev/null 2>&1; then
    echo "✅ OK"
else
    echo "❌ FALHOU"
fi

echo -n "Redis: "
if docker exec redis redis-cli ping > /dev/null 2>&1; then
    echo "✅ OK"
else
    echo "❌ FALHOU"
fi
echo ""

# 8. Uso de recursos
echo "8️⃣  Uso de recursos do sistema:"
echo "-----------------------------------------"
echo "Memória:"
free -h | grep -E "Mem:|Swap:"
echo ""
echo "Disco:"
df -h / | tail -n 1
echo ""

# 9. Verificar variáveis de ambiente críticas
echo "9️⃣  Variáveis de ambiente da API:"
echo "-----------------------------------------"
if docker ps --format '{{.Names}}' | grep -q "best-lap-api"; then
    docker exec best-lap-api env | grep -E "^(NODE_ENV|API_PORT|DB_HOST|REDIS_HOST|FORCE_HTTP_SWAGGER)=" || echo "Variáveis não encontradas"
else
    echo "❌ Container best-lap-api não está rodando"
fi
echo ""

# 10. Resumo
echo "========================================="
echo "📋 RESUMO"
echo "========================================="
API_RUNNING=$(docker ps --format '{{.Names}}' | grep -c "best-lap-api" || echo "0")
ADMIN_RUNNING=$(docker ps --format '{{.Names}}' | grep -c "best-lap-admin" || echo "0")
METRICS_RUNNING=$(docker ps --format '{{.Names}}' | grep -c "best-lap-metrics-collector" || echo "0")
DB_RUNNING=$(docker ps --format '{{.Names}}' | grep -c "timescaledb" || echo "0")
REDIS_RUNNING=$(docker ps --format '{{.Names}}' | grep -c "redis" || echo "0")

echo "API:              $([ $API_RUNNING -eq 1 ] && echo '✅ Rodando' || echo '❌ Parado')"
echo "Admin:            $([ $ADMIN_RUNNING -eq 1 ] && echo '✅ Rodando' || echo '❌ Parado')"
echo "Metrics Collector: $([ $METRICS_RUNNING -eq 1 ] && echo '✅ Rodando' || echo '❌ Parado')"
echo "TimescaleDB:      $([ $DB_RUNNING -eq 1 ] && echo '✅ Rodando' || echo '❌ Parado')"
echo "Redis:            $([ $REDIS_RUNNING -eq 1 ] && echo '✅ Rodando' || echo '❌ Parado')"
echo ""

# Sugestões
if [ $API_RUNNING -eq 0 ]; then
    echo "⚠️  AÇÃO NECESSÁRIA:"
    echo "   A API não está rodando. Execute:"
    echo "   docker-compose up -d api"
    echo "   docker logs best-lap-api"
fi

echo "========================================="
echo "✅ Diagnóstico completo!"
echo "========================================="
