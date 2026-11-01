import type { Task } from './task.ts'

export const TASKS_STORAGE_KEY = 'zaloghub.tasks.v1'

export type TaskStorage = {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
}

type TaskEnvelope = {
  version: 1
  tasks: readonly Task[]
}

function toTask(value: unknown): Task | null {
  if (typeof value !== 'object' || value === null) return null

  const record = value as Record<string, unknown>
  const { id, title, completed, createdAt } = record

  if (typeof id !== 'string' || id.trim().length === 0) return null
  if (typeof title !== 'string') return null

  const normalizedTitle = title.trim()
  if (normalizedTitle.length === 0) return null
  if (typeof completed !== 'boolean') return null
  if (typeof createdAt !== 'number' || !Number.isFinite(createdAt)) return null

  return {
    id,
    title: normalizedTitle,
    completed,
    createdAt,
  }
}

export function serializeTasks(tasks: readonly Task[]): string {
  const envelope: TaskEnvelope = { version: 1, tasks }
  return JSON.stringify(envelope)
}

export function parseTasks(raw: string | null): readonly Task[] {
  if (raw === null || raw.trim().length === 0) return []

  let parsed: unknown

  try {
    parsed = JSON.parse(raw)
  } catch {
    return []
  }

  if (typeof parsed !== 'object' || parsed === null) return []

  const record = parsed as Record<string, unknown>
  if (record.version !== 1 || !Array.isArray(record.tasks)) return []

  const seen = new Set<string>()
  const tasks: Task[] = []

  for (const item of record.tasks) {
    const task = toTask(item)
    if (!task || seen.has(task.id)) continue
    seen.add(task.id)
    tasks.push(task)
  }

  tasks.sort((left, right) => left.createdAt - right.createdAt)
  return tasks
}

export function readTasks(storage: TaskStorage): readonly Task[] {
  try {
    return parseTasks(storage.getItem(TASKS_STORAGE_KEY))
  } catch {
    return []
  }
}

export function writeTasks(storage: TaskStorage, tasks: readonly Task[]): boolean {
  try {
    storage.setItem(TASKS_STORAGE_KEY, serializeTasks(tasks))
    return true
  } catch {
    return false
  }
}
