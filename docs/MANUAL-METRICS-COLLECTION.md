# Coleta Manual de Métricas de Performance

## Visão Geral

Este documento descreve a funcionalidade de **coleta manual (sob demanda)** de métricas de performance implementada no Best Lap. Esta feature permite que usuários disparem a coleta de métricas de performance através do dashboard web, sem necessidade de aguardar o agendamento automático via cron.

## Funcionalidades

A coleta manual oferece **três níveis de escopo**:

### 1. Coleta de Todos os Canais (Global)
- **Endpoint**: `POST /channels/metrics/collect`
- **Descrição**: Dispara a coleta da página home (`/`) de todos os canais ativos
- **Use Case**: Atualização rápida das métricas de todos os canais após mudanças globais

### 2. Coleta de Canal Específico
- **Endpoint**: `POST /channels/metrics/:channel_id/collect`
- **Descrição**: Dispara a coleta de **todas as páginas** de um canal específico
- **Use Case**: Atualização completa das métricas de um canal após deploy ou mudanças

### 3. Coleta de Página Específica
- **Endpoint**: `POST /channels/metrics/:channel_id/pages/:page_id/collect`
- **Descrição**: Dispara a coleta de uma página individual
- **Use Case**: Teste pontual de performance de uma página específica

## Como Usar

### Via Dashboard Web (Interface do Usuário)

#### 1. Coletar Todos os Canais
```tsx
import { TriggerCollectionDialog } from '@/components/trigger-collection-dialog'
import { useTriggerCollectionAll } from '@/hooks/use-metrics'

export function DashboardPage() {
  const { mutate: triggerAll, isPending } = useTriggerCollectionAll()

  return (
    <TriggerCollectionDialog
      scope="all"
      channelsCount={activeChannelsCount}
      onConfirm={() => triggerAll()}
      isPending={isPending}
    />
  )
}
```

#### 2. Coletar Canal Específico
```tsx
import { TriggerCollectionDialog } from '@/components/trigger-collection-dialog'
import { useTriggerCollectionChannel } from '@/hooks/use-metrics'

export function ChannelDetailsPage({ channel }: { channel: Channel }) {
  const { mutate: triggerChannel, isPending } = useTriggerCollectionChannel()

  return (
    <TriggerCollectionDialog
      scope="channel"
      channelName={channel.name}
      pagesCount={channel.pages?.length}
      onConfirm={() => triggerChannel(channel.id)}
      isPending={isPending}
    />
  )
}
```

#### 3. Coletar Página Específica
```tsx
import { TriggerCollectionDialog } from '@/components/trigger-collection-dialog'
import { useTriggerCollectionPage } from '@/hooks/use-metrics'

export function PageRow({ page, channelId }: { page: Page; channelId: string }) {
  const { mutate: triggerPage, isPending } = useTriggerCollectionPage()

  return (
    <TriggerCollectionDialog
      scope="page"
      pageName={page.name}
      onConfirm={() => triggerPage({ channelId, pageId: page.id })}
      isPending={isPending}
    />
  )
}
```

### Via API (cURL / Postman / Swagger)

#### 1. Coletar Todos os Canais
```bash
curl -X POST http://localhost:3333/channels/metrics/collect
```

**Resposta**:
```json
{
  "message": "Successfully enqueued 15 metrics collection jobs for 15 channels",
  "jobs_count": 15
}
```

#### 2. Coletar Canal Específico
```bash
curl -X POST http://localhost:3333/channels/metrics/{channel_id}/collect
```

**Resposta**:
```json
{
  "message": "Successfully enqueued 5 metrics collection jobs for channel",
  "jobs_count": 5,
  "channel_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

#### 3. Coletar Página Específica
```bash
curl -X POST http://localhost:3333/channels/metrics/{channel_id}/pages/{page_id}/collect
```

**Resposta**:
```json
{
  "message": "Successfully enqueued metrics collection job for page",
  "jobs_count": 1,
  "channel_id": "550e8400-e29b-41d4-a716-446655440000",
  "page_id": "660e8400-e29b-41d4-a716-446655440000"
}
```

## Arquitetura e Fluxo de Dados

### Diagrama de Fluxo
```
┌─────────────────┐
│  Dashboard Web  │
│   (Frontend)    │
└────────┬────────┘
         │ 1. POST /channels/metrics/collect
         ▼
┌─────────────────┐
│   API Server    │
│   (Fastify)     │
└────────┬────────┘
         │ 2. Busca canais ativos
         ▼
┌─────────────────┐
│  PostgreSQL DB  │
│  (TimescaleDB)  │
└────────┬────────┘
         │ 3. Retorna lista
         ▼
┌─────────────────┐
│   API Server    │
│ (Enfileira jobs)│
└────────┬────────┘
         │ 4. Adiciona jobs ao BullMQ
         ▼
┌─────────────────┐
│  Redis Queue    │
│    (BullMQ)     │
└────────┬────────┘
         │ 5. Workers processam jobs
         ▼
┌─────────────────┐
│ Metrics         │
│ Collector       │
│ (Workers)       │
└────────┬────────┘
         │ 6. Chama Google Lighthouse API
         ▼
┌─────────────────┐
│ Google          │
│ PageSpeed       │
│ Insights API    │
└────────┬────────┘
         │ 7. Retorna métricas
         ▼
┌─────────────────┐
│ Metrics         │
│ Collector       │
└────────┬────────┘
         │ 8. Salva métricas
         ▼
┌─────────────────┐
│  PostgreSQL DB  │
│  (TimescaleDB)  │
└─────────────────┘
```

### Componentes Envolvidos

#### Backend (API)
- **Controller**: `trigger-collection-controller.ts`
  - `triggerCollectionAll()`: Handler para coleta global
  - `triggerCollectionChannel()`: Handler para canal específico
  - `triggerCollectionPage()`: Handler para página específica

- **Repository**: `TypeormChannelsRepository`
  - `listActiveChannelsWithHomePage()`: Query otimizada com JOIN para buscar canais + página `/`
  - `findById()`: Busca canal por ID com páginas

- **Queue**: `BullMqPageMetricsQueue`
  - `setCollectPageMetricsJob()`: Adiciona job à fila (`reference` ou `client`)

#### Queue Infrastructure
- **Redis**: Armazena filas BullMQ
- **BullMQ**: Gerencia jobs assíncronos
- **Filas**:
  - `reference`: Jobs para canais de referência
  - `client`: Jobs para canais de clientes

#### Metrics Collector
- **Workers**: Processam jobs das filas
- **Service**: `CollectPageMetricsService`
  - Chama Google Lighthouse API
  - Adapta resposta para formato interno
  - Salva métricas no TimescaleDB

#### Frontend (Web Dashboard)
- **API Client**: `metricsApi` em `endpoints.ts`
- **Hooks**: `useTriggerCollection*` em `use-metrics.ts`
- **Component**: `TriggerCollectionDialog` (dialog de confirmação reutilizável)

### Otimizações Implementadas

#### 1. Query Otimizada para Coleta Global
Para evitar problema de N+1 queries, foi criado o método `listActiveChannelsWithHomePage()`:

```typescript
// ❌ ANTES (N+1 Problem)
const channels = await channelsRepository.listActiveChannels() // 1 query
for (const channel of channels) {
  const homePage = await pagesRepository.findByPath(channel.id, '/') // N queries
}

// ✅ DEPOIS (1 Query Única)
const channels = await channelsRepository.listActiveChannelsWithHomePage()
// Query com JOIN:
// SELECT channel.*, page.*
// FROM channel
// LEFT JOIN page ON page.channel_id = channel.id AND page.path = '/'
// WHERE channel.active = true
```

#### 2. Shared Queue Configuration
As filas foram centralizadas no pacote `@best-lap/infra`:

```typescript
// packages/infra/src/queue/queues/queues-map.ts
export const queuesMap = {
  reference: makeQueue('reference'),
  client: makeQueue('client')
}

// Importado por:
// - apps/api (para enfileirar jobs)
// - apps/metrics-collector (para processar jobs)
```

Isto evita duplicação de configuração e garante que API e Workers usem as mesmas filas.

## Comportamento e UX

### Feedback ao Usuário

1. **Dialog de Confirmação**: Antes de disparar a coleta, o usuário vê:
   - Título descritivo
   - Quantos jobs serão enfileirados
   - Aviso de que é assíncrono

2. **Toast de Sucesso**: Após confirmar:
   ```
   ✓ Successfully enqueued X metrics collection jobs
   X jobs enfileirados para coleta
   ```

3. **Toast de Erro**: Se falhar:
   ```
   ✗ Erro ao disparar coleta
   [Mensagem de erro da API]
   ```

4. **Invalidação de Cache**: Após 5 segundos do sucesso, o React Query invalida as queries de métricas, fazendo o dashboard recarregar os dados automaticamente.

### Prevenção de Múltiplos Disparos

- **Botão Desabilitado**: Enquanto `isPending` é `true`, o botão fica disabled
- **Estado de Loading**: Texto do botão muda para "Enfileirando..."

## Monitoramento e Troubleshooting

### Verificar Jobs no Bull Board
Acesse o painel administrativo em `http://localhost:4000` (ou porta configurada em `ADMIN_PORT`):

1. Navegue até a fila `reference` ou `client`
2. Veja jobs:
   - **Waiting**: Aguardando processamento
   - **Active**: Sendo processados
   - **Completed**: Finalizados com sucesso
   - **Failed**: Falharam (veja erro)

### Logs do Metrics Collector
```bash
# Docker
docker logs best-lap-metrics-collector --tail 50 --follow

# Local
cd apps/metrics-collector
pnpm dev
```

### Verificar Jobs no Redis
```bash
docker exec -it redis redis-cli KEYS "bull:*"
docker exec -it redis redis-cli LLEN bull:reference:wait
docker exec -it redis redis-cli LLEN bull:client:wait
```

### Verificar Métricas Salvas no Banco
```bash
docker exec -it timescaledb psql -U best_lap -d best_lap_db -c "
  SELECT COUNT(*), MAX(time)
  FROM metrics
  WHERE time > NOW() - INTERVAL '10 minutes';
"
```

## Limites e Considerações

### Rate Limiting
⚠️ **Atenção**: Google PageSpeed Insights API tem rate limits:
- ~200 requisições por minuto por IP
- Quotas diárias variáveis

**Recomendação**: Evite disparar coleta global muito frequentemente.

### Tempo de Processamento
- Cada página leva **5-30 segundos** para coletar (dependendo do tamanho)
- **Coleta global** (15 canais): ~2-8 minutos total
- **Coleta de canal** (5 páginas): ~30 segundos - 2 minutos

### Concorrência de Workers
Configurável via `WORKER_CONCURRENCY` (padrão: depende da implementação):
- **EC2 (t3.small)**: 2-3 workers recomendado
- **Local development**: 1 worker

## Troubleshooting Comum

### Problema: Jobs não são processados
**Causa**: Workers do metrics-collector não estão rodando

**Solução**:
```bash
# Verificar se o container está rodando
docker ps | grep metrics-collector

# Restart o metrics-collector
docker restart best-lap-metrics-collector

# Ou via docker-compose
pnpm docker:deploy:ec2
```

### Problema: Jobs falham com erro de API
**Causa**: Google Lighthouse API retornou erro (rate limit, timeout, etc.)

**Solução**:
1. Verifique a chave da API: `GOOGLE_API_KEY`
2. Aguarde alguns minutos (rate limit)
3. Re-execute jobs falhados via Bull Board

### Problema: Métricas não aparecem no dashboard
**Causa**: Cache do React Query não foi invalidado

**Solução**:
- Aguarde 5 segundos após o toast de sucesso
- Ou force refresh da página (F5)
- Ou limpe o cache: `localStorage.clear()` no console

## Exemplos de Uso Avançado

### Coletar Apenas Canais de um Tema
```typescript
// Filtrar canais por tema antes de enfileirar
const channels = await channelsRepository.listByTheme('ecommerce')
for (const channel of channels) {
  // enfileirar jobs...
}
```

### Agendar Coleta para Horário Específico
```typescript
// Usando BullMQ delayed jobs
await pageMetricsQueue.setCollectPageMetricsJob({
  type: 'client',
  data: { pageUrl, pageId },
  opts: {
    delay: 3600000 // 1 hora em ms
  }
})
```

### Coletar com Prioridade
```typescript
await pageMetricsQueue.setCollectPageMetricsJob({
  type: 'reference',
  data: { pageUrl, pageId },
  opts: {
    priority: 1 // Maior prioridade
  }
})
```

## Próximas Melhorias

- [ ] Rate limiting no backend
- [ ] Polling de status dos jobs em tempo real
- [ ] Histórico de coletas manuais
- [ ] Notificações quando coleta terminar
- [ ] Filtros avançados (por tema, provider, etc.)
- [ ] Coleta de métricas específicas (só performance, só SEO, etc.)

## Referências

- [BullMQ Documentation](https://docs.bullmq.io/)
- [Google PageSpeed Insights API](https://developers.google.com/speed/docs/insights/v5/get-started)
- [TimescaleDB Continuous Aggregates](https://docs.timescale.com/use-timescale/latest/continuous-aggregates/)
