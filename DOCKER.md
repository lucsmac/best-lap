# 🐳 Docker Deployment Guide

Este guia explica como executar toda a aplicação Best Lap usando Docker com um único comando.

## 🚀 Deploy Rápido

```bash
# 1. Clone e entre no repositório
git clone <repository-url>
cd best-lap

# 2. Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env conforme necessário

# 3. Execute o deploy
./scripts/deploy.sh
```

## ⚙️ Configuração Manual

Se preferir executar manualmente:

```bash
# Build e start de todos os serviços
docker compose -f docker-compose.prod.yml up --build -d

# Ver logs
docker compose -f docker-compose.prod.yml logs -f

# Parar todos os serviços
docker compose -f docker-compose.prod.yml down
```

## 📊 Serviços Disponíveis

Após o deploy, os seguintes serviços estarão disponíveis:

| Serviço | URL | Descrição |
|---------|-----|-----------|
| **API** | http://localhost:3333 | REST API principal |
| **Swagger** | http://localhost:3333/docs | Documentação da API |
| **Bull Board** | http://localhost:4000 | Dashboard das filas |
| **PostgreSQL** | localhost:5432 | Banco de dados |
| **Redis** | localhost:6379 | Cache e filas |

## 🔧 Variáveis de Ambiente

As principais variáveis no `.env`:

```bash
# Portas dos serviços
API_PORT=3333
BULL_BOARD_PORT=4000
DB_PORT=5432
REDIS_PORT=6379

# Credenciais do banco
DB_USER=best_lap
DB_PASSWORD=best_lap
DB_NAME=best_lap_db

# Configurações opcionais
GOOGLE_API_KEY=sua_chave_aqui
COLLECT_METRICS_CRON_EXPRESSION=0 8,14,20 * * *
```

## 🏗️ Arquitetura Docker

O projeto usa um Dockerfile multi-stage otimizado:

- **Base**: Node.js 20 Alpine com pnpm
- **Deps**: Instalação de dependências
- **Build**: Build de todos os packages
- **Runtime**: Imagens otimizadas para produção

### Serviços:

1. **API**: Aplicação Fastify principal
2. **Metrics Collector**: Coleta métricas via cron jobs
3. **Bull Board**: Dashboard para monitoramento de filas
4. **PostgreSQL**: Banco TimescaleDB
5. **Redis**: Cache e sistema de filas

## 🔍 Troubleshooting

### Verificar status dos serviços:
```bash
docker compose -f docker-compose.prod.yml ps
```

### Ver logs específicos:
```bash
docker compose -f docker-compose.prod.yml logs api
docker compose -f docker-compose.prod.yml logs metrics-collector
```

### Rebuild completo:
```bash
docker compose -f docker-compose.prod.yml down --rmi all
docker compose -f docker-compose.prod.yml up --build -d
```

### Acessar container:
```bash
docker compose -f docker-compose.prod.yml exec api sh
```

## 🔄 Atualizações

Para atualizar a aplicação:

```bash
# 1. Pull das mudanças
git pull origin main

# 2. Rebuild e restart
docker compose -f docker-compose.prod.yml up --build -d
```

## 🧹 Limpeza

Para remover tudo (cuidado - remove volumes de dados):

```bash
# Remove containers e imagens
docker compose -f docker-compose.prod.yml down --rmi all

# Remove volumes (CUIDADO: apaga dados do banco)
docker compose -f docker-compose.prod.yml down -v
```