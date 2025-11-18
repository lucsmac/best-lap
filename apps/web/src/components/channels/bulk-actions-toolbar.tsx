import { useState } from 'react'
import { Trash2, Power, PowerOff, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  useDeleteChannel,
  useEnableChannel,
  useDisableChannel,
  useUpdateChannel,
} from '@/hooks/use-channels'
import { useProviders } from '@/hooks/use-providers'
import { useToast } from '@/hooks/use-toast'

interface BulkActionsToolbarProps {
  selectedIds: string[]
  onClearSelection: () => void
}

export function BulkActionsToolbar({
  selectedIds,
  onClearSelection,
}: BulkActionsToolbarProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showProviderDialog, setShowProviderDialog] = useState(false)
  const [selectedProviderId, setSelectedProviderId] = useState<string>('')
  const { toast } = useToast()

  const deleteChannel = useDeleteChannel()
  const enableChannel = useEnableChannel()
  const disableChannel = useDisableChannel()
  const updateChannel = useUpdateChannel()
  const { data: providers = [] } = useProviders()

  const handleEnableAll = async () => {
    try {
      await Promise.all(
        selectedIds.map((id) => enableChannel.mutateAsync(id))
      )
      toast({
        title: 'Canais ativados',
        description: `${selectedIds.length} canal(is) ativado(s) com sucesso.`,
      })
      onClearSelection()
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao ativar os canais.',
        variant: 'destructive',
      })
    }
  }

  const handleDisableAll = async () => {
    try {
      await Promise.all(
        selectedIds.map((id) => disableChannel.mutateAsync(id))
      )
      toast({
        title: 'Canais desativados',
        description: `${selectedIds.length} canal(is) desativado(s) com sucesso.`,
      })
      onClearSelection()
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao desativar os canais.',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteAll = async () => {
    try {
      await Promise.all(
        selectedIds.map((id) => deleteChannel.mutateAsync(id))
      )
      toast({
        title: 'Canais deletados',
        description: `${selectedIds.length} canal(is) deletado(s) com sucesso.`,
      })
      onClearSelection()
      setShowDeleteDialog(false)
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao deletar os canais.',
        variant: 'destructive',
      })
    }
  }

  const handleAssignProvider = async () => {
    if (!selectedProviderId) {
      toast({
        title: 'Erro',
        description: 'Selecione um provedor.',
        variant: 'destructive',
      })
      return
    }

    try {
      await Promise.all(
        selectedIds.map((id) =>
          updateChannel.mutateAsync({
            channelId: id,
            data: {
              provider_id: selectedProviderId === 'none' ? undefined : selectedProviderId,
            },
          })
        )
      )

      const providerName = selectedProviderId === 'none'
        ? 'Nenhum'
        : providers.find(p => p.id === selectedProviderId)?.name || 'provedor'

      toast({
        title: 'Provedor atribuído',
        description: `${selectedIds.length} canal(is) associado(s) ao provedor "${providerName}" com sucesso.`,
      })
      onClearSelection()
      setShowProviderDialog(false)
      setSelectedProviderId('')
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao atribuir o provedor.',
        variant: 'destructive',
      })
    }
  }

  if (selectedIds.length === 0) {
    return null
  }

  const isLoading =
    deleteChannel.isPending ||
    enableChannel.isPending ||
    disableChannel.isPending ||
    updateChannel.isPending

  return (
    <>
      <div className="flex items-center justify-between rounded-lg border bg-muted/50 p-4">
        <p className="text-sm font-medium">
          {selectedIds.length} canal(is) selecionado(s)
        </p>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowProviderDialog(true)}
            disabled={isLoading}
          >
            <Tag className="mr-2 h-4 w-4" />
            Atribuir Provedor
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleEnableAll}
            disabled={isLoading}
          >
            <Power className="mr-2 h-4 w-4" />
            Ativar
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDisableAll}
            disabled={isLoading}
          >
            <PowerOff className="mr-2 h-4 w-4" />
            Desativar
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            disabled={isLoading}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Deletar
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            disabled={isLoading}
          >
            Cancelar
          </Button>
        </div>
      </div>

      <Dialog open={showProviderDialog} onOpenChange={setShowProviderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atribuir Provedor</DialogTitle>
            <DialogDescription>
              Selecione um provedor para atribuir aos {selectedIds.length} canal(is) selecionado(s).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Provedor</label>
              <Select
                value={selectedProviderId}
                onValueChange={setSelectedProviderId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um provedor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum (remover provedor)</SelectItem>
                  {providers.map((provider) => (
                    <SelectItem key={provider.id} value={provider.id}>
                      {provider.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowProviderDialog(false)
                setSelectedProviderId('')
              }}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAssignProvider}
              disabled={isLoading || !selectedProviderId}
            >
              {isLoading ? 'Atribuindo...' : 'Atribuir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso irá deletar permanentemente{' '}
              {selectedIds.length} canal(is) e todas as páginas e métricas
              associadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAll}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
