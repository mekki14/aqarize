'use client'

import { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo, type ReactNode } from 'react'
import { wilayas, type Wilaya } from '@/app/data/wilayas'
import { type PropertyType } from '@/app/data/property-types'
import { useComboboxFilter } from '@/components/ui/combobox'
import { useMapMode } from '@/app/lib/map-mode-context'
import type { Property, SearchResponse } from '@/lib/types'

interface MapProperty {
  id: number
  title: string
  center: [number, number]
  polygon: [number, number][]
  price: number
  wilayaName: string
  type: string
}

interface MapFocus {
  center: [number, number]
  zoom: number
}

interface HeroContextType {
  // Filter state
  selectedWilaya: Wilaya | null
  setSelectedWilaya: (w: Wilaya | null) => void
  selectedType: PropertyType | null
  setSelectedType: (pt: PropertyType | null) => void
  wilayaQuery: string
  setWilayaQuery: (q: string) => void
  minPrice: string
  setMinPrice: (v: string) => void
  maxPrice: string
  setMaxPrice: (v: string) => void
  minBedrooms: string
  setMinBedrooms: (v: string) => void
  filteredWilayas: Wilaya[]
  hasActiveFilters: boolean
  clearFilters: () => void
  removeFilter: (key: string) => void

  // Search state
  properties: Property[]
  loading: boolean
  wilayaCounts: Record<number, number>
  typeCounts: Record<string, number>
  hasSearched: boolean
  fetchProperties: () => void

  // Map/UI state
  isDrawerOpen: boolean
  setIsDrawerOpen: (v: boolean) => void
  isDetailOpen: boolean
  setIsDetailOpen: (v: boolean) => void
  selectedPropertyId: number | null
  setSelectedPropertyId: (id: number | null) => void
  isContentHidden: boolean
  mapFocus: MapFocus | undefined
  mapProperties: MapProperty[] | undefined
}

const HeroContext = createContext<HeroContextType | null>(null)

export function HeroProvider({ children }: { children: ReactNode }) {
  const { setMapMode } = useMapMode()

  // Filter state
  const [selectedWilaya, setSelectedWilaya] = useState<Wilaya | null>(null)
  const [selectedType, setSelectedType] = useState<PropertyType | null>(null)
  const [wilayaQuery, setWilayaQuery] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [minBedrooms, setMinBedrooms] = useState('')

  const wilayaFilter = useComboboxFilter()
  const filteredWilayas = wilayas.filter((w) =>
    wilayaFilter.contains(w, wilayaQuery, (w) => w.name),
  )

  const hasActiveFilters = !!(selectedWilaya || selectedType || minPrice || maxPrice || minBedrooms)

  const clearFilters = useCallback(() => {
    setSelectedWilaya(null)
    setSelectedType(null)
    setWilayaQuery('')
    setMinPrice('')
    setMaxPrice('')
    setMinBedrooms('')
  }, [])

  const removeFilter = useCallback((key: string) => {
    switch (key) {
      case 'wilaya': setSelectedWilaya(null); setWilayaQuery(''); break
      case 'type': setSelectedType(null); break
      case 'minPrice': setMinPrice(''); break
      case 'maxPrice': setMaxPrice(''); break
      case 'minBedrooms': setMinBedrooms(''); break
    }
  }, [])

  // Search state
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(false)
  const [wilayaCounts, setWilayaCounts] = useState<Record<number, number>>({})
  const [typeCounts, setTypeCounts] = useState<Record<string, number>>({})
  const [hasSearched, setHasSearched] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  // Map/UI state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null)
  const [isContentHidden, setIsContentHidden] = useState(false)

  // Fetch initial counts
  useEffect(() => {
    fetch('/api/properties/search?limit=0')
      .then(r => r.json())
      .then((data: SearchResponse) => {
        setWilayaCounts(data.wilayaCounts)
        setTypeCounts(data.typeCounts)
      })
      .catch(() => { })
  }, [])

  // Fetch properties
  const fetchProperties = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setLoading(true)
    const params = new URLSearchParams()
    if (selectedWilaya) params.set('wilayaId', String(selectedWilaya.id))
    if (selectedType) params.set('type', selectedType.id)
    if (minPrice) params.set('minPrice', minPrice)
    if (maxPrice) params.set('maxPrice', maxPrice)
    if (minBedrooms) params.set('bedrooms', minBedrooms)

    try {
      const res = await fetch(`/api/properties/search?${params}`, { signal: controller.signal })
      const data: SearchResponse = await res.json()
      setProperties(data.properties)
      setWilayaCounts(data.wilayaCounts)
      setTypeCounts(data.typeCounts)
      setHasSearched(true)
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') {
        console.error('Search failed:', err)
      }
    } finally {
      setLoading(false)
    }
  }, [selectedWilaya, selectedType, minPrice, maxPrice, minBedrooms])

  // Auto-fetch when drawer is open and filters change
  useEffect(() => {
    if (!isDrawerOpen || !hasSearched) return
    const timer = setTimeout(() => {
      fetchProperties()
    }, 300)
    return () => clearTimeout(timer)
  }, [isDrawerOpen, hasSearched, selectedWilaya, selectedType, minPrice, maxPrice, minBedrooms, fetchProperties])

  // Content visibility
  useEffect(() => {
    if (!isDrawerOpen) {
      setIsContentHidden(false)
      return
    }

    const timer = setTimeout(() => setIsContentHidden(true), 500)
    return () => clearTimeout(timer)
  }, [isDrawerOpen])

  // Map mode & body overflow
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    setMapMode(isDrawerOpen)
    return () => { document.body.style.overflow = '' }
  }, [isDrawerOpen, setMapMode])

  // Computed: map focus
  const mapFocus = useMemo(() => {
    if (isDetailOpen && selectedPropertyId) {
      const prop = properties.find((p) => p.id === selectedPropertyId)
      return prop ? { center: prop.center as [number, number], zoom: 16 } : undefined
    }
    if (isDrawerOpen && selectedWilaya) {
      return { center: [selectedWilaya.lat, selectedWilaya.lng] as [number, number], zoom: 12 }
    }
    return undefined
  }, [isDetailOpen, selectedPropertyId, properties, isDrawerOpen, selectedWilaya])

  // Computed: map properties
  const mapProperties = useMemo(() => {
    if (!isDrawerOpen) return undefined
    return properties.map((p) => ({
      id: p.id,
      title: p.title,
      center: p.center,
      polygon: p.polygon,
      price: p.price,
      wilayaName: p.wilayaName,
      type: p.type,
    }))
  }, [isDrawerOpen, properties])

  const value = useMemo<HeroContextType>(() => ({
    // Filters
    selectedWilaya,
    setSelectedWilaya,
    selectedType,
    setSelectedType,
    wilayaQuery,
    setWilayaQuery,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    minBedrooms,
    setMinBedrooms,
    filteredWilayas,
    hasActiveFilters,
    clearFilters,
    removeFilter,
    // Search
    properties,
    loading,
    wilayaCounts,
    typeCounts,
    hasSearched,
    fetchProperties,
    // Map/UI
    isDrawerOpen,
    setIsDrawerOpen,
    isDetailOpen,
    setIsDetailOpen,
    selectedPropertyId,
    setSelectedPropertyId,
    isContentHidden,
    mapFocus,
    mapProperties,
  }), [
    selectedWilaya, selectedType, wilayaQuery, minPrice, maxPrice, minBedrooms,
    filteredWilayas, hasActiveFilters, clearFilters, removeFilter,
    properties, loading, wilayaCounts, typeCounts, hasSearched, fetchProperties,
    isDrawerOpen, isDetailOpen, selectedPropertyId, isContentHidden, mapFocus, mapProperties,
  ])

  return <HeroContext.Provider value={value}>{children}</HeroContext.Provider>
}

export function useHero() {
  const ctx = useContext(HeroContext)
  if (!ctx) throw new Error('useHero must be used within HeroProvider')
  return ctx
}
