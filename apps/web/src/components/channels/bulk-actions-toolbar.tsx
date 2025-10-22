import { useState } from 'react'
import { Trash2, Power, PowerOff } from 'lucide-react'
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
  useDeleteChannel,
  useEnableChannel,
  useDisableChannel,
} from '@/hooks/use-channels'
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
  const { toast } = useToast()

  const deleteChannel = useDeleteChannel()
  const enableChannel = useEnableChannel()
  const disableChannel = useDisableChannel()

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

  if (selectedIds.length === 0) {
    return null
  }

  const isLoading =
    deleteChannel.isPending ||
    enableChannel.isPending ||
    disableChannel.isPending

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
