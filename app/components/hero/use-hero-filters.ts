'use client'

import { useState, useMemo } from 'react'
import { wilayas, type Wilaya } from '@/app/data/wilayas'
import { propertyTypes, type PropertyType } from '@/app/data/property-types'
import { useComboboxFilter } from '@/components/ui/combobox'

export function useHeroFilters() {
  const [selectedWilaya, setSelectedWilaya] = useState<Wilaya | null>(null)
  const [selectedType, setSelectedType] = useState<PropertyType | null>(null)
  const [wilayaQuery, setWilayaQuery] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [minBedrooms, setMinBedrooms] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)

  const wilayaFilter = useComboboxFilter()
  const filteredWilayas = wilayas.filter((w) =>
    wilayaFilter.contains(w, wilayaQuery, (w) => w.name),
  )

  const hasActiveFilters = !!(selectedWilaya || selectedType || minPrice || maxPrice || minBedrooms)

  const clearFilters = () => {
    setSelectedWilaya(null)
    setSelectedType(null)
    setWilayaQuery('')
    setMinPrice('')
    setMaxPrice('')
    setMinBedrooms('')
    setShowAdvanced(false)
  }

  const removeFilter = (key: string) => {
    switch (key) {
      case 'wilaya': setSelectedWilaya(null); setWilayaQuery(''); break
      case 'type': setSelectedType(null); break
      case 'minPrice': setMinPrice(''); break
      case 'maxPrice': setMaxPrice(''); break
      case 'minBedrooms': setMinBedrooms(''); break
    }
  }

  return {
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
    showAdvanced,
    setShowAdvanced,
    filteredWilayas,
    hasActiveFilters,
    clearFilters,
    removeFilter,
  }
}
