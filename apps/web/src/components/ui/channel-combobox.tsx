import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface Channel {
  id: string
  name: string
}

interface ChannelComboboxProps {
  channels: Channel[]
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  emptyText?: string
  disabled?: boolean
  className?: string
}

export function ChannelCombobox({
  channels,
  value,
  onValueChange,
  placeholder = "Selecione um canal",
  emptyText = "Nenhum canal encontrado",
  disabled = false,
  className,
}: ChannelComboboxProps) {
  const [open, setOpen] = React.useState(false)

  const selectedChannel = channels.find((channel) => channel.id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          disabled={disabled}
        >
          <span className="truncate">
            {selectedChannel ? selectedChannel.name : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar canal..." />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {channels.map((channel) => (
                <CommandItem
                  key={channel.id}
                  value={channel.name}
                  onSelect={() => {
                    onValueChange(channel.id === value ? "" : channel.id)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === channel.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="truncate">{channel.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
