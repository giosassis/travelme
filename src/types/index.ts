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

// ─── Shopping List ────────────────────────────────────────────────────────────
export type ShoppingCategory =
  | 'Roupa e calçados'
  | 'Farmácia'
  | 'Higiene e beleza'
  | 'Eletrônicos'
  | 'Alimentos e bebidas'
  | 'Documentos e viagem'
  | 'Presentes e lembranças'
  | 'Outros'

export interface ShoppingItem {
  id: string
  tripId: string
  name: string
  category: ShoppingCategory
  quantity: number
  estimatedPrice: number   // R$
  actualPrice: number      // R$, 0 = não preenchido
  bought: boolean
  priority: 'Alta' | 'Média' | 'Baixa'
  notes: string
  createdAt: string
  updatedAt: string
}

// ─── Backup ───────────────────────────────────────────────────────────────────
export interface TripBackup {
  version: number          // currently 2
  exportedAt: string
  trip: Trip
  expenses: Expense[]
  budgetCategories: BudgetCategory[]
  itinerary: ItineraryItem[]
  checklist: ChecklistItem[]
  reservations: Reservation[]
  notes: Note[]
  shoppingList: ShoppingItem[]
}
