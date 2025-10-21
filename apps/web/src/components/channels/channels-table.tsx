import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Channel } from '@/types/api'
import { MoreHorizontal, Eye, Pencil, Trash2, Power } from 'lucide-react'
import { useDeleteChannel, useEnableChannel, useDisableChannel } from '@/hooks/use-channels'
import { useToast } from '@/hooks/use-toast'

interface ChannelsTableProps {
  data: Channel[]
  onEdit: (channel: Channel) => void
}

export function ChannelsTable({ data, onEdit }: ChannelsTableProps) {
  const [globalFilter, setGlobalFilter] = useState('')
  const { toast } = useToast()
  const deleteChannel = useDeleteChannel()
  const enableChannel = useEnableChannel()
  const disableChannel = useDisableChannel()

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja deletar este canal?')) {
      try {
        await deleteChannel.mutateAsync(id)
        toast({
          title: 'Canal deletado',
          description: 'Canal deletado com sucesso.',
        })
      } catch (error) {
        toast({
          title: 'Erro',
          description: 'Ocorreu um erro ao deletar o canal.',
          variant: 'destructive',
        })
      }
    }
  }

  const handleToggleActive = async (channel: Channel) => {
    try {
      if (channel.active) {
        await disableChannel.mutateAsync(channel.id)
        toast({
          title: 'Canal desativado',
          description: `Canal ${channel.name} foi desativado.`,
        })
      } else {
        await enableChannel.mutateAsync(channel.id)
        toast({
          title: 'Canal ativado',
          description: `Canal ${channel.name} foi ativado.`,
        })
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao alterar o status do canal.',
        variant: 'destructive',
      })
    }
  }

  const columns: ColumnDef<Channel>[] = [
    {
      accessorKey: 'name',
      header: 'Nome',
    },
    {
      accessorKey: 'domain',
      header: 'Domínio',
    },
    {
      accessorKey: 'theme',
      header: 'Tema',
    },
    {
      accessorKey: 'active',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.active ? 'default' : 'secondary'}>
          {row.original.active ? 'Ativo' : 'Inativo'}
        </Badge>
      ),
    },
    {
      accessorKey: 'is_reference',
      header: 'Referência',
      cell: ({ row }) =>
        row.original.is_reference ? (
          <Badge variant="outline">Sim</Badge>
        ) : null,
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const channel = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Ações</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link
                  to="/channels/$channelId"
                  params={{ channelId: channel.id }}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Ver detalhes
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(channel)}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleToggleActive(channel)}>
                <Power className="mr-2 h-4 w-4" />
                {channel.active ? 'Desativar' : 'Ativar'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDelete(channel.id)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Deletar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  })

  return (
    <div className="space-y-4">
      <Input
        placeholder="Buscar canais..."
        value={globalFilter}
        onChange={(e) => setGlobalFilter(e.target.value)}
        className="max-w-sm"
      />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Nenhum resultado encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Próxima
        </Button>
      </div>
    </div>
  )
}
