# 🔧 Development Guide

Guia para rodar a aplicação Best Lap em ambiente de desenvolvimento.

## 🚀 Setup Rápido

### Opção 1: Desenvolvimento Local (Recomendado)

```bash
# 1. Instalar dependências
pnpm install

# 2. Configurar environment
cp .env.example .env
# Editar .env conforme necessário

# 3. Subir banco e Redis via Docker
docker compose -f docker-compose.dev.yml up -d

# 4. Fazer seed do banco (opcional)
pnpm --filter=@best-lap/infra db:seed

# 5. Iniciar aplicações em modo dev
pnpm dev
```

### Opção 2: Full Docker Development

```bash
# Usar configuração de produção para desenvolvimento
cp .env.example .env
docker compose -f docker-compose.prod.yml up --build -d
```

## 📦 Comandos Disponíveis

### Aplicações
```bash
# Desenvolvimento de todas as apps
pnpm dev

# Apps específicas
pnpm --filter=@best-lap/api dev
pnpm --filter=@best-lap/metrics-collector dev

# Build de todas as apps
pnpm build

# Lint e type check
pnpm lint
pnpm check-types
```

### Docker para Desenvolvimento
```bash
# Subir apenas banco e Redis
docker compose -f docker-compose.dev.yml up -d

# Parar banco e Redis
docker compose -f docker-compose.dev.yml down

# Ver logs do banco e Redis
docker compose -f docker-compose.dev.yml logs -f

# Limpar volumes (reset completo)
docker compose -f docker-compose.dev.yml down -v
```

### Bull Board (Dashboard de Filas)
```bash
# Iniciar Bull Board separadamente
pnpm --filter=@best-lap/infra bull-board
```

## 🌐 URLs de Desenvolvimento

Após iniciar com `pnpm dev`:

| Serviço | URL | Descrição |
|---------|-----|-----------|
| **API** | http://localhost:3333 | REST API |
| **Swagger** | http://localhost:3333/docs | Documentação da API |
| **Bull Board** | http://localhost:4000 | Dashboard das filas |
| **PostgreSQL** | localhost:5432 | Banco de dados |
| **Redis** | localhost:6379 | Cache e filas |

## ⚙️ Configuração de Ambiente

### Arquivo .env para Desenvolvimento

```bash
# Application
NODE_ENV=development

# API Configuration
API_PORT=3333

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=best_lap
DB_PASSWORD=best_lap
DB_NAME=best_lap_db

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# Bull Board Dashboard
BULL_BOARD_PORT=4000

# Google API (opcional)
GOOGLE_API_KEY=your_key_here

# Metrics Collection (para desenvolvimento, pode rodar a cada minuto)
COLLECT_METRICS_CRON_EXPRESSION=*/1 * * * *
WORKER_CONCURRENCY=5
```

## 🔄 Workflow de Desenvolvimento

### Adicionando Nova Feature

1. **Criar branch**:
   ```bash
   git checkout -b feature/nova-funcionalidade
   ```

2. **Desenvolver localmente**:
   ```bash
   docker compose -f docker-compose.dev.yml up -d  # Se não estiver rodando
   pnpm dev
   ```

3. **Testar mudanças**:
   ```bash
   pnpm build      # Verificar se builda
   pnpm lint       # Verificar linting
   pnpm check-types # Verificar tipos
   ```

4. **Commit e push**:
   ```bash
   git add .
   git commit -m "feat: adicionar nova funcionalidade"
   git push origin feature/nova-funcionalidade
   ```

### Debugging

- **Logs da API**: Aparecem no terminal onde `pnpm dev` está rodando
- **Logs do Collector**: Aparecem no terminal do metrics-collector
- **Logs do Docker**: `docker compose -f docker-compose.dev.yml logs -f`
- **Inspecionar banco**: Use ferramenta como DBeaver ou pgAdmin

## 🧪 Testes (Futuro)

```bash
# Quando implementados
pnpm test
pnpm test:watch
pnpm test:coverage
```

## 🚨 Troubleshooting

### Problemas Comuns

1. **Porta já em uso**:
   ```bash
   # Verificar o que está usando a porta
   lsof -i :3333
   
   # Matar processo se necessário
   kill -9 <PID>
   ```

2. **Banco não conecta**:
   ```bash
   # Verificar se containers estão rodando
   docker ps
   
   # Restart containers
   docker compose -f docker-compose.dev.yml down
   docker compose -f docker-compose.dev.yml up -d
   ```

3. **Dependências desatualizadas**:
   ```bash
   # Reinstalar dependências
   rm -rf node_modules */node_modules
   pnpm install
   ```

4. **Build falhando**:
   ```bash
   # Limpar builds anteriores
   pnpm turbo clean
   
   # Build completo
   pnpm build
   ```

## 🔧 Configuração de IDEs

### VS Code

Extensões recomendadas:
- TypeScript and JavaScript Language Features
- ESLint
- Prettier
- Docker
- Thunder Client (para testar APIs)

### Settings recomendadas (`.vscode/settings.json`):
```json
{
  "typescript.preferences.importModuleSpecifier": "non-relative",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```