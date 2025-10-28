# ✅ Checklist - Deploy Híbrido Simplificado

Siga na ordem! Marque [x] conforme completar.

---

## 📋 Parte 1: EC2 (5 minutos)

### [ ] 1.1. Conectar no EC2
```bash
ssh -i sua-chave.pem ec2-user@ec2-75-101-196-198.compute-1.amazonaws.com
cd best-lap
git pull origin main
```

### [ ] 1.2. Parar apenas a API (Admin fica no EC2)
```bash
docker-compose -f docker-compose.ec2.yml stop api
docker-compose -f docker-compose.ec2.yml rm -f api
```

**Por quê?** Admin (Bull Board) precisa de acesso rápido ao Redis, então fica no EC2.

### [ ] 1.3. Subir DB + Redis + Collector + Admin
```bash
docker-compose -f docker-compose.ec2.yml up -d timescaledb redis metrics-collector admin
docker ps
```

**Esperado:** Ver 4 containers rodando (timescaledb, redis, best-lap-metrics-collector, best-lap-admin)

### [ ] 1.4. Abrir portas no AWS Security Group

**AWS Console → EC2 → Security Groups → Inbound Rules → Edit**

Adicionar 2 regras:

**Regra 1 - PostgreSQL:**
```
Type: Custom TCP
Port: 5432
Source: 0.0.0.0/0
Description: PostgreSQL
```

**Regra 2 - Redis:**
```
Type: Custom TCP
Port: 6379
Source: 0.0.0.0/0
Description: Redis
```

**Save rules**

---

## 📋 Parte 2: Render - Deploy da API (10 minutos)

### [ ] 2.1. Criar conta no Render
- Acessar: https://render.com
- Sign up com GitHub

### [ ] 2.2. Conectar repositório
- Dashboard → **New +** → **Web Service**
- **Connect** seu repositório `best-lap`

### [ ] 2.3. Configurar serviço

**Name:** `best-lap-api`
**Region:** `Oregon` (ou Ohio)
**Branch:** `main`
**Runtime:** `Docker`

**Docker Config:**
- **Dockerfile Path:** `./apps/api/Dockerfile`
- **Docker Build Context:** `.` (deixar vazio = root)

**Instance Type:** `Free` (ou `Starter` se quiser $7/mês sem sleep)

### [ ] 2.4. Adicionar variáveis de ambiente

Clicar em **Advanced** → Adicionar:

```
NODE_ENV = production
API_PORT = 3333

DB_HOST = ec2-75-101-196-198.compute-1.amazonaws.com
DB_PORT = 5432
DB_USER = best_lap
DB_PASSWORD = best_lap
DB_NAME = best_lap_db

REDIS_HOST = ec2-75-101-196-198.compute-1.amazonaws.com
REDIS_PORT = 6379

GOOGLE_API_KEY = (deixar vazio ou sua chave)

CORS_ORIGIN = *

FORCE_HTTP_SWAGGER = false
```

⚠️ **IMPORTANTE:** Substituir `ec2-75-101-196-198.compute-1.amazonaws.com` pelo IP do seu EC2!

### [ ] 2.5. Criar serviço
- Clicar em **Create Web Service**
- ☕ Aguardar ~5-10 minutos (build + deploy)

### [ ] 2.6. Anotar URL da API
Render vai dar algo como: `https://best-lap-api.onrender.com`

**Anotar aqui:** _______________________________________________

### [ ] 2.7. Testar API
```bash
curl https://best-lap-api.onrender.com/health
curl https://best-lap-api.onrender.com/docs
```

**Esperado:** Resposta 200 OK

---

## 📋 Parte 3: Render - Deploy do Dashboard (5 minutos)

### [ ] 3.1. Criar Static Site
- Dashboard → **New +** → **Static Site**
- Selecionar repositório `best-lap`

### [ ] 3.2. Configurar

**Name:** `best-lap-dashboard`
**Branch:** `main`
**Root Directory:** `apps/web`
**Build Command:** `npm install && npm run build`
**Publish Directory:** `.next` (ou `out` se usar export estático)

### [ ] 3.3. Variável de ambiente

```
NEXT_PUBLIC_API_URL = https://best-lap-api.onrender.com
```

⚠️ Usar a URL anotada no passo 2.6!

### [ ] 3.4. Criar site
- Clicar em **Create Static Site**
- ☕ Aguardar ~3-5 minutos

### [ ] 3.5. Anotar URL do Dashboard
Render vai dar algo como: `https://best-lap-dashboard.onrender.com`

**Anotar aqui:** _______________________________________________

### [ ] 3.6. Testar Dashboard
Abrir a URL no navegador

**Esperado:** Dashboard carrega

---

## 📋 Parte 4: Atualizar CORS (2 minutos)

### [ ] 4.1. Atualizar CORS da API
- Render Dashboard → **best-lap-api**
- **Environment** → Editar `CORS_ORIGIN`
- Mudar de `*` para: `https://best-lap-dashboard.onrender.com`
- **Save Changes**

⚠️ Usar a URL anotada no passo 3.5!

### [ ] 4.2. Aguardar redeploy
~2 minutos

---

## ✅ Verificação Final

### [ ] EC2 rodando
```bash
ssh ec2-user@ec2-ip
docker ps
```
**Esperado:** 4 containers (DB, Redis, Collector, Admin)

### [ ] Admin (Bull Board) acessível
Abrir: `http://ec2-75-101-196-198.compute-1.amazonaws.com:4000`

**Esperado:** Dashboard do Bull Board carrega

### [ ] API respondendo
```bash
curl https://best-lap-api.onrender.com/health
```
**Esperado:** 200 OK

### [ ] Dashboard acessível
Abrir `https://best-lap-dashboard.onrender.com` no navegador

**Esperado:** Aplicação carregando

### [ ] Dashboard chama API
F12 (DevTools) → Network → Verificar requisições para API

**Esperado:** Chamadas para `https://best-lap-api.onrender.com`

---

## 🎉 Pronto!

### Arquitetura Final:

```
✅ Render → API (https://best-lap-api.onrender.com)
✅ Render → Dashboard (https://best-lap-dashboard.onrender.com)
✅ EC2 → TimescaleDB + Redis + Metrics Collector + Admin (Bull Board)
```

### Custo:
- **$0/mês** (free tier com sleep)
- **$7/mês** (Render Starter sem sleep)

### URLs:
- **API:** https://best-lap-api.onrender.com/docs
- **Dashboard:** https://best-lap-dashboard.onrender.com
- **Admin (Bull Board):** http://ec2-75-101-196-198.compute-1.amazonaws.com:4000

---

## 🐛 Problemas?

### API não conecta no DB
- [ ] Verificar Security Group (portas abertas?)
- [ ] Testar: `telnet ec2-ip 5432`
- [ ] Verificar containers no EC2: `docker ps`

### Dashboard não chama API
- [ ] Abrir DevTools (F12) → Console
- [ ] Verificar `NEXT_PUBLIC_API_URL`
- [ ] Verificar CORS no Render

### Need help?
Veja `QUICK_HYBRID_SETUP.md` para detalhes!

---

## 📊 Monitoramento

**Logs da API:**
Render Dashboard → best-lap-api → Logs

**Logs do Collector:**
```bash
ssh ec2-user@ec2-ip
docker logs best-lap-metrics-collector -f
```

**Database:**
```bash
docker exec -it timescaledb psql -U best_lap -d best_lap_db
```
