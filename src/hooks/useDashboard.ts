import { useEffect, useState, useCallback } from 'react'
import { tripRepository } from '@/services/storage/tripRepository'
import { expenseRepository } from '@/services/storage/expenseRepository'
import type { Trip, Expense } from '@/types'

export interface DashboardData {
  trip: Trip
  expenses: Expense[]
  totalBudget: number
  totalSpent: number
  totalPending: number
  balance: number
  percentUsed: number
  dailyAllowance: number
  daysRemaining: number
  tripStarted: boolean
  tripEnded: boolean
}

export function useDashboard(tripId: string | undefined) {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!tripId) {
      setData(null)
      setLoading(false)
      return
    }
    const [trip, expenses] = await Promise.all([
      tripRepository.getById(tripId),
      expenseRepository.getAllByTripId(tripId),
    ])
    if (!trip) {
      setData(null)
      setLoading(false)
      return
    }

    const totalSpent = expenses
      .filter((e) => e.status === 'Pago')
      .reduce((s, e) => s + e.amount, 0)
    const totalPending = expenses
      .filter((e) => e.status === 'Pendente')
      .reduce((s, e) => s + e.amount, 0)
    const balance = trip.budget - totalSpent - totalPending

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [sy, sm, sd] = trip.startDate.split('-').map(Number)
    const [ey, em, ed] = trip.endDate.split('-').map(Number)
    const startDate = new Date(sy, sm - 1, sd)
    const endDate = new Date(ey, em - 1, ed)

    const tripStarted = today >= startDate
    const tripEnded = today > endDate

    const daysRemaining = Math.max(
      0,
      Math.ceil((endDate.getTime() - today.getTime()) / 86400000),
    )
    const totalDays = Math.max(
      1,
      Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000) + 1,
    )
    const dailyAllowanceDivisor = tripStarted ? daysRemaining : totalDays
    const dailyAllowance = dailyAllowanceDivisor > 0 ? balance / dailyAllowanceDivisor : balance

    const percentUsed = trip.budget > 0 ? (totalSpent + totalPending) / trip.budget : 0

    setData({
      trip,
      expenses,
      totalBudget: trip.budget,
      totalSpent,
      totalPending,
      balance,
      percentUsed,
      dailyAllowance,
      daysRemaining,
      tripStarted,
      tripEnded,
    })
    setLoading(false)
  }, [tripId])

  useEffect(() => {
    load()
  }, [load])

  return { data, loading, refresh: load }
}
