# Guia de Deploy no EC2

> **⚠️ Usando t2.micro (1GB RAM)?** Leia primeiro: [T2_MICRO_GUIDE.md](./T2_MICRO_GUIDE.md)
>
> t2.micro tem apenas 1GB RAM. Builds podem levar 30+ minutos ou travar.
> **Recomendação**: Faça build localmente e transfira as imagens (5-10 min total)

---

## 🧹 Limpeza de Memória (Executar ANTES do Deploy)

### Limpar Docker (Libera muito espaço!)

```bash
# 1. Parar containers em execução
docker-compose down

# 2. Executar script de limpeza completa
./scripts/docker-cleanup.sh

# 3. (Opcional) Limpar logs do sistema
sudo journalctl --vacuum-time=3d

# 4. (Opcional) Limpar cache do apt
sudo apt-get clean

# 5. Verificar espaço em disco
df -h
```

### Comando de Limpeza Rápida (Sem confirmação)

```bash
# Remove tudo que não está sendo usado
docker system prune -af --volumes

# Verifica quanto espaço foi liberado
docker system df
```

---

## 🚀 Deploy no EC2 (SEM Frontend)

O frontend será hospedado no Render, então no EC2 você só precisa do backend.

### Escolha o Script de Deploy

| Script | Quando Usar | Velocidade |
|--------|-------------|------------|
| `./scripts/deploy-light.sh` | **t2.micro ou quando imagens já existem** | ⚡ Rápido (2-3 min) |
| `./scripts/deploy.sh` | Instâncias grandes (t3.medium+) com rebuild | 🐌 Lento (15-30 min) |
| `./scripts/restart.sh` | Apenas reiniciar containers (código mudou) | ⚡⚡ Muito rápido (30s) |

### 1. Preparar o ambiente

```bash
cd /caminho/para/best-lap

# Atualizar código
git pull origin main

# Certificar que .env.production existe e está correto
cat .env.production
```

### 2. Build das Imagens (SEM web)

```bash
# Build APENAS do backend (API, Admin, Metrics Collector)
./scripts/build.sh

# OU usando docker-compose diretamente
docker-compose build api admin metrics-collector
```

### 3. Deploy dos Serviços (SEM web)

```bash
# Deploy LEVE (recomendado para t2.micro)
./scripts/deploy-light.sh

# OU deploy completo com rebuild (t3.medium+)
./scripts/deploy.sh

# OU manualmente
docker-compose down
docker-compose up -d timescaledb redis
sleep 10
docker-compose up -d api admin metrics-collector

# OU apenas restart (se só mudou código)
./scripts/restart.sh
```

### 4. Verificar Status

```bash
# Ver containers rodando
docker-compose ps

# Ver logs
docker-compose logs -f api
docker-compose logs -f admin
docker-compose logs -f metrics-collector

# Verificar saúde
curl http://localhost:3333/health
curl http://localhost:4000/health
```

---

## 🌐 Deploy com Frontend (Caso necessário)

Se você quiser incluir o frontend no EC2 também:

```bash
# 1. Build com frontend
./scripts/build.sh --with-web

# 2. Deploy com frontend
./scripts/deploy.sh --with-web

# 3. Verificar
curl http://localhost:5173/health
```

---

## 📊 Monitoramento

### Ver uso de recursos

```bash
# Uso de disco Docker
docker system df

# Containers em execução
docker stats

# Espaço em disco total
df -h

# Memória do sistema
free -h
```

### Ver logs

```bash
# Logs de um serviço específico
docker logs best-lap-api --tail 50 --follow

# Logs de todos os serviços
docker-compose logs -f

# Logs com timestamp
docker-compose logs -f --timestamps
```

---

## 🔧 Troubleshooting

### Erro de memória durante build

```bash
# 1. Limpar Docker completamente
./scripts/docker-cleanup.sh

# 2. Limpar logs do sistema
sudo journalctl --vacuum-time=3d

# 3. Fazer build sem cache
docker-compose build --no-cache api admin metrics-collector

# 4. Ou fazer build de um serviço por vez
docker build -t best-lap-api:latest -f apps/api/Dockerfile .
docker build -t best-lap-admin:latest -f apps/admin/Dockerfile .
docker build -t best-lap-metrics-collector:latest -f apps/metrics-collector/Dockerfile .
```

### Container não inicia

```bash
# Ver logs de erro
docker logs best-lap-api

# Verificar variáveis de ambiente
docker exec -it best-lap-api env | grep -E "DB_|REDIS_|API_"

# Reiniciar container
docker restart best-lap-api
```

### Banco de dados não conecta

```bash
# Verificar se PostgreSQL está rodando
docker exec -it timescaledb pg_isready -U best_lap

# Ver logs do banco
docker logs timescaledb --tail 50

# Conectar no banco
docker exec -it timescaledb psql -U best_lap -d best_lap_db
```

### Redis não conecta

```bash
# Verificar conexão
docker exec -it redis redis-cli ping

# Ver chaves
docker exec -it redis redis-cli KEYS "*"
```

---

## 🔄 Workflow Completo de Deploy

### Deploy normal (atualização de código)

```bash
# 1. Parar serviços
docker-compose down

# 2. Atualizar código
git pull origin main

# 3. Rebuild (reutiliza cache)
docker-compose build api admin metrics-collector

# 4. Subir serviços
docker-compose up -d timescaledb redis
sleep 10
docker-compose up -d api admin metrics-collector

# 5. Verificar
docker-compose ps
docker-compose logs -f
```

### Deploy com limpeza completa (quando há problemas)

```bash
# 1. Parar tudo
docker-compose down

# 2. LIMPAR TUDO (libera memória)
./scripts/docker-cleanup.sh

# 3. Atualizar código
git pull origin main

# 4. Build sem cache
./scripts/build.sh  # SEM --with-web

# 5. Deploy
./scripts/deploy.sh  # SEM --with-web
```

---

## 📝 Notas Importantes

1. **Por padrão, os scripts NÃO incluem o frontend** (web dashboard)
   - Use a flag `--with-web` apenas se necessário

2. **Sempre limpe o Docker antes de builds grandes**
   - Evita erros de memória
   - Libera espaço em disco

3. **O frontend deve ser hospedado no Render**
   - Mais leve para o EC2
   - CDN e HTTPS gratuitos
   - Menos consumo de memória no servidor

4. **CORS**: Se o frontend estiver no Render, configure no `.env.production`:
   ```bash
   CORS_ORIGIN="https://seu-app.onrender.com"
   ```

5. **Volumes do Docker preservam dados**
   - `timescaledb_data` - Banco de dados
   - `redis_data` - Cache Redis
   - Não são removidos pelo cleanup (a menos que use `--volumes`)
