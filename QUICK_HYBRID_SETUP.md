# 🚀 Setup Rápido - Deploy Híbrido (SEM Segurança Extra)

Guia simplificado para colocar no ar rapidamente.
Segurança pode ser adicionada depois!

---

## Parte 1: Preparar EC2 (5 minutos)

### **1. Conectar no EC2**
```bash
ssh -i sua-chave.pem ec2-user@ec2-75-101-196-198.compute-1.amazonaws.com
cd best-lap
git pull origin main
```

### **2. Parar API e Admin (vão pro Render)**
```bash
docker-compose -f docker-compose.ec2.yml stop api admin
docker-compose -f docker-compose.ec2.yml rm -f api admin
```

### **3. Manter só DB + Redis + Collector rodando**
```bash
docker-compose -f docker-compose.ec2.yml up -d timescaledb redis metrics-collector
```

### **4. Verificar**
```bash
docker ps
# Deve mostrar:
# - timescaledb
# - redis
# - best-lap-metrics-collector
```

### **5. Abrir portas no Security Group**

**No AWS Console:**
1. EC2 → Security Groups
2. Selecione o Security Group da sua instância
3. Inbound Rules → Edit inbound rules
4. **Adicionar regra para PostgreSQL:**
   ```
   Type: Custom TCP
   Port: 5432
   Source: 0.0.0.0/0  (ou Anywhere-IPv4)
   Description: PostgreSQL para Render
   ```

5. **Adicionar regra para Redis:**
   ```
   Type: Custom TCP
   Port: 6379
   Source: 0.0.0.0/0  (ou Anywhere-IPv4)
   Description: Redis para Render
   ```

6. Save rules

✅ **EC2 configurado!**

---

## Parte 2: Deploy da API no Render (10 minutos)

### **1. Criar conta no Render**
- Acesse: https://render.com
- Sign up com GitHub

### **2. Conectar repositório**
- Dashboard → New → Web Service
- Connect repository: `best-lap`

### **3. Configurar o serviço**

**Básico:**
```
Name: best-lap-api
Region: Oregon (ou Ohio - mais próximo do EC2)
Branch: main
Root Directory: (deixar vazio)
Runtime: Docker
```

**Docker:**
```
Dockerfile Path: ./apps/api/Dockerfile
Docker Build Context Directory: .  (root do repo)
```

**Instance:**
```
Instance Type: Free  (ou Starter se quiser sem sleep - $7/mês)
```

### **4. Variáveis de Ambiente**

Clicar em **Advanced** → **Add Environment Variable**:

```bash
NODE_ENV=production
API_PORT=3333

# Conexão com EC2 (SUBSTITUA O IP!)
DB_HOST=ec2-75-101-196-198.compute-1.amazonaws.com
DB_PORT=5432
DB_USER=best_lap
DB_PASSWORD=best_lap
DB_NAME=best_lap_db

REDIS_HOST=ec2-75-101-196-198.compute-1.amazonaws.com
REDIS_PORT=6379

# API Keys (se tiver)
GOOGLE_API_KEY=

# CORS
CORS_ORIGIN=*

# Swagger
FORCE_HTTP_SWAGGER=false
```

### **5. Deploy!**

- Clicar em **Create Web Service**
- Aguardar ~5-10 minutos

### **6. Testar**

Quando terminar, Render vai dar uma URL tipo:
```
https://best-lap-api.onrender.com
```

Testar:
```bash
curl https://best-lap-api.onrender.com/health
curl https://best-lap-api.onrender.com/docs
```

✅ **API no ar!**

---

## Parte 3: Deploy do Dashboard no Render (5 minutos)

### **1. Verificar configuração do Dashboard**

O Dashboard precisa saber a URL da API. Vamos verificar:

```bash
# No seu computador
cd best-lap/apps/web
cat .env.example
```

Se tiver `NEXT_PUBLIC_API_URL`, é só configurar no Render.

### **2. Criar Static Site no Render**

- Dashboard → New → Static Site
- Selecionar repositório: `best-lap`

**Configuração:**
```
Name: best-lap-dashboard
Branch: main
Root Directory: apps/web
Build Command: npm install && npm run build
Publish Directory: .next  (ou "out" se usar export)
```

### **3. Variáveis de Ambiente**

```bash
NEXT_PUBLIC_API_URL=https://best-lap-api.onrender.com
```

⚠️ **IMPORTANTE**: Substituir pela URL real que o Render deu para a API!

### **4. Deploy!**

- Clicar em **Create Static Site**
- Aguardar ~3-5 minutos

### **5. Testar**

Render vai dar uma URL tipo:
```
https://best-lap-dashboard.onrender.com
```

Abrir no navegador e verificar se carrega!

✅ **Dashboard no ar!**

---

## Parte 4: Atualizar CORS (2 minutos)

Agora que temos a URL do Dashboard, atualizar o CORS da API:

1. **Render Dashboard** → **best-lap-api**
2. **Environment** → Editar `CORS_ORIGIN`
3. Mudar de `*` para a URL do dashboard:
   ```
   CORS_ORIGIN=https://best-lap-dashboard.onrender.com
   ```
4. **Save Changes** (vai fazer redeploy automático em ~2 min)

---

## ✅ Verificação Final

### **No EC2:**
```bash
docker ps
# Deve mostrar: timescaledb, redis, metrics-collector

docker logs best-lap-metrics-collector --tail 20
# Verificar se não tem erro
```

### **API:**
```bash
curl https://best-lap-api.onrender.com/health
# Deve retornar 200 OK

curl https://best-lap-api.onrender.com/docs
# Deve retornar o HTML do Swagger
```

### **Dashboard:**
Abrir no navegador:
```
https://best-lap-dashboard.onrender.com
```

---

## 🐛 Troubleshooting Rápido

### **API não conecta no DB**

```bash
# Verificar se portas estão abertas
# No seu computador:
telnet ec2-75-101-196-198.compute-1.amazonaws.com 5432
# Deve conectar

# Se não conectar:
# - Verificar Security Group (portas abertas?)
# - Verificar se containers estão rodando no EC2
```

### **Dashboard não chama a API**

1. Abrir DevTools do navegador (F12)
2. Console → Ver erros
3. Network → Ver se está chamando a API correta

Provavelmente é:
- URL da API errada no `NEXT_PUBLIC_API_URL`
- CORS não configurado

### **Collector não processa jobs**

```bash
# No EC2
docker logs best-lap-metrics-collector --tail 50

# Verificar se conecta no Redis
docker exec -it best-lap-metrics-collector nc -zv redis 6379
```

---

## 📊 Status Esperado

Após seguir este guia:

✅ **EC2**: TimescaleDB + Redis + Metrics Collector
✅ **Render API**: API rodando e acessível via HTTPS
✅ **Render Dashboard**: Dashboard acessível via HTTPS
✅ **Custo**: $0/mês (com sleep) ou $7/mês (sem sleep)

---

## 🔒 Próximos Passos (Opcional - Segurança)

Quando quiser aumentar a segurança:

1. **Restringir IPs no Security Group** (só IPs do Render)
2. **Adicionar senha no Redis**
3. **SSL no PostgreSQL**
4. **Monitoramento de acesso**

Veja `HYBRID_DEPLOY.md` para detalhes.

---

## 💡 Dicas

### **Free Tier do Render**
- API dorme após 15 min de inatividade
- Primeira request demora ~30s (cold start)
- Para desenvolvimento está ótimo!

### **Upgrade para Starter ($7/mês)**
- API sempre ativa
- Sem cold start
- Melhor para produção

### **Monitorar Logs**
- API: Render Dashboard → best-lap-api → Logs
- Collector: SSH no EC2 → `docker logs best-lap-metrics-collector -f`

---

Algum problema? Me avise e eu ajudo! 🚀
