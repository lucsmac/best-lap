import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Activity } from 'lucide-react'
import { type ReactNode } from 'react'

type CollectionScope = 'all' | 'channel' | 'page'

interface TriggerCollectionDialogProps {
  scope: CollectionScope
  channelName?: string
  pageName?: string
  channelsCount?: number
  pagesCount?: number
  onConfirm: () => void
  isPending: boolean
  children?: ReactNode
}

export function TriggerCollectionDialog({
  scope,
  channelName,
  pageName,
  channelsCount,
  pagesCount,
  onConfirm,
  isPending,
  children,
}: TriggerCollectionDialogProps) {
  const getTitle = () => {
    switch (scope) {
      case 'all':
        return 'Coletar Performance de Todos os Canais'
      case 'channel':
        return `Coletar Performance do Canal${channelName ? `: ${channelName}` : ''}`
      case 'page':
        return `Coletar Performance da Página${pageName ? `: ${pageName}` : ''}`
    }
  }

  const getDescription = () => {
    switch (scope) {
      case 'all':
        return `Isto irá enfileirar ${channelsCount || '?'} jobs para coletar métricas de performance de todos os canais ativos. A coleta é assíncrona e pode levar alguns minutos para ser processada.`
      case 'channel':
        return `Isto irá enfileirar ${pagesCount || '?'} jobs para coletar métricas de performance de todas as páginas deste canal. A coleta é assíncrona e pode levar alguns minutos para ser processada.`
      case 'page':
        return 'Isto irá enfileirar 1 job para coletar métricas de performance desta página. A coleta é assíncrona e pode levar alguns minutos para ser processada.'
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {children || (
          <Button variant="default" size="sm" disabled={isPending} className="bg-blue-600 hover:bg-blue-700">
            <Activity className="mr-2 h-4 w-4" />
            Coletar Performance
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{getTitle()}</AlertDialogTitle>
          <AlertDialogDescription>{getDescription()}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isPending}>
            {isPending ? 'Enfileirando...' : 'Confirmar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
