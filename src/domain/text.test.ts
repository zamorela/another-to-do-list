import { describe, expect, it } from 'vitest'
import { formatActiveTasks } from './text.ts'

describe('formatActiveTasks', () => {
  it('склоняет подпись по числу задач', () => {
    expect(formatActiveTasks(0)).toBe('0 активных задач')
    expect(formatActiveTasks(1)).toBe('1 активная задача')
    expect(formatActiveTasks(2)).toBe('2 активные задачи')
    expect(formatActiveTasks(4)).toBe('4 активные задачи')
    expect(formatActiveTasks(5)).toBe('5 активных задач')
    expect(formatActiveTasks(11)).toBe('11 активных задач')
    expect(formatActiveTasks(21)).toBe('21 активная задача')
    expect(formatActiveTasks(22)).toBe('22 активные задачи')
    expect(formatActiveTasks(111)).toBe('111 активных задач')
  })
})
