import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { Channel } from '@/types/api'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface ThemeDistributionCardProps {
  channels: Channel[]
  isLoading?: boolean
}

const THEME_COLORS: Record<string, string> = {
  automotive: '#3b82f6', // blue
  technology: '#8b5cf6', // purple
  healthcare: '#10b981', // green
  finance: '#f59e0b', // amber
  retail: '#ec4899', // pink
  landingpage: '#6366f1', // indigo
  outros: '#9ca3af', // gray
}

// Extended color palette for dynamic assignment
const COLOR_PALETTE = [
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#10b981', // green
  '#f59e0b', // amber
  '#ec4899', // pink
  '#6366f1', // indigo
  '#ef4444', // red
  '#14b8a6', // teal
  '#f97316', // orange
  '#84cc16', // lime
  '#06b6d4', // cyan
  '#a855f7', // violet
  '#eab308', // yellow
  '#22c55e', // emerald
  '#f43f5e', // rose
  '#8b5cf6', // fuchsia
  '#0ea5e9', // sky
  '#d946ef', // magenta
  '#64748b', // slate
  '#78716c', // stone
]

function getThemeColor(theme: string, index: number): string {
  if (THEME_COLORS[theme]) {
    return THEME_COLORS[theme]
  }
  // Use index to assign a color from palette cyclically
  return COLOR_PALETTE[index % COLOR_PALETTE.length]
}

const THEME_LABELS: Record<string, string> = {
  automotive: 'Automotivo',
  technology: 'Tecnologia',
  healthcare: 'Saúde',
  finance: 'Finanças',
  retail: 'Varejo',
  landingpage: 'Landing Page',
}

export function ThemeDistributionCard({
  channels,
  isLoading,
}: ThemeDistributionCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Distribuição por Tema</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[500px] w-full" />
          <div className="mt-4 grid grid-cols-2 gap-3 border-t pt-4 md:grid-cols-3 lg:grid-cols-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (channels.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Distribuição por Tema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[500px] items-center justify-center">
            <p className="text-sm text-muted-foreground">
              Nenhum canal cadastrado
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Count channels by theme
  const themeCount = channels.reduce(
    (acc, channel) => {
      const theme = channel.theme
      acc[theme] = (acc[theme] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  // Convert to array and sort by count
  const sortedThemes = Object.entries(themeCount)
    .map(([theme, count]) => ({
      name: THEME_LABELS[theme] || theme,
      value: count,
      theme,
    }))
    .sort((a, b) => b.value - a.value)

  // Keep top 10 and group rest as "Outros"
  const top10 = sortedThemes.slice(0, 10)
  const rest = sortedThemes.slice(10)

  // Assign colors to each theme
  const chartData = top10.map((item, index) => ({
    ...item,
    color: getThemeColor(item.theme, index),
  }))

  if (rest.length > 0) {
    const othersCount = rest.reduce((acc, item) => acc + item.value, 0)
    chartData.push({
      name: 'Outros',
      value: othersCount,
      theme: 'outros',
      color: THEME_COLORS.outros,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribuição por Tema</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={500}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={true}
              label={({ name, percent }) =>
                percent > 0.05 ? `${name} (${(percent * 100).toFixed(0)}%)` : ''
              }
              outerRadius={140}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry) => (
                <Cell
                  key={`cell-${entry.theme}`}
                  fill={entry.color}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => [
                `${value} ${value === 1 ? 'canal' : 'canais'}`,
                'Total',
              ]}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Summary stats */}
        <div className="mt-4 grid grid-cols-2 gap-3 border-t pt-4 md:grid-cols-3 lg:grid-cols-4">
          {chartData.map((item) => (
            <div key={item.theme} className="flex items-center gap-2">
              <div
                className="h-3 w-3 flex-shrink-0 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground">
                  {item.value} {item.value === 1 ? 'canal' : 'canais'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
