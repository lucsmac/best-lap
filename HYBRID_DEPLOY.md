# 🔀 Deploy Híbrido: Render + EC2

Esta configuração usa o melhor de dois mundos:
- **Render**: API + Dashboard (CDN, HTTPS automático, deploy fácil)
- **EC2**: TimescaleDB + Redis + Metrics Collector (recursos pesados)

---

## 💰 Custos

| Componente | Plataforma | Custo |
|------------|------------|-------|
| TimescaleDB | EC2 t2.micro | $0/mês (free tier) |
| Redis | EC2 t2.micro | $0/mês (free tier) |
| Metrics Collector | EC2 t2.micro | $0/mês (free tier) |
| API | Render Free | $0/mês (com sleep) |
| API | Render Starter | $7/mês (sem sleep) ⭐ |
| Dashboard | Render Static | $0/mês |

**Total**: $0-7/mês (vs $17-32/mês se tudo no EC2 pago)

---

## 🏗️ Arquitetura

```
Internet
   │
   ├─► Render.com (API)          ──┐
   │                                │
   └─► Render.com (Dashboard)      │
                                    │
                              (conexão via internet
                               ~20-50ms latency)
                                    │
        ┌───────────────────────────┘
        │
        ▼
   AWS EC2 t2.micro (us-east-1)
   ├─► TimescaleDB (PostgreSQL)
   ├─► Redis (Cache/Queue)
   └─► Metrics Collector (Cron)
```

---

## 🚀 Guia de Deploy Completo

### **Pré-requisitos**
- Conta no Render.com (gratuita)
- EC2 rodando em us-east-1
- Acesso ao Security Group do EC2

---

## Parte 1: Configurar EC2

### **1.1. Conectar no EC2**
```bash
ssh -i sua-chave.pem ec2-user@ec2-75-101-196-198.compute-1.amazonaws.com
cd best-lap
git pull origin main
```

### **1.2. Atualizar docker-compose.ec2.yml**

Editar `docker-compose.ec2.yml` para adicionar senha no Redis:

```yaml
redis:
  image: redis:7
  container_name: redis
  command: redis-server --requirepass YOUR_STRONG_PASSWORD_HERE --bind 0.0.0.0
  ports:
    - "6379:6379"
  volumes:
    - redis_data:/data
  restart: unless-stopped
  networks:
    - best-lap-network
  healthcheck:
    test: ["CMD", "redis-cli", "--pass", "YOUR_STRONG_PASSWORD_HERE", "ping"]
    interval: 30s
    timeout: 10s
    retries: 3
```

### **1.3. Atualizar variáveis do Metrics Collector**

```yaml
metrics-collector:
  # ... resto da config
  environment:
    # ... outras vars
    - REDIS_HOST=redis
    - REDIS_PORT=6379
    - REDIS_PASSWORD=YOUR_STRONG_PASSWORD_HERE  # Adicionar
```

### **1.4. Parar API e Admin (vão para o Render)**
```bash
docker-compose -f docker-compose.ec2.yml stop api admin
docker-compose -f docker-compose.ec2.yml rm -f api admin
```

### **1.5. Subir apenas DB + Redis + Collector**
```bash
docker-compose -f docker-compose.ec2.yml up -d timescaledb redis metrics-collector
```

### **1.6. Verificar**
```bash
docker ps
# Deve mostrar: timescaledb, redis, best-lap-metrics-collector

# Testar conectividade
docker exec -it timescaledb psql -U best_lap -d best_lap_db -c "SELECT 1;"
docker exec -it redis redis-cli --pass YOUR_PASSWORD ping
```

---

### **1.7. Configurar Security Group no AWS**

No Console AWS → EC2 → Security Groups:

#### **Adicionar Regra Inbound para PostgreSQL:**
```
Type: Custom TCP
Protocol: TCP
Port: 5432
Source: Custom
  - 216.24.57.1/32
  - 216.24.57.253/32
  - 216.24.57.254/32
  (IPs do Render - veja: https://render.com/docs/static-outbound-ip-addresses)
Description: Render API -> PostgreSQL
```

#### **Adicionar Regra Inbound para Redis:**
```
Type: Custom TCP
Protocol: TCP
Port: 6379
Source: Custom
  - 216.24.57.1/32
  - 216.24.57.253/32
  - 216.24.57.254/32
Description: Render API -> Redis
```

⚠️ **IMPORTANTE**: Mantenha a lista de IPs do Render atualizada!

---

## Parte 2: Deploy da API no Render

### **2.1. Criar conta no Render**
1. Acesse https://render.com
2. Sign up (pode usar GitHub)
3. Conecte seu repositório GitHub

### **2.2. Criar Web Service**

1. Dashboard → **New +** → **Web Service**
2. Conecte o repositório `best-lap`
3. Configurações:

```
Name: best-lap-api
Region: Oregon (ou Ohio - mais próximo do EC2 us-east-1)
Branch: main
Runtime: Docker
Dockerfile Path: ./apps/api/Dockerfile
Docker Context: . (raiz do repo)
Instance Type: Free (ou Starter se quiser sem sleep)
```

### **2.3. Configurar Variáveis de Ambiente**

Na seção **Environment**:

```bash
NODE_ENV=production
API_PORT=3333

# Conexão com EC2
DB_HOST=ec2-75-101-196-198.compute-1.amazonaws.com
DB_PORT=5432
DB_USER=best_lap
DB_PASSWORD=best_lap
DB_NAME=best_lap_db

REDIS_HOST=ec2-75-101-196-198.compute-1.amazonaws.com
REDIS_PORT=6379
REDIS_PASSWORD=YOUR_STRONG_PASSWORD_HERE

# APIs externas
GOOGLE_API_KEY=your-api-key-here

# CORS (atualizar depois com URL do dashboard)
CORS_ORIGIN=*

# Swagger
FORCE_HTTP_SWAGGER=false
```

### **2.4. Deploy**

Clique em **Create Web Service**

⏱️ Aguardar ~5-10 minutos para build e deploy

### **2.5. Testar**

```bash
# URL será algo como: https://best-lap-api.onrender.com

curl https://best-lap-api.onrender.com/health
curl https://best-lap-api.onrender.com/docs
```

---

## Parte 3: Deploy do Dashboard no Render

### **3.1. Verificar se o Dashboard está configurado**

Certifique-se que `apps/web/.env.production` ou variáveis de build apontam para a API:

```bash
NEXT_PUBLIC_API_URL=https://best-lap-api.onrender.com
```

### **3.2. Criar Static Site no Render**

1. Dashboard → **New +** → **Static Site**
2. Conecte o repositório
3. Configurações:

```
Name: best-lap-dashboard
Branch: main
Build Command: cd apps/web && npm install && npm run build
Publish Directory: apps/web/out
```

### **3.3. Variáveis de Ambiente**

```bash
NEXT_PUBLIC_API_URL=https://best-lap-api.onrender.com
```

### **3.4. Deploy**

Clique em **Create Static Site**

### **3.5. Atualizar CORS na API**

Voltar no serviço da API e atualizar:
```bash
CORS_ORIGIN=https://best-lap-dashboard.onrender.com
```

---

## 🔒 Segurança

### **Checklist de Segurança**

- ✅ PostgreSQL: Aceita apenas IPs do Render
- ✅ Redis: Protegido com senha forte
- ✅ Security Group: Portas abertas apenas para IPs específicos
- ✅ HTTPS: Automático no Render
- ✅ Variáveis sensíveis: Configuradas via dashboard (não no código)

### **Senha Redis Forte**

Gerar senha:
```bash
openssl rand -base64 32
```

### **Monitoramento de IPs do Render**

Os IPs do Render podem mudar. Monitore em:
https://render.com/docs/static-outbound-ip-addresses

---

## 📊 Monitoramento

### **Logs da API (Render)**
```
Dashboard → best-lap-api → Logs
```

### **Logs do Collector (EC2)**
```bash
ssh ec2-user@ec2-ip
docker logs best-lap-metrics-collector --tail 100 -f
```

### **Database (EC2)**
```bash
docker exec -it timescaledb psql -U best_lap -d best_lap_db
```

---

## 🐛 Troubleshooting

### **API não conecta no DB**

```bash
# Testar do Render
# Dashboard → best-lap-api → Shell

nc -zv ec2-75-101-196-198.compute-1.amazonaws.com 5432
# Deve retornar: succeeded
```

Se falhar:
- Verificar Security Group (portas abertas?)
- Verificar IPs do Render (atualizados?)
- Testar `telnet ec2-ip 5432`

### **Redis timeout**

```bash
# Verificar se Redis está rodando
docker ps | grep redis

# Testar conexão
docker exec -it redis redis-cli --pass YOUR_PASSWORD ping
```

### **Collector não consegue processar jobs**

```bash
# Ver logs
docker logs best-lap-metrics-collector --tail 50

# Verificar se conecta no Redis
docker exec -it best-lap-metrics-collector nc -zv redis 6379
```

---

## 🔄 Workflow de Deploy

### **Para código da API:**
```bash
git add apps/api
git commit -m "feat: nova feature na API"
git push origin main

# Render faz deploy automático em ~5 min
```

### **Para código do Dashboard:**
```bash
git add apps/web
git commit -m "feat: nova feature no dashboard"
git push origin main

# Render faz deploy automático em ~3 min
```

### **Para Metrics Collector:**
```bash
# No EC2
cd best-lap
git pull origin main
docker-compose -f docker-compose.ec2.yml build metrics-collector
docker-compose -f docker-compose.ec2.yml up -d metrics-collector
```

---

## 💡 Otimizações

### **Reduzir latência DB**

1. **Usar região mais próxima**
   - EC2 em `us-east-1`
   - Render em `ohio` (us-east-2)

2. **Connection pooling**
```javascript
// apps/api/src/config/database.ts
{
  max: 10,
  min: 2,
  idle: 10000,
  acquire: 30000,
}
```

3. **Cache agressivo**
```javascript
// Cache queries lentas no Redis
const cacheKey = `metrics:${pageId}:${period}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

// ... fetch from DB
await redis.setex(cacheKey, 300, JSON.stringify(result)); // 5 min
```

### **Reduzir custo**

Se não precisa de API 24/7:
- Use **Render Free** (dorme após 15 min)
- Primeira request demora ~30s (cold start)
- Ideal para desenvolvimento/staging

Para produção:
- Use **Render Starter** ($7/mês)
- Sempre ativo, sem cold start

---

## 📈 Escalabilidade

### **Quando migrar tudo para Railway/Render?**

Considere quando:
- ✅ Tráfego > 10k requests/dia
- ✅ Latência 20-50ms é problemática
- ✅ Quer menos complexidade (tudo em um lugar)
- ✅ Budget permite ~$15-20/mês

### **Quando manter híbrido?**

Mantenha se:
- ✅ Budget é limitado ($0-7/mês)
- ✅ Free tier do EC2 ainda ativo
- ✅ Latência 20-50ms é aceitável
- ✅ Gosta de ter controle do DB

---

## 🎯 Resumo

**Vantagens:**
- ✅ Custo baixo ($0-7/mês)
- ✅ Deploy fácil (API + Dashboard)
- ✅ HTTPS automático
- ✅ Free tier maximizado

**Desvantagens:**
- ⚠️ Latência +20-50ms (vs localhost)
- ⚠️ DB exposto na internet (mas seguro com IP whitelist)
- ⚠️ Mais complexo que tudo em uma plataforma

**Vale a pena?** ✅ Sim! Especialmente se:
- Free tier do EC2 ainda ativo
- Budget limitado
- Quer deploy automático para API/Dashboard
