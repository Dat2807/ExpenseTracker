import { apiRequest } from './client'
import { getToken } from '../state/auth'

export type Report = {
  id: number
  year: number
  month: number
  title: string
  note: string
}

export type CreateReportPayload = {
  year: number
  month: number
  title?: string
  note?: string
}

export async function listReports() {
  return apiRequest<Report[]>('/api/reports/', {
    token: getToken() ?? undefined,
  })
}

export async function createReport(payload: CreateReportPayload) {
  return apiRequest<Report>('/api/reports/', {
    method: 'POST',
    body: payload,
    token: getToken() ?? undefined,
  })
}

export async function getReport(reportId: string) {
  return apiRequest<Report>(`/api/reports/${reportId}/`, {
    token: getToken() ?? undefined,
  })
}

