# Dockerfile
FROM node:20-alpine

# Criar diretório
WORKDIR /app

# Copiar configs
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm

# Instalar dependências
RUN pnpm install

# Copiar todo o monorepo
COPY . .

# Build (se necessário, dependendo se compila TS -> JS ou usa ts-node direto)
RUN pnpm build

# Default: API (pode ser sobrescrito no docker-compose)
CMD ["pnpm", "run", "dev"]
