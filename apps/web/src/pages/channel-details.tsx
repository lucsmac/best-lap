import { useState } from 'react'
import { useParams, Link } from '@tanstack/react-router'
import { ChevronLeft } from 'lucide-react'
import { AppShell } from '@/components/layout/app-shell'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { ChannelInfoTab } from '@/components/channels/channel-info-tab'
import { ChannelPagesTab } from '@/components/channels/channel-pages-tab'
import { ChannelDialog } from '@/components/channels/channel-dialog'
import { useChannel } from '@/hooks/use-channels'
import { TriggerCollectionDialog } from '@/components/trigger-collection-dialog'
import { useTriggerCollectionChannel } from '@/hooks/use-metrics'

export function ChannelDetailsPage() {
  const { channelId } = useParams({ strict: false })
  const [dialogOpen, setDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('info')

  const { data: channel, isLoading, isError } = useChannel(channelId)
  const { mutate: triggerCollectionChannel, isPending: isCollecting } =
    useTriggerCollectionChannel()

  if (isLoading) {
    return (
      <AppShell title="Carregando..." description="Aguarde">
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </AppShell>
    )
  }

  if (isError || !channel) {
    return (
      <AppShell title="Erro" description="Canal não encontrado">
        <div className="flex h-[400px] flex-col items-center justify-center gap-4">
          <p className="text-destructive">
            Não foi possível carregar as informações do canal.
          </p>
          <Button asChild>
            <Link to="/channels">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Voltar para Canais
            </Link>
          </Button>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell
      title={channel.name}
      description={channel.domain}
      breadcrumbs={[
        { label: 'Canais', href: '/channels' },
        { label: channel.name },
      ]}
      action={
        <div className="flex gap-2">
          <TriggerCollectionDialog
            scope="channel"
            channelName={channel.name}
            pagesCount={channel.pages?.length || 0}
            onConfirm={() => triggerCollectionChannel(channel.id)}
            isPending={isCollecting}
          />
          <Button asChild variant="outline">
            <Link to="/channels">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Voltar
            </Link>
          </Button>
        </div>
      }
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-[400px] grid-cols-2">
          <TabsTrigger value="info">Informações</TabsTrigger>
          <TabsTrigger value="pages">Páginas</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-6">
          <ChannelInfoTab
            channel={channel}
            onEdit={() => setDialogOpen(true)}
          />
        </TabsContent>

        <TabsContent value="pages" className="mt-6">
          <ChannelPagesTab channel={channel} />
        </TabsContent>
      </Tabs>

      <ChannelDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        channel={channel}
      />
    </AppShell>
  )
}
