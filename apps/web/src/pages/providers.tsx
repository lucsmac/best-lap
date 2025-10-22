import { useState } from 'react'
import { Plus } from 'lucide-react'
import { AppShell } from '@/components/layout/app-shell'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ProvidersTable } from '@/components/providers/providers-table'
import { ProviderDialog } from '@/components/providers/provider-dialog'
import { useProviders } from '@/hooks/use-providers'
import type { Provider } from '@/types/api'

export function ProvidersPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null)

  const { data, isLoading, isError } = useProviders()

  const handleEdit = (provider: Provider) => {
    setSelectedProvider(provider)
    setDialogOpen(true)
  }

  const handleCreate = () => {
    setSelectedProvider(null)
    setDialogOpen(true)
  }

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open)
    if (!open) {
      setSelectedProvider(null)
    }
  }

  if (isError) {
    return (
      <AppShell title="Providers" description="Gerencie seus providers">
        <div className="flex h-[400px] items-center justify-center">
          <p className="text-destructive">
            Erro ao carregar os providers. Tente novamente mais tarde.
          </p>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell
      title="Providers"
      description="Gerencie os provedores de tecnologia dos sites"
      breadcrumbs={[{ label: 'Providers' }]}
      action={
        <Button onClick={handleCreate} disabled={isLoading}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Provider
        </Button>
      }
    >
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-[400px] w-full" />
          </div>
        ) : (
          <>
            <ProvidersTable
              data={data || []}
              onEdit={handleEdit}
            />

            {data?.length === 0 && !isLoading && (
              <div className="flex h-[200px] items-center justify-center rounded-lg border border-dashed">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Nenhum provider encontrado.
                  </p>
                  <Button
                    variant="link"
                    onClick={handleCreate}
                    className="mt-2"
                  >
                    Criar seu primeiro provider
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <ProviderDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        provider={selectedProvider}
      />
    </AppShell>
  )
}
