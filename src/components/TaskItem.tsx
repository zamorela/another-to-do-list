import type { Task } from '../domain/task.ts'

type TaskItemProps = {
  task: Task
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}

export function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
  return (
    <li className={task.completed ? 'task is-done' : 'task'}>
      <label className="task__check">
        <input
          className="task__input"
          type="checkbox"
          checked={task.completed}
          onChange={() => {
            onToggle(task.id)
          }}
        />
        <span className="task__mark" aria-hidden="true" />
        <span className="task__title">{task.title}</span>
      </label>
      <button
        type="button"
        className="task__delete"
        aria-label={`Удалить задачу «${task.title}»`}
        onClick={() => {
          onDelete(task.id)
        }}
      >
        Удалить
      </button>
    </li>
  )
}
