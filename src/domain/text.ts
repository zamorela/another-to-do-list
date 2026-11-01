function pluralRu(count: number, forms: readonly [string, string, string]): string {
  const value = Math.abs(Math.trunc(count))
  const mod100 = value % 100
  const mod10 = value % 10
  const [one, few, many] = forms

  if (mod100 > 10 && mod100 < 20) return many
  if (mod10 === 1) return one
  if (mod10 > 1 && mod10 < 5) return few
  return many
}

export function formatActiveTasks(count: number): string {
  const noun = pluralRu(count, [
    'активная задача',
    'активные задачи',
    'активных задач',
  ])

  return `${count} ${noun}`
}
