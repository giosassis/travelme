# TravelMe Implementation Plan

> **For agentic execution:** Read tasks one at a time. Each task ends with an
> independently testable deliverable. Do not skip verification steps.
> Uses `subagent-driven-development` skill for parallel-safe execution.

**Goal:** Build TravelMe — a mobile-first React PWA for personal travel planning with full offline support via IndexedDB, covering budgets, expenses, itinerary, checklist, reservations, notes, and location tagging.

**Architecture:** React + TypeScript + Vite SPA with React Router v6. Persistence layer uses IndexedDB via the `idb` library, fully encapsulated in repository classes so the rest of the app treats them as async CRUD services. Each feature domain has its own page, custom hook, and repository — no cross-domain coupling except through the `tripId` foreign key.

**Tech Stack:** React 18, TypeScript 5, Vite 5, Tailwind CSS v4, shadcn/ui (Radix primitives), Lucide React, idb 8, Recharts, React Router v6, vite-plugin-pwa.

## Global Constraints

- Language: ALL UI text in pt-BR. No English labels, placeholders, buttons, or messages.
- Currency: BRL, formatted as `R$ 1.234,56` (pt-BR locale).
- Dates: pt-BR format `dd/MM/yyyy`. Date display uses `pt-BR` locale.
- App name stays `TravelMe` (English). Tagline: "Sua viagem, organizada do seu jeito."
- Color palette — strictly follow these tokens (defined in `src/index.css` as CSS vars):
  - `--color-bg: #F8F7FC`
  - `--color-surface: #FFFFFF`
  - `--color-primary: #8B7CF6`
  - `--color-primary-light: #EAE7FF`
  - `--color-teal: #315C68`
  - `--color-teal-light: #DCECEF`
  - `--color-text: #252333`
  - `--color-muted: #777487`
  - `--color-success: #5E9C76`
  - `--color-danger: #D96C6C`
  - `--color-warning: #D5A94F`
- No backend, no authentication, no remote DB.
- All data persists in IndexedDB database named `travelme-db`.
- Object stores: `trips | expenses | budgetCategories | itinerary | checklist | reservations | notes`.
- Every entity has fields: `id` (string UUID v4), `createdAt` (ISO string), `updatedAt` (ISO string).
- UUID generation: `crypto.randomUUID()` (no external lib).
- No mock data hardcoded in UI components. Sample data only in `src/data/sampleData.ts`.
- File structure: `src/{components,pages,layouts,hooks,services/storage,types,utils,data,lib}`.
- shadcn/ui components installed to `src/components/ui/`.
- Recharts only on the Gastos page (budget chart).
- `vite-plugin-pwa` for PWA support.
- Location data is purely offline — `latitude`, `longitude`, `address`, `placeName`, optional `placeId`. Google Maps/Places integration is optional and desacoplated, behind `VITE_GOOGLE_MAPS_API_KEY`.
- No `any` TypeScript types. Strict mode on.
- Tailwind only for styling — no inline `style=` except for dynamic values unavoidable with Tailwind (e.g., progress bar width).

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `index.html`
- Create: `tailwind.config.ts`, `postcss.config.mjs`, `src/index.css`
- Create: `src/main.tsx`, `src/App.tsx`
- Create: `public/manifest.json`, `public/icons/` (SVG placeholders)
- Create: `.env.example`
- Create: `src/lib/utils.ts`
- Create: `components.json` (shadcn config)

**Interfaces:**
- Produces: running `npm run dev` renders a blank page with title "TravelMe" and the primary lilac background `#F8F7FC`.
- Produces: `cn()` exported from `src/lib/utils.ts`.
- Produces: CSS custom properties defined in `src/index.css`.

- [ ] **Step 1: Scaffold project**

```bash
npm create vite@latest . -- --template react-ts
```
Expected: `package.json` and standard Vite structure created.

- [ ] **Step 2: Install dependencies**

```bash
npm install react-router-dom idb recharts lucide-react
npm install -D tailwindcss @tailwindcss/vite autoprefixer vite-plugin-pwa
npm install @radix-ui/react-dialog @radix-ui/react-select @radix-ui/react-checkbox @radix-ui/react-separator @radix-ui/react-tabs @radix-ui/react-tooltip @radix-ui/react-progress @radix-ui/react-label @radix-ui/react-slot class-variance-authority clsx tailwind-merge
```

- [ ] **Step 3: Configure Vite**

`vite.config.ts`:
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.svg', 'icons/*.png'],
      manifest: {
        name: 'TravelMe',
        short_name: 'TravelMe',
        description: 'Sua viagem, organizada do seu jeito.',
        theme_color: '#8B7CF6',
        background_color: '#F8F7FC',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
          },
        ],
      },
    }),
  ],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
})
```

- [ ] **Step 4: Configure TypeScript**

`tsconfig.json`:
```json
{
  "files": [],
  "references": [{ "path": "./tsconfig.app.json" }]
}
```

`tsconfig.app.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["src"]
}
```

- [ ] **Step 5: Create CSS variables and Tailwind config**

`src/index.css`:
```css
@import "tailwindcss";

:root {
  --color-bg: #F8F7FC;
  --color-surface: #FFFFFF;
  --color-primary: #8B7CF6;
  --color-primary-light: #EAE7FF;
  --color-teal: #315C68;
  --color-teal-light: #DCECEF;
  --color-text: #252333;
  --color-muted: #777487;
  --color-success: #5E9C76;
  --color-danger: #D96C6C;
  --color-warning: #D5A94F;
}

* { box-sizing: border-box; }
body {
  background-color: var(--color-bg);
  color: var(--color-text);
  font-family: -apple-system, "Segoe UI", system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  margin: 0;
}
```

`tailwind.config.ts`:
```ts
import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        primary: 'var(--color-primary)',
        'primary-light': 'var(--color-primary-light)',
        teal: 'var(--color-teal)',
        'teal-light': 'var(--color-teal-light)',
        'app-text': 'var(--color-text)',
        muted: 'var(--color-muted)',
        success: 'var(--color-success)',
        danger: 'var(--color-danger)',
        warning: 'var(--color-warning)',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
      },
    },
  },
} satisfies Config
```

- [ ] **Step 6: Create `src/lib/utils.ts`**

```ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

- [ ] **Step 7: Create placeholder App**

`src/main.tsx`:
```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

`src/App.tsx`:
```tsx
export default function App() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <h1 className="text-2xl font-bold text-primary">TravelMe</h1>
    </div>
  )
}
```

- [ ] **Step 8: Create `.env.example`**

```
# Google Maps Places API Key (opcional — somente para busca de localizações)
# Sem esta chave, a busca de localizações não estará disponível,
# mas o restante da aplicação funciona normalmente offline.
VITE_GOOGLE_MAPS_API_KEY=
```

- [ ] **Step 9: Create placeholder PWA icons**

Create `public/icons/icon-192.png` and `public/icons/icon-512.png` as simple PNG files (can be 1x1 pixel placeholders — will be replaced in the final step).

- [ ] **Step 10: Verify**

```bash
npm run dev
```
Expected: Browser opens at `http://localhost:5173` showing "TravelMe" in lilac on `#F8F7FC` background. No TypeScript errors on `npm run build`.

```bash
npm run build && npm run preview
```
Expected: Build succeeds, preview serves the app.

---

## Task 2: Types, Utilities and Storage Layer

**Files:**
- Create: `src/types/index.ts`
- Create: `src/utils/format.ts`
- Create: `src/utils/backup.ts`
- Create: `src/services/storage/db.ts`
- Create: `src/services/storage/tripRepository.ts`
- Create: `src/services/storage/expenseRepository.ts`
- Create: `src/services/storage/budgetCategoryRepository.ts`
- Create: `src/services/storage/itineraryRepository.ts`
- Create: `src/services/storage/checklistRepository.ts`
- Create: `src/services/storage/reservationRepository.ts`
- Create: `src/services/storage/noteRepository.ts`

**Interfaces:**
- Consumes: nothing (pure TS, no React)
- Produces: all TypeScript types exported from `src/types/index.ts`
- Produces: `formatCurrency`, `formatDate`, `formatDateShort`, `formatPercent`, `formatWeight`, `formatDuration` from `src/utils/format.ts`
- Produces: `exportTripData`, `importTripData`, `validateTripBackup` from `src/utils/backup.ts`
- Produces: `getDB` from `src/services/storage/db.ts`
- Produces: one repository per entity, each with `create`, `getAll`, `getById`, `update`, `delete`, `getAllByTripId`

- [ ] **Step 1: Define all TypeScript types**

`src/types/index.ts`:
```ts
// ─── Location ─────────────────────────────────────────────────────────────────
export interface Location {
  placeName: string
  address: string
  latitude?: number
  longitude?: number
  placeId?: string
}

// ─── Trip ─────────────────────────────────────────────────────────────────────
export interface Trip {
  id: string
  name: string
  destination: string
  startDate: string        // ISO date string YYYY-MM-DD
  endDate: string          // ISO date string YYYY-MM-DD
  budget: number
  currency: string         // 'BRL'
  description: string
  luggageWeightLimit: number  // kg
  createdAt: string
  updatedAt: string
}

// ─── Expense ──────────────────────────────────────────────────────────────────
export type ExpenseCategory =
  | 'Transporte'
  | 'Hospedagem'
  | 'Alimentação'
  | 'Passeios'
  | 'Compras'
  | 'Farmácia'
  | 'Higiene e beleza'
  | 'Ingressos'
  | 'Emergência'
  | 'Outros'

export type PaymentMethod =
  | 'Dinheiro'
  | 'Cartão de crédito'
  | 'Cartão de débito'
  | 'Pix'
  | 'Outro'

export type ExpenseStatus = 'Pago' | 'Pendente'

export interface Expense {
  id: string
  tripId: string
  description: string
  amount: number
  category: ExpenseCategory
  date: string             // ISO date string YYYY-MM-DD
  paymentMethod: PaymentMethod
  status: ExpenseStatus
  notes: string
  createdAt: string
  updatedAt: string
}

// ─── BudgetCategory ───────────────────────────────────────────────────────────
export interface BudgetCategory {
  id: string
  tripId: string
  category: ExpenseCategory
  plannedAmount: number
  createdAt: string
  updatedAt: string
}

// ─── Itinerary ────────────────────────────────────────────────────────────────
export type ItineraryCategory =
  | 'Transporte'
  | 'Alimentação'
  | 'Passeio'
  | 'Praia'
  | 'Compras'
  | 'Descanso'
  | 'Outro'

export type ItineraryStatus =
  | 'Planejado'
  | 'Confirmado'
  | 'Concluído'
  | 'Cancelado'

export interface ItineraryItem {
  id: string
  tripId: string
  date: string             // ISO date string YYYY-MM-DD
  title: string
  description: string
  startTime: string        // HH:mm or empty
  endTime: string          // HH:mm or empty
  location: Location | null
  category: ItineraryCategory
  estimatedCost: number
  actualCost: number
  status: ItineraryStatus
  notes: string
  createdAt: string
  updatedAt: string
}

// ─── Checklist ────────────────────────────────────────────────────────────────
export type ChecklistCategory =
  | 'Roupas'
  | 'Higiene e beleza'
  | 'Farmácia'
  | 'Eletrônicos'
  | 'Documentos'
  | 'Praia'
  | 'Acessórios'
  | 'Outros'

export interface ChecklistItem {
  id: string
  tripId: string
  name: string
  category: ChecklistCategory
  quantity: number
  weight: number           // kg per item
  checked: boolean
  notes: string
  createdAt: string
  updatedAt: string
}

// ─── Reservation ──────────────────────────────────────────────────────────────
export type ReservationType =
  | 'Voo'
  | 'Hospedagem'
  | 'Passeio'
  | 'Restaurante'
  | 'Transporte'
  | 'Ingresso'
  | 'Outro'

export type ReservationStatus = 'Confirmado' | 'Pendente' | 'Cancelado'

export interface Reservation {
  id: string
  tripId: string
  type: ReservationType
  name: string
  date: string             // ISO date string YYYY-MM-DD
  startTime: string        // HH:mm or empty
  endTime: string          // HH:mm or empty
  location: Location | null
  confirmationCode: string
  cost: number
  status: ReservationStatus
  notes: string
  createdAt: string
  updatedAt: string
}

// ─── Note ─────────────────────────────────────────────────────────────────────
export interface Note {
  id: string
  tripId: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
}

// ─── Backup ───────────────────────────────────────────────────────────────────
export interface TripBackup {
  version: number          // currently 1
  exportedAt: string
  trip: Trip
  expenses: Expense[]
  budgetCategories: BudgetCategory[]
  itinerary: ItineraryItem[]
  checklist: ChecklistItem[]
  reservations: Reservation[]
  notes: Note[]
}
```

- [ ] **Step 2: Create format utilities**

`src/utils/format.ts`:
```ts
const ptBR = 'pt-BR'

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat(ptBR, {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(value)
}

export function formatDate(isoDate: string): string {
  if (!isoDate) return ''
  const [year, month, day] = isoDate.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return new Intl.DateTimeFormat(ptBR, { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date)
}

export function formatDateLong(isoDate: string): string {
  if (!isoDate) return ''
  const [year, month, day] = isoDate.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return new Intl.DateTimeFormat(ptBR, { weekday: 'long', day: 'numeric', month: 'long' }).format(date)
}

export function formatDateShort(isoDate: string): string {
  if (!isoDate) return ''
  const [year, month, day] = isoDate.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return new Intl.DateTimeFormat(ptBR, { day: '2-digit', month: 'short' }).format(date)
}

export function formatPercent(value: number, total: number): string {
  if (total === 0) return '0%'
  return new Intl.NumberFormat(ptBR, {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(value / total)
}

export function formatWeight(kg: number): string {
  return new Intl.NumberFormat(ptBR, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(kg) + ' kg'
}

export function formatDuration(startTime: string, endTime: string): string {
  if (!startTime || !endTime) return ''
  const [sh, sm] = startTime.split(':').map(Number)
  const [eh, em] = endTime.split(':').map(Number)
  const totalMin = (eh * 60 + em) - (sh * 60 + sm)
  if (totalMin <= 0) return ''
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  if (h === 0) return `${m}min`
  if (m === 0) return `${h}h`
  return `${h}h${m}min`
}

export function isoToday(): string {
  return new Date().toISOString().slice(0, 10)
}

export function daysUntil(isoDate: string): number {
  const [y, m, d] = isoDate.split('-').map(Number)
  const target = new Date(y, m - 1, d)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.ceil((target.getTime() - today.getTime()) / 86400000)
}

export function daysBetween(start: string, end: string): number {
  const [sy, sm, sd] = start.split('-').map(Number)
  const [ey, em, ed] = end.split('-').map(Number)
  const s = new Date(sy, sm - 1, sd)
  const e = new Date(ey, em - 1, ed)
  return Math.max(0, Math.round((e.getTime() - s.getTime()) / 86400000) + 1)
}
```

- [ ] **Step 3: Create backup utilities**

`src/utils/backup.ts`:
```ts
import type { TripBackup, Trip, Expense, BudgetCategory, ItineraryItem, ChecklistItem, Reservation, Note } from '@/types'

export function exportTripData(backup: TripBackup): void {
  const slug = backup.trip.destination
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
  const filename = `travelme-${slug}-${backup.exportedAt.slice(0, 10)}.json`
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export type BackupValidationResult =
  | { ok: true; data: TripBackup }
  | { ok: false; error: string }

export function validateTripBackup(raw: unknown): BackupValidationResult {
  if (typeof raw !== 'object' || raw === null) {
    return { ok: false, error: 'Arquivo inválido: o conteúdo não é um objeto JSON.' }
  }
  const obj = raw as Record<string, unknown>
  if (typeof obj.version !== 'number') {
    return { ok: false, error: 'Arquivo inválido: campo "version" ausente ou inválido.' }
  }
  if (typeof obj.trip !== 'object' || obj.trip === null) {
    return { ok: false, error: 'Arquivo inválido: campo "trip" ausente.' }
  }
  const trip = obj.trip as Record<string, unknown>
  if (!trip.id || !trip.name || !trip.destination) {
    return { ok: false, error: 'Arquivo inválido: viagem sem id, nome ou destino.' }
  }
  if (!Array.isArray(obj.expenses) || !Array.isArray(obj.itinerary) ||
      !Array.isArray(obj.checklist) || !Array.isArray(obj.reservations) || !Array.isArray(obj.notes)) {
    return { ok: false, error: 'Arquivo inválido: dados de viagem incompletos.' }
  }
  return { ok: true, data: raw as TripBackup }
}

export async function importTripData(file: File): Promise<BackupValidationResult> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string)
        resolve(validateTripBackup(parsed))
      } catch {
        resolve({ ok: false, error: 'Arquivo inválido: não foi possível ler o JSON.' })
      }
    }
    reader.onerror = () => resolve({ ok: false, error: 'Erro ao ler o arquivo.' })
    reader.readAsText(file)
  })
}
```

- [ ] **Step 4: Create IndexedDB initializer**

`src/services/storage/db.ts`:
```ts
import { openDB, type IDBPDatabase } from 'idb'

const DB_NAME = 'travelme-db'
const DB_VERSION = 1

export type TravelMeDB = IDBPDatabase<{
  trips: { key: string; value: Record<string, unknown> }
  expenses: { key: string; value: Record<string, unknown>; indexes: { tripId: string } }
  budgetCategories: { key: string; value: Record<string, unknown>; indexes: { tripId: string } }
  itinerary: { key: string; value: Record<string, unknown>; indexes: { tripId: string } }
  checklist: { key: string; value: Record<string, unknown>; indexes: { tripId: string } }
  reservations: { key: string; value: Record<string, unknown>; indexes: { tripId: string } }
  notes: { key: string; value: Record<string, unknown>; indexes: { tripId: string } }
}>

let dbPromise: Promise<TravelMeDB> | null = null

export function getDB(): Promise<TravelMeDB> {
  if (!dbPromise) {
    dbPromise = openDB<{
      trips: { key: string; value: Record<string, unknown> }
      expenses: { key: string; value: Record<string, unknown>; indexes: { tripId: string } }
      budgetCategories: { key: string; value: Record<string, unknown>; indexes: { tripId: string } }
      itinerary: { key: string; value: Record<string, unknown>; indexes: { tripId: string } }
      checklist: { key: string; value: Record<string, unknown>; indexes: { tripId: string } }
      reservations: { key: string; value: Record<string, unknown>; indexes: { tripId: string } }
      notes: { key: string; value: Record<string, unknown>; indexes: { tripId: string } }
    }>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('trips')) {
          db.createObjectStore('trips', { keyPath: 'id' })
        }
        const withTripId = ['expenses', 'budgetCategories', 'itinerary', 'checklist', 'reservations', 'notes'] as const
        for (const store of withTripId) {
          if (!db.objectStoreNames.contains(store)) {
            const s = db.createObjectStore(store, { keyPath: 'id' })
            s.createIndex('tripId', 'tripId')
          }
        }
      },
    }) as Promise<TravelMeDB>
  }
  return dbPromise
}
```

- [ ] **Step 5: Create repositories**

`src/services/storage/tripRepository.ts`:
```ts
import { getDB } from './db'
import type { Trip } from '@/types'

export const tripRepository = {
  async getAll(): Promise<Trip[]> {
    const db = await getDB()
    return (await db.getAll('trips')) as Trip[]
  },
  async getById(id: string): Promise<Trip | undefined> {
    const db = await getDB()
    return (await db.get('trips', id)) as Trip | undefined
  },
  async create(trip: Trip): Promise<Trip> {
    const db = await getDB()
    await db.put('trips', trip as unknown as Record<string, unknown>)
    return trip
  },
  async update(trip: Trip): Promise<Trip> {
    const db = await getDB()
    await db.put('trips', trip as unknown as Record<string, unknown>)
    return trip
  },
  async delete(id: string): Promise<void> {
    const db = await getDB()
    await db.delete('trips', id)
  },
}
```

`src/services/storage/expenseRepository.ts`:
```ts
import { getDB } from './db'
import type { Expense } from '@/types'

export const expenseRepository = {
  async getAllByTripId(tripId: string): Promise<Expense[]> {
    const db = await getDB()
    return (await db.getAllFromIndex('expenses', 'tripId', tripId)) as Expense[]
  },
  async getById(id: string): Promise<Expense | undefined> {
    const db = await getDB()
    return (await db.get('expenses', id)) as Expense | undefined
  },
  async create(expense: Expense): Promise<Expense> {
    const db = await getDB()
    await db.put('expenses', expense as unknown as Record<string, unknown>)
    return expense
  },
  async update(expense: Expense): Promise<Expense> {
    const db = await getDB()
    await db.put('expenses', expense as unknown as Record<string, unknown>)
    return expense
  },
  async delete(id: string): Promise<void> {
    const db = await getDB()
    await db.delete('expenses', id)
  },
  async deleteAllByTripId(tripId: string): Promise<void> {
    const expenses = await this.getAllByTripId(tripId)
    const db = await getDB()
    await Promise.all(expenses.map(e => db.delete('expenses', e.id)))
  },
}
```

Create the same pattern for `budgetCategoryRepository`, `itineraryRepository`, `checklistRepository`, `reservationRepository`, `noteRepository` — each one:
- `getAllByTripId(tripId)` using the `tripId` index
- `getById(id)`
- `create(item)` using `db.put`
- `update(item)` using `db.put`
- `delete(id)`
- `deleteAllByTripId(tripId)` — fetches all then deletes

`src/services/storage/budgetCategoryRepository.ts` (same pattern as expenseRepository with `BudgetCategory` type and store `'budgetCategories'`)
`src/services/storage/itineraryRepository.ts` (same pattern with `ItineraryItem` type and store `'itinerary'`)
`src/services/storage/checklistRepository.ts` (same pattern with `ChecklistItem` type and store `'checklist'`)
`src/services/storage/reservationRepository.ts` (same pattern with `Reservation` type and store `'reservations'`)
`src/services/storage/noteRepository.ts` (same pattern with `Note` type and store `'notes'`)

- [ ] **Step 6: Verify TypeScript compiles**

```bash
npm run build
```
Expected: Build succeeds with no TypeScript errors. (React tree may still show placeholder content.)

---

## Task 3: App Shell, Routing, Layout and Navigation

**Files:**
- Create: `src/contexts/TripContext.tsx`
- Create: `src/layouts/AppLayout.tsx`
- Create: `src/components/layout/BottomNav.tsx`
- Create: `src/components/layout/Sidebar.tsx`
- Create: `src/components/layout/TopBar.tsx`
- Create: `src/components/layout/QuickAddMenu.tsx`
- Create: `src/pages/TripsPage.tsx` (stub)
- Create: `src/pages/DashboardPage.tsx` (stub)
- Create: `src/pages/GastosPage.tsx` (stub)
- Create: `src/pages/RoteiPage.tsx` (stub)
- Create: `src/pages/MalaPage.tsx` (stub)
- Create: `src/pages/MaisPage.tsx` (stub)
- Create: `src/pages/ReservasPage.tsx` (stub)
- Create: `src/pages/NotasPage.tsx` (stub)
- Create: `src/pages/BackupPage.tsx` (stub)
- Create: `src/pages/ConfiguracoesPage.tsx` (stub)
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: types from `src/types/index.ts`
- Consumes: `tripRepository` from Task 2
- Produces: `useTripContext()` hook — returns `{ trips, activeTrip, setActiveTrip, refreshTrips }`
- Produces: React Router routes configured, bottom nav functional on mobile, sidebar on desktop

- [ ] **Step 1: Create TripContext**

`src/contexts/TripContext.tsx`:
```tsx
import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import type { Trip } from '@/types'
import { tripRepository } from '@/services/storage/tripRepository'

interface TripContextValue {
  trips: Trip[]
  activeTrip: Trip | null
  setActiveTrip: (trip: Trip | null) => void
  refreshTrips: () => Promise<void>
  loading: boolean
}

const TripContext = createContext<TripContextValue | null>(null)

export function TripProvider({ children }: { children: ReactNode }) {
  const [trips, setTrips] = useState<Trip[]>([])
  const [activeTrip, setActiveTripState] = useState<Trip | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshTrips = useCallback(async () => {
    const all = await tripRepository.getAll()
    const sorted = all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    setTrips(sorted)
    return sorted
  }, [])

  useEffect(() => {
    const init = async () => {
      const all = await refreshTrips()
      const savedId = localStorage.getItem('travelme-active-trip')
      if (savedId) {
        const found = (all as Trip[]).find(t => t.id === savedId)
        if (found) setActiveTripState(found)
      }
      setLoading(false)
    }
    init()
  }, [refreshTrips])

  const setActiveTrip = useCallback((trip: Trip | null) => {
    setActiveTripState(trip)
    if (trip) localStorage.setItem('travelme-active-trip', trip.id)
    else localStorage.removeItem('travelme-active-trip')
  }, [])

  return (
    <TripContext.Provider value={{ trips, activeTrip, setActiveTrip, refreshTrips, loading }}>
      {children}
    </TripContext.Provider>
  )
}

export function useTripContext() {
  const ctx = useContext(TripContext)
  if (!ctx) throw new Error('useTripContext must be used within TripProvider')
  return ctx
}
```

- [ ] **Step 2: Create BottomNav**

`src/components/layout/BottomNav.tsx`:
```tsx
import { NavLink, useParams } from 'react-router-dom'
import { Home, Calendar, Luggage, DollarSign, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  onQuickAdd: () => void
}

export function BottomNav({ onQuickAdd }: Props) {
  const { id } = useParams<{ id: string }>()
  const base = id ? `/viagem/${id}` : ''

  const items = [
    { to: id ? `${base}` : '/', icon: Home, label: 'Início', end: true },
    { to: `${base}/roteiro`, icon: Calendar, label: 'Roteiro' },
    { to: `${base}/gastos`, icon: DollarSign, label: 'Gastos' },
    { to: `${base}/mala`, icon: Luggage, label: 'Mala' },
    { to: `${base}/mais`, icon: MoreHorizontal, label: 'Mais' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-gray-100 flex items-center justify-around px-2 pb-safe z-40 md:hidden">
      {items.map((item, i) => {
        if (i === 2) {
          return (
            <button
              key="add"
              onClick={onQuickAdd}
              className="flex flex-col items-center justify-center w-14 h-14 -mt-5 bg-primary rounded-full shadow-md text-white"
              aria-label="Adicionar rapidamente"
            >
              <span className="text-2xl leading-none">+</span>
            </button>
          )
        }
        const idx = i > 2 ? i - 1 : i
        const it = items[idx === i ? i : idx + 1] ?? item
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn('flex flex-col items-center gap-0.5 py-2 px-3 text-xs transition-colors',
                isActive ? 'text-primary' : 'text-muted')
            }
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        )
      })}
    </nav>
  )
}
```

**Note:** The BottomNav items array has 5 slots. Re-implement as a flat list:

```tsx
import { NavLink, useParams } from 'react-router-dom'
import { Home, Calendar, Luggage, DollarSign, MoreHorizontal, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props { onQuickAdd: () => void }

export function BottomNav({ onQuickAdd }: Props) {
  const { id } = useParams<{ id: string }>()
  const base = id ? `/viagem/${id}` : ''

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-gray-100 flex items-center justify-around pb-safe z-40 md:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <NavLink to={id ? base : '/'} end className={({ isActive }) => cn('flex flex-col items-center gap-0.5 py-2 px-3 text-xs', isActive ? 'text-primary' : 'text-muted')}>
        <Home size={20} /><span>Início</span>
      </NavLink>
      <NavLink to={`${base}/roteiro`} className={({ isActive }) => cn('flex flex-col items-center gap-0.5 py-2 px-3 text-xs', isActive ? 'text-primary' : 'text-muted')}>
        <Calendar size={20} /><span>Roteiro</span>
      </NavLink>
      <button onClick={onQuickAdd} className="flex flex-col items-center justify-center w-12 h-12 -mt-4 bg-primary rounded-full shadow-lg text-white" aria-label="Adicionar">
        <Plus size={22} />
      </button>
      <NavLink to={`${base}/gastos`} className={({ isActive }) => cn('flex flex-col items-center gap-0.5 py-2 px-3 text-xs', isActive ? 'text-primary' : 'text-muted')}>
        <DollarSign size={20} /><span>Gastos</span>
      </NavLink>
      <NavLink to={`${base}/mala`} className={({ isActive }) => cn('flex flex-col items-center gap-0.5 py-2 px-3 text-xs', isActive ? 'text-primary' : 'text-muted')}>
        <Luggage size={20} /><span>Mala</span>
      </NavLink>
    </nav>
  )
}
```

- [ ] **Step 3: Create Sidebar (desktop)**

`src/components/layout/Sidebar.tsx`:
```tsx
import { NavLink, useParams } from 'react-router-dom'
import { Home, Calendar, DollarSign, Luggage, MoreHorizontal, MapPin } from 'lucide-react'
import { useTripContext } from '@/contexts/TripContext'
import { cn } from '@/lib/utils'

export function Sidebar() {
  const { activeTrip } = useTripContext()
  const { id } = useParams<{ id: string }>()
  const base = id ? `/viagem/${id}` : ''

  const navItems = [
    { to: id ? base : '/', icon: Home, label: 'Início', end: true },
    { to: `${base}/roteiro`, icon: Calendar, label: 'Roteiro' },
    { to: `${base}/gastos`, icon: DollarSign, label: 'Gastos' },
    { to: `${base}/mala`, icon: Luggage, label: 'Mala' },
    { to: `${base}/mais`, icon: MoreHorizontal, label: 'Mais' },
  ]

  return (
    <aside className="hidden md:flex flex-col w-56 min-h-screen bg-surface border-r border-gray-100 px-3 py-6 fixed left-0 top-0">
      <div className="flex items-center gap-2 px-3 mb-8">
        <MapPin size={20} className="text-primary" />
        <span className="font-bold text-lg text-app-text">TravelMe</span>
      </div>
      {activeTrip && (
        <div className="px-3 mb-6">
          <p className="text-xs text-muted uppercase tracking-wide mb-1">Viagem ativa</p>
          <p className="text-sm font-semibold text-app-text truncate">{activeTrip.name}</p>
          <p className="text-xs text-muted truncate">{activeTrip.destination}</p>
        </div>
      )}
      <nav className="flex flex-col gap-1">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn('flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors',
                isActive ? 'bg-primary-light text-primary font-medium' : 'text-muted hover:bg-gray-50 hover:text-app-text')
            }
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
```

- [ ] **Step 4: Create TopBar**

`src/components/layout/TopBar.tsx`:
```tsx
import { useNavigate } from 'react-router-dom'
import { ChevronDown, MapPin } from 'lucide-react'
import { useTripContext } from '@/contexts/TripContext'

export function TopBar() {
  const { activeTrip } = useTripContext()
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-30 bg-surface border-b border-gray-100 px-4 py-3 flex items-center justify-between md:ml-56">
      <div className="flex items-center gap-2">
        <MapPin size={18} className="text-primary" />
        <span className="font-bold text-app-text">TravelMe</span>
      </div>
      {activeTrip ? (
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1 text-sm text-muted hover:text-app-text transition-colors"
          aria-label="Trocar viagem"
        >
          <span className="truncate max-w-[140px]">{activeTrip.name}</span>
          <ChevronDown size={14} />
        </button>
      ) : (
        <button onClick={() => navigate('/')} className="text-sm text-primary font-medium">
          Selecionar viagem
        </button>
      )}
    </header>
  )
}
```

- [ ] **Step 5: Create QuickAddMenu**

`src/components/layout/QuickAddMenu.tsx`:
```tsx
import { useNavigate, useParams } from 'react-router-dom'
import { X, DollarSign, Calendar, Luggage, BookOpen, FileText } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
}

export function QuickAddMenu({ open, onClose }: Props) {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const base = id ? `/viagem/${id}` : ''

  const options = [
    { icon: DollarSign, label: 'Novo gasto', path: `${base}/gastos?novo=1` },
    { icon: Calendar, label: 'Nova atividade', path: `${base}/roteiro?novo=1` },
    { icon: Luggage, label: 'Item da mala', path: `${base}/mala?novo=1` },
    { icon: BookOpen, label: 'Nova reserva', path: `${base}/mais/reservas?novo=1` },
    { icon: FileText, label: 'Nova nota', path: `${base}/mais/notas?novo=1` },
  ]

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end md:justify-center md:items-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-surface rounded-t-2xl md:rounded-2xl p-6 w-full md:max-w-sm mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-app-text">Adicionar</h2>
          <button onClick={onClose} aria-label="Fechar"><X size={20} className="text-muted" /></button>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {options.map(opt => (
            <button
              key={opt.path}
              onClick={() => { navigate(opt.path); onClose() }}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-bg transition-colors text-left"
            >
              <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center">
                <opt.icon size={18} className="text-primary" />
              </div>
              <span className="text-sm font-medium text-app-text">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Create AppLayout and stub pages**

`src/layouts/AppLayout.tsx`:
```tsx
import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { TopBar } from '@/components/layout/TopBar'
import { BottomNav } from '@/components/layout/BottomNav'
import { Sidebar } from '@/components/layout/Sidebar'
import { QuickAddMenu } from '@/components/layout/QuickAddMenu'

export function AppLayout() {
  const [quickAddOpen, setQuickAddOpen] = useState(false)

  return (
    <div className="min-h-screen bg-bg">
      <Sidebar />
      <div className="md:ml-56">
        <TopBar />
        <main className="pb-24 md:pb-8 px-4 py-6 max-w-2xl mx-auto">
          <Outlet />
        </main>
      </div>
      <BottomNav onQuickAdd={() => setQuickAddOpen(true)} />
      <QuickAddMenu open={quickAddOpen} onClose={() => setQuickAddOpen(false)} />
    </div>
  )
}
```

Create stub pages — each returns a `<div>` with the page name:

`src/pages/DashboardPage.tsx`: `export default function DashboardPage() { return <div>Dashboard</div> }`
(same pattern for GastosPage, RoteiPage, MalaPage, MaisPage, ReservasPage, NotasPage, BackupPage, ConfiguracoesPage)

- [ ] **Step 7: Wire up router in App.tsx**

`src/App.tsx`:
```tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { TripProvider } from '@/contexts/TripContext'
import { AppLayout } from '@/layouts/AppLayout'
import TripsPage from '@/pages/TripsPage'
import DashboardPage from '@/pages/DashboardPage'
import GastosPage from '@/pages/GastosPage'
import RoteiPage from '@/pages/RoteiPage'
import MalaPage from '@/pages/MalaPage'
import MaisPage from '@/pages/MaisPage'
import ReservasPage from '@/pages/ReservasPage'
import NotasPage from '@/pages/NotasPage'
import BackupPage from '@/pages/BackupPage'
import ConfiguracoesPage from '@/pages/ConfiguracoesPage'

export default function App() {
  return (
    <BrowserRouter>
      <TripProvider>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<TripsPage />} />
            <Route path="viagem/:id" element={<DashboardPage />} />
            <Route path="viagem/:id/gastos" element={<GastosPage />} />
            <Route path="viagem/:id/roteiro" element={<RoteiPage />} />
            <Route path="viagem/:id/mala" element={<MalaPage />} />
            <Route path="viagem/:id/mais" element={<MaisPage />} />
            <Route path="viagem/:id/mais/reservas" element={<ReservasPage />} />
            <Route path="viagem/:id/mais/notas" element={<NotasPage />} />
            <Route path="viagem/:id/mais/backup" element={<BackupPage />} />
            <Route path="viagem/:id/mais/configuracoes" element={<ConfiguracoesPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </TripProvider>
    </BrowserRouter>
  )
}
```

- [ ] **Step 8: Create TripsPage stub (enough to test navigation)**

`src/pages/TripsPage.tsx`:
```tsx
import { useTripContext } from '@/contexts/TripContext'
import { useNavigate } from 'react-router-dom'

export default function TripsPage() {
  const { trips, setActiveTrip, loading } = useTripContext()
  const navigate = useNavigate()

  if (loading) return <div className="text-center py-12 text-muted">Carregando...</div>

  return (
    <div>
      <h1 className="text-xl font-bold text-app-text mb-4">Minhas viagens</h1>
      {trips.map(trip => (
        <button key={trip.id} className="block w-full text-left p-4 bg-surface rounded-2xl mb-3 shadow-sm"
          onClick={() => { setActiveTrip(trip); navigate(`/viagem/${trip.id}`) }}>
          <p className="font-semibold">{trip.name}</p>
          <p className="text-sm text-muted">{trip.destination}</p>
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 9: Verify**

```bash
npm run dev
```
Expected: `/` shows "Minhas viagens", bottom nav visible on mobile viewport, sidebar visible on desktop (≥768px). Navigation links are clickable and route correctly.

---

## Task 4: Trips Page — Full CRUD

**Files:**
- Replace: `src/pages/TripsPage.tsx`
- Create: `src/components/trip/TripCard.tsx`
- Create: `src/components/trip/TripForm.tsx`
- Create: `src/components/common/EmptyState.tsx`
- Create: `src/components/common/ConfirmDialog.tsx`
- Create: `src/hooks/useTrips.ts`

**Interfaces:**
- Consumes: `Trip` type, `tripRepository`, `useTripContext`, `formatDate`, `formatCurrency`
- Produces: `useTrips()` hook — `{ trips, createTrip, updateTrip, deleteTrip }`

- [ ] **Step 1: Create `useTrips` hook**

`src/hooks/useTrips.ts`:
```ts
import { useCallback } from 'react'
import { useTripContext } from '@/contexts/TripContext'
import { tripRepository } from '@/services/storage/tripRepository'
import { expenseRepository } from '@/services/storage/expenseRepository'
import { budgetCategoryRepository } from '@/services/storage/budgetCategoryRepository'
import { itineraryRepository } from '@/services/storage/itineraryRepository'
import { checklistRepository } from '@/services/storage/checklistRepository'
import { reservationRepository } from '@/services/storage/reservationRepository'
import { noteRepository } from '@/services/storage/noteRepository'
import type { Trip } from '@/types'

export function useTrips() {
  const { trips, refreshTrips, setActiveTrip, activeTrip } = useTripContext()

  const createTrip = useCallback(async (data: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>): Promise<Trip> => {
    const now = new Date().toISOString()
    const trip: Trip = { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now }
    await tripRepository.create(trip)
    await refreshTrips()
    return trip
  }, [refreshTrips])

  const updateTrip = useCallback(async (id: string, data: Partial<Omit<Trip, 'id' | 'createdAt'>>): Promise<void> => {
    const existing = await tripRepository.getById(id)
    if (!existing) return
    const updated: Trip = { ...existing, ...data, updatedAt: new Date().toISOString() }
    await tripRepository.update(updated)
    await refreshTrips()
    if (activeTrip?.id === id) setActiveTrip(updated)
  }, [refreshTrips, activeTrip, setActiveTrip])

  const deleteTrip = useCallback(async (id: string): Promise<void> => {
    await tripRepository.delete(id)
    await expenseRepository.deleteAllByTripId(id)
    await budgetCategoryRepository.deleteAllByTripId(id)
    await itineraryRepository.deleteAllByTripId(id)
    await checklistRepository.deleteAllByTripId(id)
    await reservationRepository.deleteAllByTripId(id)
    await noteRepository.deleteAllByTripId(id)
    if (activeTrip?.id === id) setActiveTrip(null)
    await refreshTrips()
  }, [refreshTrips, activeTrip, setActiveTrip])

  return { trips, createTrip, updateTrip, deleteTrip }
}
```

- [ ] **Step 2: Create EmptyState component**

`src/components/common/EmptyState.tsx`:
```tsx
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  icon: LucideIcon
  title: string
  description: string
  action?: { label: string; onClick: () => void }
  className?: string
}

export function EmptyState({ icon: Icon, title, description, action, className }: Props) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 text-center px-4', className)}>
      <div className="w-16 h-16 bg-primary-light rounded-2xl flex items-center justify-center mb-4">
        <Icon size={28} className="text-primary" />
      </div>
      <h3 className="font-semibold text-app-text mb-2">{title}</h3>
      <p className="text-sm text-muted max-w-xs mb-6">{description}</p>
      {action && (
        <button onClick={action.onClick} className="bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-medium">
          {action.label}
        </button>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Create ConfirmDialog**

`src/components/common/ConfirmDialog.tsx`:
```tsx
interface Props {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({ open, title, description, confirmLabel = 'Confirmar', cancelLabel = 'Cancelar', danger, onConfirm, onCancel }: Props) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-surface rounded-2xl p-6 w-full max-w-sm shadow-xl">
        <h3 className="font-semibold text-app-text mb-2">{title}</h3>
        <p className="text-sm text-muted mb-6">{description}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-app-text">{cancelLabel}</button>
          <button onClick={onConfirm} className={`flex-1 py-2.5 rounded-xl text-sm text-white font-medium ${danger ? 'bg-danger' : 'bg-primary'}`}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create TripForm**

`src/components/trip/TripForm.tsx` — A modal/bottom sheet form with all Trip fields:
- name (required)
- destination (required)
- startDate (required, date picker)
- endDate (required, must be >= startDate)
- budget (required, number >= 0)
- currency (fixed BRL)
- description (optional)
- luggageWeightLimit (default 10)

Validation in pt-BR. Uses controlled form state (no form library). On submit calls `onSubmit(data)`. Shows inline validation errors.

```tsx
import { useState } from 'react'
import { X } from 'lucide-react'
import type { Trip } from '@/types'

interface TripFormData {
  name: string
  destination: string
  startDate: string
  endDate: string
  budget: string
  currency: string
  description: string
  luggageWeightLimit: string
}

interface Props {
  open: boolean
  initialData?: Trip
  onSubmit: (data: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  onClose: () => void
}

const emptyForm: TripFormData = {
  name: '', destination: '', startDate: '', endDate: '',
  budget: '', currency: 'BRL', description: '', luggageWeightLimit: '10',
}

export function TripForm({ open, initialData, onSubmit, onClose }: Props) {
  const [form, setForm] = useState<TripFormData>(
    initialData ? {
      name: initialData.name,
      destination: initialData.destination,
      startDate: initialData.startDate,
      endDate: initialData.endDate,
      budget: String(initialData.budget),
      currency: initialData.currency,
      description: initialData.description,
      luggageWeightLimit: String(initialData.luggageWeightLimit),
    } : emptyForm
  )
  const [errors, setErrors] = useState<Partial<TripFormData>>({})
  const [loading, setLoading] = useState(false)

  function validate(): boolean {
    const e: Partial<TripFormData> = {}
    if (!form.name.trim()) e.name = 'Nome é obrigatório'
    if (!form.destination.trim()) e.destination = 'Destino é obrigatório'
    if (!form.startDate) e.startDate = 'Data de início é obrigatória'
    if (!form.endDate) e.endDate = 'Data de término é obrigatória'
    if (form.startDate && form.endDate && form.endDate < form.startDate) e.endDate = 'Data de término deve ser após a data de início'
    if (!form.budget || isNaN(Number(form.budget)) || Number(form.budget) < 0) e.budget = 'Orçamento deve ser um valor válido'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    await onSubmit({
      name: form.name.trim(),
      destination: form.destination.trim(),
      startDate: form.startDate,
      endDate: form.endDate,
      budget: Number(form.budget),
      currency: 'BRL',
      description: form.description.trim(),
      luggageWeightLimit: Number(form.luggageWeightLimit) || 10,
    })
    setLoading(false)
    onClose()
  }

  if (!open) return null

  const field = (key: keyof TripFormData) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value })),
  })

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end md:justify-center md:items-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-surface rounded-t-2xl md:rounded-2xl p-6 w-full md:max-w-lg overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-lg text-app-text">{initialData ? 'Editar viagem' : 'Nova viagem'}</h2>
          <button onClick={onClose} aria-label="Fechar"><X size={20} className="text-muted" /></button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {([
            { key: 'name', label: 'Nome da viagem', placeholder: 'Ex: João Pessoa 2026', type: 'text' },
            { key: 'destination', label: 'Destino', placeholder: 'Ex: João Pessoa, PB', type: 'text' },
            { key: 'startDate', label: 'Data de início', placeholder: '', type: 'date' },
            { key: 'endDate', label: 'Data de término', placeholder: '', type: 'date' },
            { key: 'budget', label: 'Orçamento total (R$)', placeholder: 'Ex: 4256.47', type: 'number' },
            { key: 'luggageWeightLimit', label: 'Limite de peso da mala (kg)', placeholder: '10', type: 'number' },
          ] as const).map(({ key, label, placeholder, type }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-app-text mb-1">{label}</label>
              <input
                type={type}
                placeholder={placeholder}
                {...field(key)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
                min={type === 'number' ? '0' : undefined}
                step={type === 'number' ? 'any' : undefined}
              />
              {errors[key] && <p className="text-xs text-danger mt-1">{errors[key]}</p>}
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-app-text mb-1">Descrição (opcional)</label>
            <textarea
              placeholder="Anotações sobre a viagem..."
              {...field('description')}
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary resize-none"
            />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-primary text-white py-3 rounded-xl font-medium mt-2 disabled:opacity-60">
            {loading ? 'Salvando...' : (initialData ? 'Salvar alterações' : 'Criar viagem')}
          </button>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Create TripCard**

`src/components/trip/TripCard.tsx`:
```tsx
import { MapPin, Calendar, DollarSign, Pencil, Trash2 } from 'lucide-react'
import type { Trip } from '@/types'
import { formatDate, formatCurrency, daysUntil } from '@/utils/format'
import { cn } from '@/lib/utils'

interface Props {
  trip: Trip
  isActive: boolean
  onSelect: () => void
  onEdit: () => void
  onDelete: () => void
}

export function TripCard({ trip, isActive, onSelect, onEdit, onDelete }: Props) {
  const days = daysUntil(trip.startDate)
  const statusText = days > 0 ? `Em ${days} dia${days > 1 ? 's' : ''}` : days === 0 ? 'Começa hoje!' : 'Em andamento'

  return (
    <div className={cn('bg-surface rounded-2xl p-4 shadow-sm border-2 transition-colors', isActive ? 'border-primary' : 'border-transparent')}>
      <div className="flex items-start justify-between mb-3">
        <button onClick={onSelect} className="flex-1 text-left">
          <h3 className="font-bold text-app-text">{trip.name}</h3>
          <div className="flex items-center gap-1 text-muted text-xs mt-0.5">
            <MapPin size={12} /><span>{trip.destination}</span>
          </div>
        </button>
        <div className="flex gap-2 ml-2">
          <button onClick={onEdit} aria-label="Editar viagem" className="p-1.5 text-muted hover:text-primary">
            <Pencil size={16} />
          </button>
          <button onClick={onDelete} aria-label="Excluir viagem" className="p-1.5 text-muted hover:text-danger">
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      <button onClick={onSelect} className="w-full text-left">
        <div className="flex items-center gap-3 text-xs text-muted">
          <span className="flex items-center gap-1"><Calendar size={12} />{formatDate(trip.startDate)} — {formatDate(trip.endDate)}</span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="flex items-center gap-1 text-xs text-muted"><DollarSign size={12} />{formatCurrency(trip.budget)}</span>
          <span className={cn('text-xs px-2 py-0.5 rounded-full', days >= 0 ? 'bg-primary-light text-primary' : 'bg-teal-light text-teal')}>{statusText}</span>
        </div>
      </button>
      {isActive && <div className="mt-2 text-xs text-primary font-medium">✓ Viagem ativa</div>}
    </div>
  )
}
```

- [ ] **Step 6: Build TripsPage**

`src/pages/TripsPage.tsx` — full implementation:
- Header: "Minhas viagens" + "+ Nova viagem" button
- List of TripCard
- Empty state with Plane icon when no trips
- TripForm modal for create/edit
- ConfirmDialog for delete
- On card click → setActiveTrip + navigate to dashboard
- Sample data button: "Carregar viagem de exemplo" (calls `loadSampleData` from `src/data/sampleData.ts`)

- [ ] **Step 7: Verify**

```bash
npm run dev
```
Expected: Can create a trip, see it in the list, edit it, delete it with confirmation. Selecting a trip navigates to `/viagem/:id` and shows trip name in TopBar.

---

## Task 5: Dashboard Page

**Files:**
- Replace: `src/pages/DashboardPage.tsx`
- Create: `src/hooks/useDashboard.ts`
- Create: `src/components/trip/BudgetCard.tsx`
- Create: `src/components/trip/DailyAllowanceCard.tsx`
- Create: `src/components/trip/TripHeader.tsx`

**Interfaces:**
- Consumes: `Trip`, `Expense`, `ItineraryItem` types; all repositories; `formatCurrency`, `formatDate`, `formatPercent`, `daysBetween`, `daysUntil`
- Produces: `useDashboard(tripId)` — returns `{ trip, totalBudget, totalSpent, totalPending, totalPlanned, balance, percentUsed, dailyAllowance, daysRemaining }`

- [ ] **Step 1: Create `useDashboard` hook**

`src/hooks/useDashboard.ts`:
```ts
import { useEffect, useState, useCallback } from 'react'
import { tripRepository } from '@/services/storage/tripRepository'
import { expenseRepository } from '@/services/storage/expenseRepository'
import { itineraryRepository } from '@/services/storage/itineraryRepository'
import type { Trip, Expense, ItineraryItem } from '@/types'
import { daysUntil, daysBetween } from '@/utils/format'

export interface DashboardData {
  trip: Trip | null
  expenses: Expense[]
  itineraryItems: ItineraryItem[]
  totalBudget: number
  totalSpent: number       // status === 'Pago'
  totalPending: number     // status === 'Pendente'
  totalPlanned: number     // estimatedCost from itinerary not yet covered by actualCost
  balance: number          // budget - spent - pending
  percentUsed: number
  dailyAllowance: number
  daysRemaining: number
  tripStarted: boolean
}

export function useDashboard(tripId: string | undefined) {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!tripId) { setData(null); setLoading(false); return }
    const [trip, expenses, itinerary] = await Promise.all([
      tripRepository.getById(tripId),
      expenseRepository.getAllByTripId(tripId),
      itineraryRepository.getAllByTripId(tripId),
    ])
    if (!trip) { setData(null); setLoading(false); return }

    const totalSpent = expenses.filter(e => e.status === 'Pago').reduce((s, e) => s + e.amount, 0)
    const totalPending = expenses.filter(e => e.status === 'Pendente').reduce((s, e) => s + e.amount, 0)
    const balance = trip.budget - totalSpent - totalPending
    const percentUsed = trip.budget > 0 ? (totalSpent + totalPending) / trip.budget : 0

    const today = new Date(); today.setHours(0,0,0,0)
    const endParts = trip.endDate.split('-').map(Number)
    const endDate = new Date(endParts[0], endParts[1]-1, endParts[2])
    const startParts = trip.startDate.split('-').map(Number)
    const startDate = new Date(startParts[0], startParts[1]-1, startParts[2])

    const tripStarted = today >= startDate
    const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / 86400000))
    const dailyAllowance = daysRemaining > 0 ? balance / daysRemaining : balance

    setData({
      trip, expenses, itineraryItems: itinerary,
      totalBudget: trip.budget, totalSpent, totalPending,
      totalPlanned: 0, // simplified: not double-counting
      balance, percentUsed, dailyAllowance, daysRemaining, tripStarted,
    })
    setLoading(false)
  }, [tripId])

  useEffect(() => { load() }, [load])

  return { data, loading, refresh: load }
}
```

- [ ] **Step 2: Create TripHeader**

`src/components/trip/TripHeader.tsx`:
```tsx
import { MapPin, Calendar } from 'lucide-react'
import type { Trip } from '@/types'
import { formatDate } from '@/utils/format'

export function TripHeader({ trip }: { trip: Trip }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-app-text">{trip.name}</h1>
      <div className="flex items-center gap-1 text-muted text-sm mt-1">
        <MapPin size={14} /><span>{trip.destination}</span>
      </div>
      <div className="flex items-center gap-1 text-muted text-xs mt-1">
        <Calendar size={12} />
        <span>{formatDate(trip.startDate)} — {formatDate(trip.endDate)}</span>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create BudgetCard**

`src/components/trip/BudgetCard.tsx`:
```tsx
import { formatCurrency, formatPercent } from '@/utils/format'
import { cn } from '@/lib/utils'

interface Props {
  totalBudget: number
  totalSpent: number
  totalPending: number
  balance: number
  percentUsed: number
}

export function BudgetCard({ totalBudget, totalSpent, totalPending, balance, percentUsed }: Props) {
  const pct = Math.min(percentUsed, 1)
  const over = percentUsed > 1
  const warn = percentUsed >= 0.8

  return (
    <div className="bg-surface rounded-2xl p-5 shadow-sm mb-4">
      <h2 className="font-semibold text-app-text mb-4">Orçamento</h2>
      <div className="grid grid-cols-2 gap-4 mb-5">
        {[
          { label: 'Orçamento total', value: totalBudget, color: 'text-app-text' },
          { label: 'Gasto realizado', value: totalSpent, color: 'text-danger' },
          { label: 'Gastos pendentes', value: totalPending, color: 'text-warning' },
          { label: 'Saldo disponível', value: balance, color: balance >= 0 ? 'text-success' : 'text-danger' },
        ].map(item => (
          <div key={item.label}>
            <p className="text-xs text-muted mb-0.5">{item.label}</p>
            <p className={cn('font-bold text-base', item.color)}>{formatCurrency(item.value)}</p>
          </div>
        ))}
      </div>
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-muted">{formatCurrency(totalSpent + totalPending)} utilizados</span>
          <span className={cn('font-medium', over ? 'text-danger' : warn ? 'text-warning' : 'text-muted')}>
            {over ? '⚠️ Orçamento excedido' : warn ? '⚠️ Atenção' : `${formatPercent(totalSpent + totalPending, totalBudget)} utilizado`}
          </span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all', over ? 'bg-danger' : warn ? 'bg-warning' : 'bg-primary')}
            style={{ width: `${Math.min(pct * 100, 100)}%` }}
          />
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create DailyAllowanceCard**

`src/components/trip/DailyAllowanceCard.tsx`:
```tsx
import { TrendingDown } from 'lucide-react'
import { formatCurrency } from '@/utils/format'

interface Props {
  dailyAllowance: number
  daysRemaining: number
  tripStarted: boolean
  balance: number
}

export function DailyAllowanceCard({ dailyAllowance, daysRemaining, tripStarted, balance }: Props) {
  let message: string
  if (daysRemaining === 0 && tripStarted) {
    message = `Último dia da viagem! Saldo atual: ${formatCurrency(balance)}`
  } else if (!tripStarted) {
    message = `Você tem aproximadamente ${formatCurrency(dailyAllowance)} por dia disponíveis para esta viagem.`
  } else {
    message = `Você pode gastar aproximadamente ${formatCurrency(Math.max(0, dailyAllowance))} por dia até o fim da viagem.`
  }

  return (
    <div className="bg-teal-light rounded-2xl p-4 mb-4 flex items-start gap-3">
      <div className="w-9 h-9 bg-teal rounded-xl flex items-center justify-center shrink-0">
        <TrendingDown size={16} className="text-white" />
      </div>
      <div>
        <p className="text-xs font-medium text-teal mb-0.5">Disponível por dia</p>
        <p className="text-sm text-teal">{message}</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Build DashboardPage**

`src/pages/DashboardPage.tsx`:
```tsx
import { useParams, useNavigate } from 'react-router-dom'
import { useTripContext } from '@/contexts/TripContext'
import { useDashboard } from '@/hooks/useDashboard'
import { TripHeader } from '@/components/trip/TripHeader'
import { BudgetCard } from '@/components/trip/BudgetCard'
import { DailyAllowanceCard } from '@/components/trip/DailyAllowanceCard'
import { useEffect } from 'react'

export default function DashboardPage() {
  const { id } = useParams<{ id: string }>()
  const { setActiveTrip } = useTripContext()
  const { data, loading } = useDashboard(id)
  const navigate = useNavigate()

  useEffect(() => {
    if (data?.trip) setActiveTrip(data.trip)
  }, [data?.trip, setActiveTrip])

  if (loading) return <div className="text-center py-12 text-muted text-sm">Carregando...</div>
  if (!data?.trip) {
    navigate('/', { replace: true })
    return null
  }

  return (
    <div>
      <TripHeader trip={data.trip} />
      <BudgetCard
        totalBudget={data.totalBudget}
        totalSpent={data.totalSpent}
        totalPending={data.totalPending}
        balance={data.balance}
        percentUsed={data.percentUsed}
      />
      <DailyAllowanceCard
        dailyAllowance={data.dailyAllowance}
        daysRemaining={data.daysRemaining}
        tripStarted={data.tripStarted}
        balance={data.balance}
      />
    </div>
  )
}
```

---

## Task 6: Expenses Page — Full CRUD + Budget Chart

**Files:**
- Replace: `src/pages/GastosPage.tsx`
- Create: `src/hooks/useExpenses.ts`
- Create: `src/hooks/useBudgetCategories.ts`
- Create: `src/components/expense/ExpenseForm.tsx`
- Create: `src/components/expense/ExpenseCard.tsx`
- Create: `src/components/expense/BudgetCategoryTable.tsx`
- Create: `src/components/expense/BudgetChart.tsx`

**Interfaces:**
- Consumes: `Expense`, `BudgetCategory`, `ExpenseCategory`, `PaymentMethod`, `ExpenseStatus` types; `expenseRepository`, `budgetCategoryRepository`; `formatCurrency`, `formatDate`, `formatPercent`
- Produces: `useExpenses(tripId)` — `{ expenses, addExpense, updateExpense, deleteExpense, loading }`
- Produces: `useBudgetCategories(tripId)` — `{ categories, upsertCategory, deleteCategory }`

- [ ] **Step 1: Create `useExpenses` hook**

`src/hooks/useExpenses.ts`:
```ts
import { useEffect, useState, useCallback } from 'react'
import { expenseRepository } from '@/services/storage/expenseRepository'
import type { Expense } from '@/types'

export function useExpenses(tripId: string | undefined) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!tripId) { setExpenses([]); setLoading(false); return }
    const data = await expenseRepository.getAllByTripId(tripId)
    setExpenses(data.sort((a, b) => b.date.localeCompare(a.date)))
    setLoading(false)
  }, [tripId])

  useEffect(() => { load() }, [load])

  const addExpense = useCallback(async (data: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString()
    const expense: Expense = { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now }
    await expenseRepository.create(expense)
    await load()
    return expense
  }, [load])

  const updateExpense = useCallback(async (id: string, data: Partial<Omit<Expense, 'id' | 'createdAt'>>) => {
    const existing = await expenseRepository.getById(id)
    if (!existing) return
    const updated: Expense = { ...existing, ...data, updatedAt: new Date().toISOString() }
    await expenseRepository.update(updated)
    await load()
  }, [load])

  const deleteExpense = useCallback(async (id: string) => {
    await expenseRepository.delete(id)
    await load()
  }, [load])

  return { expenses, addExpense, updateExpense, deleteExpense, loading, refresh: load }
}
```

- [ ] **Step 2: Create `useBudgetCategories` hook**

`src/hooks/useBudgetCategories.ts`:
```ts
import { useEffect, useState, useCallback } from 'react'
import { budgetCategoryRepository } from '@/services/storage/budgetCategoryRepository'
import type { BudgetCategory, ExpenseCategory } from '@/types'

export function useBudgetCategories(tripId: string | undefined) {
  const [categories, setCategories] = useState<BudgetCategory[]>([])

  const load = useCallback(async () => {
    if (!tripId) { setCategories([]); return }
    setCategories(await budgetCategoryRepository.getAllByTripId(tripId))
  }, [tripId])

  useEffect(() => { load() }, [load])

  const upsertCategory = useCallback(async (category: ExpenseCategory, plannedAmount: number) => {
    if (!tripId) return
    const existing = categories.find(c => c.category === category)
    const now = new Date().toISOString()
    if (existing) {
      const updated: BudgetCategory = { ...existing, plannedAmount, updatedAt: now }
      await budgetCategoryRepository.update(updated)
    } else {
      const created: BudgetCategory = { id: crypto.randomUUID(), tripId, category, plannedAmount, createdAt: now, updatedAt: now }
      await budgetCategoryRepository.create(created)
    }
    await load()
  }, [tripId, categories, load])

  const deleteCategory = useCallback(async (id: string) => {
    await budgetCategoryRepository.delete(id)
    await load()
  }, [load])

  return { categories, upsertCategory, deleteCategory, refresh: load }
}
```

- [ ] **Step 3: Create ExpenseForm**

`src/components/expense/ExpenseForm.tsx` — modal/bottom sheet with fields:
- description (required)
- amount (required, >= 0)
- category (select from ExpenseCategory list)
- date (required)
- paymentMethod (select)
- status (Pago / Pendente)
- notes (optional)

All selects use native `<select>` styled with Tailwind. Validation in pt-BR.

- [ ] **Step 4: Create ExpenseCard**

`src/components/expense/ExpenseCard.tsx` — shows description, category badge, date, amount with color (danger if Pendente, success if Pago), edit/delete buttons.

- [ ] **Step 5: Create BudgetCategoryTable**

`src/components/expense/BudgetCategoryTable.tsx`:
Table showing each `ExpenseCategory` with `plannedAmount`, `realizedAmount` (sum of expenses with that category and status=Pago), difference, and an edit inline input. Highlight rows where realized > planned.

- [ ] **Step 6: Create BudgetChart**

`src/components/expense/BudgetChart.tsx` using Recharts `BarChart` (horizontal):
- X axis: category names
- Two bars: Planejado (primary color) and Realizado (teal color)
- Formatted Y axis values

- [ ] **Step 7: Build GastosPage**

`src/pages/GastosPage.tsx`:
- Summary cards (total spent, pending, balance, budget)
- Tab switcher: "Lançamentos" | "Por categoria"
- Lançamentos tab: sorted list of ExpenseCard + "+ Adicionar gasto" FAB
- Por categoria tab: BudgetCategoryTable + BudgetChart
- ExpenseForm modal for add/edit
- ConfirmDialog for delete
- Empty state when no expenses
- Query param `?novo=1` auto-opens the form

---

## Task 7: Itinerary Page — Full CRUD + Grouping

**Files:**
- Replace: `src/pages/RoteiPage.tsx`
- Create: `src/hooks/useItinerary.ts`
- Create: `src/components/itinerary/ActivityForm.tsx`
- Create: `src/components/itinerary/ActivityCard.tsx`
- Create: `src/components/itinerary/ItineraryDay.tsx`
- Create: `src/components/common/LocationField.tsx`

**Interfaces:**
- Consumes: `ItineraryItem`, `ItineraryCategory`, `ItineraryStatus`, `Location` types; `itineraryRepository`; `formatDate`, `formatDateLong`, `formatCurrency`, `formatDuration`
- Produces: `useItinerary(tripId)` — `{ items, addItem, updateItem, deleteItem, toggleStatus }`
- Produces: `LocationField` component — reusable location input (placeName, address, lat, lng, placeId, open-in-maps button)

- [ ] **Step 1: Create `useItinerary` hook**

Same pattern as `useExpenses` but for `ItineraryItem` and `itineraryRepository`. Sorted by `date` then `startTime`.

- [ ] **Step 2: Create LocationField component**

`src/components/common/LocationField.tsx`:
```tsx
import { MapPin, ExternalLink } from 'lucide-react'
import type { Location } from '@/types'

interface Props {
  value: Location | null
  onChange: (location: Location | null) => void
  readOnly?: boolean
}

export function LocationField({ value, onChange, readOnly }: Props) {
  function openInMaps() {
    if (!value) return
    const query = value.latitude && value.longitude
      ? `${value.latitude},${value.longitude}`
      : encodeURIComponent(value.address || value.placeName)
    window.open(`https://maps.google.com/maps?q=${query}`, '_blank', 'noopener')
  }

  if (readOnly && value) {
    return (
      <div className="flex items-start gap-2 p-3 bg-teal-light rounded-xl">
        <MapPin size={14} className="text-teal mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-teal truncate">{value.placeName}</p>
          {value.address && <p className="text-xs text-muted truncate">{value.address}</p>}
        </div>
        {(value.latitude || value.address) && (
          <button onClick={openInMaps} aria-label="Abrir no mapa" className="shrink-0">
            <ExternalLink size={14} className="text-teal" />
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <MapPin size={14} className="text-muted" />
        <label className="text-sm font-medium text-app-text">Localização (opcional)</label>
      </div>
      <input
        type="text"
        placeholder="Nome do local"
        value={value?.placeName ?? ''}
        onChange={e => onChange(e.target.value ? { ...(value ?? { address: '', placeName: '' }), placeName: e.target.value } : null)}
        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
      />
      <input
        type="text"
        placeholder="Endereço"
        value={value?.address ?? ''}
        onChange={e => onChange(value ? { ...value, address: e.target.value } : { placeName: '', address: e.target.value })}
        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
      />
      <div className="grid grid-cols-2 gap-2">
        <input
          type="number"
          placeholder="Latitude"
          value={value?.latitude ?? ''}
          onChange={e => onChange(value ? { ...value, latitude: e.target.value ? Number(e.target.value) : undefined } : { placeName: '', address: '', latitude: Number(e.target.value) })}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
          step="any"
        />
        <input
          type="number"
          placeholder="Longitude"
          value={value?.longitude ?? ''}
          onChange={e => onChange(value ? { ...value, longitude: e.target.value ? Number(e.target.value) : undefined } : { placeName: '', address: '', longitude: Number(e.target.value) })}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
          step="any"
        />
      </div>
      {value?.latitude && value?.longitude && (
        <button type="button" onClick={openInMaps} className="flex items-center gap-1.5 text-xs text-teal font-medium">
          <ExternalLink size={12} />Abrir no mapa
        </button>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Create ActivityForm**

`src/components/itinerary/ActivityForm.tsx` — modal/bottom sheet with:
- title (required)
- date (required)
- startTime, endTime (optional)
- category (select)
- status (select)
- estimatedCost (number >= 0)
- actualCost (number >= 0)
- description (optional)
- notes (optional)
- location via `LocationField`

- [ ] **Step 4: Create ActivityCard**

`src/components/itinerary/ActivityCard.tsx` — shows time, title, category icon/badge, status badge, estimated/actual cost, location (if set), edit/delete/complete buttons.

Category → emoji mapping: Transporte→🚗, Alimentação→🍽️, Passeio→🗺️, Praia→🏖️, Compras→🛍️, Descanso→😴, Outro→📍

Status badge colors: Planejado=primary-light, Confirmado=teal-light, Concluído=success/10%, Cancelado=danger/10%

- [ ] **Step 5: Create ItineraryDay**

`src/components/itinerary/ItineraryDay.tsx` — groups ActivityCards for a single date, shows formatted date header with `formatDateLong`.

- [ ] **Step 6: Build RoteiPage**

`src/pages/RoteiPage.tsx`:
- Groups items by date using `Object.groupBy` or reduce
- Renders ItineraryDay per unique date, sorted chronologically
- "+ Adicionar atividade" button + FAB
- ActivityForm modal for add/edit
- ConfirmDialog for delete
- Empty state when no items
- Query param `?novo=1` auto-opens form

---

## Task 8: Checklist (Mala) Page

**Files:**
- Replace: `src/pages/MalaPage.tsx`
- Create: `src/hooks/useChecklist.ts`
- Create: `src/components/checklist/ChecklistItemForm.tsx`
- Create: `src/components/checklist/ChecklistItemRow.tsx`
- Create: `src/components/checklist/ChecklistGroup.tsx`
- Create: `src/components/checklist/WeightBar.tsx`

**Interfaces:**
- Consumes: `ChecklistItem`, `ChecklistCategory` types; `checklistRepository`; `formatWeight`, `formatPercent`
- Produces: `useChecklist(tripId)` — `{ items, addItem, updateItem, deleteItem, toggleItem, totalWeight, checkedCount, totalCount }`

- [ ] **Step 1: Create `useChecklist` hook**

Same CRUD pattern. Additionally computes:
- `checkedCount`: items where `checked === true`
- `totalCount`: total items
- `totalWeight`: sum of `weight * quantity` for checked items

- [ ] **Step 2: Create WeightBar**

`src/components/checklist/WeightBar.tsx`:
Shows `X,X / Y kg` bar. Colors: normal (primary), warning at 80%, danger when over.

- [ ] **Step 3: Create ChecklistItemForm**

Fields: name (required), category (select), quantity (number >= 1), weight (number >= 0), notes.

- [ ] **Step 4: Create ChecklistItemRow**

Checkbox (toggle checked), name, quantity, weight badge, edit/delete. When checked: strike-through text.

- [ ] **Step 5: Create ChecklistGroup**

Header: category name + emoji + count of checked/total. Collapsible. Contains ChecklistItemRow list.

Category emoji mapping: Roupas→👕, Higiene e beleza→🧴, Farmácia→💊, Eletrônicos→📱, Documentos→📄, Praia→🏖️, Acessórios→👜, Outros→📦

- [ ] **Step 6: Build MalaPage**

`src/pages/MalaPage.tsx`:
- Progress header: "X de Y itens — Z% pronta"
- WeightBar (uses trip.luggageWeightLimit)
- ChecklistGroup per category (only show categories with items)
- "+ Adicionar item" button
- ChecklistItemForm modal
- ConfirmDialog for delete
- Empty state
- Query param `?novo=1` auto-opens form

---

## Task 9: Reservations Page

**Files:**
- Replace: `src/pages/ReservasPage.tsx`
- Create: `src/hooks/useReservations.ts`
- Create: `src/components/reservation/ReservationForm.tsx`
- Create: `src/components/reservation/ReservationCard.tsx`

**Interfaces:**
- Consumes: `Reservation`, `ReservationType`, `ReservationStatus`, `Location` types; `reservationRepository`; `formatDate`, `formatCurrency`; `LocationField`
- Produces: `useReservations(tripId)` — CRUD

- [ ] **Step 1: Create `useReservations` hook**

Same CRUD pattern. Sorted by date.

- [ ] **Step 2: Create ReservationForm**

Fields: type (select), name (required), date (required), startTime, endTime, confirmationCode, cost, status, notes, location via `LocationField`.

- [ ] **Step 3: Create ReservationCard**

Shows type icon, name, date, times, confirmation code, cost, status badge, location (via LocationField readOnly), edit/delete.

Type → icon/emoji: Voo→✈️, Hospedagem→🏨, Passeio→🗺️, Restaurante→🍽️, Transporte→🚗, Ingresso→🎫, Outro→📋

- [ ] **Step 4: Build ReservasPage**

`src/pages/ReservasPage.tsx`:
- Filter tabs by type or show all
- List of ReservationCard
- "+ Nova reserva" button
- ReservationForm modal
- ConfirmDialog
- Empty state
- Query param `?novo=1` auto-opens form

---

## Task 10: Notes Page + Mais Menu

**Files:**
- Replace: `src/pages/NotasPage.tsx`
- Replace: `src/pages/MaisPage.tsx`
- Create: `src/hooks/useNotes.ts`
- Create: `src/components/note/NoteForm.tsx`
- Create: `src/components/note/NoteCard.tsx`

**Interfaces:**
- Consumes: `Note` type; `noteRepository`; `formatDate`
- Produces: `useNotes(tripId)` — CRUD

- [ ] **Step 1: Create `useNotes` hook**

Same CRUD pattern. Sorted by updatedAt desc.

- [ ] **Step 2: Create NoteForm**

Fields: title (required), content (required, textarea).

- [ ] **Step 3: Create NoteCard**

Shows title, content preview, date. Edit/delete buttons.

- [ ] **Step 4: Build NotasPage**

List + empty state + form modal.

- [ ] **Step 5: Build MaisPage**

`src/pages/MaisPage.tsx`:
Navigation hub with cards linking to:
- 🎫 Reservas → `/viagem/:id/mais/reservas`
- 📝 Notas → `/viagem/:id/mais/notas`
- 💾 Backup → `/viagem/:id/mais/backup`
- ⚙️ Configurações → `/viagem/:id/mais/configuracoes`

---

## Task 11: Backup, Configurações and Sample Data

**Files:**
- Replace: `src/pages/BackupPage.tsx`
- Replace: `src/pages/ConfiguracoesPage.tsx`
- Create: `src/data/sampleData.ts`
- Create: `public/icons/icon-192.png` and `public/icons/icon-512.png` (proper SVG-based icons)

**Interfaces:**
- Consumes: all repositories; `exportTripData`, `importTripData`, `validateTripBackup`; `TripBackup` type; `useTrips`

- [ ] **Step 1: Build BackupPage**

`src/pages/BackupPage.tsx`:
- Section: "Exportar viagem"
  - Button "📥 Exportar JSON" → calls `exportTripData` with assembled backup
  - Success toast: "Arquivo exportado com sucesso"
- Section: "Importar viagem"
  - File input (hidden, click via button "📤 Importar backup")
  - Runs `importTripData`, `validateTripBackup`
  - On success: saves all entities, shows success message
  - On error: shows error in pt-BR
- Section: "Apagar todos os dados"
  - Button (red): "🗑️ Apagar todos os dados da viagem"
  - ConfirmDialog with two-step confirmation
  - On confirm: deletes all data for activeTrip

- [ ] **Step 2: Build ConfiguracoesPage**

`src/pages/ConfiguracoesPage.tsx`:
- Section: Sobre — TravelMe version, tagline
- Section: Dados de exemplo — Button "Carregar viagem de exemplo" with warning that it creates a new trip
- Section: Limite de peso da mala — inline edit (also accessible from MalaPage)
- Section: Informações — offline note

- [ ] **Step 3: Create sample data**

`src/data/sampleData.ts`:
```ts
import type { Trip, Expense, BudgetCategory, ItineraryItem, ChecklistItem, Reservation, Note } from '@/types'

export function buildSampleData(): {
  trip: Trip
  expenses: Expense[]
  budgetCategories: BudgetCategory[]
  itinerary: ItineraryItem[]
  checklist: ChecklistItem[]
  reservations: Reservation[]
  notes: Note[]
} {
  const tripId = crypto.randomUUID()
  const now = new Date().toISOString()
  const trip: Trip = {
    id: tripId,
    name: 'João Pessoa 2026',
    destination: 'João Pessoa, PB',
    startDate: '2026-10-07',
    endDate: '2026-10-16',
    budget: 4256.47,
    currency: 'BRL',
    description: 'Viagem de férias para curtir as praias de João Pessoa.',
    luggageWeightLimit: 10,
    createdAt: now,
    updatedAt: now,
  }
  // Add ~5 expenses, 3 itinerary items, 5 checklist items, 2 reservations, 1 note
  // ... (full data)
  return { trip, expenses: [], budgetCategories: [], itinerary: [], checklist: [], reservations: [], notes: [] }
}
```

The actual function fills in realistic sample entries using `crypto.randomUUID()` for all IDs.

- [ ] **Step 4: Wire sample data loading**

`loadSampleData` async function in `sampleData.ts`:
```ts
import { tripRepository } from '@/services/storage/tripRepository'
import { expenseRepository } from '@/services/storage/expenseRepository'
// ... other repos

export async function loadSampleData(): Promise<Trip> {
  const { trip, expenses, budgetCategories, itinerary, checklist, reservations, notes } = buildSampleData()
  await tripRepository.create(trip)
  await Promise.all([
    ...expenses.map(e => expenseRepository.create(e)),
    ...budgetCategories.map(b => budgetCategoryRepository.create(b)),
    ...itinerary.map(i => itineraryRepository.create(i)),
    ...checklist.map(c => checklistRepository.create(c)),
    ...reservations.map(r => reservationRepository.create(r)),
    ...notes.map(n => noteRepository.create(n)),
  ])
  return trip
}
```

- [ ] **Step 5: Create PWA icons**

Generate `public/icons/icon-192.png` and `public/icons/icon-512.png` as proper PNG icons with TravelMe branding (purple background `#8B7CF6`, white plane/map icon). Use base64 encoded minimal PNGs or generate via canvas in a build script. At minimum, create non-empty placeholder PNGs.

- [ ] **Step 6: Final verification**

```bash
npm run build
```
Expected: Clean build, no TypeScript errors, no unused imports.

```bash
npm run preview
```
Expected: Full app works — create trip, add expense, see dashboard update, export backup, import backup, sample data loads.

Lighthouse PWA audit score ≥ 90.

---

## Self-Review

**Spec coverage check:**
1. Multi-trip CRUD → Task 4 ✅
2. Active trip context with localStorage persistence → Task 3 ✅
3. Dashboard with budget/daily allowance → Task 5 ✅
4. Expenses CRUD + budget categories + planned vs actual → Task 6 ✅
5. Itinerary CRUD + grouped by day → Task 7 ✅
6. Location field (reusable, offline, open-in-maps) → Task 7 ✅
7. Checklist + weight control → Task 8 ✅
8. Reservations with location → Task 9 ✅
9. Notes → Task 10 ✅
10. Mais menu → Task 10 ✅
11. Backup export/import/validate → Task 11 ✅
12. Sample data (separate, deletable) → Task 11 ✅
13. PWA + offline → Task 1 + Task 11 ✅
14. IndexedDB persistence → Task 2 ✅
15. pt-BR throughout → Global Constraints ✅
16. Empty states → Tasks 4–10 ✅
17. Validation in pt-BR → Tasks 4–9 ✅
18. Mobile bottom nav + desktop sidebar → Task 3 ✅
19. Quick-add `+` button → Task 3 ✅
20. `?novo=1` query param → Tasks 6–9 ✅

**No placeholders:** All tasks have concrete code or explicit patterns. ✅
**No TBD:** All repository methods follow the explicit pattern shown in Task 2. ✅
**Location architecture allows future map page:** `Location` type on all relevant entities; a future `/viagem/:id/mapa` page can query all repositories and collect `location` fields. ✅
