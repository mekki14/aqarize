'use client'

import { useState, useEffect } from 'react'
import { useMapMode } from '@/app/lib/map-mode-context'
import type { Property } from '@/lib/types'
import type { Wilaya } from '@/app/data/wilayas'

export function useHeroMapState(
  properties: Property[],
  selectedWilaya: Wilaya | null,
  isDrawerOpen: boolean,
  setIsDrawerOpen: (v: boolean) => void,
) {
  const { setMapMode } = useMapMode()
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null)
  const [isContentHidden, setIsContentHidden] = useState(false)

  useEffect(() => {
    if (isDrawerOpen) {
      setIsContentHidden(false)
      const timer = setTimeout(() => setIsContentHidden(true), 500)
      return () => clearTimeout(timer)
    } else {
      setIsContentHidden(false)
    }
  }, [isDrawerOpen])

  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    setMapMode(isDrawerOpen)
    return () => { document.body.style.overflow = '' }
  }, [isDrawerOpen, setMapMode])

  const mapFocus = isDetailOpen && selectedPropertyId
    ? (() => {
      const prop = properties.find((p) => p.id === selectedPropertyId)
      return prop ? { center: prop.center as [number, number], zoom: 16 } : undefined
    })()
    : isDrawerOpen && selectedWilaya
      ? { center: [selectedWilaya.lat, selectedWilaya.lng] as [number, number], zoom: 12 }
      : undefined

  const mapProperties = isDrawerOpen
    ? properties.map((p) => ({
      id: p.id,
      title: p.title,
      center: p.center,
      polygon: p.polygon,
      price: p.price,
      wilayaName: p.wilayaName,
      type: p.type,
    }))
    : undefined

  return {
    isDetailOpen,
    setIsDetailOpen,
    selectedPropertyId,
    setSelectedPropertyId,
    isContentHidden,
    mapFocus,
    mapProperties,
  }
}
