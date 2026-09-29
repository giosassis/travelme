import { useState, useEffect, useRef, useCallback } from 'react'
import { MapPin, ExternalLink, Search, X, Loader2, AlertCircle } from 'lucide-react'
import type { Location } from '@/types'
import { searchPlaces, type GeocodingSuggestion } from '@/services/maps/geocodingService'

interface Props {
  value: Location | null
  onChange: (location: Location | null) => void
  readOnly?: boolean
}

function buildMapsUrl(loc: Location): string {
  if (loc.latitude !== undefined && loc.longitude !== undefined) {
    return `https://maps.google.com/maps?q=${loc.latitude},${loc.longitude}`
  }
  if (loc.address) return `https://maps.google.com/maps?q=${encodeURIComponent(loc.address)}`
  return `https://maps.google.com/maps?q=${encodeURIComponent(loc.placeName)}`
}

// ─── Read-only mode ────────────────────────────────────────────────────────────
function LocationReadOnly({ value }: { value: Location }) {
  if (!value.placeName && !value.address) return null
  return (
    <div className="flex items-start gap-2 p-3 bg-teal-light rounded-xl">
      <MapPin size={14} className="text-teal mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        {value.placeName && (
          <p className="text-sm font-medium text-teal truncate">{value.placeName}</p>
        )}
        {value.address && (
          <p className="text-xs text-muted truncate">{value.address}</p>
        )}
        {value.latitude !== undefined && (
          <p className="text-xs text-muted/60">
            {value.latitude.toFixed(5)}, {value.longitude?.toFixed(5)}
          </p>
        )}
      </div>
      <a
        href={buildMapsUrl(value)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Abrir no mapa"
        className="shrink-0 text-teal hover:text-primary transition-colors"
      >
        <ExternalLink size={14} />
      </a>
    </div>
  )
}

// ─── Edit mode ─────────────────────────────────────────────────────────────────
export function LocationField({ value, onChange, readOnly }: Props) {
  if (readOnly) {
    if (!value || (!value.placeName && !value.address)) return null
    return <LocationReadOnly value={value} />
  }

  return <LocationSearch value={value} onChange={onChange} />
}

function LocationSearch({ value, onChange }: { value: Location | null; onChange: (l: Location | null) => void }) {
  const [query, setQuery] = useState(value?.placeName ?? '')
  const [suggestions, setSuggestions] = useState<GeocodingSuggestion[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [offline, setOffline] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Sync query when value changes externally (e.g. form reset)
  useEffect(() => {
    setQuery(value?.placeName ?? '')
  }, [value?.placeName])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const runSearch = useCallback(async (q: string) => {
    if (q.length < 2) {
      setSuggestions([])
      setOpen(false)
      setLoading(false)
      return
    }
    setLoading(true)
    setOffline(false)
    const results = await searchPlaces(q)
    setLoading(false)
    if (!navigator.onLine && results.length === 0) {
      setOffline(true)
      setOpen(false)
      return
    }
    setSuggestions(results)
    setOpen(results.length > 0)
  }, [])

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value
    setQuery(q)
    setOffline(false)

    // If the user clears the field, clear the location value
    if (!q.trim()) {
      onChange(null)
      setSuggestions([])
      setOpen(false)
      return
    }

    // Debounce Nominatim calls (1 req/s policy)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => runSearch(q), 600)
  }

  function handleSelect(s: GeocodingSuggestion) {
    const loc: Location = {
      placeName: s.placeName,
      address: s.address,
      latitude: s.latitude,
      longitude: s.longitude,
      placeId: s.placeId,
    }
    onChange(loc)
    setQuery(s.placeName)
    setSuggestions([])
    setOpen(false)
  }

  function handleClear() {
    setQuery('')
    onChange(null)
    setSuggestions([])
    setOpen(false)
    setOffline(false)
  }

  const hasValue = value && (value.placeName || value.address)

  return (
    <div className="flex flex-col gap-2" ref={containerRef}>
      {/* Section label */}
      <div className="flex items-center gap-2">
        <MapPin size={14} className="text-muted" />
        <span className="text-sm font-medium text-app-text">Localização (opcional)</span>
      </div>

      {/* Search input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          {loading ? (
            <Loader2 size={15} className="text-muted animate-spin" />
          ) : (
            <Search size={15} className="text-muted" />
          )}
        </div>
        <input
          type="text"
          placeholder="Buscar local: aeroporto, hotel, restaurante…"
          value={query}
          onChange={handleInput}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          className="w-full border border-gray-200 rounded-xl pl-9 pr-9 py-2.5 text-sm focus:outline-none focus:border-primary bg-white"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Limpar localização"
            className="absolute inset-y-0 right-3 flex items-center text-muted hover:text-app-text"
          >
            <X size={15} />
          </button>
        )}

        {/* Dropdown */}
        {open && suggestions.length > 0 && (
          <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
            {suggestions.map((s) => (
              <button
                key={s.placeId}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault() // prevent blur before click
                  handleSelect(s)
                }}
                className="w-full text-left flex items-start gap-3 px-3 py-2.5 hover:bg-primary-light transition-colors border-b border-gray-50 last:border-0"
              >
                <MapPin size={14} className="text-primary shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-app-text truncate">{s.placeName}</p>
                  <p className="text-xs text-muted truncate">{s.address}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Offline notice */}
      {offline && (
        <div className="flex items-center gap-2 text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-xl px-3 py-2">
          <AlertCircle size={13} className="shrink-0" />
          <span>
            Sem conexão — busca automática indisponível. Você ainda pode preencher o local
            manualmente clicando em "Preencher manualmente".
          </span>
        </div>
      )}

      {/* Selected location badge */}
      {hasValue && (
        <div className="flex items-start gap-2 p-3 bg-teal-light rounded-xl">
          <MapPin size={13} className="text-teal mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            {value.placeName && (
              <p className="text-sm font-medium text-teal truncate">{value.placeName}</p>
            )}
            {value.address && (
              <p className="text-xs text-muted truncate">{value.address}</p>
            )}
            {value.latitude !== undefined && (
              <p className="text-xs text-muted/60">
                {value.latitude.toFixed(5)}, {value.longitude?.toFixed(5)}
              </p>
            )}
          </div>
          <a
            href={buildMapsUrl(value)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Abrir no mapa"
            className="shrink-0 text-teal hover:text-primary transition-colors"
          >
            <ExternalLink size={14} />
          </a>
        </div>
      )}

      {/* Manual fallback toggle */}
      <ManualFallback value={value} onChange={onChange} />
    </div>
  )
}

// ─── Manual coordinate entry (collapsed by default) ───────────────────────────
function ManualFallback({
  value,
  onChange,
}: {
  value: Location | null
  onChange: (l: Location | null) => void
}) {
  const [open, setOpen] = useState(false)

  function update(patch: Partial<Location>) {
    const current = value ?? { placeName: '', address: '' }
    const updated = { ...current, ...patch }
    if (!updated.placeName && !updated.address && !updated.latitude && !updated.longitude) {
      onChange(null)
    } else {
      onChange(updated)
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-xs text-muted hover:text-primary underline-offset-2 hover:underline transition-colors"
      >
        {open ? 'Ocultar preenchimento manual' : 'Preencher manualmente (lat/lng)'}
      </button>

      {open && (
        <div className="flex flex-col gap-2 mt-2">
          <input
            type="text"
            placeholder="Nome do local"
            value={value?.placeName ?? ''}
            onChange={(e) => update({ placeName: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white"
          />
          <input
            type="text"
            placeholder="Endereço"
            value={value?.address ?? ''}
            onChange={(e) => update({ address: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="Latitude"
              value={value?.latitude ?? ''}
              onChange={(e) =>
                update({ latitude: e.target.value ? Number(e.target.value) : undefined })
              }
              step="any"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white"
            />
            <input
              type="number"
              placeholder="Longitude"
              value={value?.longitude ?? ''}
              onChange={(e) =>
                update({ longitude: e.target.value ? Number(e.target.value) : undefined })
              }
              step="any"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white"
            />
          </div>
        </div>
      )}
    </div>
  )
}
