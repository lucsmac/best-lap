import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import type { Provider } from '@/types/api'

export interface ChannelsFiltersState {
  search: string
  theme: string
  status: string
  isReference: string
  provider: string
}

interface ChannelsFiltersProps {
  filters: ChannelsFiltersState
  onFiltersChange: (filters: ChannelsFiltersState) => void
  availableThemes: string[]
  availableProviders: Provider[]
}

export function ChannelsFilters({
  filters,
  onFiltersChange,
  availableThemes,
  availableProviders,
}: ChannelsFiltersProps) {
  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value })
  }

  const handleThemeChange = (value: string) => {
    onFiltersChange({ ...filters, theme: value })
  }

  const handleStatusChange = (value: string) => {
    onFiltersChange({ ...filters, status: value })
  }

  const handleIsReferenceChange = (value: string) => {
    onFiltersChange({ ...filters, isReference: value })
  }

  const handleProviderChange = (value: string) => {
    onFiltersChange({ ...filters, provider: value })
  }

  const handleClearFilters = () => {
    onFiltersChange({
      search: '',
      theme: 'all',
      status: 'all',
      isReference: 'all',
      provider: 'all',
    })
  }

  const hasActiveFilters =
    filters.search ||
    filters.theme !== 'all' ||
    filters.status !== 'all' ||
    filters.isReference !== 'all' ||
    filters.provider !== 'all'

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou domínio..."
          value={filters.search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Select value={filters.theme} onValueChange={handleThemeChange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Tema" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os temas</SelectItem>
            {availableThemes.map((theme) => (
              <SelectItem key={theme} value={theme}>
                {theme}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Ativos</SelectItem>
            <SelectItem value="inactive">Inativos</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.isReference}
          onValueChange={handleIsReferenceChange}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Referência" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="true">Referência</SelectItem>
            <SelectItem value="false">Não referência</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.provider} onValueChange={handleProviderChange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Provedor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os provedores</SelectItem>
            <SelectItem value="none">Sem provedor</SelectItem>
            {availableProviders.map((provider) => (
              <SelectItem key={provider.id} value={provider.id}>
                {provider.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={handleClearFilters}>
            Limpar filtros
          </Button>
        )}
      </div>
    </div>
  )
}
