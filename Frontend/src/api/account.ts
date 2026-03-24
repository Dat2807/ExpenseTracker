import { apiRequest } from './client'

export type LoginPayload = {
  username: string
  password: string
}

export type LoginResponse = {
  code: string
  message: string
  token: string
  user: {
    id: number
    username: string
    email: string
  }
}

export async function login(payload: LoginPayload) {
  return apiRequest<LoginResponse>('/api/account/login/', {
    method: 'POST',
    body: payload,
  })
}

export type RegisterPayload = {
  username: string
  email: string
  password: string
  password_confirm: string
}

export type RegisterResponse = {
  code: string
  message: string
  token: string
  user: {
    id: number
    username: string
    email: string
  }
}

export async function register(payload: RegisterPayload) {
  return apiRequest<RegisterResponse>('/api/account/register/', {
    method: 'POST',
    body: payload,
  })
}

