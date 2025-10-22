import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { AverageMetric } from '@/types/api'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface OverallPerformanceChartProps {
  data: AverageMetric[]
  isLoading?: boolean
}

export function OverallPerformanceChart({
  data,
  isLoading,
}: OverallPerformanceChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance Geral ao Longo do Tempo</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance Geral ao Longo do Tempo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center">
            <p className="text-sm text-muted-foreground">
              Nenhum dado disponível para o período selecionado
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const chartData = data.map((metric) => ({
    date: format(new Date(metric.period_start), 'dd/MM', { locale: ptBR }),
    fullDate: format(new Date(metric.period_start), 'dd/MM/yyyy HH:mm', {
      locale: ptBR,
    }),
    performance: Number(metric.avg_score.toFixed(1)),
    seo: Number(metric.avg_seo.toFixed(1)),
    responseTime:
      typeof metric.avg_response_time === 'string'
        ? parseFloat(metric.avg_response_time)
        : metric.avg_response_time,
    lcp: Number((metric.avg_lcp / 1000).toFixed(2)), // Convert to seconds
    fcp: Number((metric.avg_fcp / 1000).toFixed(2)), // Convert to seconds
    si: Number((metric.avg_si / 1000).toFixed(2)), // Convert to seconds
    tbt: Number(metric.avg_tbt.toFixed(0)), // milliseconds
    cls: Number(metric.avg_cls.toFixed(3)), // unitless
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Geral ao Longo do Tempo</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
              }}
              labelFormatter={(label, payload) => {
                if (payload && payload[0]) {
                  return payload[0].payload.fullDate
                }
                return label
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="performance"
              name="Performance Score"
              stroke="#8884d8"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="seo"
              name="SEO Score"
              stroke="#82ca9d"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>

        <div className="mt-4 border-t pt-4">
          <h4 className="mb-3 text-sm font-semibold">Core Web Vitals</h4>
          <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
            <div>
              <p className="text-muted-foreground">LCP</p>
              <p className="text-2xl font-bold">
                {(
                  chartData.reduce((acc, d) => acc + d.lcp, 0) /
                  chartData.length
                ).toFixed(2)}
                <span className="text-sm font-normal">s</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Largest Contentful Paint
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">FCP</p>
              <p className="text-2xl font-bold">
                {(
                  chartData.reduce((acc, d) => acc + d.fcp, 0) /
                  chartData.length
                ).toFixed(2)}
                <span className="text-sm font-normal">s</span>
              </p>
              <p className="text-xs text-muted-foreground">
                First Contentful Paint
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">TBT</p>
              <p className="text-2xl font-bold">
                {(
                  chartData.reduce((acc, d) => acc + d.tbt, 0) /
                  chartData.length
                ).toFixed(0)}
                <span className="text-sm font-normal">ms</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Total Blocking Time
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">CLS</p>
              <p className="text-2xl font-bold">
                {(
                  chartData.reduce((acc, d) => acc + d.cls, 0) /
                  chartData.length
                ).toFixed(3)}
              </p>
              <p className="text-xs text-muted-foreground">
                Cumulative Layout Shift
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
