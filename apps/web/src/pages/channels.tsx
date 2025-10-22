import { useState, useMemo } from 'react'
import { Plus } from 'lucide-react'
import { AppShell } from '@/components/layout/app-shell'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ChannelsTable } from '@/components/channels/channels-table'
import { ChannelDialog } from '@/components/channels/channel-dialog'
import {
  ChannelsFilters,
  type ChannelsFiltersState,
} from '@/components/channels/channels-filters'
import { BulkActionsToolbar } from '@/components/channels/bulk-actions-toolbar'
import { useChannels } from '@/hooks/use-channels'
import type { Channel } from '@/types/api'

export function ChannelsPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [filters, setFilters] = useState<ChannelsFiltersState>({
    search: '',
    theme: 'all',
    status: 'all',
    isReference: 'all',
  })

  const { data, isLoading, isError } = useChannels()

  // Extract unique themes from channels
  const availableThemes = useMemo(() => {
    if (!data) return []
    const themes = new Set(data.map((channel) => channel.theme))
    return Array.from(themes).sort()
  }, [data])

  // Apply filters to channels
  const filteredChannels = useMemo(() => {
    if (!data) return []

    return data.filter((channel) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const matchesSearch =
          channel.name.toLowerCase().includes(searchLower) ||
          channel.domain.toLowerCase().includes(searchLower)
        if (!matchesSearch) return false
      }

      // Theme filter
      if (filters.theme !== 'all' && channel.theme !== filters.theme) {
        return false
      }

      // Status filter
      if (filters.status !== 'all') {
        const isActive = filters.status === 'active'
        if (channel.active !== isActive) return false
      }

      // Is reference filter
      if (filters.isReference !== 'all') {
        const isReference = filters.isReference === 'true'
        if (channel.is_reference !== isReference) return false
      }

      return true
    })
  }, [data, filters])

  const handleEdit = (channel: Channel) => {
    setSelectedChannel(channel)
    setDialogOpen(true)
  }

  const handleCreate = () => {
    setSelectedChannel(null)
    setDialogOpen(true)
  }

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open)
    if (!open) {
      setSelectedChannel(null)
    }
  }

  if (isError) {
    return (
      <AppShell title="Canais" description="Gerencie seus canais">
        <div className="flex h-[400px] items-center justify-center">
          <p className="text-destructive">
            Erro ao carregar os canais. Tente novamente mais tarde.
          </p>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell
      title="Canais"
      description="Gerencie seus canais de monitoramento"
      breadcrumbs={[{ label: 'Canais' }]}
      action={
        <Button onClick={handleCreate} disabled={isLoading}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Canal
        </Button>
      }
    >
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-[400px] w-full" />
          </div>
        ) : (
          <>
            <ChannelsFilters
              filters={filters}
              onFiltersChange={setFilters}
              availableThemes={availableThemes}
            />

            {selectedIds.length > 0 && (
              <BulkActionsToolbar
                selectedIds={selectedIds}
                onClearSelection={() => setSelectedIds([])}
              />
            )}

            <ChannelsTable
              data={filteredChannels}
              onEdit={handleEdit}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
            />

            {filteredChannels.length === 0 && !isLoading && (
              <div className="flex h-[200px] items-center justify-center rounded-lg border border-dashed">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Nenhum canal encontrado.
                  </p>
                  {filters.search ||
                  filters.theme !== 'all' ||
                  filters.status !== 'all' ||
                  filters.isReference !== 'all' ? (
                    <p className="mt-1 text-sm text-muted-foreground">
                      Tente ajustar os filtros.
                    </p>
                  ) : (
                    <Button
                      variant="link"
                      onClick={handleCreate}
                      className="mt-2"
                    >
                      Criar seu primeiro canal
                    </Button>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <ChannelDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        channel={selectedChannel}
      />
    </AppShell>
  )
}
