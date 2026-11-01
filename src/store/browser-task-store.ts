import { TASKS_STORAGE_KEY, type TaskStorage } from '../domain/storage.ts'
import { createTaskStore } from './task-store.ts'

function browserStorage(): TaskStorage | null {
  try {
    if (typeof window === 'undefined') return null
    return window.localStorage
  } catch {
    return null
  }
}

function subscribeToBrowserStorage(onChange: () => void): () => void {
  if (typeof window === 'undefined') return () => {}

  const onStorage = (event: StorageEvent) => {
    if (event.key !== null && event.key !== TASKS_STORAGE_KEY) return
    onChange()
  }

  window.addEventListener('storage', onStorage)
  return () => {
    window.removeEventListener('storage', onStorage)
  }
}

export const taskStore = createTaskStore(browserStorage(), subscribeToBrowserStorage)
