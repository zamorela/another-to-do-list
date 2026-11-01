import { describe, expect, it } from 'vitest'
import {
  TASKS_STORAGE_KEY,
  parseTasks,
  serializeTasks,
  type TaskStorage,
} from '../domain/storage.ts'
import type { Task } from '../domain/task.ts'
import { createTaskStore } from './task-store.ts'

function memoryStorage(initial: string | null = null): TaskStorage & { raw: () => string | null } {
  let value = initial

  return {
    getItem(key) {
      return key === TASKS_STORAGE_KEY ? value : null
    },
    setItem(key, next) {
      if (key !== TASKS_STORAGE_KEY) return
      value = next
    },
    raw() {
      return value
    },
  }
}

describe('createTaskStore', () => {
  it('сохраняет задачу и читает её новым хранилищем', () => {
    const storage = memoryStorage()
    const store = createTaskStore(storage)
    const result = store.add('  Купить молоко  ')

    expect(result.ok).toBe(true)

    const restored = createTaskStore(storage).getSnapshot().tasks
    expect(restored.map((task) => task.title)).toEqual(['Купить молоко'])
    expect(restored[0]?.completed).toBe(false)
  })

  it('не записывает пустую задачу', () => {
    const storage = memoryStorage()
    const store = createTaskStore(storage)

    expect(store.add('   ').ok).toBe(false)
    expect(storage.raw()).toBeNull()
    expect(store.getSnapshot().tasks).toEqual([])
  })

  it('переключает и удаляет задачу в хранилище', () => {
    const storage = memoryStorage()
    const store = createTaskStore(storage)
    store.add('Первая')
    store.add('Вторая')

    const first = store.getSnapshot().tasks[0]
    expect(first).toBeDefined()
    if (!first) return

    store.toggle(first.id)
    expect(createTaskStore(storage).getSnapshot().tasks[0]?.completed).toBe(true)

    store.remove(first.id)
    expect(createTaskStore(storage).getSnapshot().tasks.map((task) => task.title)).toEqual([
      'Вторая',
    ])
  })

  it('не пишет в хранилище, если задачи с таким id нет', () => {
    let writes = 0
    const storage: TaskStorage = {
      getItem() {
        return null
      },
      setItem() {
        writes += 1
      },
    }
    const store = createTaskStore(storage)

    store.toggle('missing')
    store.remove('missing')

    expect(writes).toBe(0)
  })

  it('оставляет список в памяти, если запись не удалась', () => {
    const storage: TaskStorage = {
      getItem() {
        return null
      },
      setItem() {
        throw new Error('quota')
      },
    }
    const store = createTaskStore(storage)
    const result = store.add('Молоко')

    expect(result.ok).toBe(true)
    expect(store.getSnapshot().tasks.map((task) => task.title)).toEqual(['Молоко'])
    expect(store.getSnapshot().persistError).toBe(true)
  })

  it('подхватывает внешнее изменение хранилища', () => {
    let notify = () => {}
    const storage = memoryStorage()
    const store = createTaskStore(storage, (onChange) => {
      notify = onChange
      return () => {}
    })
    const external: readonly Task[] = [
      { id: '1', title: 'Из другой вкладки', completed: false, createdAt: 1 },
    ]

    storage.setItem(TASKS_STORAGE_KEY, serializeTasks(external))
    notify()

    expect(store.getSnapshot().tasks).toEqual(external)
    expect(store.getSnapshot().persistError).toBe(false)

    storage.setItem(TASKS_STORAGE_KEY, '{')
    notify()

    expect(store.getSnapshot().tasks).toEqual([])
    expect(parseTasks('{')).toEqual([])
  })

  it('сообщает, что сохранять некуда, если хранилища нет', () => {
    const store = createTaskStore(null)
    expect(store.getSnapshot().persistError).toBe(true)
    expect(store.add('Молоко').ok).toBe(true)
    expect(store.getSnapshot().tasks).toHaveLength(1)
    expect(store.getSnapshot().persistError).toBe(true)
  })
})
