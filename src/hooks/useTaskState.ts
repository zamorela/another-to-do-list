import { useSyncExternalStore } from 'react'
import { taskStore } from '../store/browser-task-store.ts'
import type { TaskSnapshot } from '../store/task-store.ts'

export function useTaskState(): TaskSnapshot {
  return useSyncExternalStore(
    taskStore.subscribe,
    taskStore.getSnapshot,
    taskStore.getServerSnapshot,
  )
}
