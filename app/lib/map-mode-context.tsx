'use client'

import { createContext, useContext, useState } from 'react'

type MapModeContextType = {
  isMapMode: boolean
  setMapMode: (v: boolean) => void
}

const Ctx = createContext<MapModeContextType | null>(null)

export function MapModeProvider({ children }: { children: React.ReactNode }) {
  const [isMapMode, setMapMode] = useState(false)
  return <Ctx.Provider value={{ isMapMode, setMapMode }}>{children}</Ctx.Provider>
}

export function useMapMode() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useMapMode must be used within MapModeProvider')
  return ctx
}
