import type { CardProgress } from '../types'

const API = '/api'

let token: string | null = localStorage.getItem('auth_token')

let onUnauthorized: (() => void) | null = null

export function setOnUnauthorized(cb: () => void) {
  onUnauthorized = cb
}

function authHeaders(): HeadersInit {
  const h: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) h['Authorization'] = `Bearer ${token}`
  return h
}

async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { ...authHeaders(), ...init?.headers },
  })
  if (res.status === 401) {
    setToken(null)
    onUnauthorized?.()
  }
  return res
}

export function setToken(t: string | null) {
  token = t
  if (t) localStorage.setItem('auth_token', t)
  else localStorage.removeItem('auth_token')
}

export function getToken(): string | null {
  return token
}

export async function login(username: string, password: string): Promise<{ token: string; username: string }> {
  const res = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error((data as { error?: string }).error || 'Giriş başarısız')
  }
  const data = await res.json() as { token: string; username: string }
  setToken(data.token)
  return data
}

export async function register(username: string, password: string): Promise<{ token: string; username: string }> {
  const res = await apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error((data as { error?: string }).error || 'Kayıt başarısız')
  }
  const data = await res.json() as { token: string; username: string }
  setToken(data.token)
  return data
}

export async function fetchMe(): Promise<{ userId: number; username: string }> {
  const res = await apiFetch('/auth/me')
  if (!res.ok) throw new Error('Oturum geçersiz')
  return await res.json() as { userId: number; username: string }
}

export async function loadProgress(): Promise<Record<string, CardProgress>> {
  const res = await apiFetch('/progress')
  if (!res.ok) return {}
  return await res.json() as Record<string, CardProgress>
}

export async function saveProgress(progress: Record<string, CardProgress>): Promise<void> {
  await apiFetch('/progress', {
    method: 'PUT',
    body: JSON.stringify(progress),
  })
}

export async function clearProgress(): Promise<void> {
  await apiFetch('/progress', { method: 'DELETE' })
}
