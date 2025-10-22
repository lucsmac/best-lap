import { useState } from 'react'
import { Plus, Pencil, Trash2, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { PageDialog } from './page-dialog'
import { usePages, useDeletePage } from '@/hooks/use-pages'
import { useToast } from '@/hooks/use-toast'
import type { Page, Channel } from '@/types/api'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface ChannelPagesTabProps {
  channel: Channel
}

export function ChannelPagesTab({ channel }: ChannelPagesTabProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedPage, setSelectedPage] = useState<Page | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [pageToDelete, setPageToDelete] = useState<Page | null>(null)

  const { toast } = useToast()
  const { data: pages, isLoading } = usePages(channel.id)
  const deletePage = useDeletePage()

  const handleCreate = () => {
    setSelectedPage(null)
    setDialogOpen(true)
  }

  const handleEdit = (page: Page) => {
    setSelectedPage(page)
    setDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!pageToDelete) return

    try {
      await deletePage.mutateAsync({
        channelId: channel.id,
        pageId: pageToDelete.id,
      })
      toast({
        title: 'Página deletada',
        description: 'A página foi deletada com sucesso.',
      })
      setDeleteDialogOpen(false)
      setPageToDelete(null)
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao deletar a página.',
        variant: 'destructive',
      })
    }
  }

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open)
    if (!open) {
      setSelectedPage(null)
    }
  }

  const getFullUrl = (path: string) => {
    const domain = channel.domain.endsWith('/')
      ? channel.domain.slice(0, -1)
      : channel.domain
    const cleanPath = path.startsWith('/') ? path : `/${path}`
    return `${domain}${cleanPath}`
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Páginas do Canal</h3>
            <p className="text-sm text-muted-foreground">
              Gerencie as páginas que serão monitoradas neste canal.
            </p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Página
          </Button>
        </div>

        {!pages || pages.length === 0 ? (
          <Card>
            <CardContent className="flex h-[200px] items-center justify-center">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Nenhuma página cadastrada ainda.
                </p>
                <Button
                  variant="link"
                  onClick={handleCreate}
                  className="mt-2"
                >
                  Criar sua primeira página
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>
                {pages.length} página{pages.length !== 1 ? 's' : ''}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Caminho</TableHead>
                    <TableHead>URL Completa</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pages.map((page) => (
                    <TableRow key={page.id}>
                      <TableCell className="font-medium">{page.name}</TableCell>
                      <TableCell>
                        <code className="rounded bg-muted px-2 py-1 text-sm">
                          {page.path}
                        </code>
                      </TableCell>
                      <TableCell>
                        <a
                          href={getFullUrl(page.path)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                          <span className="max-w-[200px] truncate">
                            {getFullUrl(page.path)}
                          </span>
                          <ExternalLink className="h-3 w-3 flex-shrink-0" />
                        </a>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {page.created_at && !isNaN(new Date(page.created_at).getTime())
                          ? format(new Date(page.created_at), 'dd/MM/yyyy', {
                              locale: ptBR,
                            })
                          : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(page)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setPageToDelete(page)
                              setDeleteDialogOpen(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

      <PageDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        channelId={channel.id}
        page={selectedPage}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso irá deletar permanentemente
              a página <strong>{pageToDelete?.name}</strong> e todas as métricas
              associadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
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
