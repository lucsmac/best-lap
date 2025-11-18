import { useState, useMemo } from 'react'
import { useQueries } from '@tanstack/react-query'
import { Plus, Layers, X } from 'lucide-react'
import { AppShell } from '@/components/layout/app-shell'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { ProvidersTable } from '@/components/providers/providers-table'
import { ProviderDialog } from '@/components/providers/provider-dialog'
import { ProviderCard } from '@/components/providers/provider-card'
import { ProvidersComparisonChart } from '@/components/providers/providers-comparison-chart'
import { useProviders } from '@/hooks/use-providers'
import { useChannels } from '@/hooks/use-channels'
import { metricsApi } from '@/lib/api/endpoints'
import type { Provider, Period } from '@/types/api'

const periodLabels: Record<Period, string> = {
  hourly: 'Por Hora',
  daily: 'Por Dia',
  weekly: 'Por Semana',
  monthly: 'Por Mês',
}

const metricOptions = [
  { value: 'avg_score', label: 'Performance Score' },
  { value: 'avg_seo', label: 'SEO Score' },
  { value: 'avg_response_time', label: 'Response Time' },
] as const

type MetricKey = (typeof metricOptions)[number]['value']

// Predefined colors for providers
const PROVIDER_COLORS = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // green
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
]

export function ProvidersPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null)
  const [comparisonMode, setComparisonMode] = useState(false)
  const [selectedProvidersForComparison, setSelectedProvidersForComparison] = useState<string[]>([])
  const [period, setPeriod] = useState<Period>('daily')
  const [metricKey, setMetricKey] = useState<MetricKey>('avg_score')

  const { data: providers, isLoading, isError } = useProviders()
  const { data: channels } = useChannels()

  const handleEdit = (provider: Provider) => {
    setSelectedProvider(provider)
    setDialogOpen(true)
  }

  const handleCreate = () => {
    setSelectedProvider(null)
    setDialogOpen(true)
  }

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open)
    if (!open) {
      setSelectedProvider(null)
    }
  }

  // Fetch metrics for providers using useQueries
  const providersToFetch = comparisonMode ? selectedProvidersForComparison : (providers?.map((p) => p.id) || [])
  const providerMetricsQueries = useQueries({
    queries: providersToFetch.map((providerId) => ({
      queryKey: ['metrics', 'provider', providerId, period],
      queryFn: async () => {
        const { data } = await metricsApi.getProviderAverage(providerId, period)
        return { providerId, metrics: data.metrics || [] }
      },
      enabled: !!providerId && comparisonMode,
    })),
  })

  const isLoadingMetrics = providerMetricsQueries.some((q) => q.isLoading)

  // Handle provider selection for comparison
  const handleAddProviderToComparison = (providerId: string) => {
    if (selectedProvidersForComparison.length < 4 && !selectedProvidersForComparison.includes(providerId)) {
      setSelectedProvidersForComparison([...selectedProvidersForComparison, providerId])
    }
  }

  const handleRemoveProviderFromComparison = (providerId: string) => {
    setSelectedProvidersForComparison(selectedProvidersForComparison.filter((id) => id !== providerId))
  }

  const handleStartComparison = () => {
    setComparisonMode(true)
  }

  const handleExitComparison = () => {
    setComparisonMode(false)
    setSelectedProvidersForComparison([])
  }

  // Available providers for selection (not already selected)
  const availableProviders = useMemo(() => {
    return providers?.filter((p) => !selectedProvidersForComparison.includes(p.id)) || []
  }, [providers, selectedProvidersForComparison])

  // Can add more providers?
  const canAddMore = selectedProvidersForComparison.length < 4

  // Prepare data for cards
  const providerCardsData = useMemo(() => {
    if (!comparisonMode || selectedProvidersForComparison.length === 0) return []

    return selectedProvidersForComparison.map((providerId, index) => {
      const provider = providers?.find((p) => p.id === providerId)
      const queryResult = providerMetricsQueries[index]
      const metrics = queryResult?.data?.metrics || []
      const latestMetric = metrics.length > 0 ? metrics[metrics.length - 1] : null

      const channelCount = channels?.filter((c) => c.provider_id === providerId).length || 0

      let value = 0
      if (latestMetric) {
        if (metricKey === 'avg_score') {
          value = latestMetric.avg_score
        } else if (metricKey === 'avg_seo') {
          value = latestMetric.avg_seo
        } else if (metricKey === 'avg_response_time') {
          value = typeof latestMetric.avg_response_time === 'string'
            ? parseFloat(latestMetric.avg_response_time)
            : latestMetric.avg_response_time
        }
      }

      return {
        providerId,
        providerName: provider?.name || 'Unknown',
        channelCount,
        value,
      }
    })
  }, [selectedProvidersForComparison, comparisonMode, providerMetricsQueries, providers, metricKey])

  // Prepare data for chart
  const chartData = useMemo(() => {
    if (!comparisonMode || selectedProvidersForComparison.length === 0) return []

    return selectedProvidersForComparison.map((providerId, index) => {
      const provider = providers?.find((p) => p.id === providerId)
      const queryResult = providerMetricsQueries[index]
      return {
        providerId,
        providerName: provider?.name || 'Unknown',
        metrics: queryResult?.data?.metrics || [],
        color: PROVIDER_COLORS[index % PROVIDER_COLORS.length],
      }
    })
  }, [selectedProvidersForComparison, comparisonMode, providerMetricsQueries, providers])

  // Find best performing provider based on selected metric
  const bestProviderId = useMemo(() => {
    if (selectedProvidersForComparison.length === 0 || !comparisonMode) return null

    if (providerCardsData.length === 0) return null

    let best = providerCardsData[0]
    providerCardsData.forEach((item) => {
      let currentValue = item.value
      let bestValue = best.value

      // For response time, lower is better
      if (metricKey === 'avg_response_time') {
        if (currentValue < bestValue) best = item
      } else {
        // For scores, higher is better
        if (currentValue > bestValue) best = item
      }
    })

    return best.providerId
  }, [selectedProvidersForComparison, comparisonMode, providerCardsData, metricKey])

  if (isError) {
    return (
      <AppShell title="Providers" description="Gerencie seus providers">
        <div className="flex h-[400px] items-center justify-center">
          <p className="text-destructive">
            Erro ao carregar os providers. Tente novamente mais tarde.
          </p>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell
      title="Providers"
      description={comparisonMode ? 'Compare a performance de múltiplos providers lado a lado' : 'Gerencie os provedores de tecnologia dos sites'}
      breadcrumbs={[{ label: 'Providers' }]}
      action={
        !comparisonMode && (
          <Button onClick={handleCreate} disabled={isLoading}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Provider
          </Button>
        )
      }
    >
      <div className="space-y-6">
        {/* Comparison Mode UI */}
        {comparisonMode ? (
          <>
            {/* Filters and Comparison Selection */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Modo Comparação</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExitComparison}
                  >
                    Sair da Comparação
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Provider Selection */}
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Providers Selecionados ({selectedProvidersForComparison.length}/4)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {selectedProvidersForComparison.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          Nenhum provider selecionado
                        </p>
                      ) : (
                        selectedProvidersForComparison.map((providerId, index) => {
                          const provider = providers?.find((p) => p.id === providerId)
                          return (
                            <Badge
                              key={providerId}
                              variant="secondary"
                              className="gap-1 pr-1"
                            >
                              <div
                                className="h-2 w-2 rounded-full"
                                style={{
                                  backgroundColor: PROVIDER_COLORS[index % PROVIDER_COLORS.length],
                                }}
                              />
                              {provider?.name || 'Unknown'}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0 hover:bg-transparent"
                                onClick={() => handleRemoveProviderFromComparison(providerId)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </Badge>
                          )
                        })
                      )}
                    </div>
                  </div>

                  {/* Add Provider + Filters Row */}
                  <div className="flex flex-col gap-4 md:flex-row">
                    {/* Add Provider Select */}
                    <div className="flex-1">
                      <label className="mb-2 block text-sm font-medium">
                        Adicionar Provider
                      </label>
                      <Select
                        value=""
                        onValueChange={handleAddProviderToComparison}
                        disabled={!canAddMore || isLoading}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              canAddMore
                                ? 'Selecione um provider'
                                : 'Máximo de 4 providers'
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {availableProviders.length === 0 ? (
                            <SelectItem value="none" disabled>
                              Nenhum provider disponível
                            </SelectItem>
                          ) : (
                            availableProviders.map((provider) => (
                              <SelectItem key={provider.id} value={provider.id}>
                                {provider.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Period Select */}
                    <div className="flex-1">
                      <label className="mb-2 block text-sm font-medium">
                        Período
                      </label>
                      <Select
                        value={period}
                        onValueChange={(value) => setPeriod(value as Period)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o período" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(periodLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Metric Select */}
                    <div className="flex-1">
                      <label className="mb-2 block text-sm font-medium">
                        Métrica Principal
                      </label>
                      <Select
                        value={metricKey}
                        onValueChange={(value) => setMetricKey(value as MetricKey)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a métrica" />
                        </SelectTrigger>
                        <SelectContent>
                          {metricOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Comparison Mode Empty State */}
            {selectedProvidersForComparison.length === 0 && (
              <Card>
                <CardContent className="flex h-[300px] items-center justify-center">
                  <div className="text-center">
                    <Layers className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <p className="mt-4 text-sm text-muted-foreground">
                      Selecione pelo menos um provider para começar a comparação
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Você pode comparar até 4 providers simultaneamente
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Comparison Chart */}
            {!isLoadingMetrics && chartData.length > 0 && (
              <ProvidersComparisonChart
                data={chartData}
                metricKey={metricKey}
              />
            )}

            {/* KPI Cards Grid */}
            {selectedProvidersForComparison.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Resumo das Métricas</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Principais indicadores de performance de cada provider
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {providerCardsData.map((data, index) => {
                      const isBest = data.providerId === bestProviderId

                      return (
                        <ProviderCard
                          key={data.providerId}
                          providerName={data.providerName}
                          value={data.value}
                          label={metricOptions.find((m) => m.value === metricKey)?.label || ''}
                          channelCount={data.channelCount}
                          color={PROVIDER_COLORS[index % PROVIDER_COLORS.length]}
                          isBest={isBest}
                          isLoading={isLoadingMetrics}
                        />
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          /* Normal Mode UI */
          <>
            {/* Action Bar */}
            {!isLoading && providers && providers.length > 1 && (
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleStartComparison}
                >
                  <Layers className="mr-2 h-4 w-4" />
                  Comparar Providers
                </Button>
              </div>
            )}

            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-[400px] w-full" />
              </div>
            ) : (
              <>
                <ProvidersTable
                  data={providers || []}
                  onEdit={handleEdit}
                />

                {providers?.length === 0 && !isLoading && (
                  <div className="flex h-[200px] items-center justify-center rounded-lg border border-dashed">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">
                        Nenhum provider encontrado.
                      </p>
                      <Button
                        variant="link"
                        onClick={handleCreate}
                        className="mt-2"
                      >
                        Criar seu primeiro provider
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      <ProviderDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        provider={selectedProvider}
      />
    </AppShell>
  )
}
