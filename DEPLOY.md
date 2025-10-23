# 🚀 Deploy Guide - Best Lap

Este guia explica como fazer o deploy da aplicação Best Lap em produção usando Docker.

## 📋 Pré-requisitos

- Docker 20.10+
- Docker Compose 2.0+
- Git
- 2GB+ RAM disponível
- 10GB+ espaço em disco

## 🔧 Configuração Inicial

### 1. Clone o repositório
```bash
git clone <repository-url>
cd best-lap
```

### 2. Configure variáveis de ambiente
```bash
# Copie o arquivo de exemplo
cp .env.production .env.production.local

# Edite com suas configurações
nano .env.production.local
```

**Variáveis importantes para configurar:**
- `GOOGLE_API_KEY`: Sua chave da API do Google
- `ADMIN_TOKEN`: Token de acesso ao painel administrativo
- `DB_PASSWORD`: Senha do banco de dados (altere a padrão)
- `COLLECT_METRICS_CRON_EXPRESSION`: Horários de coleta de métricas

### 3. Torne os scripts executáveis
```bash
chmod +x scripts/*.sh
```

## 🚀 Deploy

### Opção 1: Deploy Automático (Recomendado)
```bash
./scripts/deploy.sh
```

### Opção 2: Deploy Manual
```bash
# 1. Build das imagens
./scripts/build.sh

# 2. Iniciar serviços
docker-compose up -d

# 3. Executar seed do banco (opcional)
pnpm --filter=@best-lap/infra db:seed:prod

# 4. Verificar status
./scripts/monitor.sh health
```

## 🖥️ Deploy em EC2

### 1. Preparação da Instância EC2

**Especificações mínimas:**
- Tipo: t3.medium ou superior
- OS: Ubuntu 20.04+ / Amazon Linux 2
- Storage: 20GB+ EBS
- Security Groups: Portas 22, 80, 443, 3333, 4000

### 2. Instalação do Docker na EC2
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y docker.io docker-compose
sudo systemctl enable docker
sudo usermod -aG docker $USER

# Amazon Linux 2
sudo yum update -y
sudo yum install -y docker
sudo systemctl enable docker
sudo usermod -aG docker ec2-user

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 3. Deploy na EC2
```bash
# Clone o projeto
git clone <repository-url>
cd best-lap

# Configure as variáveis de ambiente
cp .env.production .env.production.local
nano .env.production.local

# Execute o deploy
chmod +x scripts/*.sh
./scripts/deploy.sh

# Executar seed do banco (opcional)
pnpm --filter=@best-lap/infra db:seed:prod
```

### 4. Configuração de Proxy Reverso (Opcional - Nginx)

Se você deseja expor os serviços através de um proxy reverso:

```bash
# Instalar Nginx
sudo apt install nginx

# Configurar proxy reverso
sudo nano /etc/nginx/sites-available/best-lap
```

Exemplo de configuração:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # API
    location /api/ {
        proxy_pass http://localhost:3333/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Admin Panel (proteja com autenticação básica ou firewall)
    location /admin/ {
        proxy_pass http://localhost:4000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Ativar configuração
sudo ln -s /etc/nginx/sites-available/best-lap /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

**Nota:** O web dashboard deve ser executado localmente ou em um serviço separado de hospedagem de frontend (Vercel, Netlify, etc).

## 📊 Monitoramento

### Verificar status dos serviços
```bash
./scripts/monitor.sh status
```

### Ver logs em tempo real
```bash
# Todos os serviços
./scripts/monitor.sh logs

# Serviço específico
./scripts/monitor.sh api
./scripts/monitor.sh admin
./scripts/monitor.sh metrics
```

### Verificar saúde dos serviços
```bash
./scripts/monitor.sh health
```

## 🔄 Atualizações

### Atualizar aplicação
```bash
# 1. Baixar alterações
git pull origin main

# 2. Rebuild e restart
docker-compose down
./scripts/deploy.sh
```

### Backup do banco de dados
```bash
# Backup
docker-compose exec timescaledb pg_dump -U best_lap best_lap_db > backup.sql

# Restore
docker-compose exec -T timescaledb psql -U best_lap best_lap_db < backup.sql
```

### Comandos de Seed do Banco

```bash
# Seed para desenvolvimento (dados básicos)
pnpm --filter=@best-lap/infra db:seed

# Seed para produção (dados essenciais apenas)
pnpm --filter=@best-lap/infra db:seed:prod
```

## 🔧 Troubleshooting

### Problemas comuns

**1. Erro de memória durante build**
```bash
# Aumentar memória do Docker
echo '{"max_concurrent_downloads": 3}' | sudo tee /etc/docker/daemon.json
sudo systemctl restart docker
```

**2. Containers não iniciam**
```bash
# Verificar logs
./scripts/monitor.sh logs

# Verificar recursos
df -h
free -h
```

**3. Lighthouse não funciona (Metrics Collector)**
```bash
# Verificar se Chrome está funcionando
docker-compose exec metrics-collector /usr/bin/chromium-browser --version
```

**4. Banco de dados não conecta**
```bash
# Verificar se PostgreSQL está rodando
docker-compose exec timescaledb pg_isready -U best_lap

# Verificar logs do banco
./scripts/monitor.sh db
```

### Comandos úteis

```bash
# Restart de um serviço específico
docker-compose restart api

# Rebuild de um serviço específico
docker-compose up -d --build api

# Entrar no container
docker-compose exec api sh

# Ver uso de recursos
docker stats

# Limpar recursos não utilizados
docker system prune -af
```

## 🔐 Segurança

### Configurações de segurança recomendadas:

1. **Firewall**: Configure apenas as portas necessárias
2. **SSL/TLS**: Use Certbot para HTTPS
3. **Environment Variables**: Nunca commite senhas no código
4. **Updates**: Mantenha Docker e sistema operacional atualizados
5. **Backups**: Configure backups automáticos do banco de dados

### Configurar SSL com Certbot
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## 📞 Suporte

Em caso de problemas:
1. Verifique os logs: `./scripts/monitor.sh logs`
2. Verifique o status: `./scripts/monitor.sh health`
3. Consulte este documento
4. Abra uma issue no repositório