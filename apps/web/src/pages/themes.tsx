import { useState, useMemo } from 'react'
import { AppShell } from '@/components/layout/app-shell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { ThemeCard } from '@/components/themes/theme-card'
import { ThemesComparisonChart } from '@/components/themes/themes-comparison-chart'
import { ThemesTable } from '@/components/themes/themes-table'
import { ThemeChannelsSection } from '@/components/themes/theme-channels-section'
import { useChannels } from '@/hooks/use-channels'
import { useThemeMetrics } from '@/hooks/use-metrics'
import type { Period } from '@/types/api'
import { Layers, ChevronDown, ChevronUp } from 'lucide-react'

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

// Predefined colors for themes
const THEME_COLORS = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // green
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
]

export function ThemesPage() {
  const [period, setPeriod] = useState<Period>('daily')
  const [metricKey, setMetricKey] = useState<MetricKey>('avg_score')
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null)
  const [isOverviewExpanded, setIsOverviewExpanded] = useState(false)

  const { data: channels, isLoading: isLoadingChannels } = useChannels()

  // Extract unique themes from channels
  const themes = useMemo(() => {
    if (!channels) return []
    const uniqueThemes = new Set(channels.map((c) => c.theme))
    return Array.from(uniqueThemes).filter(Boolean).sort()
  }, [channels])

  // Fetch metrics for each theme
  const themeMetricsQueries = themes.map((theme) => ({
    theme,
    // eslint-disable-next-line react-hooks/rules-of-hooks
    query: useThemeMetrics(theme, period),
  }))

  const isLoadingMetrics = themeMetricsQueries.some((q) => q.query.isLoading)

  // Prepare data for cards
  const themeCardsData = useMemo(() => {
    return themes.map((theme) => {
      const query = themeMetricsQueries.find((q) => q.theme === theme)
      const metrics = query?.query.data || []
      const latestMetric = metrics.length > 0 ? metrics[metrics.length - 1] : null

      const channelCount = channels?.filter((c) => c.theme === theme).length || 0

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
        theme,
        channelCount,
        value,
      }
    })
  }, [themes, themeMetricsQueries, channels, metricKey])

  // Prepare data for chart
  const chartData = useMemo(() => {
    return themes.map((theme, index) => {
      const query = themeMetricsQueries.find((q) => q.theme === theme)
      return {
        theme,
        metrics: query?.query.data || [],
        color: THEME_COLORS[index % THEME_COLORS.length],
      }
    })
  }, [themes, themeMetricsQueries])

  // Prepare data for table
  const tableData = useMemo(() => {
    return themes.map((theme) => {
      const query = themeMetricsQueries.find((q) => q.theme === theme)
      const metrics = query?.query.data || []
      const latestMetric = metrics.length > 0 ? metrics[metrics.length - 1] : null

      const channelCount = channels?.filter((c) => c.theme === theme).length || 0

      return {
        theme,
        channelCount,
        avgScore: latestMetric?.avg_score || 0,
        avgSEO: latestMetric?.avg_seo || 0,
        avgResponseTime:
          typeof latestMetric?.avg_response_time === 'string'
            ? parseFloat(latestMetric.avg_response_time)
            : latestMetric?.avg_response_time || 0,
        avgFCP: latestMetric?.avg_fcp || 0,
        avgLCP: latestMetric?.avg_lcp || 0,
        avgCLS: latestMetric?.avg_cls || 0,
        avgTBT: latestMetric?.avg_tbt || 0,
        avgSI: latestMetric?.avg_si || 0,
      }
    })
  }, [themes, themeMetricsQueries, channels])

  return (
    <AppShell
      title="Por Tema"
      description="Visualize e compare métricas de performance agrupadas por tema"
      breadcrumbs={[{ label: 'Por Tema' }]}
    >
      <div className="space-y-6">
        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 md:flex-row">
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
          </CardContent>
        </Card>

        {/* Comparison Chart */}
        {!isLoadingMetrics && chartData.length > 0 && (
          <ThemesComparisonChart
            data={chartData}
            metricKey={metricKey}
          />
        )}

        {/* Theme Cards Grid - Preview with Expand */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Visão Geral por Tema</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Resumo da métrica selecionada por tema
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Preview or Full Grid */}
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                {isLoadingChannels || isLoadingMetrics
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <ThemeCard
                        key={i}
                        theme="Loading"
                        value={0}
                        label=""
                        channelCount={0}
                        isLoading
                      />
                    ))
                  : (isOverviewExpanded
                      ? themeCardsData
                      : themeCardsData.slice(0, 4)
                    ).map((data) => (
                      <ThemeCard
                        key={data.theme}
                        theme={data.theme}
                        value={data.value}
                        label={metricOptions.find((m) => m.value === metricKey)?.label || ''}
                        channelCount={data.channelCount}
                        onClick={() => setSelectedTheme(data.theme)}
                      />
                    ))}
              </div>

              {/* See More/Less Button */}
              {themeCardsData.length > 4 && (
                <div className="flex justify-center pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsOverviewExpanded(!isOverviewExpanded)}
                  >
                    {isOverviewExpanded ? (
                      <>
                        <ChevronUp className="mr-1 h-4 w-4" />
                        Ver menos
                      </>
                    ) : (
                      <>
                        <ChevronDown className="mr-1 h-4 w-4" />
                        Ver mais {themeCardsData.length - 4} temas
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Detailed Table */}
        <ThemesTable
          data={tableData}
          isLoading={isLoadingChannels || isLoadingMetrics}
          onThemeClick={(theme) => setSelectedTheme(theme)}
        />

        {/* Selected Theme Channels Section */}
        {selectedTheme && (
          <ThemeChannelsSection
            theme={selectedTheme}
            onClose={() => setSelectedTheme(null)}
          />
        )}

        {/* Empty State */}
        {!isLoadingChannels && themes.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Layers className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">Nenhum tema encontrado</h3>
              <p className="text-sm text-muted-foreground">
                Crie canais com temas para visualizar as métricas aqui
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  )
}
