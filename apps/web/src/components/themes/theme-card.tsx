import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

interface ThemeCardProps {
  theme: string
  value: number
  label: string
  channelCount: number
  isLoading?: boolean
  onClick?: () => void
}

function getScoreColor(score: number, isScore: boolean): string {
  if (!isScore) return 'text-foreground'
  if (score >= 90) return 'text-green-600'
  if (score >= 70) return 'text-yellow-600'
  return 'text-red-600'
}

function getScoreStatus(score: number, isScore: boolean): string {
  if (!isScore) return ''
  if (score >= 90) return 'Excelente'
  if (score >= 70) return 'Bom'
  if (score >= 50) return 'Regular'
  return 'Crítico'
}

export function ThemeCard({
  theme,
  value,
  label,
  channelCount,
  isLoading,
  onClick,
}: ThemeCardProps) {
  if (isLoading) {
    return (
      <Card className="cursor-pointer transition-all hover:shadow-sm">
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex-1">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="mt-1 h-3 w-16" />
          </div>
          <Skeleton className="h-6 w-12" />
        </CardContent>
      </Card>
    )
  }

  const isScore = label.includes('Score')
  const scoreColor = getScoreColor(value, isScore)
  const scoreStatus = getScoreStatus(value, isScore)

  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-sm"
      onClick={onClick}
    >
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium capitalize">{theme}</span>
            {scoreStatus && (
              <Badge variant="secondary" className="text-xs">
                {scoreStatus}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {channelCount} {channelCount === 1 ? 'canal' : 'canais'}
          </p>
        </div>
        <div className={`text-2xl font-bold ${scoreColor}`}>
          {value.toFixed(label.includes('Time') ? 0 : 1)}
          {label.includes('Time') && <span className="text-sm">ms</span>}
        </div>
      </CardContent>
    </Card>
  )
}
