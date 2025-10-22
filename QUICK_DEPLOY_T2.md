# Deploy Rápido para t2.micro - GUIA DEFINITIVO

## ⚠️ REGRA DE OURO: NUNCA FAÇA BUILD NO t2.micro

t2.micro tem apenas 1GB RAM. Builds Docker travam a instância.

---

## 🚀 Método Correto: Build Local + Transfer

### NO SEU COMPUTADOR (uma vez só)

```bash
# 1. Ir para o diretório do projeto
cd /caminho/para/best-lap

# 2. Garantir que está atualizado
git pull origin main

# 3. Build das imagens (seu PC tem RAM suficiente)
./scripts/build.sh

# 4. Salvar imagens como arquivos
mkdir -p ~/docker-images
docker save best-lap-api:latest | gzip > ~/docker-images/api.tar.gz
docker save best-lap-admin:latest | gzip > ~/docker-images/admin.tar.gz
docker save best-lap-metrics-collector:latest | gzip > ~/docker-images/collector.tar.gz

echo "✅ Imagens salvas em ~/docker-images/"
ls -lh ~/docker-images/
```

### TRANSFERIR PARA EC2

```bash
# Substitua pelos seus valores:
# - ~/.ssh/SUA_CHAVE.pem
# - SEU_IP_EC2

# 1. Transferir os 3 arquivos
scp -i ~/.ssh/SUA_CHAVE.pem ~/docker-images/*.tar.gz ubuntu@SEU_IP_EC2:/tmp/

# Isso pode levar 5-10 minutos dependendo da sua conexão
```

### NO EC2 (após transferência)

```bash
# 1. Conectar no EC2
ssh -i ~/.ssh/SUA_CHAVE.pem ubuntu@SEU_IP_EC2

# 2. Carregar as imagens
cd /tmp
docker load < api.tar.gz
docker load < admin.tar.gz
docker load < collector.tar.gz

# 3. Limpar arquivos temporários
rm *.tar.gz

# 4. Ir para o projeto
cd /caminho/para/best-lap

# 5. Atualizar código (se necessário)
git pull origin main

# 6. Deploy (instantâneo, usa imagens já carregadas!)
./scripts/deploy-light.sh

# ✅ Pronto! Levou ~2-3 minutos
```

---

## 🔄 Atualizações Futuras

### Quando você mudar APENAS código (sem mudar dependências):

```bash
# NO EC2
cd /caminho/para/best-lap
git pull origin main
./scripts/restart.sh

# ✅ Leva 30 segundos
```

### Quando você adicionar/mudar dependências:

```bash
# Repetir processo completo:
# 1. Build local
# 2. Transfer
# 3. Deploy
```

---

## 📦 Script Automatizado (Opcional)

Salve isso como `deploy-to-ec2.sh` no seu computador:

```bash
#!/bin/bash

# Configurações - EDITE AQUI
EC2_IP="SEU_IP_EC2"
EC2_KEY="~/.ssh/SUA_CHAVE.pem"
EC2_USER="ubuntu"
PROJECT_PATH="/caminho/para/best-lap"

set -e

echo "🚀 Deploy para EC2 t2.micro - Build Local"
echo ""

# 1. Build local
echo "📦 Building images..."
./scripts/build.sh

# 2. Salvar imagens
echo "💾 Saving images..."
mkdir -p /tmp/docker-images
docker save best-lap-api:latest | gzip > /tmp/docker-images/api.tar.gz
docker save best-lap-admin:latest | gzip > /tmp/docker-images/admin.tar.gz
docker save best-lap-metrics-collector:latest | gzip > /tmp/docker-images/collector.tar.gz

# 3. Transfer
echo "📤 Transferring to EC2..."
scp -i $EC2_KEY /tmp/docker-images/*.tar.gz $EC2_USER@$EC2_IP:/tmp/

# 4. Deploy remoto
echo "🚀 Deploying on EC2..."
ssh -i $EC2_KEY $EC2_USER@$EC2_IP << 'EOF'
cd /tmp
docker load < api.tar.gz
docker load < admin.tar.gz
docker load < collector.tar.gz
rm *.tar.gz

cd /caminho/para/best-lap
git pull origin main
./scripts/deploy-light.sh
EOF

# 5. Cleanup local
rm -rf /tmp/docker-images

echo ""
echo "✅ Deploy completo!"
echo "🌐 Acesse: http://$EC2_IP:3333"
```

---

## 🆘 Se a Instância Travar Novamente

### 1. Reboot via Console AWS
- EC2 Console → Selecionar instância → Instance state → Reboot

### 2. Aguardar 2-5 minutos

### 3. Conectar e limpar
```bash
docker-compose down
docker system prune -af --volumes
free -h
```

### 4. NUNCA rodar `./scripts/deploy.sh` no t2.micro
- Esse script usa `--no-cache` que trava
- Use SEMPRE `./scripts/deploy-light.sh`

---

## 💾 Economizar Espaço em Disco

```bash
# Limpar logs antigos
sudo journalctl --vacuum-time=3d

# Limpar cache do apt
sudo apt-get clean

# Ver o que está ocupando espaço
du -h --max-depth=1 / 2>/dev/null | sort -hr | head -20
```

---

## 📊 Monitorar Recursos

```bash
# Memória em tempo real
watch -n 1 free -h

# Disco
df -h

# Containers
docker stats --no-stream
```

---

## ⚡ Workflow Completo (Resumo)

```
┌─────────────────────────────────────────┐
│  SEU COMPUTADOR (Build aqui!)          │
│  1. git pull                            │
│  2. ./scripts/build.sh                  │
│  3. docker save → .tar.gz               │
└──────────────┬──────────────────────────┘
               │ SCP (transfer)
               ▼
┌─────────────────────────────────────────┐
│  EC2 t2.micro (Só deploy!)              │
│  1. docker load                         │
│  2. ./scripts/deploy-light.sh           │
│  ✅ 2-3 minutos total                   │
└─────────────────────────────────────────┘
```

---

## 🎯 Checklist Antes de Cada Deploy

- [ ] Build feito LOCALMENTE (não no EC2)
- [ ] Imagens transferidas via SCP
- [ ] EC2 com memória limpa (`free -h` > 300MB livre)
- [ ] Usando `./scripts/deploy-light.sh` (NÃO `deploy.sh`)
- [ ] Arquivo `.env.production` configurado

---

## 🚫 O QUE NUNCA FAZER

❌ `./scripts/deploy.sh` no t2.micro (trava!)
❌ `./scripts/build.sh` no t2.micro (trava!)
❌ `docker-compose build --no-cache` (trava!)
❌ Build de qualquer coisa no t2.micro

✅ Sempre faça build local + transfer!
