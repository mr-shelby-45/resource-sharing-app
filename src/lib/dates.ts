//the community lives in Kenya, so "today" means today in Nairobi, not on the server (UTC)
const COMMUNITY_TIME_ZONE = "Africa/Nairobi"
export const MAX_BOOKING_DAYS = 14
const DAY_MS = 24 * 60 * 60 * 1000

//"2026-11-10" -> midnight UTC of that day, the shape Prisma expects for a @db.Date column
export function parseDay(value: unknown): Date {
  if(typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error("Dates must be in YYYY-MM-DD format")
  }
  const date = new Date(`${value}T00:00:00.000Z`)
  //JS rolls 2026-02-31 over into March, so compare it back to the input to catch impossible dates
  if(Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new Error("Invalid date")
  }
  return date
}

export function todayInNairobi(now: Date = new Date()): Date {
  const iso = now.toLocaleDateString("en-CA", { timeZone: COMMUNITY_TIME_ZONE })
  return parseDay(iso)
}

//inclusive: the 10th to the 12th is 3 days
export function countDays(start: Date, end: Date): number {
  return Math.round((end.getTime() - start.getTime()) / DAY_MS) + 1
}

export function calculateFee(dailyRate: number, start: Date, end: Date): number {
  return dailyRate * countDays(start, end)
}

// Two inclusive ranges overlap when each starts on or before the other ends.
// Same rule the database constraint uses, so UI and DB agree.
export function datesOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart <= bEnd && bStart <= aEnd
}