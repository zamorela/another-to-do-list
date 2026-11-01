import { useId, useRef, useState, type FormEvent } from 'react'
import type { AddTaskResult } from '../domain/task.ts'

type TaskFormProps = {
  onAdd: (title: string) => AddTaskResult
}

const EMPTY_TASK_MESSAGE = 'Введите текст задачи'

export function TaskForm({ onAdd }: TaskFormProps) {
  const inputId = useId()
  const errorId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [title, setTitle] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const result = onAdd(title)

    if (!result.ok) {
      setError(EMPTY_TASK_MESSAGE)
      inputRef.current?.focus()
      inputRef.current?.select()
      return
    }

    setTitle('')
    setError(null)
    inputRef.current?.focus()
  }

  return (
    <form className="task-form" onSubmit={handleSubmit} noValidate>
      <label className="field-label" htmlFor={inputId}>
        Новая задача
      </label>
      <div className="composer">
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          name="title"
          value={title}
          placeholder="Что нужно сделать?"
          autoComplete="off"
          enterKeyHint="done"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          onChange={(event) => {
            setTitle(event.target.value)
            if (error) setError(null)
          }}
        />
        <button type="submit">Добавить</button>
      </div>
      {error ? (
        <p id={errorId} className="form-error" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  )
}
