import type { Task } from '../domain/task.ts'
import { TaskItem } from './TaskItem.tsx'

type TaskListProps = {
  tasks: readonly Task[]
  emptyLabel: string
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}

export function TaskList({ tasks, emptyLabel, onToggle, onDelete }: TaskListProps) {
  if (tasks.length === 0) {
    return <p className="empty">{emptyLabel}</p>
  }

  return (
    <ul className="tasks" aria-label="Список задач">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} onToggle={onToggle} onDelete={onDelete} />
      ))}
    </ul>
  )
}
