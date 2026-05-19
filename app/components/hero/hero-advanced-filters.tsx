'use client'

import { Bed, X } from 'lucide-react'
import { useHero } from './hero-context'

export function HeroAdvancedFilters() {
  const {
    isDrawerOpen,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    minBedrooms,
    setMinBedrooms,
    hasActiveFilters,
    clearFilters,
  } = useHero()

  return (
    <div className={`overflow-hidden transition-all duration-400 ease-out ${isDrawerOpen ? 'max-h-40 mt-3 opacity-100' : 'max-h-0 mt-0 opacity-0'}`}>
      <div className="rounded-2xl bg-background/60 backdrop-blur-2xl border border-border/30 p-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center gap-2 flex-1 w-full">
            <div className="relative flex-1">
              <input
                type="number"
                placeholder="السعر الأدنى"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full h-11 rounded-xl bg-background/80 border border-border/40 px-3 text-sm font-medium placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
              />
            </div>
            <span className="text-muted-foreground/60 text-sm">—</span>
            <div className="relative flex-1">
              <input
                type="number"
                placeholder="السعر الأقصى"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full h-11 rounded-xl bg-background/80 border border-border/40 px-3 text-sm font-medium placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative">
              <Bed className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60 pointer-events-none" />
              <select
                value={minBedrooms}
                onChange={(e) => setMinBedrooms(e.target.value)}
                className="h-11 rounded-xl bg-background/80 border border-border/40 ps-9 pe-4 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all appearance-none cursor-pointer"
              >
                <option value="">الغرف</option>
                <option value="1">+1</option>
                <option value="2">+2</option>
                <option value="3">+3</option>
                <option value="4">+4</option>
                <option value="5">+5</option>
              </select>
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="h-11 px-3 rounded-xl bg-destructive/10 text-destructive text-sm font-medium hover:bg-destructive/20 transition-colors flex items-center gap-1.5 whitespace-nowrap"
              >
                <X className="size-3.5" />
                مسح
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
