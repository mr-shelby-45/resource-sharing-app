import { todayInNairobi, countDays, MAX_BOOKING_DAYS } from "@/lib/dates"
import { AppError } from "@/lib/errors"

export function validateLoginInput(email: string, password: string) {
  if(!email || !password) throw new AppError( 400, "Email and password are required")
  if(!email.includes("@")) throw new AppError( 400, "Invalid email format")
}

export function validateRegisterInput(name: string, email: string, phone: string, password: string) {
  if(!name || !email || !phone || !password) {
    throw new AppError( 400, "All fields are required")
  }
  if(!email.includes("@")) {
    throw new AppError( 400, "Invalid email format")
  }
  if(phone.length < 10) {
    throw new AppError( 400, "Invalid phone number")
  }
  if(password.length < 8) {
    throw new AppError( 400, "Password must be at least 8 characters")
  }
}

export function validatePasswordsMatch(password: string, confirmPassword: string) {
  if(password !== confirmPassword) {
    throw new AppError( 400, "Passwords do not match")
  }
}

const MAX_DAILY_RATE = 10000
export const MAX_ITEM_IMAGES = 4
const BLOB_HOST_SUFFIX = ".public.blob.vercel-storage.com"

export function validateItemInput(title: string, description: string, dailyRate: unknown) {
  if(!title?.trim() || !description?.trim()) {
    throw new AppError( 400, "Title and Description are required")
  }
  if(typeof dailyRate !== "number" || !Number.isInteger(dailyRate)) {
    throw new AppError( 400, "Daily rate must be a whole new number")
  }
  if(dailyRate < 0) {
    throw new AppError( 400, "Daily rate cannot be negative")
  }
  if(dailyRate > MAX_DAILY_RATE) {
    throw new AppError( 400, `Daily rate cannot be more than KES ${MAX_DAILY_RATE}`)
  }
}

export function validateBookingDates(startDate: Date, endDate: Date) {
  if(startDate < todayInNairobi()) {
    throw new AppError( 400, "Start date cannot be in the past")
  }
  if(endDate < startDate) {
    throw new AppError( 400, "End date cannot be before the start date")
  }
  if(countDays(startDate, endDate) > MAX_BOOKING_DAYS) {
    throw new AppError( 400, `You can borrow an item for at most ${MAX_BOOKING_DAYS} days`)
  }
}

export function validateImageUrls(urls: string[]) {
  if(urls.length > MAX_ITEM_IMAGES) {
    throw new AppError( 400, `You can add at most ${MAX_ITEM_IMAGES} photos`)
  }
  if(new Set(urls).size !== urls.length) {
    throw new AppError( 400, "Duplicate photos are not allowed")
  }
  for(const url of urls) {
    let parsed: URL
    try {
      parsed = new URL(url)
    } catch {
      throw new AppError( 400, "Invalid photo link")
    }
    // only accept photos that live in our own Blob store, under the items/ folder we upload to
    if(
      parsed.protocol !== "https:" ||
      !parsed.hostname.endsWith(BLOB_HOST_SUFFIX) ||
      !parsed.pathname.startsWith("/items/")
    ) {
      throw new AppError( 400, "Invalid photo link")
    }
  }
}