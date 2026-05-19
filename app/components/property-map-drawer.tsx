'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Polygon, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const markerIcon = L.divIcon({
  className: '',
  html: `<div style="width:12px;height:12px;background:#F97316;border:2px solid white;border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,0.3);"></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
})

interface PropertyMapDrawerProps {
  points: [number, number][]
  onChange: (points: [number, number][]) => void
}

function ClickHandler({ onMapClick }: { onMapClick: (latlng: [number, number]) => void }) {
  useMapEvents({
    click(e) {
      onMapClick([e.latlng.lat, e.latlng.lng])
    },
  })
  return null
}

export default function PropertyMapDrawer({ points, onChange }: PropertyMapDrawerProps) {
  const [drawingPoints, setDrawingPoints] = useState<[number, number][]>(points)
  const center: [number, number] = points.length > 0
    ? [points[0][0], points[0][1]]
    : [36.7538, 3.0588]

  const handleMapClick = useCallback((latlng: [number, number]) => {
    setDrawingPoints((prev) => {
      const next = [...prev, latlng]
      onChange(next)
      return next
    })
  }, [onChange])

  const undoLast = () => {
    setDrawingPoints((prev) => {
      const next = prev.slice(0, -1)
      onChange(next)
      return next
    })
  }

  const resetPolygon = () => {
    setDrawingPoints([])
    onChange([])
  }

  return (
    <div className="space-y-3">
      <div className="h-[300px] rounded-lg overflow-hidden border border-border/40">
        <MapContainer
          center={center}
          zoom={14}
          className="w-full h-full"
          zoomControl={true}
        >
          <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png" />
          <ClickHandler onMapClick={handleMapClick} />
          {drawingPoints.length > 0 && (
            <Polygon
              positions={drawingPoints}
              pathOptions={{
                color: '#F97316',
                weight: 3,
                fillColor: '#F97316',
                fillOpacity: 0.2,
              }}
            />
          )}
          {drawingPoints.map((point, idx) => (
            <Marker key={idx} position={point} icon={markerIcon} />
          ))}
        </MapContainer>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">
          {drawingPoints.length === 0
            ? 'انقر على الخريطة لتحديد حدود العقار'
            : `تم تحديد ${drawingPoints.length} نقطة`}
        </span>
        <div className="flex-1" />
        {drawingPoints.length > 0 && (
          <>
            <button
              type="button"
              onClick={undoLast}
              className="px-3 py-1.5 rounded-lg border border-border/40 text-xs hover:bg-muted transition-colors"
            >
              تراجع
            </button>
            <button
              type="button"
              onClick={resetPolygon}
              className="px-3 py-1.5 rounded-lg border border-border/40 text-xs hover:bg-muted transition-colors"
            >
              إعادة تعيين
            </button>
          </>
        )}
      </div>
    </div>
  )
}
