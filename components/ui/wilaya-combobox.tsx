'use client'

import { useState, useCallback } from 'react'
import { MapPin, ChevronsUpDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandItem,
} from '@/components/ui/command'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover'
import type { Wilaya } from '@/app/data/wilayas'

interface WilayaComboboxProps {
  wilayas: Wilaya[]
  value: Wilaya | null
  onChange: (wilaya: Wilaya | null) => void
  counts: Record<number, number>
  placeholder?: string
  className?: string
  align?: 'start' | 'center' | 'end'
  side?: 'top' | 'bottom' | 'left' | 'right'
}

export function WilayaCombobox({
  wilayas,
  value,
  onChange,
  counts,
  placeholder = 'ابحث عن ولايتك...',
  className,
  align = 'start',
  side = 'bottom',
}: WilayaComboboxProps) {
  const [open, setOpen] = useState(false)

  const handleSelect = useCallback(
    (wilaya: Wilaya) => {
      onChange(wilaya)
      setOpen(false)
    },
    [onChange],
  )

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onChange(null)
    },
    [onChange],
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          'relative flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-input bg-background px-3 text-start text-sm font-medium shadow-xs/5 outline-none ring-ring/24 transition-shadow hover:bg-muted/30 focus-visible:border-ring focus-visible:ring-[3px] data-disabled:pointer-events-none data-disabled:opacity-64 sm:h-11',
          !value && 'text-muted-foreground',
          className,
        )}
        role="combobox"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <MapPin className="size-4 shrink-0 text-primary/80" />
          <span className="truncate">
            {value ? value.name : placeholder}
          </span>
        </div>
        <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent
        className="p-0"
        align={align}
        side={side}
        sideOffset={4}
      >
        <Command>
          <CommandInput placeholder={placeholder} />
          <CommandList>
            <CommandEmpty>لا توجد نتائج</CommandEmpty>
            {wilayas.map((w) => (
              <CommandItem
                key={w.id}
                onClick={() => handleSelect(w)}
                className="flex items-center gap-2"
              >
                <Check
                  className={cn(
                    'size-4 shrink-0',
                    value?.id === w.id ? 'opacity-100' : 'opacity-0',
                  )}
                />
                <span className="flex-1">{w.name}</span>
                {counts[w.id] > 0 && (
                  <span className="text-xs text-muted-foreground/70">
                    {counts[w.id]}
                  </span>
                )}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
