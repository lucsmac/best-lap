import { KpiCard } from './kpi-card'
import {
  Clock,
  TrendingUp,
  Search,
  Activity,
} from 'lucide-react'
import type { Channel, AverageMetric } from '@/types/api'

interface DashboardOverviewCardsProps {
  channels: Channel[]
  metrics: AverageMetric[]
  isLoading?: boolean
}

export function DashboardOverviewCards({
  channels,
  metrics,
  isLoading,
}: DashboardOverviewCardsProps) {
  // Get latest metrics average
  const latestMetrics = metrics.length > 0 ? metrics[metrics.length - 1] : null
  const averageScore = latestMetrics ? latestMetrics.avg_score : 0
  const averageSEO = latestMetrics ? latestMetrics.avg_seo : 0
  const averageResponseTime = latestMetrics
    ? typeof latestMetrics.avg_response_time === 'string'
      ? parseFloat(latestMetrics.avg_response_time)
      : latestMetrics.avg_response_time
    : 0

  // Count active channels
  const activeChannelsCount = channels.filter((channel) => channel.active).length

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        title="Tempo de Resposta Médio"
        value={
          averageResponseTime > 0 ? (
            <>
              {averageResponseTime.toFixed(0)}
              <span className="text-sm font-normal text-muted-foreground">
                ms
              </span>
            </>
          ) : (
            'N/A'
          )
        }
        icon={Clock}
        description="Tempo médio de resposta dos canais"
        isLoading={isLoading}
      />

      <KpiCard
        title="Performance Média"
        value={
          averageScore > 0 ? (
            <>
              {averageScore.toFixed(0)}
              <span className="text-sm font-normal text-muted-foreground">
                /100
              </span>
            </>
          ) : (
            'N/A'
          )
        }
        icon={TrendingUp}
        description="Score médio de performance"
        isLoading={isLoading}
      />

      <KpiCard
        title="SEO Médio"
        value={
          averageSEO > 0 ? (
            <>
              {averageSEO.toFixed(0)}
              <span className="text-sm font-normal text-muted-foreground">
                /100
              </span>
            </>
          ) : (
            'N/A'
          )
        }
        icon={Search}
        description="Score médio de SEO"
        isLoading={isLoading}
      />

      <KpiCard
        title="Canais Ativos"
        value={activeChannelsCount}
        icon={Activity}
        description="Canais sendo monitorados"
        isLoading={isLoading}
      />
    </div>
  )
}
