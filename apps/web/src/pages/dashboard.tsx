import { useState } from 'react'
import { AppShell } from '@/components/layout/app-shell'
import { DashboardOverviewCards } from '@/components/dashboard/dashboard-overview-cards'
import { ThemeDistributionCard } from '@/components/dashboard/theme-distribution-card'
import { PerformanceInsightsCard } from '@/components/dashboard/performance-insights-card'
import { OverallPerformanceChart } from '@/components/dashboard/overall-performance-chart'
import { useChannels } from '@/hooks/use-channels'
import { useAllMetrics, useTriggerCollectionAll } from '@/hooks/use-metrics'
import type { Period } from '@/types/api'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TriggerCollectionDialog } from '@/components/trigger-collection-dialog'

const periodLabels: Record<Period, string> = {
  hourly: 'Última Hora',
  daily: 'Últimos 7 Dias',
  weekly: 'Últimas 4 Semanas',
  monthly: 'Últimos 6 Meses',
}

export function DashboardPage() {
  const [period, setPeriod] = useState<Period>('daily')

  const { data: channels = [], isLoading: isLoadingChannels } = useChannels()
  const { data: metrics = [], isLoading: isLoadingMetrics } =
    useAllMetrics(period)
  const { mutate: triggerCollectionAll, isPending: isCollecting } =
    useTriggerCollectionAll()

  const activeChannels = channels.filter((c) => c.active)

  return (
    <AppShell
      title="Dashboard"
      description="Visão geral das métricas de performance"
    >
      <div className="space-y-6">
        {/* Period Filter and Actions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Período de Visualização</CardTitle>
              <TriggerCollectionDialog
                scope="all"
                channelsCount={activeChannels.length}
                onConfirm={() => triggerCollectionAll()}
                isPending={isCollecting}
              />
            </div>
          </CardHeader>
          <CardContent>
            <Select
              value={period}
              onValueChange={(value) => setPeriod(value as Period)}
            >
              <SelectTrigger className="w-[200px]">
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
          </CardContent>
        </Card>

        {/* Overview Cards */}
        <DashboardOverviewCards
          channels={channels}
          metrics={metrics}
          isLoading={isLoadingChannels || isLoadingMetrics}
        />

        {/* Performance Chart */}
        <OverallPerformanceChart
          data={metrics}
          isLoading={isLoadingMetrics}
        />

        {/* Theme Distribution and Insights */}
        <div className="grid gap-6 md:grid-cols-2">
          <ThemeDistributionCard
            channels={channels}
            isLoading={isLoadingChannels}
          />
          <PerformanceInsightsCard
            channels={channels}
            isLoading={isLoadingChannels}
          />
        </div>
      </div>
    </AppShell>
  )
}
