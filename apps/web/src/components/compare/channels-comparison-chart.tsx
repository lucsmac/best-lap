import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'
import type { AverageMetric } from '@/types/api'

interface ChannelsComparisonChartProps {
  data: {
    channelId: string
    channelName: string
    metrics: AverageMetric[]
    color: string
  }[]
  title?: string
  metricKey?:
    | 'avg_score'
    | 'avg_seo'
    | 'avg_response_time'
    | 'avg_lcp'
    | 'avg_fcp'
    | 'avg_cls'
}

const metricLabels = {
  avg_score: 'Performance Score',
  avg_seo: 'SEO Score',
  avg_response_time: 'Response Time (ms)',
  avg_lcp: 'Largest Contentful Paint (ms)',
  avg_fcp: 'First Contentful Paint (ms)',
  avg_cls: 'Cumulative Layout Shift',
}

export function ChannelsComparisonChart({
  data,
  title = 'Comparação de Performance entre Canais',
  metricKey = 'avg_score',
}: ChannelsComparisonChartProps) {
  // Prepare chart data by merging all channels data by time
  const timeMap = new Map<string, any>()

  data.forEach(({ channelName, metrics }) => {
    metrics.forEach((metric) => {
      const date = new Date(metric.period_start)
      const isValidDate = metric.period_start && !isNaN(date.getTime())
      const timeKey = isValidDate ? format(date, 'dd/MM HH:mm') : '-'

      if (!timeMap.has(timeKey)) {
        timeMap.set(timeKey, { time: timeKey })
      }

      const entry = timeMap.get(timeKey)!
      let value = metric[metricKey]

      // Handle response_time which can be string or number
      if (metricKey === 'avg_response_time' && typeof value === 'string') {
        value = parseFloat(value)
      }

      entry[channelName] = value
    })
  })

  const chartData = Array.from(timeMap.values())

  // If no data, show empty state
  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex h-[400px] items-center justify-center">
          <p className="text-sm text-muted-foreground">
            Nenhum dado disponível para o período selecionado
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {metricLabels[metricKey]}
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="time"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip />
            <Legend />
            {data.map(({ channelName, color }) => (
              <Line
                key={channelName}
                type="monotone"
                dataKey={channelName}
                stroke={color}
                strokeWidth={2}
                name={channelName}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
