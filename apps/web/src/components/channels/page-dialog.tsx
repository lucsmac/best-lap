import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCreatePage, useUpdatePage } from '@/hooks/use-pages'
import { useToast } from '@/hooks/use-toast'
import type { Page } from '@/types/api'

const pageFormSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  path: z.string().min(1, 'Caminho é obrigatório'),
})

type PageFormData = z.infer<typeof pageFormSchema>

interface PageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  channelId: string
  page?: Page | null
}

export function PageDialog({
  open,
  onOpenChange,
  channelId,
  page,
}: PageDialogProps) {
  const { toast } = useToast()
  const createPage = useCreatePage()
  const updatePage = useUpdatePage()

  const isEditing = !!page

  const form = useForm<PageFormData>({
    resolver: zodResolver(pageFormSchema),
    defaultValues: {
      name: '',
      path: '',
    },
  })

  // Reset form when dialog opens/closes or page changes
  useEffect(() => {
    if (open && page) {
      form.reset({
        name: page.name,
        path: page.path,
      })
    } else if (open && !page) {
      form.reset({
        name: '',
        path: '',
      })
    }
  }, [open, page, form])

  const onSubmit = async (data: PageFormData) => {
    try {
      if (isEditing) {
        await updatePage.mutateAsync({
          channelId,
          pageId: page.id,
          data,
        })
        toast({
          title: 'Página atualizada',
          description: 'A página foi atualizada com sucesso.',
        })
      } else {
        await createPage.mutateAsync({
          channelId,
          data,
        })
        toast({
          title: 'Página criada',
          description: 'A página foi criada com sucesso.',
        })
      }
      onOpenChange(false)
      form.reset()
    } catch (error) {
      toast({
        title: 'Erro',
        description:
          error instanceof Error
            ? error.message
            : 'Ocorreu um erro ao salvar a página.',
        variant: 'destructive',
      })
    }
  }

  const isLoading = createPage.isPending || updatePage.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Página' : 'Criar Nova Página'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Atualize as informações da página.'
              : 'Preencha os dados para criar uma nova página.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              placeholder="Ex: Página Inicial"
              {...form.register('name')}
              disabled={isLoading}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="path">Caminho</Label>
            <Input
              id="path"
              placeholder="Ex: / ou /sobre"
              {...form.register('path')}
              disabled={isLoading}
            />
            {form.formState.errors.path && (
              <p className="text-sm text-destructive">
                {form.formState.errors.path.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? 'Salvando...'
                : isEditing
                  ? 'Atualizar'
                  : 'Criar Página'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
