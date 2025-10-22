import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import type { AverageMetric } from '@/types/api'

interface ComparisonTableProps {
  data: {
    channelId: string
    channelName: string
    latestMetric: AverageMetric | null
    color: string
  }[]
  isLoading?: boolean
}

function getScoreBadgeVariant(
  score: number
): 'default' | 'secondary' | 'destructive' {
  if (score >= 90) return 'default'
  if (score >= 70) return 'secondary'
  return 'destructive'
}

export function ComparisonTable({ data, isLoading }: ComparisonTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Comparação Detalhada</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const metrics = [
    { key: 'avg_score', label: 'Performance Score', format: (v: number) => v.toFixed(1), badge: true },
    { key: 'avg_seo', label: 'SEO Score', format: (v: number) => v.toFixed(1), badge: true },
    { key: 'avg_response_time', label: 'Response Time', format: (v: number) => `${v.toFixed(0)}ms`, badge: false },
    { key: 'avg_fcp', label: 'First Contentful Paint', format: (v: number) => `${(v / 1000).toFixed(2)}s`, badge: false },
    { key: 'avg_lcp', label: 'Largest Contentful Paint', format: (v: number) => `${(v / 1000).toFixed(2)}s`, badge: false },
    { key: 'avg_si', label: 'Speed Index', format: (v: number) => `${(v / 1000).toFixed(2)}s`, badge: false },
    { key: 'avg_tbt', label: 'Total Blocking Time', format: (v: number) => `${v.toFixed(0)}ms`, badge: false },
    { key: 'avg_cls', label: 'Cumulative Layout Shift', format: (v: number) => v.toFixed(3), badge: false },
  ] as const

  const getMetricValue = (metric: AverageMetric | null, key: string): number => {
    if (!metric) return 0
    const value = metric[key as keyof AverageMetric]
    if (typeof value === 'string') return parseFloat(value)
    return value as number
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparação Detalhada</CardTitle>
        <p className="text-sm text-muted-foreground">
          Todas as métricas dos canais selecionados
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[180px]">Métrica</TableHead>
                {data.map((item) => (
                  <TableHead key={item.channelId} className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span>{item.channelName}</span>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {metrics.map((metric) => (
                <TableRow key={metric.key}>
                  <TableCell className="font-medium">{metric.label}</TableCell>
                  {data.map((item) => {
                    const value = getMetricValue(item.latestMetric, metric.key)
                    const formattedValue = metric.format(value)

                    return (
                      <TableCell key={item.channelId} className="text-right">
                        {metric.badge ? (
                          <Badge variant={getScoreBadgeVariant(value)}>
                            {formattedValue}
                          </Badge>
                        ) : (
                          <span className="font-medium">{formattedValue}</span>
                        )}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
