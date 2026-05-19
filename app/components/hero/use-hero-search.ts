'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { Property, SearchResponse } from '@/lib/types'

interface UseHeroSearchProps {
  selectedWilaya: { id: number } | null
  selectedType: { id: string } | null
  minPrice: string
  maxPrice: string
  minBedrooms: string
  isDrawerOpen: boolean
}

export function useHeroSearch({
  selectedWilaya,
  selectedType,
  minPrice,
  maxPrice,
  minBedrooms,
  isDrawerOpen,
}: UseHeroSearchProps) {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(false)
  const [wilayaCounts, setWilayaCounts] = useState<Record<number, number>>({})
  const [typeCounts, setTypeCounts] = useState<Record<string, number>>({})
  const [hasSearched, setHasSearched] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    fetch('/api/properties/search?limit=0')
      .then(r => r.json())
      .then((data: SearchResponse) => {
        setWilayaCounts(data.wilayaCounts)
        setTypeCounts(data.typeCounts)
      })
      .catch(() => { })
  }, [])

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
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        console.error('Search failed:', err)
      }
    } finally {
      setLoading(false)
    }
  }, [selectedWilaya, selectedType, minPrice, maxPrice, minBedrooms])

  useEffect(() => {
    if (!isDrawerOpen || !hasSearched) return
    const timer = setTimeout(() => {
      fetchProperties()
    }, 300)
    return () => clearTimeout(timer)
  }, [isDrawerOpen, hasSearched, selectedWilaya, selectedType, minPrice, maxPrice, minBedrooms, fetchProperties])

  return {
    properties,
    loading,
    wilayaCounts,
    typeCounts,
    hasSearched,
    setHasSearched,
    fetchProperties,
    setProperties,
    setWilayaCounts,
    setTypeCounts,
  }
}
