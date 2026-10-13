// src/lib/errors.ts
export class AppError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

// Detects the Postgres exclusion-constraint violation (SQLSTATE 23P01).
// Checks the constraint name too, because Prisma's driver adapter can wrap the error differently.
export function isOverlapViolation(e: unknown): boolean {
  let cur: any = e
  for (let i = 0; i < 4 && cur; i++) {
    const haystack = `${cur.message ?? ""} ${cur.code ?? ""} ${cur.originalCode ?? ""} ${JSON.stringify(cur.meta ?? {})}`
    if (haystack.includes("no_overlapping_approved_bookings") || haystack.includes("23P01")) return true
    cur = cur.cause
  }
  return false
}