import { apiRequest } from './client'
import { getToken } from '../state/auth'

export type CategoryType = 'INCOME' | 'EXPENSE'

export type Category = {
  id: number
  name: string
  type: CategoryType
  is_active: boolean
}

export async function listCategories(type?: CategoryType) {
  const query = type ? `?type=${type}` : ''
  return apiRequest<Category[]>(`/api/categories/${query}`, {
    token: getToken() ?? undefined,
  })
}

export async function createCategory(payload: { name: string; type: CategoryType }) {
  return apiRequest<Category>('/api/categories/', {
    method: 'POST',
    body: {
      ...payload,
      is_active: true,
    },
    token: getToken() ?? undefined,
  })
}

export async function deleteCategory(categoryId: number) {
  return apiRequest<void>(`/api/categories/${categoryId}/`, {
    method: 'DELETE',
    token: getToken() ?? undefined,
  })
}

