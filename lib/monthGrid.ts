export type MonthKey = { year: number; month: number }

export function toMonthIndex(month: MonthKey): number {
  return month.year * 12 + month.month
}

export function addMonths(month: MonthKey, delta: number): MonthKey {
  const total = toMonthIndex(month) + delta
  return { year: Math.floor(total / 12), month: ((total % 12) + 12) % 12 }
}

export function clampMonth(
  month: MonthKey,
  min: MonthKey,
  max: MonthKey,
): MonthKey {
  const clamped = Math.min(
    Math.max(toMonthIndex(month), toMonthIndex(min)),
    toMonthIndex(max),
  )
  return { year: Math.floor(clamped / 12), month: clamped % 12 }
}

export function getMonthGridDates(month: MonthKey): Date[] {
  const firstOfMonth = new Date(month.year, month.month, 1)
  const leadingDays = (firstOfMonth.getDay() + 6) % 7
  const gridStart = new Date(month.year, month.month, 1 - leadingDays)

  const lastOfMonth = new Date(month.year, month.month + 1, 0)
  const trailingDays = 6 - ((lastOfMonth.getDay() + 6) % 7)
  const gridEnd = new Date(
    month.year,
    month.month,
    lastOfMonth.getDate() + trailingDays,
  )

  const dates: Date[] = []
  for (
    const cursor = new Date(gridStart);
    cursor <= gridEnd;
    cursor.setDate(cursor.getDate() + 1)
  ) {
    dates.push(new Date(cursor))
  }
  return dates
}
