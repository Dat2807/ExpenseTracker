import { apiRequest } from './client'
import { getToken } from '../state/auth'

export type QuickNote = {
  id: number
  title: string
  content: string
  is_favorite: boolean
}

export async function listQuickNotes() {
  return apiRequest<QuickNote[]>('/api/quick-notes/', {
    token: getToken() ?? undefined,
  })
}

export async function createQuickNote(payload: { title: string; is_favorite?: boolean }) {
  return apiRequest<QuickNote>('/api/quick-notes/', {
    method: 'POST',
    body: {
      title: payload.title,
      content: payload.title,
      is_favorite: payload.is_favorite ?? false,
    },
    token: getToken() ?? undefined,
  })
}

export async function updateQuickNote(noteId: number, payload: Partial<{ title: string; is_favorite: boolean }>) {
  return apiRequest<QuickNote>(`/api/quick-notes/${noteId}/`, {
    method: 'PATCH',
    body: {
      ...(payload.title !== undefined ? { title: payload.title, content: payload.title } : {}),
      ...(payload.is_favorite !== undefined ? { is_favorite: payload.is_favorite } : {}),
    },
    token: getToken() ?? undefined,
  })
}

export async function deleteQuickNote(noteId: number) {
  return apiRequest<void>(`/api/quick-notes/${noteId}/`, {
    method: 'DELETE',
    token: getToken() ?? undefined,
  })
}

