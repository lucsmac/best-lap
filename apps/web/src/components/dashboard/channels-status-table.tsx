import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { Channel } from '@/types/api'
import { ExternalLink } from 'lucide-react'
import { Link } from '@tanstack/react-router'

interface ChannelsStatusTableProps {
  channels: Channel[]
  isLoading?: boolean
  limit?: number
}

function getStatusBadge(active: boolean) {
  if (active) {
    return <Badge variant="default">Ativo</Badge>
  }
  return <Badge variant="secondary">Inativo</Badge>
}

function getThemeBadge(theme: string) {
  const themeColors: Record<string, string> = {
    automotive: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    technology:
      'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    healthcare:
      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    finance:
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    retail: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
  }

  const colorClass = themeColors[theme] || 'bg-gray-100 text-gray-800'

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClass}`}
    >
      {theme}
    </span>
  )
}

function getDomainDisplay(domain: string): string {
  try {
    const url = new URL(domain)
    return url.hostname
  } catch {
    // If domain is not a valid URL, try to extract hostname from string
    // Remove protocol if present
    const withoutProtocol = domain.replace(/^(https?:\/\/)/, '')
    // Remove path if present
    const hostname = withoutProtocol.split('/')[0]
    return hostname
  }
}

export function ChannelsStatusTable({
  channels,
  isLoading,
  limit = 5,
}: ChannelsStatusTableProps) {
  const displayedChannels = limit ? channels.slice(0, limit) : channels
  const hasMore = channels.length > limit
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Status dos Canais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (channels.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Status dos Canais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[200px] items-center justify-center">
            <p className="text-sm text-muted-foreground">
              Nenhum canal cadastrado ainda
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Status dos Canais</CardTitle>
        {hasMore && (
          <Link
            to="/channels"
            className="text-sm text-primary hover:underline"
          >
            Ver todos ({channels.length})
          </Link>
        )}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Tema</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Páginas</TableHead>
              <TableHead>Referência</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedChannels.map((channel) => (
              <TableRow key={channel.id}>
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span>{channel.name}</span>
                    <a
                      href={channel.domain}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                    >
                      {getDomainDisplay(channel.domain)}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </TableCell>
                <TableCell>{getThemeBadge(channel.theme)}</TableCell>
                <TableCell>{getStatusBadge(channel.active)}</TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {channel.pages?.length || 0} página(s)
                  </span>
                </TableCell>
                <TableCell>
                  {channel.is_reference ? (
                    <Badge variant="outline">Referência</Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Link
                    to="/channels/$channelId"
                    params={{ channelId: channel.id }}
                    className="text-sm text-primary hover:underline"
                  >
                    Ver detalhes
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
