# Deploy Rápido da API no Render

Guia objetivo para subir a API Best Lap no Render em 5 minutos.

## Passo 1: Preparar EC2

No AWS Console > EC2 > Security Groups, abra estas portas:

```
PostgreSQL (5432): 0.0.0.0/0
Redis (6379): 0.0.0.0/0
```

## Passo 2: Pegar o IP do EC2

```bash
# No seu terminal local
echo "Seu EC2 IP: $(aws ec2 describe-instances --instance-ids <SEU-INSTANCE-ID> --query 'Reservations[0].Instances[0].PublicDnsName' --output text)"
```

Ou veja no console da AWS.

## Passo 3: Criar Service no Render

1. Acesse https://dashboard.render.com
2. New + → **Blueprint**
3. Conecte o repositório GitHub `best-lap`
4. Selecione **render-api.yaml**
5. Apply

## Passo 4: Configurar Variáveis

No service criado (best-lap-api):

1. Environment → Edite:
   - `DB_HOST`: `seu-ec2-ip.compute-1.amazonaws.com`
   - `REDIS_HOST`: `seu-ec2-ip.compute-1.amazonaws.com`  
   - `GOOGLE_API_KEY`: (opcional)

2. Save Changes

## Passo 5: Deploy

O Render fará deploy automaticamente. Aguarde 5-10 minutos.

## Verificar

Após deploy:

```bash
# Health check
curl https://best-lap-api.onrender.com/health

# Swagger
open https://best-lap-api.onrender.com/docs
```

## Problemas?

### Build Falhou
- Manual Deploy → Clear cache & deploy

### Cannot Connect to DB/Redis  
- Verifique Security Groups do EC2
- Verifique se TimescaleDB e Redis estão up: `docker ps`

### Slow (Free Plan)
- Free tier "dorme" após 15min
- Upgrade para Starter ($7/mês) ou aceite cold starts

## Pronto!

API URL: `https://best-lap-api.onrender.com`

Próximo passo: Deploy do dashboard (ver `RENDER_DEPLOY.md`)
