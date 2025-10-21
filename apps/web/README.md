# Best Lap - Web Dashboard

Dashboard web para gestão e visualização de métricas de performance do projeto Best Lap.

## Tecnologias

- **React 18** + **TypeScript**
- **Vite** - Build tool
- **TanStack Router** - Roteamento
- **TanStack Query** - Data fetching e cache
- **TanStack Table** - Tabelas avançadas
- **shadcn/ui** - Componentes UI
- **Tailwind CSS** - Estilização
- **Recharts** - Gráficos
- **React Hook Form** + **Zod** - Formulários e validação

## Estrutura

```
src/
├── components/
│   ├── ui/              # Componentes shadcn/ui
│   ├── layout/          # Layout (Sidebar, Header, AppShell)
│   ├── dashboard/       # Componentes do dashboard
│   ├── channels/        # Componentes de canais
│   ├── pages/           # Componentes de páginas
│   └── metrics/         # Componentes de métricas
├── lib/
│   ├── api/             # API client e endpoints
│   └── utils.ts         # Utilitários (cn, etc)
├── hooks/               # Custom hooks (TanStack Query)
├── pages/               # Páginas da aplicação
├── routes/              # Configuração de rotas
├── types/               # TypeScript types
└── main.tsx             # Entry point
```

## Desenvolvimento

```bash
# Instalar dependências (na raiz do monorepo)
pnpm install

# Iniciar servidor de desenvolvimento
pnpm --filter=@best-lap/web dev

# Ou usando turbo
turbo dev --filter=@best-lap/web
```

A aplicação estará disponível em: http://localhost:5173

## Build

```bash
# Build para produção
pnpm --filter=@best-lap/web build

# Preview do build
pnpm --filter=@best-lap/web preview
```

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz do monorepo com:

```env
# API URL (opcional, padrão: http://localhost:3333)
VITE_API_URL=http://localhost:3333
```

## Páginas

### Dashboard (`/`)
- Visão geral com KPIs principais
- Gráfico de performance ao longo do tempo
- Score médio geral, canais ativos, total de páginas

### Canais (`/channels`)
- Listagem de todos os canais
- CRUD completo (criar, editar, deletar)
- Ativar/Desativar canais
- Filtros e busca

### Detalhes do Canal (`/channels/:id`)
- Informações detalhadas do canal
- KPIs específicos do canal
- Gráficos de métricas ao longo do tempo
- Core Web Vitals (FCP, LCP, TBT, CLS, SI)
- Lista de páginas do canal
- Seletor de período (hourly, daily, weekly, monthly)

### Métricas (`/metrics`)
- Visualização de todas as métricas agregadas
- Gráficos separados para cada métrica
- Comparação temporal

### Comparação (`/compare`)
- Comparar até 6 canais simultaneamente
- Gráficos comparativos
- Tabela com médias do período

## Componentes Principais

### Layout
- **AppShell**: Container principal com sidebar e header
- **Sidebar**: Navegação lateral
- **Header**: Cabeçalho com título e descrição

### Dashboard
- **KpiCard**: Card para exibir KPIs
- **PerformanceChart**: Gráfico de linha para performance

### Canais
- **ChannelsTable**: Tabela com TanStack Table
- **ChannelForm**: Formulário para criar/editar canais

## Integração com API

O dashboard se conecta à API REST em `http://localhost:3333` (configurável via `VITE_API_URL`).

Endpoints utilizados:
- `GET /channels` - Listar canais
- `POST /channels` - Criar canal
- `PATCH /channels/:id` - Atualizar canal
- `DELETE /channels/:id` - Deletar canal
- `PATCH /channels/:id/enable` - Ativar canal
- `PATCH /channels/:id/disable` - Desativar canal
- `GET /metrics/:channelId/average/:period` - Métricas do canal
- `GET /metrics/average/:period` - Métricas gerais

## Hooks Personalizados

### Canais
- `useChannels()` - Listar todos os canais
- `useChannel(id)` - Obter canal específico
- `useCreateChannel()` - Criar canal
- `useUpdateChannel()` - Atualizar canal
- `useDeleteChannel()` - Deletar canal
- `useEnableChannel()` - Ativar canal
- `useDisableChannel()` - Desativar canal

### Métricas
- `useAllMetrics(period)` - Métricas agregadas
- `useChannelMetrics(channelId, period)` - Métricas do canal
- `useThemeMetrics(theme, period)` - Métricas por tema

### Páginas
- `usePages(channelId)` - Páginas do canal
- `useCreatePage()` - Criar página
- `useUpdatePage()` - Atualizar página
- `useDeletePage()` - Deletar página
