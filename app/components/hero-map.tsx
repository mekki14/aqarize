'use client'

import { useEffect, useRef, memo } from 'react'
import { MapContainer, TileLayer, Marker, Polygon, Tooltip, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { propertyTypeColors } from '@/app/data/property-types'
import { demoProperties, getDemoPropertyColor } from '@/app/data/demo-properties'

interface HeroMapProps {
  center?: [number, number]
  zoom?: number
  selectedPropertyId?: number | null
  onPropertyClick?: (id: number) => void
  isMobile?: boolean
  properties?: Array<{
    id: number
    title: string
    center: [number, number]
    polygon: [number, number][]
    price: number
    wilayaName: string
    type: string
  }>
}

function MapController({ center, zoom, isMobile }: { center: [number, number]; zoom: number; isMobile?: boolean }) {
  const map = useMap()
  const prevCenterRef = useRef<[number, number] | null>(null)
  const prevZoomRef = useRef<number | null>(null)

  useEffect(() => {
    map.dragging.enable()
  }, [map])

  useEffect(() => {
    const prevCenter = prevCenterRef.current
    const prevZoom = prevZoomRef.current

    if (prevCenter && prevZoom !== null) {
      const centerChanged = prevCenter[0] !== center[0] || prevCenter[1] !== center[1]
      const zoomChanged = prevZoom !== zoom

      if (centerChanged || zoomChanged) {
        if (isMobile) {
          const mapSize = map.getSize()
          const targetPoint = map.project(center, zoom)
          const offsetPoint = L.point(targetPoint.x, targetPoint.y + mapSize.y * 0.25)
          const offsetLatLng = map.unproject(offsetPoint, zoom)
          map.flyTo(offsetLatLng, zoom, {
            duration: 1.5,
            easeLinearity: 0.25,
          })
        } else {
          map.flyTo(center, zoom, {
            duration: 1.5,
            easeLinearity: 0.25,
          })
        }
      }
    }

    prevCenterRef.current = center
    prevZoomRef.current = zoom
  }, [map, center, zoom, isMobile])

  return null
}

const iconCache = new Map<string, L.DivIcon>()

const createPulseIcon = (color: string): L.DivIcon => {
  if (!iconCache.has(color)) {
    iconCache.set(color, L.divIcon({
      className: 'custom-pulse-icon',
      html: `
        <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
          <div style="position: absolute; width: 100%; height: 100%; background: ${color}; opacity: 0.15; border-radius: 50%; box-shadow: 0 0 10px ${color};"></div>
          <div style="position: absolute; width: 60%; height: 60%; background: ${color}; opacity: 0.25; border-radius: 50%;"></div>
          <div style="width: 10px; height: 10px; background: ${color}; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); z-index: 10;"></div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    }))
  }
  return iconCache.get(color)!
}

const originColor = '#F97316'

const getPropertyColor = (type: string): string => {
  return propertyTypeColors[type] || originColor
}

const darkenColor = (color: string, amount: number): string => {
  const hex = color.replace('#', '')
  const r = Math.max(0, parseInt(hex.substring(0, 2), 16) - amount)
  const g = Math.max(0, parseInt(hex.substring(2, 4), 16) - amount)
  const b = Math.max(0, parseInt(hex.substring(4, 6), 16) - amount)
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

const labelIcon = L.divIcon({
  className: 'custom-label-icon',
  html: `
    <div style="background: white; padding: 4px 8px; font-size: 10px; font-weight: bold; color: #F97316; box-shadow: 0 2px 10px rgba(0,0,0,0.1); border-radius: 2px; letter-spacing: 1px; white-space: nowrap;">
      العقار المختار
    </div>
  `,
  iconSize: [80, 24],
  iconAnchor: [90, 10],
})

const PropertyMarker = memo(({ property, isSelected, onClick }: {
  property: { id: number; title: string; center: [number, number]; polygon: [number, number][]; price: number; wilayaName: string; type: string }
  isSelected: boolean
  onClick?: (id: number) => void
}) => {
  const baseColor = getPropertyColor(property.type)
  const selectedColor = darkenColor(baseColor, 30)

  return (
    <>
      <Polygon
        positions={property.polygon}
        pathOptions={{
          color: isSelected ? selectedColor : baseColor,
          weight: isSelected ? 4 : 2,
          opacity: isSelected ? 1 : 0.8,
          fillColor: isSelected ? selectedColor : baseColor,
          fillOpacity: isSelected ? 0.25 : 0.1,
          dashArray: isSelected ? undefined : '4, 4',
        }}
        eventHandlers={{
          click: () => onClick?.(property.id),
        }}
      />
      <Marker
        position={property.center}
        icon={isSelected ? createPulseIcon(selectedColor) : createPulseIcon(baseColor)}
        zIndexOffset={isSelected ? 0 : 0}
        eventHandlers={{
          click: () => onClick?.(property.id),
        }}
      >
        <Tooltip direction="top" offset={[140, 0]} opacity={1} className="custom-property-tooltip" interactive>
          <div className="p-3 px-4 flex flex-col gap-1 min-w-[140px] font-sans" dir="rtl">
            <span className="font-bold text-sm text-zinc-900 border-b border-zinc-100 pb-1 mb-1">{property.title}</span>
            <span className="text-xs font-semibold text-zinc-500">{property.wilayaName}</span>
            <span className="text-sm font-black mt-1" style={{ color: baseColor }}>
              {new Intl.NumberFormat('ar-DZ', { maximumFractionDigits: 0 }).format(property.price)} دج
            </span>
          </div>
        </Tooltip>
      </Marker>
    </>
  )
})
PropertyMarker.displayName = 'PropertyMarker'

const DemoPropertyMarker = memo(({ property }: { property: typeof demoProperties[number] }) => {
  const color = getDemoPropertyColor(property.type)

  return (
    <>
      <Polygon
        positions={property.polygon}
        pathOptions={{ color, weight: 2, opacity: 0.8, fillColor: color, fillOpacity: 0.1, dashArray: '4, 4' }}
      />
      <Marker position={property.center} icon={createPulseIcon(color)}>
        <Tooltip direction="top" offset={[0, -32]} opacity={1} className="custom-property-tooltip" interactive>
          <div className="p-3 px-4 flex flex-col gap-1 min-w-[140px] font-sans" dir="rtl">
            <span className="font-bold text-sm text-zinc-900 border-b border-zinc-100 pb-1 mb-1">{property.title}</span>
            <span className="text-xs font-semibold text-zinc-500">{property.wilayaName}</span>
            <span className="text-sm font-black mt-1" style={{ color }}>
              {new Intl.NumberFormat('ar-DZ', { maximumFractionDigits: 0 }).format(property.price)} دج
            </span>
          </div>
        </Tooltip>
      </Marker>
    </>
  )
})
DemoPropertyMarker.displayName = 'DemoPropertyMarker'

export default function HeroMap({ center, zoom, selectedPropertyId, onPropertyClick, properties: mapProperties, isMobile }: HeroMapProps) {
  const defaultCenter: [number, number] = [36.7450, 3.0600]
  const defaultZoom = 13
  const mapCenter = center ?? defaultCenter
  const mapZoom = zoom ?? defaultZoom

  const showProperties = mapProperties && mapProperties.length > 0

  return (
    <div className="w-full h-full relative map-wrapper-bg">
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        zoomControl={true}
        attributionControl={false}
        dragging={true}
        touchZoom={true}
        bounceAtZoomLimits={false}
        maxBoundsViscosity={0.8}
        className="w-full h-full"
      >
        <MapController center={mapCenter} zoom={mapZoom} isMobile={isMobile} />
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
        />

        {showProperties && mapProperties.map((property) => (
          <PropertyMarker
            key={property.id}
            property={property}
            isSelected={selectedPropertyId === property.id}
            onClick={onPropertyClick}
          />
        ))}

        {!showProperties && demoProperties.map((property) => (
          <DemoPropertyMarker key={property.id} property={property} />
        ))}

        {!showProperties && (
          <Marker position={[36.7350, 3.0800]} icon={labelIcon} interactive={false} />
        )}
      </MapContainer>
    </div>
  )
}
