# Guia de Deploy para t2.micro (1GB RAM)

A instância **t2.micro** é gratuita mas tem apenas **1GB de RAM**, o que torna builds Docker **muito lentos** ou impossíveis.

---

## ⚡ Estratégias Recomendadas

### 🥇 Estratégia 1: Build Local + Deploy Rápido (MELHOR)

**Quando usar**: Sempre que possível (mais rápido)

**Como funciona**:
1. Faz build das imagens **localmente** (seu computador tem mais RAM)
2. Salva as imagens como arquivos `.tar`
3. Transfere para o EC2 via SCP
4. Carrega as imagens no Docker do EC2
5. Deploy instantâneo

**Passo a passo**:

```bash
# ==========================================
# NO SEU COMPUTADOR LOCAL
# ==========================================

# 1. Build das imagens
./scripts/build.sh

# 2. Salvar imagens como arquivos
docker save best-lap-api:latest | gzip > best-lap-api.tar.gz
docker save best-lap-admin:latest | gzip > best-lap-admin.tar.gz
docker save best-lap-metrics-collector:latest | gzip > best-lap-metrics-collector.tar.gz

# 3. Transferir para EC2 (substitua pelo seu IP e chave)
scp -i ~/.ssh/sua-chave.pem best-lap-*.tar.gz ubuntu@SEU_IP_EC2:/tmp/

# ==========================================
# NO EC2
# ==========================================

# 4. Carregar as imagens
cd /tmp
docker load < best-lap-api.tar.gz
docker load < best-lap-admin.tar.gz
docker load < best-lap-metrics-collector.tar.gz

# 5. Limpar arquivos temporários
rm best-lap-*.tar.gz

# 6. Deploy (instantâneo, sem rebuild!)
cd /caminho/para/best-lap
./scripts/deploy-light.sh

# ✅ Deploy concluído em ~2-3 minutos!
```

---

### 🥈 Estratégia 2: Build com Cache no EC2 (Lento mas funciona)

**Quando usar**: Primeira vez ou quando não pode fazer build local

**Como funciona**: Build no EC2 com cache (SEM `--no-cache`)

```bash
# NO EC2

# 1. Limpar memória ANTES
./scripts/docker-cleanup.sh

# 2. Verificar memória disponível
free -h

# 3. Build COM cache (10-20 min)
docker-compose build api admin metrics-collector

# 4. Deploy
./scripts/deploy-light.sh
```

**⚠️ Avisos**:
- Pode levar 15-30 minutos na primeira vez
- Use `screen` ou `tmux` para não perder o processo se desconectar

---

### 🥉 Estratégia 3: Usar GitHub Actions (CI/CD - Avançado)

**Quando usar**: Para automatizar deploys

**Como funciona**: GitHub Actions faz build e push para Docker Hub, EC2 puxa as imagens prontas

Não está implementado ainda, mas posso criar se quiser!

---

## 🚀 Scripts Disponíveis

### Para t2.micro

| Script | Uso | Velocidade | Quando Usar |
|--------|-----|------------|-------------|
| `./scripts/deploy-light.sh` | Deploy sem rebuild | ⚡ Rápido (2-3 min) | Quando imagens já existem |
| `./scripts/restart.sh` | Apenas restart | ⚡⚡ Muito rápido (30s) | Mudanças de código pequenas |
| `docker-compose build` | Build com cache | 🐌 Lento (15-30 min) | Primeira vez ou mudança de deps |

### Scripts Antigos (NÃO use em t2.micro!)

| Script | Por que NÃO usar |
|--------|------------------|
| `./scripts/deploy.sh` | Usa `--no-cache`, trava t2.micro |
| `./scripts/build.sh --with-web` | Build do frontend, muito pesado |

---

## 📋 Workflow Recomendado para t2.micro

### Primeiro Deploy (Setup Inicial)

```bash
# 1. Fazer build LOCAL (no seu computador)
# 2. Transferir imagens via SCP
# 3. Carregar no EC2
# 4. Deploy com ./scripts/deploy-light.sh
```

### Deploy de Atualizações (Mudanças no Código)

**Opção A: Mudanças pequenas (apenas código)**
```bash
# No EC2 (se imagens já existem)
git pull origin main
./scripts/restart.sh
```

**Opção B: Mudanças médias (dependências, migrations)**
```bash
# Build local + transfer + deploy
# (mesmo processo do setup inicial)
```

---

## 🧹 Limpeza de Memória

**SEMPRE limpe antes de builds**:

```bash
# Limpeza completa
./scripts/docker-cleanup.sh

# Ou comando direto
docker system prune -af

# Verificar espaço livre
free -h
df -h
```

---

## 🔍 Diagnóstico

### Ver uso de memória em tempo real

```bash
# Opção 1: free
watch -n 1 free -h

# Opção 2: htop (se instalado)
htop

# Opção 3: Ver apenas percentual usado
free -m | awk 'NR==2{printf "Memory Usage: %.2f%%\n", $3*100/$2 }'
```

### Ver o que está usando memória

```bash
# Processos por memória
ps aux --sort=-%mem | head -10

# Containers Docker
docker stats --no-stream
```

---

## ⚠️ Problemas Comuns em t2.micro

### Build trava ou demora muito

**Causa**: Falta de RAM, usando SWAP (disco como memória)

**Solução**:
1. Cancele (Ctrl+C)
2. Limpe memória: `./scripts/docker-cleanup.sh`
3. Use build local + transferência

### Servidor fica lento após deploy

**Causa**: Memória SWAP sendo usada

**Solução**:
```bash
# Ver uso de swap
free -h

# Se swap estiver cheio, reinicie containers
docker-compose restart

# Ou libere cache
sync; echo 3 > /proc/sys/vm/drop_caches
```

### "Cannot allocate memory" durante build

**Causa**: RAM esgotada

**Solução**: Use Estratégia 1 (build local)

---

## 💡 Dicas de Otimização

### 1. Use `screen` ou `tmux` para processos longos

```bash
# Iniciar screen
screen -S deploy

# Dentro do screen, rode o deploy
./scripts/deploy-light.sh

# Desanexar: Ctrl+A, depois D
# Reanexar: screen -r deploy
```

### 2. Monitore memória durante build

```bash
# Em outra janela SSH
watch -n 2 free -h
```

### 3. Aumente SWAP (emergencial)

```bash
# Criar arquivo de 2GB de swap
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Verificar
free -h
```

⚠️ SWAP é lento! Use apenas se não puder fazer build local.

---

## 🎯 Checklist de Deploy em t2.micro

- [ ] Código atualizado no GitHub
- [ ] `.env.production` configurado no EC2
- [ ] Memória limpa (`./scripts/docker-cleanup.sh`)
- [ ] Imagens construídas (localmente ou no EC2)
- [ ] Deploy executado (`./scripts/deploy-light.sh`)
- [ ] Serviços saudáveis (health checks passando)
- [ ] Logs verificados (sem erros)
- [ ] CORS configurado (se frontend no Render)

---

## 📊 Comparação de Tempo

| Método | Tempo | RAM Necessária |
|--------|-------|----------------|
| Build local + Transfer | ~5-10 min | Apenas seu PC |
| Restart apenas | ~30s | < 100MB |
| Build no EC2 (com cache) | ~15-30 min | ~800MB |
| Build no EC2 (sem cache) | ⏰ 30-60 min ou trava | ~1GB+ |
| Deploy light | ~2-3 min | < 200MB |

---

## 🆘 Precisa de Mais Recursos?

Se o t2.micro está sendo limitante:

### Opções Gratuitas/Baratas:

1. **Render.com** - Free tier para backend também
2. **Railway.app** - $5 crédito mensal grátis
3. **Fly.io** - Free tier generoso

### Upgrade AWS:

- **t3.small** (~$15/mês): 2GB RAM, builds 2x mais rápidos
- **t3.medium** (~$30/mês): 4GB RAM, sem problemas de memória

**Mas na maioria dos casos, build local + t2.micro funciona perfeitamente!**
