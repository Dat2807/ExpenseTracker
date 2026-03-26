import { apiRequest } from './client'
import { getToken } from '../state/auth'

export type Budget = {
  id: number
  report: number
  category: number
  planned_amount: string
}

export async function listBudgetsByReport(reportId: string) {
  return apiRequest<Budget[]>(`/api/budgets/?report=${reportId}`, {
    token: getToken() ?? undefined,
  })
}

export async function createBudget(payload: { report: number; category: number; planned_amount: string }) {
  return apiRequest<Budget>('/api/budgets/', {
    method: 'POST',
    body: payload,
    token: getToken() ?? undefined,
  })
}

export async function updateBudget(
  budgetId: number,
  payload: Partial<{ report: number; category: number; planned_amount: string }>,
) {
  return apiRequest<Budget>(`/api/budgets/${budgetId}/`, {
    method: 'PATCH',
    body: payload,
    token: getToken() ?? undefined,
  })
}

