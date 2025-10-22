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
import type { AverageMetric } from '@/types/api'
import { format } from 'date-fns'

interface PerformanceChartProps {
  data: AverageMetric[]
  title?: string
}

export function PerformanceChart({
  data,
  title = 'Performance Score ao longo do tempo',
}: PerformanceChartProps) {
  const chartData = data.map((item) => {
    const date = new Date(item.period_start)
    const isValidDate = item.period_start && !isNaN(date.getTime())
    return {
      time: isValidDate ? format(date, 'dd/MM HH:mm') : '-',
      score: item.avg_score,
      seo: item.avg_seo,
    }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
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
            <Line
              type="monotone"
              dataKey="score"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              name="Performance Score"
            />
            <Line
              type="monotone"
              dataKey="seo"
              stroke="hsl(var(--accent-foreground))"
              strokeWidth={2}
              name="SEO Score"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
