import { apiRequest } from './client'
import { getToken } from '../state/auth'

export type Transaction = {
  id: number
  report: number
  category: number
  amount: string
  date: string
  description: string
  created_at?: string
}

export async function listTransactionsByReport(reportId: string) {
  return apiRequest<Transaction[]>(`/api/transactions/?report=${reportId}`, {
    token: getToken() ?? undefined,
  })
}

export async function createTransaction(payload: {
  report: number
  category: number
  amount: string
  date: string
  description: string
}) {
  return apiRequest<Transaction>('/api/transactions/', {
    method: 'POST',
    body: payload,
    token: getToken() ?? undefined,
  })
}

export async function deleteTransaction(transactionId: number) {
  return apiRequest<void>(`/api/transactions/${transactionId}/`, {
    method: 'DELETE',
    token: getToken() ?? undefined,
  })
}

export async function updateTransaction(
  transactionId: number,
  payload: Partial<{
    report: number
    category: number
    amount: string
    date: string
    description: string
  }>,
) {
  return apiRequest<Transaction>(`/api/transactions/${transactionId}/`, {
    method: 'PATCH',
    body: payload,
    token: getToken() ?? undefined,
  })
}

