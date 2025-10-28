# Deploy Rápido no Render (API + Dashboard)

Guia objetivo para subir API e Dashboard Best Lap no Render em 5 minutos com um único blueprint.

## Arquitetura

Este blueprint unificado deploya:
- **API Backend** (Docker): Fastify + Swagger em `https://best-lap-api.onrender.com`
- **Dashboard Web** (Static): Next.js em `https://best-lap-dashboard.onrender.com`
- **Integração Automática**: CORS e URLs configurados automaticamente entre os serviços

Infraestrutura no EC2:
- TimescaleDB (PostgreSQL)
- Redis
- Admin (Bull Board)
- Metrics Collector

## Passo 1: Preparar EC2

No AWS Console > EC2 > Security Groups, abra estas portas:

```
PostgreSQL (5432): Custom TCP, Source: 0.0.0.0/0
Redis (6379): Custom TCP, Source: 0.0.0.0/0
```

**Detalhes da configuração:**
1. Security Groups → Editar Inbound Rules
2. Add Rule:
   - **Type**: Custom TCP
   - **Port**: 5432 (PostgreSQL)
   - **Source**: 0.0.0.0/0
3. Add Rule:
   - **Type**: Custom TCP
   - **Port**: 6379 (Redis)
   - **Source**: 0.0.0.0/0
4. Save rules

## Passo 2: Pegar o IP do EC2

```bash
# No seu terminal local
echo "Seu EC2 IP: $(aws ec2 describe-instances --instance-ids <SEU-INSTANCE-ID> --query 'Reservations[0].Instances[0].PublicDnsName' --output text)"
```

Ou veja no console da AWS em EC2 → Instances → Public IPv4 DNS.

## Passo 3: Deploy Unificado no Render

1. Acesse https://dashboard.render.com
2. New + → **Blueprint**
3. Conecte o repositório GitHub `best-lap`
4. Selecione **render.yaml** (blueprint unificado)
5. Apply

**O que acontece:**
- Render cria 2 services automaticamente: `best-lap-api` e `best-lap-dashboard`
- CORS_ORIGIN da API aponta automaticamente para URL do Dashboard
- VITE_API_URL do Dashboard aponta automaticamente para URL da API

## Passo 4: Configurar Variáveis do EC2

Após criação, configure apenas as variáveis do EC2 no service **best-lap-api**:

1. Dashboard → best-lap-api → Environment
2. Edite estas variáveis (marcadas com `sync: false` no blueprint):
   - `DB_HOST`: `seu-ec2-ip.compute-1.amazonaws.com`
   - `REDIS_HOST`: `seu-ec2-ip.compute-1.amazonaws.com`
   - `GOOGLE_API_KEY`: (opcional, para métricas extendidas)
3. Save Changes

**Nota:** As outras variáveis já estão configuradas automaticamente pelo blueprint.

## Passo 5: Aguardar Deploy

O Render fará deploy automaticamente dos dois services. Aguarde 5-10 minutos.

**Progresso:**
- best-lap-api: Build Docker → Deploy
- best-lap-dashboard: Build estático → Deploy

## Verificar

Após deploy completo:

```bash
# API Health check
curl https://best-lap-api.onrender.com/health

# API Swagger
open https://best-lap-api.onrender.com/docs

# Dashboard
open https://best-lap-dashboard.onrender.com
```

## Benefícios do Blueprint Unificado

1. **Deploy Único**: Um único Apply cria ambos os services
2. **URLs Automáticos**: Não precisa copiar/colar URLs entre services
3. **CORS Configurado**: API aceita requisições do Dashboard automaticamente
4. **Versionamento**: Mudanças no blueprint afetam ambos os services
5. **Consistência**: Mesma região (Ohio) para baixa latência

## Problemas?

### Build Falhou (API ou Dashboard)
- Dashboard → Service → Manual Deploy
- Opção: Clear build cache & deploy

### API: Cannot Connect to DB/Redis
- Verifique Security Groups do EC2 (porta 5432 e 6379 abertas)
- SSH no EC2: `docker ps` (TimescaleDB e Redis devem estar running)
- Teste conectividade: `nc -zv seu-ec2-ip.compute-1.amazonaws.com 5432`

### Dashboard: Página em Branco
- Check Console do navegador (F12)
- Verifique se VITE_API_URL está correto: Dashboard → Environment
- Deve apontar para: `https://best-lap-api.onrender.com`

### CORS Errors no Dashboard
- Verifique CORS_ORIGIN na API: `https://best-lap-dashboard.onrender.com`
- Se mudou domínio customizado, atualize manualmente

### Slow (Free Plan)
- Free tier "dorme" após 15min de inatividade
- Cold start: ~30s para acordar
- Upgrade para Starter ($7/mês/service) elimina cold starts

## Pronto!

**URLs Finais:**
- API: `https://best-lap-api.onrender.com`
- Dashboard: `https://best-lap-dashboard.onrender.com`
- Swagger: `https://best-lap-api.onrender.com/docs`

**EC2 (interno):**
- Admin (Bull Board): `http://seu-ec2-ip:4000`
- Metrics Collector: Running em background

**Próximos passos:**
- Configurar domínio customizado (opcional)
- Monitorar queues no Admin (Bull Board)
- Verificar coleta de métricas nos logs do metrics-collector
