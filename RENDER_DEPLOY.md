# Deploy do Frontend no Render

Este guia explica como fazer deploy do dashboard web no Render gratuitamente.

## 🎯 Visão Geral

- **Plataforma**: Render.com (Static Site - Gratuito)
- **Aplicação**: Dashboard Web (React + Vite)
- **URL**: `https://best-lap-dashboard.onrender.com` (ou personalizada)
- **Deploy**: Automático a cada push no GitHub

---

## 📋 Pré-requisitos

1. Conta no GitHub com o repositório `best-lap`
2. Conta no [Render.com](https://render.com) (gratuita)
3. IP público do EC2 onde a API está rodando

---

## 🚀 Método 1: Deploy via Blueprint (render.yaml) - RECOMENDADO

Este método usa o arquivo `render.yaml` já criado no projeto.

### Passo 1: Commit e Push do render.yaml

```bash
git add render.yaml
git commit -m "feat: add Render blueprint for frontend deployment"
git push origin main
```

### Passo 2: Criar Blueprint no Render

1. Acesse [render.com](https://render.com) e faça login
2. No Dashboard, clique em **"New +"** → **"Blueprint"**
3. Conecte seu repositório GitHub (`best-lap`)
4. O Render detectará automaticamente o `render.yaml`
5. Clique em **"Apply"**

### Passo 3: Configurar Variável de Ambiente

Após criar o Blueprint:

1. Vá em **"best-lap-dashboard"** no dashboard do Render
2. Clique em **"Environment"** no menu lateral
3. Adicione a variável:
   ```
   Key: VITE_API_URL
   Value: http://SEU_IP_EC2:3333
   ```
   Exemplo: `http://54.123.45.67:3333`
4. Clique em **"Save Changes"**

### Passo 4: Deploy Automático

O Render iniciará o build e deploy automaticamente.

- ⏱️ **Tempo de build**: ~5-10 minutos no primeiro deploy
- 🔄 **Auto-deploy**: A cada push no branch `main`
- 🌐 **URL**: Será fornecida após o deploy (ex: `https://best-lap-dashboard.onrender.com`)

---

## 🔧 Método 2: Deploy Manual (Sem Blueprint)

Se preferir configurar manualmente:

### Passo 1: Criar Static Site

1. Acesse [render.com](https://render.com) e faça login
2. Clique em **"New +"** → **"Static Site"**
3. Conecte seu repositório GitHub
4. Selecione o repositório `best-lap`

### Passo 2: Configurar Build

Preencha os campos:

| Campo | Valor |
|-------|-------|
| **Name** | `best-lap-dashboard` |
| **Branch** | `main` |
| **Root Directory** | `apps/web` |
| **Build Command** | `pnpm install && pnpm build` |
| **Publish Directory** | `apps/web/dist` |

### Passo 3: Variáveis de Ambiente

Adicione estas variáveis:

```
VITE_API_URL=http://SEU_IP_EC2:3333
NODE_VERSION=18
PNPM_VERSION=8.14.0
NODE_ENV=production
```

### Passo 4: Criar Static Site

Clique em **"Create Static Site"** e aguarde o build.

---

## 🔐 Configurar CORS no Backend (EC2)

Após o deploy no Render, você receberá uma URL tipo:
```
https://best-lap-dashboard.onrender.com
```

**IMPORTANTE**: Configure o CORS na API para aceitar requisições do Render.

### No EC2:

```bash
# 1. Conecte no EC2
ssh seu-usuario@seu-ip-ec2

# 2. Edite o .env.production
cd /caminho/para/best-lap
nano .env.production

# 3. Adicione/altere a linha CORS_ORIGIN:
CORS_ORIGIN="https://best-lap-dashboard.onrender.com"

# 4. Reinicie a API
docker restart best-lap-api

# 5. Verifique os logs
docker logs best-lap-api --tail 50 --follow
```

---

## 📊 Monitoramento

### Ver Logs do Deploy

1. Acesse o dashboard do Render
2. Clique em **"best-lap-dashboard"**
3. Vá em **"Logs"** para ver o build e runtime logs

### Redesploy Manual

Se precisar fazer um redesploy manual:

1. Acesse **"best-lap-dashboard"** no Render
2. Clique em **"Manual Deploy"** → **"Deploy latest commit"**

### Testar a Aplicação

Após o deploy:
```bash
# Testar se está acessível
curl https://best-lap-dashboard.onrender.com

# Testar conexão com API (via browser)
# Abra o DevTools (F12) e veja se as requisições para a API estão funcionando
```

---

## 🎨 Domínio Customizado (Opcional)

### Usar Domínio Próprio

Se você tem um domínio (ex: `dashboard.seudominio.com`):

1. No Render, vá em **"Settings"** → **"Custom Domain"**
2. Adicione seu domínio
3. Configure o DNS no seu provedor:
   ```
   Type: CNAME
   Name: dashboard (ou @)
   Value: best-lap-dashboard.onrender.com
   ```
4. Aguarde propagação DNS (~5-60 min)
5. HTTPS será configurado automaticamente

---

## 🔄 Workflow de Deploy

### Deploy Automático (Recomendado)

```bash
# 1. Faça modificações no código
# 2. Commit e push
git add .
git commit -m "feat: nova funcionalidade no dashboard"
git push origin main

# 3. Render detecta o push e inicia deploy automaticamente
# 4. Acompanhe o progresso no dashboard do Render
```

### Deploy Desabilitado (Apenas quando necessário)

Se quiser desabilitar auto-deploy:

1. Vá em **"Settings"** → **"Build & Deploy"**
2. Desabilite **"Auto-Deploy"**
3. Use **"Manual Deploy"** quando quiser fazer deploy

---

## ❌ Troubleshooting

### Build Falha - "pnpm not found"

**Solução**: Certifique-se de que `PNPM_VERSION=8.14.0` está nas variáveis de ambiente.

### Build Falha - "Cannot find module"

**Solução**: Pode ser problema com dependências do monorepo. Tente:
1. Alterar o Build Command para:
   ```bash
   cd ../.. && pnpm install && cd apps/web && pnpm build
   ```

### Frontend não conecta com a API

**Problemas possíveis**:

1. **CORS não configurado**:
   - Verifique se `CORS_ORIGIN` no EC2 aponta para a URL do Render

2. **VITE_API_URL incorreta**:
   - Verifique se a URL da API está correta nas variáveis de ambiente do Render
   - Deve ser o IP público do EC2, não localhost

3. **API offline no EC2**:
   ```bash
   # No EC2, verifique se a API está rodando
   docker ps | grep best-lap-api
   curl http://localhost:3333/health
   ```

4. **Security Group do EC2**:
   - Certifique-se de que a porta 3333 está aberta no Security Group da AWS
   - Origem: `0.0.0.0/0` (ou restrito ao Render)

### Site carregando lentamente

- **Free tier do Render**: Sites podem ficar inativos após 15 min sem uso
- Primeira requisição após inatividade pode levar ~30 segundos
- **Solução**: Upgrade para plano pago ou aceitar o cold start

---

## 💰 Custos

### Free Tier (Plano Gratuito)

✅ **Incluído**:
- 100 GB bandwidth/mês
- Deploy automático
- HTTPS gratuito
- Static site hosting
- Cold start após 15 min de inatividade

❌ **Limitações**:
- Site fica inativo após 15 min sem tráfego
- Primeira requisição após inatividade demora ~30s

### Plano Pago (Se necessário)

- **Starter ($7/mês)**: Sem cold start, sempre ativo
- **Pro ($25/mês)**: Mais recursos e prioridade

**Recomendação**: Comece com o free tier!

---

## 📝 Checklist de Deploy

- [ ] Código commitado e no GitHub
- [ ] `render.yaml` no repositório
- [ ] Blueprint criado no Render
- [ ] `VITE_API_URL` configurada no Render (com IP do EC2)
- [ ] `NODE_VERSION` e `PNPM_VERSION` configuradas
- [ ] Deploy concluído com sucesso
- [ ] URL do Render funcionando
- [ ] `CORS_ORIGIN` configurado no EC2
- [ ] API no EC2 reiniciada
- [ ] Dashboard conectando com a API
- [ ] Security Group do EC2 permite porta 3333

---

## 🔗 Links Úteis

- [Render Dashboard](https://dashboard.render.com)
- [Render Docs - Static Sites](https://render.com/docs/static-sites)
- [Render Docs - Blueprint](https://render.com/docs/blueprint-spec)
- [Render Status](https://status.render.com)

---

## 📞 Suporte

Se tiver problemas:

1. Verifique os logs no Render Dashboard
2. Confira o checklist acima
3. Veja a seção de Troubleshooting
4. Consulte a [documentação oficial do Render](https://render.com/docs)
