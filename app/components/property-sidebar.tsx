'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Drawer } from 'vaul'
import { MapPin, Bed, Bath, Square, X, Heart, Phone, Calendar, Shield, Building2, ArrowRight, ChevronDownIcon } from 'lucide-react'
import ImageViewer from '@/components/ui/image-viewer'
import type { Property } from '@/lib/types'
import { propertyTypes } from '@/app/data/property-types'
import { wilayas } from '@/app/data/wilayas'
import { useSession } from '@/lib/auth-client'
import { useMediaQuery } from '@/hooks/use-media-query'
import { WilayaCombobox } from '@/components/ui/wilaya-combobox'
import { useHero } from './hero/hero-context'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/menu'

function PropertyCardSkeleton() {
  return (
    <div className="w-full bg-card rounded-2xl border border-border/40 overflow-hidden animate-pulse">
      <div className="h-44 bg-muted" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-muted rounded w-3/4" />
        <div className="h-3 bg-muted rounded w-1/2" />
        <div className="flex gap-3">
          <div className="h-3 bg-muted rounded w-16" />
          <div className="h-3 bg-muted rounded w-16" />
          <div className="h-3 bg-muted rounded w-16" />
        </div>
        <div className="h-8 bg-muted rounded w-full" />
      </div>
    </div>
  )
}

type SortOption = 'default' | 'price-asc' | 'price-desc'

interface PropertySidebarProps {
  isDrawerOpen: boolean
  onDrawerOpenChange: (open: boolean) => void
  onDetailOpenChange: (open: boolean) => void
  onPropertySelect: (id: number | null) => void
  forceOpenPropertyId?: number | null
  onClearAll: () => void
}

export default function PropertySidebar({
  isDrawerOpen,
  onDrawerOpenChange,
  onDetailOpenChange,
  onPropertySelect,
  forceOpenPropertyId,
  onClearAll,
}: PropertySidebarProps) {
  const {
    properties,
    loading,
    selectedWilaya,
    setSelectedWilaya,
    selectedType,
    setSelectedType,
    setWilayaQuery,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    minBedrooms,
    setMinBedrooms,
    wilayaCounts,
    typeCounts,
    removeFilter,
  } = useHero()

  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)
  const [likedProperties, setLikedProperties] = useState<Set<number>>(new Set())
  const [sortBy] = useState<SortOption>('default')
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const [openNestedPropertyId, setOpenNestedPropertyId] = useState<number | null>(null)
  const isNestedMobile = useMediaQuery("max-sm")
  const listRef = useRef<HTMLDivElement>(null)
  const { data: session } = useSession()
  const isAuthenticated = !!session


  useEffect(() => {
    if (!isAuthenticated) return
    fetch('/api/saved-properties')
      .then((res) => res.json())
      .then((data) => {
        if (data.propertyIds) {
          setLikedProperties(new Set(data.propertyIds))
        }
      })
      .catch(() => { })
  }, [isAuthenticated])

  useEffect(() => {
    if (forceOpenPropertyId == null) return

    const property = properties.find(p => p.id === forceOpenPropertyId)
    if (property) {
      setSelectedProperty(property)
      setSelectedImageIndex(null)
      setOpenNestedPropertyId(property.id)
    }
  }, [forceOpenPropertyId, properties])

  const sortedProperties = [...properties].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price
    if (sortBy === 'price-desc') return b.price - a.price
    return 0
  })

  const filterChips = [
    selectedWilaya && { key: 'wilaya' as const, label: selectedWilaya.name },
    selectedType && { key: 'type' as const, label: selectedType.name },
    minPrice && { key: 'minPrice' as const, label: `من ${Number(minPrice).toLocaleString('ar-DZ')}` },
    maxPrice && { key: 'maxPrice' as const, label: `إلى ${Number(maxPrice).toLocaleString('ar-DZ')}` },
    minBedrooms && { key: 'minBedrooms' as const, label: `${minBedrooms}+ غرف` },
  ].filter(Boolean) as { key: string; label: string }[]

  const getPropertyImages = (property: Property) => {
    return [
      property.image,
      `https://picsum.photos/seed/${property.id}-2/800/600`,
      `https://picsum.photos/seed/${property.id}-3/800/600`,
      `https://picsum.photos/seed/${property.id}-4/800/600`,
    ]
  }

  const formatPrice = (price: number) => {
    const isRent = price < 100000
    return new Intl.NumberFormat('ar-DZ', {
      style: 'currency',
      currency: 'DZD',
      maximumFractionDigits: 0,
    }).format(price) + (isRent ? '/شهر' : '')
  }

  const getPropertyTypeName = (typeId: string) => {
    return propertyTypes.find(pt => pt.id === typeId)?.name ?? typeId
  }

  const toggleLike = (propertyId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isAuthenticated) return

    const isLiked = likedProperties.has(propertyId)
    setLikedProperties(prev => {
      const next = new Set(prev)
      if (isLiked) next.delete(propertyId)
      else next.add(propertyId)
      return next
    })

    if (isLiked) {
      fetch(`/api/saved-properties?propertyId=${propertyId}`, { method: 'DELETE' }).catch(() => { })
    } else {
      fetch('/api/saved-properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId }),
      }).catch(() => { })
    }
  }

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const items = listRef.current?.querySelectorAll('[data-property-card]')
    if (!items?.length) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setFocusedIndex(prev => Math.min(prev + 1, items.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setFocusedIndex(prev => Math.max(prev - 1, 0))
        break
      case 'Home':
        e.preventDefault()
        setFocusedIndex(0)
        break
      case 'End':
        e.preventDefault()
        setFocusedIndex(items.length - 1)
        break
    }
  }, [])

  useEffect(() => {
    if (!isDrawerOpen) {
      setSelectedProperty(null)
      setSelectedImageIndex(null)
      setFocusedIndex(-1)
      setOpenNestedPropertyId(null)
    }
  }, [isDrawerOpen])

  useEffect(() => {
    const items = listRef.current?.querySelectorAll('[data-property-card]')
    if (focusedIndex >= 0 && items?.[focusedIndex]) {
      ; (items[focusedIndex] as HTMLElement).focus()
    }
  }, [focusedIndex])

  const handlePropertySelect = (property: Property) => {
    setSelectedProperty(property)
    setSelectedImageIndex(null)
    setOpenNestedPropertyId(property.id)
    onPropertySelect(property.id)
    onDetailOpenChange(true)
  }

  const handleNestedClose = () => {
    setSelectedProperty(null)
    setSelectedImageIndex(null)
    setOpenNestedPropertyId(null)
    onPropertySelect(null)
    onDetailOpenChange(false)
  }

  return (
    <Drawer.Root direction={isNestedMobile ? 'bottom' : 'right'} open={isDrawerOpen} onOpenChange={onDrawerOpenChange} dismissible={false} modal={false}>
      <Drawer.Portal>
        <Drawer.Content
          className="bg-background/95 backdrop-blur-xl fixed inset-x-0 bottom-0 max-h-[50vh] sm:inset-y-4 sm:end-4 sm:w-[420px] sm:max-h-none z-50 shadow-2xl rounded-t-2xl sm:rounded-2xl border-0 sm:border border-border/40 flex flex-col outline-none sm:pt-0"
          dir="rtl"
        >
          <div className="absolute top-2 start-2 sm:top-4 sm:start-4 z-10">
            <Drawer.Close className="size-9 sm:size-10 rounded-full bg-muted/50 hover:bg-muted flex items-center justify-center transition-colors">
              <X className="size-5" />
            </Drawer.Close>
          </div>

          <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl px-3 py-2 sm:px-5 sm:py-4 rounded-t-2xl border-b border-border/30">
            <div className="flex items-center justify-between gap-2 mb-2 sm:mb-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-foreground">العقارات المتاحة</h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0 sm:mt-0.5">
                  {properties.length} عقار{properties.length !== 1 ? 'ات' : ''}
                </p>
              </div>

            </div>

            {/* Search Bar */}
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* Location Combobox */}
                <div className="flex-1 min-w-0">
                  <WilayaCombobox
                    wilayas={wilayas}
                    value={selectedWilaya}
                    onChange={(v) => {
                      setSelectedWilaya(v)
                      setWilayaQuery(v ? v.name : '')
                    }}
                    counts={wilayaCounts}
                    placeholder="ابحث عن ولايتك..."
                    align="start"
                    side="bottom"
                  />
                </div>

                {/* Property Type Dropdown */}
                <div className="w-36 shrink-0">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="w-full h-9 sm:h-11 flex items-center gap-2 px-2 text-sm font-medium border-0 bg-transparent shadow-none hover:bg-transparent focus-visible:ring-0 outline-none cursor-pointer">
                      <Building2 className="size-4 shrink-0 text-primary/80" />
                      <span className="flex-1 truncate text-start">
                        {selectedType?.name ?? 'نوع العقار'}
                      </span>
                      <ChevronDownIcon className="size-3.5 opacity-50" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-48 z-100" align="end">
                      <DropdownMenuRadioGroup
                        value={selectedType?.id}
                        onValueChange={(id) => {
                          const type = propertyTypes.find((pt) => pt.id === id)
                          setSelectedType(type ?? null)
                        }}
                      >
                        {propertyTypes.map((pt) => (
                          <DropdownMenuRadioItem key={pt.id} value={pt.id}>
                            <span className="flex-1">{pt.name}</span>
                            <span className="text-xs text-muted-foreground/70 ms-2">
                              {typeCounts[pt.id] || 0}
                            </span>
                          </DropdownMenuRadioItem>
                        ))}
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Advanced Filters (Price & Bedrooms) */}
              <div className="space-y-1.5 pt-2 mt-2 sm:space-y-3 sm:pt-3 sm:mt-3 border-t border-border/10">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-1">
                    <div className="relative flex-1">
                      <input
                        type="number"
                        placeholder="السعر الأدنى"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="w-full h-8 sm:h-10 rounded-xl bg-muted/30 border border-border/30 px-3 text-xs font-medium placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all"
                      />
                    </div>
                    <span className="text-muted-foreground/40 text-xs">—</span>
                    <div className="relative flex-1">
                      <input
                        type="number"
                        placeholder="السعر الأقصى"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="w-full h-8 sm:h-10 rounded-xl bg-muted/30 border border-border/30 px-3 text-xs font-medium placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all"
                      />
                    </div>
                  </div>

                  <div className="w-24 shrink-0 relative">
                    <Bed className="absolute inset-s-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/60 pointer-events-none" />
                    <select
                      value={minBedrooms}
                      onChange={(e) => setMinBedrooms(e.target.value)}
                      className="w-full h-8 sm:h-10 rounded-xl bg-muted/30 border border-border/30 ps-8 pe-2 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all appearance-none cursor-pointer"
                    >
                      <option value="">الغرف</option>
                      <option value="1">+1</option>
                      <option value="2">+2</option>
                      <option value="3">+3</option>
                      <option value="4">+4</option>
                      <option value="5">+5</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {filterChips.length > 0 && (
            <div className="sticky top-[72px] z-10 bg-background/60 backdrop-blur-xl px-3 py-2 sm:px-5 sm:py-3 border-b border-border/20">
              <div className="flex items-center gap-2 flex-wrap">
                {filterChips.map((chip) => (
                  <button
                    key={chip.key}
                    onClick={() => removeFilter(chip.key)}
                    className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
                  >
                    {chip.label}
                    <X className="size-3.5" />
                  </button>
                ))}
                {filterChips.length > 1 && (
                  <button
                    onClick={onClearAll}
                    className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-destructive/10 text-destructive text-xs font-medium hover:bg-destructive/20 transition-colors"
                  >
                    مسح الكل
                  </button>
                )}
              </div>
            </div>
          )}

          {loading ? (
            <div className="overflow-y-auto flex-1 px-4 py-4 space-y-4">
              {[1, 2, 3].map((i) => (
                <PropertyCardSkeleton key={i} />
              ))}
            </div>
          ) : sortedProperties.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
              <Building2 className="size-20 text-muted-foreground/15 mb-5" />
              <h3 className="text-lg font-semibold text-foreground mb-1.5">لا توجد عقارات</h3>
              <p className="text-sm text-muted-foreground max-w-[200px]">
                حاول تعديل معايير البحث أو إزالة الفلاتر
              </p>
            </div>
          ) : (
            <div
              ref={listRef}
              className="overflow-y-auto flex-1 px-3 py-3 sm:px-4 sm:py-4 space-y-3 sm:space-y-4"
              role="listbox"
              aria-label="قائمة العقارات"
              onKeyDown={handleKeyDown}
            >
              {sortedProperties.map((property, index) => (
                <Drawer.NestedRoot
                  key={property.id}
                  direction={isNestedMobile ? 'bottom' : 'right'}
                  open={openNestedPropertyId === property.id || forceOpenPropertyId === property.id}
                  onOpenChange={(open) => {
                    if (open) handlePropertySelect(property)
                    else handleNestedClose()
                  }}
                >
                  <Drawer.Trigger
                    data-property-card
                    className="group w-full text-start bg-card rounded-2xl border border-border/40 overflow-hidden hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 cursor-pointer block animate-hero-fade-up"
                    style={{ animationDelay: `${index * 60}ms` }}
                    tabIndex={0}
                    role="option"
                    aria-label={`${property.title} - ${formatPrice(property.price)}`}
                  >
                    <div className="relative h-32 sm:h-44 overflow-hidden">
                      <img
                        src={property.image}
                        alt={property.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                      <div className="absolute top-2 sm:top-3 start-2 sm:start-3">
                        <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-background/80 backdrop-blur-sm text-xs font-medium text-foreground">
                          {getPropertyTypeName(property.type)}
                        </span>
                      </div>

                      <button
                        onClick={(e) => toggleLike(property.id, e)}
                        className="absolute top-2 sm:top-3 end-2 sm:end-3 size-9 sm:size-11 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
                        aria-label={likedProperties.has(property.id) ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
                      >
                        <Heart
                          className={`size-4 transition-all ${likedProperties.has(property.id)
                            ? 'fill-primary text-primary scale-110'
                            : 'text-muted-foreground hover:text-primary'
                            }`}
                        />
                      </button>

                      <div className="absolute bottom-2 sm:bottom-3 end-2 sm:end-3 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-background/90 backdrop-blur-sm">
                        <span className="text-xs sm:text-sm font-bold text-primary">{formatPrice(property.price)}</span>
                      </div>
                    </div>

                    <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                      <div>
                        <h3 className="font-bold text-foreground text-sm sm:text-base">{property.title}</h3>
                        <div className="flex items-center gap-1.5 mt-1 sm:mt-1.5 text-muted-foreground">
                          <MapPin className="size-3.5" />
                          <span className="text-xs">{property.wilayaName}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {property.bedrooms && (
                          <div className="flex items-center gap-1">
                            <Bed className="size-3.5" />
                            <span>{property.bedrooms} غرف</span>
                          </div>
                        )}
                        {property.bathrooms && (
                          <div className="flex items-center gap-1">
                            <Bath className="size-3.5" />
                            <span>{property.bathrooms} حمام</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Square className="size-3.5" />
                          <span>{property.area} م²</span>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground/80 line-clamp-2 leading-relaxed">
                        {property.description}
                      </p>
                    </div>
                  </Drawer.Trigger>

                  <Drawer.Portal>
                    <Drawer.Content
                      className="bg-background/95 backdrop-blur-2xl fixed inset-x-0 bottom-0 max-h-[50vh] sm:inset-y-4 sm:end-4 sm:w-[420px] sm:max-h-none z-50 shadow-2xl rounded-t-2xl sm:rounded-2xl border-0 sm:border border-border/40 flex flex-col outline-none overflow-hidden"
                      dir="rtl"
                    >
                      {/* Sticky Header with Back Button */}
                      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-border/10 px-4 py-3 flex items-center justify-between">
                        <button
                          onClick={handleNestedClose}
                          className="h-10 px-3 rounded-xl bg-muted/50 hover:bg-muted flex items-center gap-2 transition-all group"
                        >
                          <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
                          <span className="text-sm font-medium">العودة للقائمة</span>
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => selectedProperty && toggleLike(selectedProperty.id, e)}
                            className="size-10 rounded-xl bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors"
                            aria-label={selectedProperty && likedProperties.has(selectedProperty.id) ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
                          >
                            <Heart
                              className={`size-4 transition-all ${selectedProperty && likedProperties.has(selectedProperty.id)
                                ? 'fill-primary text-primary scale-110'
                                : 'text-muted-foreground'
                                }`}
                            />
                          </button>
                        </div>
                      </div>

                      {selectedProperty && (
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                          <div className="relative">
                            <ImageViewer
                              images={getPropertyImages(selectedProperty)}
                              initialIndex={selectedImageIndex ?? 0}
                            />
                          </div>

                          <div className="p-6 space-y-8">
                            {/* Title and Price Section */}
                            <div className="space-y-4">
                              <div className="flex items-start justify-between gap-4">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <span className="px-3 py-1 rounded-full bg-primary/10 text-[10px] font-bold uppercase tracking-wider text-primary border border-primary/20">
                                      {getPropertyTypeName(selectedProperty.type)}
                                    </span>
                                    <span className="px-3 py-1 rounded-full bg-green-500/10 text-[10px] font-bold uppercase tracking-wider text-green-600 border border-green-500/20">
                                      متاح حالياً
                                    </span>
                                  </div>
                                  <h3 className="font-black text-foreground text-2xl leading-tight">{selectedProperty.title}</h3>
                                </div>

                                <div className="shrink-0 text-start sm:text-end">
                                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">السعر الإجمالي</p>
                                  <span className="text-2xl font-black text-primary block">{formatPrice(selectedProperty.price)}</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/30 border border-border/50 text-muted-foreground">
                                <MapPin className="size-4 text-primary" />
                                <span className="text-sm font-medium">{selectedProperty.wilayaName} • الجزائر</span>
                              </div>
                            </div>

                            {/* Features Grid */}
                            <div className="grid grid-cols-3 gap-3">
                              {selectedProperty.bedrooms && (
                                <div className="bg-muted/40 rounded-xl p-3 text-center">
                                  <Bed className="size-5 mx-auto mb-1.5 text-primary" />
                                  <span className="text-sm font-bold text-foreground">{selectedProperty.bedrooms}</span>
                                  <p className="text-xs text-muted-foreground">غرف</p>
                                </div>
                              )}
                              {selectedProperty.bathrooms && (
                                <div className="bg-muted/40 rounded-xl p-3 text-center">
                                  <Bath className="size-5 mx-auto mb-1.5 text-primary" />
                                  <span className="text-sm font-bold text-foreground">{selectedProperty.bathrooms}</span>
                                  <p className="text-xs text-muted-foreground">حمام</p>
                                </div>
                              )}
                              <div className="bg-muted/40 rounded-xl p-3 text-center">
                                <Square className="size-5 mx-auto mb-1.5 text-primary" />
                                <span className="text-sm font-bold text-foreground">{selectedProperty.area}</span>
                                <p className="text-xs text-muted-foreground">م²</p>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-semibold text-foreground text-sm mb-2">الوصف</h4>
                              <p className="text-sm text-muted-foreground/80 leading-relaxed">
                                {selectedProperty.description}
                              </p>
                            </div>

                            <div className="space-y-3 pt-2">
                              <button className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors">
                                <Phone className="size-4" />
                                اتصل بالبائع
                              </button>
                              <button className="w-full h-12 rounded-xl bg-muted/50 text-foreground font-bold text-sm flex items-center justify-center gap-2 hover:bg-muted transition-colors">
                                <Calendar className="size-4" />
                                حجز موعد زيارة
                              </button>
                              <button className="w-full h-12 rounded-xl bg-muted/50 text-foreground font-bold text-sm flex items-center justify-center gap-2 hover:bg-muted transition-colors">
                                <Shield className="size-4" />
                                الإبلاغ عن هذا العقار
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </Drawer.Content>
                  </Drawer.Portal>
                </Drawer.NestedRoot>
              ))}
            </div>
          )}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
