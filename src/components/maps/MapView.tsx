import { useEffect, useRef, memo } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { createColoredIcon, TILE_URL, TILE_ATTRIBUTION, type MapPoint } from '@/services/maps/mapService'

interface Props {
  points: MapPoint[]
  className?: string
}

/**
 * MapView — renders a Leaflet map with coloured circle markers.
 * The component initialises the map once and updates markers on changes.
 * Wrapped in memo to prevent unnecessary re-mounts.
 */
export const MapView = memo(function MapView({ points, className = '' }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.Marker[]>([])

  // Initialise map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    const map = L.map(containerRef.current, { zoomControl: true })
    L.tileLayer(TILE_URL, { attribution: TILE_ATTRIBUTION, maxZoom: 19 }).addTo(map)
    map.setView([-14.235, -51.925], 4) // Brazil centre
    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  // Update markers whenever points change
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    // Remove old markers
    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    if (points.length === 0) return

    const bounds: [number, number][] = []

    points.forEach((pt) => {
      const icon = createColoredIcon(pt.color)
      const marker = L.marker([pt.lat, pt.lng], { icon })
        .addTo(map)
        .bindPopup(
          `<div style="font-family: system-ui, sans-serif; min-width: 140px;">
            <p style="font-weight: 600; margin: 0 0 2px; font-size: 13px;">${pt.label}</p>
            ${pt.subtitle ? `<p style="color: #777; margin: 0; font-size: 12px;">${pt.subtitle}</p>` : ''}
            <p style="color: #8B7CF6; margin: 4px 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em;">${pt.category}</p>
          </div>`,
        )
      markersRef.current.push(marker)
      bounds.push([pt.lat, pt.lng])
    })

    // Fit map to show all markers
    if (bounds.length === 1) {
      map.setView(bounds[0], 14)
    } else {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 })
    }
  }, [points])

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ minHeight: '300px' }}
    />
  )
})
