import { describe, expect, it } from 'vitest'
import { parseTasks, readTasks, serializeTasks, writeTasks, type TaskStorage } from './storage.ts'
import type { Task } from './task.ts'

const tasks: readonly Task[] = [
  { id: 'a', title: 'Раньше', completed: false, createdAt: 10 },
  { id: 'b', title: 'Позже', completed: true, createdAt: 20 },
]

describe('parseTasks', () => {
  it('читает записанный список без потерь', () => {
    expect(parseTasks(serializeTasks(tasks))).toEqual(tasks)
  })

  it('возвращает пустой список для пустого и битого значения', () => {
    expect(parseTasks(null)).toEqual([])
    expect(parseTasks('')).toEqual([])
    expect(parseTasks('{')).toEqual([])
    expect(parseTasks('null')).toEqual([])
    expect(parseTasks('[]')).toEqual([])
    expect(parseTasks('{"version":2,"tasks":[]}')).toEqual([])
  })

  it('оставляет только корректные задачи, убирает дубли и сортирует по времени', () => {
    const raw = JSON.stringify({
      version: 1,
      tasks: [
        { id: 'b', title: '  Позже  ', completed: false, createdAt: 20 },
        { id: 'b', title: 'Дубль', completed: true, createdAt: 30 },
        { id: 'bad', title: '   ', completed: false, createdAt: 1 },
        { id: 'a', title: 'Раньше', completed: 'yes', createdAt: 10 },
        { id: 'a', title: 'Раньше', completed: false, createdAt: 10 },
        { title: 'Без id' },
        null,
      ],
    })

    expect(parseTasks(raw)).toEqual([
      { id: 'a', title: 'Раньше', completed: false, createdAt: 10 },
      { id: 'b', title: 'Позже', completed: false, createdAt: 20 },
    ])
  })

  it('сохраняет порядок задач с одинаковым временем создания', () => {
    const raw = JSON.stringify({
      version: 1,
      tasks: [
        { id: 'b', title: 'Вторая', completed: false, createdAt: 5 },
        { id: 'c', title: 'Третья', completed: false, createdAt: 5 },
        { id: 'a', title: 'Первая', completed: false, createdAt: 1 },
      ],
    })

    expect(parseTasks(raw).map((task) => task.id)).toEqual(['a', 'b', 'c'])
  })
})

describe('readTasks и writeTasks', () => {
  it('не падает, если хранилище недоступно', () => {
    const storage: TaskStorage = {
      getItem() {
        throw new Error('denied')
      },
      setItem() {
        throw new Error('quota')
      },
    }

    expect(readTasks(storage)).toEqual([])
    expect(writeTasks(storage, tasks)).toBe(false)
  })
})
