export type Task = {
  readonly id: string
  readonly title: string
  readonly completed: boolean
  readonly createdAt: number
}

export type TaskFilter = 'all' | 'active' | 'completed'

export type TaskCounts = Record<TaskFilter, number>

export type AddTaskResult =
  | { ok: true; tasks: readonly Task[] }
  | { ok: false; reason: 'empty' }

type NewTaskMeta = {
  id?: string
  createdAt?: number
}

export function addTask(
  tasks: readonly Task[],
  title: string,
  meta: NewTaskMeta = {},
): AddTaskResult {
  const normalized = title.trim()

  if (normalized.length === 0) {
    return { ok: false, reason: 'empty' }
  }

  const task: Task = {
    id: meta.id ?? crypto.randomUUID(),
    title: normalized,
    completed: false,
    createdAt: meta.createdAt ?? Date.now(),
  }

  return { ok: true, tasks: [...tasks, task] }
}

export function toggleTask(tasks: readonly Task[], id: string): readonly Task[] {
  const index = tasks.findIndex((task) => task.id === id)
  const current = index === -1 ? undefined : tasks[index]

  if (!current) return tasks

  return tasks.map((task) =>
    task.id === id ? { ...task, completed: !task.completed } : task,
  )
}

export function removeTask(tasks: readonly Task[], id: string): readonly Task[] {
  const next = tasks.filter((task) => task.id !== id)
  return next.length === tasks.length ? tasks : next
}

export function filterTasks(
  tasks: readonly Task[],
  filter: TaskFilter,
): readonly Task[] {
  switch (filter) {
    case 'all':
      return tasks
    case 'active':
      return tasks.filter((task) => !task.completed)
    case 'completed':
      return tasks.filter((task) => task.completed)
    default: {
      const unexpected: never = filter
      throw new Error(`Неизвестный фильтр: ${String(unexpected)}`)
    }
  }
}

export function countTasks(tasks: readonly Task[]): TaskCounts {
  let active = 0
  let completed = 0

  for (const task of tasks) {
    if (task.completed) completed += 1
    else active += 1
  }

  return { all: tasks.length, active, completed }
}
