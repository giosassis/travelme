import type {
  Trip,
  Expense,
  BudgetCategory,
  ItineraryItem,
  ChecklistItem,
  Reservation,
  Note,
} from '@/types'
import { tripRepository } from '@/services/storage/tripRepository'
import { expenseRepository } from '@/services/storage/expenseRepository'
import { budgetCategoryRepository } from '@/services/storage/budgetCategoryRepository'
import { itineraryRepository } from '@/services/storage/itineraryRepository'
import { checklistRepository } from '@/services/storage/checklistRepository'
import { reservationRepository } from '@/services/storage/reservationRepository'
import { noteRepository } from '@/services/storage/noteRepository'

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
    description: 'Viagem de férias para curtir as praias de João Pessoa e conhecer o ponto mais oriental das Américas.',
    luggageWeightLimit: 10,
    createdAt: now,
    updatedAt: now,
  }

  const mk = (id: string) => ({ id, tripId, createdAt: now, updatedAt: now })

  const expenses: Expense[] = [
    {
      ...mk(crypto.randomUUID()),
      description: 'Passagem aérea ida e volta',
      amount: 980.00,
      category: 'Transporte',
      date: '2026-10-01',
      paymentMethod: 'Cartão de crédito',
      status: 'Pago',
      notes: 'GOL — voo G3 1234',
    },
    {
      ...mk(crypto.randomUUID()),
      description: 'Airbnb 10 noites',
      amount: 1200.00,
      category: 'Hospedagem',
      date: '2026-10-07',
      paymentMethod: 'Cartão de crédito',
      status: 'Pago',
      notes: 'Apto na Bessa, 200m da praia',
    },
    {
      ...mk(crypto.randomUUID()),
      description: 'Almoço no Picuí',
      amount: 87.50,
      category: 'Alimentação',
      date: '2026-10-08',
      paymentMethod: 'Pix',
      status: 'Pago',
      notes: '',
    },
    {
      ...mk(crypto.randomUUID()),
      description: 'Passeio de escuna Picãozinho',
      amount: 120.00,
      category: 'Passeios',
      date: '2026-10-10',
      paymentMethod: 'Dinheiro',
      status: 'Pendente',
      notes: 'Saída 09h, levar protetor solar',
    },
    {
      ...mk(crypto.randomUUID()),
      description: 'Supermercado',
      amount: 145.30,
      category: 'Alimentação',
      date: '2026-10-09',
      paymentMethod: 'Cartão de débito',
      status: 'Pago',
      notes: '',
    },
  ]

  const budgetCategories: BudgetCategory[] = [
    { ...mk(crypto.randomUUID()), category: 'Transporte', plannedAmount: 1200 },
    { ...mk(crypto.randomUUID()), category: 'Hospedagem', plannedAmount: 1200 },
    { ...mk(crypto.randomUUID()), category: 'Alimentação', plannedAmount: 800 },
    { ...mk(crypto.randomUUID()), category: 'Passeios', plannedAmount: 600 },
    { ...mk(crypto.randomUUID()), category: 'Compras', plannedAmount: 300 },
    { ...mk(crypto.randomUUID()), category: 'Outros', plannedAmount: 156.47 },
  ]

  const itinerary: ItineraryItem[] = [
    {
      ...mk(crypto.randomUUID()),
      date: '2026-10-08',
      title: 'Praia do Cabo Branco',
      description: 'Ponta do Seixas — ponto mais oriental das Américas.',
      startTime: '08:00',
      endTime: '11:00',
      location: { placeName: 'Ponta do Seixas', address: 'Cabo Branco, João Pessoa, PB', latitude: -7.1472, longitude: -34.7924 },
      category: 'Praia',
      estimatedCost: 0,
      actualCost: 0,
      status: 'Planejado',
      notes: '',
    },
    {
      ...mk(crypto.randomUUID()),
      date: '2026-10-08',
      title: 'Almoço no Picuí',
      description: 'Restaurante de culinária nordestina.',
      startTime: '12:30',
      endTime: '14:00',
      location: { placeName: 'Restaurante Picuí', address: 'Tambaú, João Pessoa, PB', latitude: -7.1183, longitude: -34.8539 },
      category: 'Alimentação',
      estimatedCost: 90,
      actualCost: 87.50,
      status: 'Concluído',
      notes: '',
    },
    {
      ...mk(crypto.randomUUID()),
      date: '2026-10-10',
      title: 'Passeio de escuna — Picãozinho',
      description: 'Piscinas naturais e mergulho com snorkel.',
      startTime: '09:00',
      endTime: '13:00',
      location: { placeName: 'Praia de Tambaú', address: 'Tambaú, João Pessoa, PB', latitude: -7.1185, longitude: -34.8525 },
      category: 'Passeio',
      estimatedCost: 120,
      actualCost: 0,
      status: 'Confirmado',
      notes: 'Levar protetor solar, óculos e dinheiro',
    },
  ]

  const checklist: ChecklistItem[] = [
    { ...mk(crypto.randomUUID()), name: 'Camisetas', category: 'Roupas', quantity: 5, weight: 0.2, checked: false, notes: '' },
    { ...mk(crypto.randomUUID()), name: 'Shorts', category: 'Roupas', quantity: 3, weight: 0.25, checked: false, notes: '' },
    { ...mk(crypto.randomUUID()), name: 'Roupa de banho', category: 'Praia', quantity: 2, weight: 0.15, checked: true, notes: '' },
    { ...mk(crypto.randomUUID()), name: 'Protetor solar FPS 50', category: 'Higiene e beleza', quantity: 2, weight: 0.3, checked: false, notes: '' },
    { ...mk(crypto.randomUUID()), name: 'Documento de identidade', category: 'Documentos', quantity: 1, weight: 0.05, checked: true, notes: '' },
    { ...mk(crypto.randomUUID()), name: 'Carregador do celular', category: 'Eletrônicos', quantity: 1, weight: 0.1, checked: false, notes: '' },
    { ...mk(crypto.randomUUID()), name: 'Medicamentos', category: 'Farmácia', quantity: 1, weight: 0.2, checked: false, notes: 'Incluir antialérgico' },
    { ...mk(crypto.randomUUID()), name: 'Escova e pasta de dentes', category: 'Higiene e beleza', quantity: 1, weight: 0.15, checked: false, notes: '' },
  ]

  const reservations: Reservation[] = [
    {
      ...mk(crypto.randomUUID()),
      type: 'Voo',
      name: 'GOL G3 1234 — GRU → JPA',
      date: '2026-10-07',
      startTime: '06:30',
      endTime: '09:15',
      location: { placeName: 'Aeroporto Castro Pinto', address: 'João Pessoa, PB', latitude: -7.1459, longitude: -34.9503 },
      confirmationCode: 'GOL7JPA',
      cost: 490,
      status: 'Confirmado',
      notes: 'Terminal 1, portão 14',
    },
    {
      ...mk(crypto.randomUUID()),
      type: 'Hospedagem',
      name: 'Airbnb — Apto Bessa',
      date: '2026-10-07',
      startTime: '14:00',
      endTime: '',
      location: { placeName: 'Praia da Bessa', address: 'Bessa, João Pessoa, PB', latitude: -7.0896, longitude: -34.8404 },
      confirmationCode: 'AIRBNB123',
      cost: 1200,
      status: 'Confirmado',
      notes: 'Check-out: 16/10 até 12h',
    },
  ]

  const notes: Note[] = [
    {
      ...mk(crypto.randomUUID()),
      title: 'Dicas de restaurantes',
      content: '- Picuí: culinária nordestina, ótimo custo-benefício\n- Mangai: buffet regional, famoso pela qualidade\n- Tábua de Carne: especialidade em carnes e pratos regionais\n\nReservar com antecedência no final de semana.',
    },
    {
      ...mk(crypto.randomUUID()),
      title: 'Informações de emergência',
      content: 'SAMU: 192\nBombeiros: 193\nPolicía: 190\nHospital Bom Samaritano: (83) 3247-5000\n\nCartão de crédito de emergência guardado na mochila.',
    },
  ]

  return { trip, expenses, budgetCategories, itinerary, checklist, reservations, notes }
}

export async function loadSampleData(): Promise<Trip> {
  const { trip, expenses, budgetCategories, itinerary, checklist, reservations, notes } = buildSampleData()

  await tripRepository.create(trip)
  await Promise.all([
    ...expenses.map((e) => expenseRepository.create(e)),
    ...budgetCategories.map((b) => budgetCategoryRepository.create(b)),
    ...itinerary.map((i) => itineraryRepository.create(i)),
    ...checklist.map((c) => checklistRepository.create(c)),
    ...reservations.map((r) => reservationRepository.create(r)),
    ...notes.map((n) => noteRepository.create(n)),
  ])

  return trip
}
