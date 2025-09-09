# 🚀 AWS EC2 Deployment Guide - Best Lap

Guia completo para fazer deploy da aplicação Best Lap no AWS EC2.

## 📋 Pré-requisitos EC2

### AWS EC2 Instance
- **Instância recomendada**: `t3.medium` ou superior (2 vCPUs, 4GB RAM)
- **Sistema**: Ubuntu 22.04 LTS
- **Storage**: Mínimo 20GB SSD
- **Security Group**: 
  - SSH (22) - Seu IP
  - HTTP (80) - 0.0.0.0/0  
  - HTTPS (443) - 0.0.0.0/0
  - Custom TCP (3333) - 0.0.0.0/0 (API)
  - Custom TCP (4000) - 0.0.0.0/0 (Bull Board)

## 🔧 Setup Inicial EC2

### 1. Preparar Instância

```bash
# Conectar via SSH
ssh -i sua-chave.pem ubuntu@seu-ec2-ip

# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
sudo usermod -aG docker ubuntu

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Instalar Git
sudo apt install -y git

# Relogar para aplicar grupo docker
exit
ssh -i sua-chave.pem ubuntu@seu-ec2-ip
```

### 2. Clonar Repositório

```bash
# Clonar aplicação
git clone https://github.com/seu-usuario/best-lap.git
cd best-lap

# Configurar environment
cp .env.example .env
nano .env
```

## Environment Setup
Create a `.env` file in the root directory with:

```bash
# Environment
NODE_ENV=production

# API Configuration
API_PORT=3333

# Bull Board Configuration
BULL_BOARD_PORT=4000

# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=metrics

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379

# Google API (optional)
GOOGLE_API_KEY=

# Metrics Collection
COLLECT_METRICS_CRON_EXPRESSION=0 8,14,20 * * *
SEED_THEMES_URL=https://lucsmac.github.io/autodromo-domains/full_data.json
WORKER_CONCURRENCY=10
```

**Note**: The services will use the environment variables from the `.env` file, but in production Docker containers, these are also explicitly set in the docker-compose.prod.yml file.

## 🚀 Primeiro Deploy

1. **Deploy Inicial**:
```bash
# Usar script automatizado
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

**OU manualmente**:
```bash
docker compose -f docker-compose.prod.yml up -d --build
```

## 🔄 Estratégias de Atualização

### Método 1: Script Automático (Recomendado)

Para atualizações após mudanças no código:

```bash
# Script que faz backup, pull, rebuild e health check
./scripts/update.sh
```

### Método 2: GitHub Actions (CI/CD)

1. **Configurar Secrets no GitHub**:
   - `EC2_HOST`: IP público da instância
   - `EC2_KEY`: Chave privada SSH (conteúdo do .pem)

2. **Deploy automático**: Qualquer push na branch `main` dispara deploy automático

### Método 3: Manual

```bash
# Parar serviços
docker compose -f docker-compose.prod.yml down

# Atualizar código
git pull origin main

# Rebuild e restart
docker compose -f docker-compose.prod.yml up -d --build
```

2. Check service status:
```bash
docker compose -f docker-compose.prod.yml ps
```

3. View logs:
```bash
docker compose -f docker-compose.prod.yml logs -f
```

## Seed Database (Optional)
Run the seed service to populate initial data:
```bash
docker compose -f docker-compose.prod.yml run --rm seed
```

## Access Services
- **API**: http://<EC2_PUBLIC_IP>:3333
- **Bull Board**: http://<EC2_PUBLIC_IP>:4000
- **API Docs**: http://<EC2_PUBLIC_IP>:3333/docs

## Troubleshooting

### Common Issues

#### Out of Disk Space
If you get "no space left on device" errors during build:

1. **Clean up Docker resources**:
```bash
# Stop services
docker compose -f docker-compose.prod.yml down

# Clean up everything
docker system prune -a -f --volumes

# Check disk space
df -h
```

2. **Use system cleanup**:
```bash
# Clean up everything
docker system prune -a -f --volumes
```

3. **Rebuild with clean state**:
```bash
docker compose -f docker-compose.prod.yml up -d --build
```

#### Build Failures
- Check logs: `docker compose -f docker-compose.prod.yml logs <service_name>`
- Restart service: `docker compose -f docker-compose.prod.yml restart <service_name>`
- Rebuild: `docker compose -f docker-compose.prod.yml up -d --build <service_name>`

## 💾 Backup e Monitoramento

### Backup Manual
```bash
# Criar backup completo
./scripts/backup.sh

# Backup apenas do banco
docker run --rm \
  --network best-lap-network \
  -e PGPASSWORD=best_lap \
  postgres:15-alpine \
  pg_dump -h best-lap-postgres -U best_lap best_lap_db > backup.sql
```

### Backup Automático
```bash
# Adicionar ao crontab para backup diário às 2h
crontab -e

# Adicionar linha:
0 2 * * * /home/ubuntu/best-lap/scripts/backup.sh
```

### Monitoramento
```bash
# Logs em tempo real
docker compose -f docker-compose.prod.yml logs -f

# Status dos serviços
docker compose -f docker-compose.prod.yml ps

# Uso de recursos
docker stats

# Espaço em disco
df -h && docker system df
```

## 🔒 Segurança (Recomendado)

### 1. Firewall
```bash
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 3333  # API
sudo ufw allow 4000  # Bull Board (considere restringir)
```

### 2. SSL Certificate
```bash
# Instalar Nginx
sudo apt install -y nginx

# Configurar reverse proxy
sudo nano /etc/nginx/sites-available/best-lap

# Conteúdo:
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:3333;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /dashboard {
        proxy_pass http://localhost:4000;
        proxy_set_header Host $host;
    }
}

# Ativar e instalar SSL
sudo ln -s /etc/nginx/sites-available/best-lap /etc/nginx/sites-enabled/
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d seu-dominio.com
```

## 📊 Services Overview
- **postgres**: TimescaleDB database (porta 5432)
- **redis**: Redis para filas (porta 6379)
- **api**: Fastify API server (porta 3333)
- **metrics-collector**: Coleta de métricas (cron: 8h, 14h, 20h BRT)
- **bull-board**: Dashboard de filas (porta 4000)

## 🚀 URLs de Acesso

Após deploy bem-sucedido:

- **API**: `http://seu-ec2-ip:3333`
- **Documentação**: `http://seu-ec2-ip:3333/docs`  
- **Bull Board**: `http://seu-ec2-ip:4000`
- **Com Nginx**: `http://seu-dominio.com`

## 📈 Próximos Passos (Escalabilidade)

Para aplicações maiores, considere:

- **Load Balancer**: Application Load Balancer (ALB)
- **Database**: RDS PostgreSQL separado
- **Cache**: ElastiCache Redis separado  
- **Storage**: EFS para arquivos compartilhados
- **Monitoring**: CloudWatch, Prometheus + Grafana
- **Container Orchestration**: ECS ou EKS

## ⚡ Resumo de Comandos

```bash
# Primeiro deploy
./scripts/deploy.sh

# Atualizar aplicação
./scripts/update.sh

# Backup
./scripts/backup.sh

# Logs
docker compose -f docker-compose.prod.yml logs -f

# Status
docker compose -f docker-compose.prod.yml ps

# Parar tudo
docker compose -f docker-compose.prod.yml down
```
