import { addTask, removeTask, toggleTask, type AddTaskResult, type Task } from '../domain/task.ts'
import { readTasks, writeTasks, type TaskStorage } from '../domain/storage.ts'

export type TaskSnapshot = {
  readonly tasks: readonly Task[]
  readonly persistError: boolean
}

export type TaskStore = {
  subscribe: (listener: () => void) => () => void
  getSnapshot: () => TaskSnapshot
  getServerSnapshot: () => TaskSnapshot
  add: (title: string) => AddTaskResult
  toggle: (id: string) => void
  remove: (id: string) => void
}

const SERVER_SNAPSHOT: TaskSnapshot = {
  tasks: [],
  persistError: false,
}

export function createTaskStore(
  storage: TaskStorage | null,
  subscribeExternal?: (onChange: () => void) => () => void,
): TaskStore {
  let snapshot: TaskSnapshot = {
    tasks: storage ? readTasks(storage) : [],
    persistError: storage === null,
  }

  const listeners = new Set<() => void>()

  function publish(next: TaskSnapshot) {
    snapshot = next
    for (const listener of listeners) listener()
  }

  function commit(tasks: readonly Task[]) {
    if (!storage) {
      publish({ tasks, persistError: true })
      return
    }

    publish({ tasks, persistError: !writeTasks(storage, tasks) })
  }

  subscribeExternal?.(() => {
    publish({
      tasks: storage ? readTasks(storage) : [],
      persistError: false,
    })
  })

  return {
    subscribe(listener) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    getSnapshot() {
      return snapshot
    },
    getServerSnapshot() {
      return SERVER_SNAPSHOT
    },
    add(title) {
      const result = addTask(snapshot.tasks, title)
      if (result.ok) commit(result.tasks)
      return result
    },
    toggle(id) {
      const next = toggleTask(snapshot.tasks, id)
      if (next !== snapshot.tasks) commit(next)
    },
    remove(id) {
      const next = removeTask(snapshot.tasks, id)
      if (next !== snapshot.tasks) commit(next)
    },
  }
}
