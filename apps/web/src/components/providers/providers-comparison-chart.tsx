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

interface ProvidersComparisonChartProps {
  data: {
    providerId: string
    providerName: string
    metrics: AverageMetric[]
    color: string
  }[]
  title?: string
  metricKey?: 'avg_score' | 'avg_seo' | 'avg_response_time'
}

const metricLabels = {
  avg_score: 'Performance Score',
  avg_seo: 'SEO Score',
  avg_response_time: 'Response Time (ms)',
}

export function ProvidersComparisonChart({
  data,
  title = 'Comparação de Performance por Provider',
  metricKey = 'avg_score',
}: ProvidersComparisonChartProps) {
  // Prepare chart data by merging all providers data by time
  const timeMap = new Map<string, any>()

  data.forEach(({ providerName, metrics }) => {
    metrics.forEach((metric) => {
      const date = new Date(metric.period_start)
      const isValidDate = metric.period_start && !isNaN(date.getTime())
      const timeKey = isValidDate ? format(date, 'dd/MM HH:mm') : '-'

      if (!timeMap.has(timeKey)) {
        timeMap.set(timeKey, { time: timeKey })
      }

      const entry = timeMap.get(timeKey)!
      entry[providerName] = metric[metricKey]
    })
  })

  const chartData = Array.from(timeMap.values())

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
            {data.map(({ providerName, color }) => (
              <Line
                key={providerName}
                type="monotone"
                dataKey={providerName}
                stroke={color}
                strokeWidth={2}
                name={providerName}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
