import { useState } from 'react'
import { TaskFilters } from './components/TaskFilters.tsx'
import { TaskForm } from './components/TaskForm.tsx'
import { TaskList } from './components/TaskList.tsx'
import { countTasks, filterTasks, type AddTaskResult, type TaskFilter } from './domain/task.ts'
import { formatActiveTasks } from './domain/text.ts'
import { useTaskState } from './hooks/useTaskState.ts'
import { taskStore } from './store/browser-task-store.ts'

function emptyLabel(filter: TaskFilter, total: number): string {
  if (total === 0) return 'Список пуст. Добавьте первую задачу.'

  switch (filter) {
    case 'all':
      return 'Список пуст. Добавьте первую задачу.'
    case 'active':
      return 'Нет активных задач.'
    case 'completed':
      return 'Нет выполненных задач.'
    default: {
      const unexpected: never = filter
      return unexpected
    }
  }
}

export default function App() {
  const { tasks, persistError } = useTaskState()
  const [filter, setFilter] = useState<TaskFilter>('all')
  const counts = countTasks(tasks)
  const visibleTasks = filterTasks(tasks, filter)

  function handleAdd(title: string): AddTaskResult {
    const result = taskStore.add(title)

    if (result.ok && filter === 'completed') {
      setFilter('active')
    }

    return result
  }

  return (
    <main className="shell">
      <div className="panel">
        <header className="header">
          <h1>Задачи</h1>
          <p className="header__count" aria-live="polite">
            {formatActiveTasks(counts.active)}
          </p>
        </header>

        {persistError ? (
          <p className="banner" role="status">
            Не удалось сохранить список в этом браузере. После обновления страницы изменения
            пропадут.
          </p>
        ) : null}

        <TaskForm onAdd={handleAdd} />
        <TaskFilters value={filter} counts={counts} onChange={setFilter} />
        <TaskList
          tasks={visibleTasks}
          emptyLabel={emptyLabel(filter, tasks.length)}
          onToggle={taskStore.toggle}
          onDelete={taskStore.remove}
        />
        <p className="footnote">Список хранится локально в этом браузере.</p>
      </div>
    </main>
  )
}
