/**
 * geocodingService.ts
 *
 * Wrapper around Nominatim (OpenStreetMap) geocoding.
 * Free, no API key required. Rate limit: 1 req/s — enforced by the debounce
 * in the LocationField component.
 *
 * Nominatim usage policy: https://operations.osmfoundation.org/policies/nominatim/
 * We set a descriptive User-Agent via the custom header (see fetch call).
 */

export interface NominatimResult {
  place_id: number
  display_name: string
  name: string
  lat: string
  lon: string
  address?: {
    road?: string
    suburb?: string
    city?: string
    state?: string
    country?: string
    country_code?: string
    aeroway?: string
    airport?: string
  }
  type?: string
  class?: string
}

export interface GeocodingSuggestion {
  placeId: string
  placeName: string
  address: string
  latitude: number
  longitude: number
}

const BASE_URL = 'https://nominatim.openstreetmap.org/search'

/**
 * Searches Nominatim for places matching `query`.
 * Returns up to `limit` results (default 5).
 * Returns [] on network error or if offline.
 */
export async function searchPlaces(
  query: string,
  limit = 6,
): Promise<GeocodingSuggestion[]> {
  if (!query.trim() || query.length < 2) return []

  const params = new URLSearchParams({
    q: query,
    format: 'jsonv2',
    addressdetails: '1',
    limit: String(limit),
    'accept-language': 'pt-BR,pt,en',
  })

  try {
    const res = await fetch(`${BASE_URL}?${params}`, {
      headers: {
        // Nominatim requires a meaningful User-Agent identifying the application
        'User-Agent': 'TravelMe/1.0 (travel planning app)',
      },
      signal: AbortSignal.timeout(6000),
    })

    if (!res.ok) return []

    const data: NominatimResult[] = await res.json()

    return data.map((r) => {
      // Build a concise place name: prefer the 'name' field, fall back to first
      // segment of display_name
      const displayParts = r.display_name.split(', ')
      const placeName = r.name || displayParts[0] || r.display_name

      // Build a short address (city + state + country)
      const addr = r.address
      const addressParts = [
        addr?.road,
        addr?.suburb,
        addr?.city,
        addr?.state,
        addr?.country,
      ].filter(Boolean)
      const address =
        addressParts.length > 0
          ? addressParts.slice(0, 3).join(', ')
          : displayParts.slice(1, 3).join(', ')

      return {
        placeId: String(r.place_id),
        placeName,
        address,
        latitude: parseFloat(r.lat),
        longitude: parseFloat(r.lon),
      }
    })
  } catch {
    // Network error, timeout, or offline — graceful degradation
    return []
  }
}
