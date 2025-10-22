import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Gauge, Search, Clock, TrendingUp, Activity, Zap } from 'lucide-react'
import type { AverageMetric } from '@/types/api'

interface ComparisonChannelCardProps {
  channelName: string
  latestMetric: AverageMetric | null
  color: string
  isLoading?: boolean
  isBest?: boolean
}

function getScoreColor(score: number): string {
  if (score >= 90) return 'text-green-600'
  if (score >= 70) return 'text-yellow-600'
  return 'text-red-600'
}

function getScoreStatus(score: number): string {
  if (score >= 90) return 'Excelente'
  if (score >= 70) return 'Bom'
  if (score >= 50) return 'Regular'
  return 'Crítico'
}

export function ComparisonChannelCard({
  channelName,
  latestMetric,
  color,
  isLoading,
  isBest,
}: ComparisonChannelCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </CardContent>
      </Card>
    )
  }

  const avgScore = latestMetric?.avg_score || 0
  const avgSEO = latestMetric?.avg_seo || 0
  const avgResponseTime = latestMetric
    ? typeof latestMetric.avg_response_time === 'string'
      ? parseFloat(latestMetric.avg_response_time)
      : latestMetric.avg_response_time
    : 0
  const avgLCP = latestMetric?.avg_lcp || 0
  const avgFCP = latestMetric?.avg_fcp || 0
  const avgCLS = latestMetric?.avg_cls || 0

  const scoreStatus = getScoreStatus(avgScore)
  const scoreColor = getScoreColor(avgScore)

  return (
    <Card className="relative">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: color }}
            />
            <CardTitle className="text-base">{channelName}</CardTitle>
          </div>
          {isBest && (
            <Badge variant="default" className="bg-green-600">
              Melhor
            </Badge>
          )}
        </div>
        <Badge variant="secondary" className="mt-2 w-fit text-xs">
          {scoreStatus}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Performance Score */}
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div className="flex items-center gap-2">
            <Gauge className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Performance</span>
          </div>
          <span className={`text-lg font-bold ${scoreColor}`}>
            {avgScore.toFixed(0)}
            <span className="text-xs font-normal text-muted-foreground">
              /100
            </span>
          </span>
        </div>

        {/* SEO Score */}
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">SEO</span>
          </div>
          <span className={`text-lg font-bold ${getScoreColor(avgSEO)}`}>
            {avgSEO.toFixed(0)}
            <span className="text-xs font-normal text-muted-foreground">
              /100
            </span>
          </span>
        </div>

        {/* Response Time */}
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Response Time</span>
          </div>
          <span className="text-lg font-bold">
            {avgResponseTime.toFixed(0)}
            <span className="text-xs font-normal text-muted-foreground">ms</span>
          </span>
        </div>

        {/* LCP */}
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">LCP</span>
          </div>
          <span className="text-lg font-bold">
            {(avgLCP / 1000).toFixed(2)}
            <span className="text-xs font-normal text-muted-foreground">s</span>
          </span>
        </div>

        {/* FCP */}
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">FCP</span>
          </div>
          <span className="text-lg font-bold">
            {(avgFCP / 1000).toFixed(2)}
            <span className="text-xs font-normal text-muted-foreground">s</span>
          </span>
        </div>

        {/* CLS */}
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">CLS</span>
          </div>
          <span className="text-lg font-bold">{avgCLS.toFixed(3)}</span>
        </div>
      </CardContent>
    </Card>
  )
}
