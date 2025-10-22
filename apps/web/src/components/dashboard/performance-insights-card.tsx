import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import type { Channel } from '@/types/api'
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Link } from '@tanstack/react-router'

interface PerformanceInsightsCardProps {
  channels: Channel[]
  isLoading?: boolean
}

export function PerformanceInsightsCard({
  channels,
  isLoading,
}: PerformanceInsightsCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Insights Rápidos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (channels.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Insights Rápidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[200px] items-center justify-center">
            <p className="text-sm text-muted-foreground">
              Nenhum canal para análise
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const activeChannels = channels.filter((c) => c.active)
  const inactiveChannels = channels.filter((c) => !c.active)
  const referenceChannels = channels.filter((c) => c.is_reference)

  // Calculate pages stats
  const totalPages = channels.reduce(
    (acc, channel) => acc + (channel.pages?.length || 0),
    0
  )
  const channelsWithNoPages = channels.filter(
    (c) => c.active && (!c.pages || c.pages.length === 0)
  )

  // Get themes distribution
  const themes = Array.from(new Set(channels.map((c) => c.theme)))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Insights Rápidos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Active Channels */}
        <div className="flex items-start gap-3 rounded-lg border p-3">
          <div className="rounded-full bg-green-100 p-2 dark:bg-green-900">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-300" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="font-medium">Canais Ativos</p>
              <Badge variant="default">{activeChannels.length}</Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {referenceChannels.length} {referenceChannels.length === 1 ? 'é' : 'são'} canal
              {referenceChannels.length !== 1 ? 'is' : ''} de referência
            </p>
          </div>
        </div>

        {/* Pages Monitoring */}
        <div className="flex items-start gap-3 rounded-lg border p-3">
          <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900">
            <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-300" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="font-medium">Monitoramento de Páginas</p>
              <Badge variant="secondary">{totalPages}</Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Total de páginas sendo monitoradas
            </p>
          </div>
        </div>

        {/* Themes Diversity */}
        <div className="flex items-start gap-3 rounded-lg border p-3">
          <div className="rounded-full bg-purple-100 p-2 dark:bg-purple-900">
            <TrendingDown className="h-4 w-4 text-purple-600 dark:text-purple-300" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="font-medium">Diversidade de Temas</p>
              <Badge variant="secondary">{themes.length}</Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {themes.join(', ')}
            </p>
          </div>
        </div>

        {/* Warnings */}
        {(inactiveChannels.length > 0 || channelsWithNoPages.length > 0) && (
          <div className="flex items-start gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-950">
            <div className="rounded-full bg-yellow-100 p-2 dark:bg-yellow-900">
              <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-300" />
            </div>
            <div className="flex-1">
              <p className="font-medium">Atenção Necessária</p>
              <ul className="mt-1 space-y-1 text-sm text-muted-foreground">
                {inactiveChannels.length > 0 && (
                  <li>
                    • {inactiveChannels.length} canal
                    {inactiveChannels.length !== 1 ? 'is' : ''} inativo
                    {inactiveChannels.length !== 1 ? 's' : ''}
                  </li>
                )}
                {channelsWithNoPages.length > 0 && (
                  <li>
                    • {channelsWithNoPages.length} canal
                    {channelsWithNoPages.length !== 1 ? 'is' : ''} ativo
                    {channelsWithNoPages.length !== 1 ? 's' : ''} sem páginas
                  </li>
                )}
              </ul>
            </div>
          </div>
        )}

        {/* Quick Action */}
        <div className="pt-2">
          <Link
            to="/channels"
            className="block w-full rounded-md bg-primary px-4 py-2 text-center text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Gerenciar Canais
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
