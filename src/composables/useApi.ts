import type { DiffResult, Snapshot, SnapshotSummary } from '../types'

const BASE = '/api'

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(BASE + url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || `HTTP ${res.status}`)
  }
  return res.json()
}

export const api = {
  getSnapshots(): Promise<SnapshotSummary[]> {
    return request('/snapshots')
  },
  getSnapshot(id: string): Promise<Snapshot> {
    return request(`/snapshots/${id}`)
  },
  createSnapshot(data: { label: string; followers: { username: string; displayName: string }[]; following: { username: string; displayName: string }[] }): Promise<Snapshot> {
    return request('/snapshots', { method: 'POST', body: JSON.stringify(data) })
  },
  deleteSnapshot(id: string): Promise<void> {
    return request(`/snapshots/${id}`, { method: 'DELETE' })
  },
  getDiff(fromId: string | null, toId: string): Promise<DiffResult> {
    const params = new URLSearchParams({ to: toId })
    if (fromId) params.set('from', fromId)
    return request(`/diff?${params}`)
  },
}
