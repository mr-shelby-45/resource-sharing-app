import { todayInNairobi, countDays, MAX_BOOKING_DAYS } from "@/lib/dates"

export function validateLoginInput(email: string, password: string) {
  if(!email || !password) throw new Error("Email and password are required")
  if(!email.includes("@")) throw new Error("Invalid email format")
}

export function validateRegisterInput(name: string, email: string, phone: string, password: string) {
  if(!name || !email || !phone || !password) {
    throw new Error("All fields are required")
  }
  if(!email.includes("@")) {
    throw new Error("Invalid email format")
  }
  if(phone.length < 10) {
    throw new Error("Invalid phone number")
  }
  if(password.length < 8) {
    throw new Error("Password must be at least 8 characters")
  }
}

const MAX_DAILY_RATE = 10000

export function validateItemInput(title: string, description: string, dailyRate: unknown) {
  if(!title?.trim() || !description?.trim()) {
    throw new Error("Title and Description are required")
  }
  if(typeof dailyRate !== "number" || !Number.isInteger(dailyRate)) {
    throw new Error("Daily rate must be a whole new number")
  }
  if(dailyRate < 0) {
    throw new Error("Daily rate cannot be negative")
  }
  if(dailyRate > MAX_DAILY_RATE) {
    throw new Error(`Daily rate cannot be more than KES ${MAX_DAILY_RATE}`)
  }
}

export function validateBookingDates(startDate: Date, endDate: Date) {
  if(startDate < todayInNairobi()) {
    throw new Error("Start date cannot be in the past")
  }
  if(endDate < startDate) {
    throw new Error("End date cannot be before the start date")
  }
  if(countDays(startDate, endDate) > MAX_BOOKING_DAYS) {
    throw new Error(`You can borrow an item for at most ${MAX_BOOKING_DAYS} days`)
  }
}