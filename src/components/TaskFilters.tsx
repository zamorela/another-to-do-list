import type { TaskCounts, TaskFilter } from '../domain/task.ts'

const FILTERS: readonly { id: TaskFilter; label: string }[] = [
  { id: 'all', label: 'Все' },
  { id: 'active', label: 'Активные' },
  { id: 'completed', label: 'Выполненные' },
]

type TaskFiltersProps = {
  value: TaskFilter
  counts: TaskCounts
  onChange: (filter: TaskFilter) => void
}

export function TaskFilters({ value, counts, onChange }: TaskFiltersProps) {
  return (
    <fieldset className="filters">
      <legend className="visually-hidden">Фильтр задач</legend>
      {FILTERS.map((filter) => {
        const selected = value === filter.id

        return (
          <label
            key={filter.id}
            className={selected ? 'filters__option is-selected' : 'filters__option'}
          >
            <input
              type="radio"
              name="task-filter"
              value={filter.id}
              checked={selected}
              onChange={() => {
                onChange(filter.id)
              }}
            />
            <span>{filter.label}</span>
            <span className="filters__count">{counts[filter.id]}</span>
          </label>
        )
      })}
    </fieldset>
  )
}
