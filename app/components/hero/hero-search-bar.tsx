'use client'

import { MapPin, Building2, Search, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Combobox,
  ComboboxInput,
  ComboboxPopup,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from '@/components/ui/combobox'
import { Select, SelectTrigger, SelectValue, SelectPopup, SelectItem } from '@/components/ui/select'
import { propertyTypes, type PropertyType } from '@/app/data/property-types'
import { useHero } from './hero-context'
import type { Wilaya } from '@/app/data/wilayas'

interface HeroSearchBarProps {
  onSearch: () => void
}

export function HeroSearchBar({ onSearch }: HeroSearchBarProps) {
  const {
    selectedWilaya,
    setSelectedWilaya,
    selectedType,
    setSelectedType,
    wilayaQuery,
    setWilayaQuery,
    filteredWilayas,
    wilayaCounts,
    typeCounts,
    isDrawerOpen,
    hasActiveFilters,
  } = useHero()

  return (
    <div className="rounded-3xl lg:rounded-full bg-linear-to-b from-border/40 via-border/10 to-transparent p-px shadow-2xl shadow-primary/5 transition-shadow duration-500 has-[input:focus-visible,button:focus-visible]:shadow-primary/10">
      <div className="bg-background/60 backdrop-blur-2xl rounded-[calc(var(--radius-3xl)-1px)] lg:rounded-[calc(theme(borderRadius.full)-1px)] p-2 sm:p-3">
        <div className="flex flex-col lg:flex-row items-center gap-2 lg:gap-0 divide-y lg:divide-y-0 lg:divide-x lg:divide-x-reverse divide-border/40">
          <div className="w-full flex-1 px-1 lg:px-4 py-2 pt-3 lg:pt-2 **:data-[slot=input-control]:border-none border-t-0! **:data-[slot=input-control]:bg-transparent **:data-[slot=input-control]:shadow-none **:data-[slot=input-control]:ring-0 [&_[data-slot=input-control]_before]:hidden [&_input]:text-base [&_input]:font-medium">
            <Combobox<Wilaya>
              value={selectedWilaya}
              onValueChange={(v) => {
                setSelectedWilaya(v)
                setWilayaQuery(v ? v.name : '')
              }}
              inputValue={wilayaQuery}
              onInputValueChange={setWilayaQuery}
              itemToStringLabel={(w) => w?.name ?? ''}
            >
              <ComboboxInput
                startAddon={<MapPin className="size-5 text-primary/80" />}
                placeholder="ابحث عن ولايتك..."
                size="lg"
                className="text-base font-medium px-2"
              />
              <ComboboxPopup>
                <ComboboxList>
                  {filteredWilayas.length === 0 && (
                    <ComboboxEmpty>لا توجد نتائج</ComboboxEmpty>
                  )}
                  {filteredWilayas.map((w) => (
                    <ComboboxItem key={w.id} value={w}>
                      <span className="flex-1">{w.name}</span>
                      <span className="text-xs text-muted-foreground/70 ms-2">
                        {wilayaCounts[w.id] || 0}
                      </span>
                    </ComboboxItem>
                  ))}
                </ComboboxList>
              </ComboboxPopup>
            </Combobox>
          </div>

          <div className="w-full flex-1 px-1 lg:px-4 py-2 pt-3 lg:pt-2">
            <Select<PropertyType>
              value={selectedType}
              onValueChange={setSelectedType}
              itemToStringLabel={(pt) => pt?.name ?? ''}
            >
              <SelectTrigger size="lg" className="w-full gap-3 text-base font-medium border-0 bg-transparent shadow-none hover:bg-transparent focus-visible:ring-0 px-2 outline-none">
                <Building2 className="size-5 shrink-0 text-primary/80" />
                <SelectValue placeholder="نوع العقار" />
              </SelectTrigger>
              <SelectPopup>
                {propertyTypes.map((pt) => (
                  <SelectItem key={pt.id} value={pt}>
                    <span className="flex-1">{pt.name}</span>
                    <span className="text-xs text-muted-foreground/70 ms-2">
                      {typeCounts[pt.id] || 0}
                    </span>
                  </SelectItem>
                ))}
              </SelectPopup>
            </Select>
          </div>

          <div className="w-full lg:w-auto p-1 pt-3 lg:pt-1 flex gap-2">
            <button
              onClick={() => {
                if (!isDrawerOpen) {
                  onSearch()
                }
              }}
              className={`h-12 lg:h-14 px-3 rounded-2xl lg:rounded-full border transition-all duration-300 flex items-center justify-center ${isDrawerOpen || hasActiveFilters
                  ? 'bg-primary/10 border-primary/30 text-primary'
                  : 'bg-muted/50 border-border/40 text-muted-foreground hover:bg-muted'
                }`}
              aria-label="فلاتر متقدمة"
            >
              <SlidersHorizontal className="size-5" />
            </button>
            <Button
              size="lg"
              className="flex-1 lg:flex-none h-12 lg:h-14 lg:px-10 text-base font-bold rounded-2xl lg:rounded-full shadow-lg transition-all duration-300 active:scale-[0.98] hover:shadow-primary/20 hover:bg-primary/95"
              onClick={onSearch}
            >
              <Search className="size-5 ms-1" />
              بحث
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
