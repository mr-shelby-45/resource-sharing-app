export function formatRate(dailyRate: number) {
  if(dailyRate === 0) return "Free"
  return `KES ${dailyRate.toLocaleString("en-KE")} / day`
}

// Dates are stored as midnight UTC, so format in UTC. Using the local zone
// could shift them back a day.
export function formatDay(date: Date) {
  return date.toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric", timeZone: "UTC",
  })
}

export function formatDateRange(start: Date, end: Date) {
  return start.getTime() === end.getTime()
    ? formatDay(start)
    : `${formatDay(start)} to ${formatDay(end)}`
}