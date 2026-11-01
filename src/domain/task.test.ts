import { describe, expect, it } from 'vitest'
import {
  addTask,
  countTasks,
  filterTasks,
  removeTask,
  toggleTask,
  type Task,
} from './task.ts'

function task(overrides: Partial<Task> & Pick<Task, 'id' | 'title'>): Task {
  return {
    completed: false,
    createdAt: 0,
    ...overrides,
  }
}

describe('addTask', () => {
  it('не добавляет пустую строку и строку из пробелов', () => {
    const existing = [task({ id: '1', title: 'Купить молоко' })]

    expect(addTask(existing, '').ok).toBe(false)
    expect(addTask(existing, '   ').ok).toBe(false)
    expect(addTask(existing, '\n\t  ').ok).toBe(false)
    expect(existing).toHaveLength(1)
  })

  it('обрезает пробелы по краям и сохраняет пробелы внутри', () => {
    const result = addTask([], '  купить   молоко  ', { id: '1', createdAt: 10 })

    expect(result).toEqual({
      ok: true,
      tasks: [
        {
          id: '1',
          title: 'купить   молоко',
          completed: false,
          createdAt: 10,
        },
      ],
    })
  })

  it('добавляет задачу в конец и не меняет исходный список', () => {
    const existing = [task({ id: '1', title: 'Первая', createdAt: 1 })]
    const result = addTask(existing, 'Вторая', { id: '2', createdAt: 2 })

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.tasks.map((item) => item.id)).toEqual(['1', '2'])
    expect(existing).toHaveLength(1)
  })
})

describe('toggleTask', () => {
  it('переключает только выбранную задачу', () => {
    const tasks = [
      task({ id: '1', title: 'Первая' }),
      task({ id: '2', title: 'Вторая', completed: true }),
    ]
    const next = toggleTask(tasks, '1')

    expect(next[0]?.completed).toBe(true)
    expect(next[1]?.completed).toBe(true)
    expect(tasks[0]?.completed).toBe(false)
  })

  it('возвращает тот же список, если задачи нет', () => {
    const tasks = [task({ id: '1', title: 'Первая' })]
    expect(toggleTask(tasks, 'missing')).toBe(tasks)
  })
})

describe('removeTask', () => {
  it('удаляет задачу по id и не трогает остальные', () => {
    const tasks = [
      task({ id: '1', title: 'Первая' }),
      task({ id: '2', title: 'Вторая' }),
    ]

    expect(removeTask(tasks, '1').map((item) => item.id)).toEqual(['2'])
    expect(tasks).toHaveLength(2)
  })

  it('возвращает тот же список, если задачи нет', () => {
    const tasks = [task({ id: '1', title: 'Первая' })]
    expect(removeTask(tasks, 'missing')).toBe(tasks)
  })
})

describe('filterTasks и countTasks', () => {
  const tasks = [
    task({ id: '1', title: 'Активная' }),
    task({ id: '2', title: 'Готовая', completed: true }),
  ]

  it('фильтрует все, активные и выполненные', () => {
    expect(filterTasks(tasks, 'all')).toBe(tasks)
    expect(filterTasks(tasks, 'active').map((item) => item.id)).toEqual(['1'])
    expect(filterTasks(tasks, 'completed').map((item) => item.id)).toEqual(['2'])
  })

  it('считает задачи по статусу', () => {
    expect(countTasks(tasks)).toEqual({ all: 2, active: 1, completed: 1 })
    expect(countTasks([])).toEqual({ all: 0, active: 0, completed: 0 })
  })
})
