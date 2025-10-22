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

interface ThemesComparisonChartProps {
  data: {
    theme: string
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

export function ThemesComparisonChart({
  data,
  title = 'Comparação de Performance por Tema',
  metricKey = 'avg_score',
}: ThemesComparisonChartProps) {
  // Prepare chart data by merging all themes data by time
  const timeMap = new Map<string, any>()

  data.forEach(({ theme, metrics }) => {
    metrics.forEach((metric) => {
      const date = new Date(metric.period_start)
      const isValidDate = metric.period_start && !isNaN(date.getTime())
      const timeKey = isValidDate ? format(date, 'dd/MM HH:mm') : '-'

      if (!timeMap.has(timeKey)) {
        timeMap.set(timeKey, { time: timeKey })
      }

      const entry = timeMap.get(timeKey)!
      entry[theme] = metric[metricKey]
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
            {data.map(({ theme, color }) => (
              <Line
                key={theme}
                type="monotone"
                dataKey={theme}
                stroke={color}
                strokeWidth={2}
                name={theme}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
