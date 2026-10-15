import { describe, it, expect, beforeEach, afterEach, jest } from "@jest/globals"
import { parseDay, countDays, calculateFee, todayInNairobi } from "@/lib/dates"
import {
  validateBookingDates,
  validateItemInput,
  validateImageUrls,
  validateRegisterInput,
  validateLoginInput,
  MAX_ITEM_IMAGES,
} from "@/lib/validators"

// Pretend "now" is 12:00 in Nairobi on 10 Nov 2026 (09:00 UTC)
const NOW = new Date("2026-11-10T09:00:00.000Z")

beforeEach(() => {
  jest.useFakeTimers()
  jest.setSystemTime(NOW)
})
afterEach(() => {
  jest.useRealTimers()
})

const day = (iso: string) => parseDay(iso)
const blobUrl = (name: string) => `https://abc123.public.blob.vercel-storage.com/items/${name}.jpg`

describe("parseDay", () => {
  it("turns YYYY-MM-DD into midnight UTC", () => {
    expect(parseDay("2026-11-10").toISOString()).toBe("2026-11-10T00:00:00.000Z")
  })
  it("rejects impossible dates like 31 February", () => {
    expect(() => parseDay("2026-02-31")).toThrow("Invalid date")
  })
  it("rejects the wrong format", () => {
    expect(() => parseDay("10-11-2026")).toThrow("YYYY-MM-DD")
    expect(() => parseDay("2026/11/10")).toThrow("YYYY-MM-DD")
  })
  it("rejects values that are not strings", () => {
    expect(() => parseDay(undefined)).toThrow("YYYY-MM-DD")
    expect(() => parseDay(20261110)).toThrow("YYYY-MM-DD")
    expect(() => parseDay(new Date())).toThrow("YYYY-MM-DD")
  })
})

describe("todayInNairobi", () => {
  it("is the same calendar day at midday", () => {
    expect(todayInNairobi().toISOString().slice(0, 10)).toBe("2026-11-10")
  })
  it("is already tomorrow after 21:00 UTC, because Nairobi is UTC+3", () => {
    const lateUtc = new Date("2026-11-10T22:00:00.000Z")
    expect(todayInNairobi(lateUtc).toISOString().slice(0, 10)).toBe("2026-11-11")
  })
})

describe("countDays and calculateFee", () => {
  it("counts both the first and the last day", () => {
    expect(countDays(day("2026-11-10"), day("2026-11-12"))).toBe(3)
  })
  it("counts a single day as 1", () => {
    expect(countDays(day("2026-11-10"), day("2026-11-10"))).toBe(1)
  })
  it("multiplies the rate by the days", () => {
    expect(calculateFee(400, day("2026-11-10"), day("2026-11-12"))).toBe(1200)
  })
  it("is free when the rate is 0", () => {
    expect(calculateFee(0, day("2026-11-10"), day("2026-11-12"))).toBe(0)
  })
})

describe("validateBookingDates", () => {
  it("accepts starting today", () => {
    expect(() => validateBookingDates(day("2026-11-10"), day("2026-11-10"))).not.toThrow()
  })
  it("rejects a start date in the past", () => {
    expect(() => validateBookingDates(day("2026-11-09"), day("2026-11-12"))).toThrow("past")
  })
  it("rejects an end date before the start date", () => {
    expect(() => validateBookingDates(day("2026-11-12"), day("2026-11-11"))).toThrow("before")
  })
  it("accepts exactly 14 days", () => {
    expect(() => validateBookingDates(day("2026-11-10"), day("2026-11-23"))).not.toThrow()
  })
  it("rejects 15 days", () => {
    expect(() => validateBookingDates(day("2026-11-10"), day("2026-11-24"))).toThrow("at most 14")
  })
})

describe("validateItemInput", () => {
  it("accepts a normal item", () => {
    expect(() => validateItemInput("Drill", "Good condition", 400)).not.toThrow()
  })
  it("accepts a free item (rate 0)", () => {
    expect(() => validateItemInput("Drill", "Good condition", 0)).not.toThrow()
  })
  it("rejects a blank title or a whitespace-only description", () => {
    expect(() => validateItemInput("", "Good", 100)).toThrow("required")
    expect(() => validateItemInput("Drill", "   ", 100)).toThrow("required")
  })
  it("rejects rates that are not whole numbers", () => {
    expect(() => validateItemInput("Drill", "Good", 150.5)).toThrow("whole")
    expect(() => validateItemInput("Drill", "Good", "150")).toThrow("whole")
    expect(() => validateItemInput("Drill", "Good", NaN)).toThrow("whole")
  })
  it("rejects a negative rate", () => {
    expect(() => validateItemInput("Drill", "Good", -1)).toThrow("negative")
  })
  it("allows 10000 but rejects 10001", () => {
    expect(() => validateItemInput("Drill", "Good", 10000)).not.toThrow()
    expect(() => validateItemInput("Drill", "Good", 10001)).toThrow("more than")
  })
})

describe("validateImageUrls", () => {
  it("accepts no photos", () => {
    expect(() => validateImageUrls([])).not.toThrow()
  })
  it("accepts photos from our blob store", () => {
    expect(() => validateImageUrls([blobUrl("a"), blobUrl("b")])).not.toThrow()
  })
  it("rejects more than the maximum", () => {
    const urls = Array.from({ length: MAX_ITEM_IMAGES + 1 }, (_, i) => blobUrl(`p${i}`))
    expect(() => validateImageUrls(urls)).toThrow("at most")
  })
  it("rejects duplicates", () => {
    expect(() => validateImageUrls([blobUrl("a"), blobUrl("a")])).toThrow("Duplicate")
  })
  it("rejects links that are not URLs", () => {
    expect(() => validateImageUrls(["not a url"])).toThrow("Invalid photo link")
  })
  it("rejects other hosts, including look-alikes", () => {
    expect(() => validateImageUrls(["https://evil.com/items/a.jpg"])).toThrow("Invalid photo link")
    expect(() =>
      validateImageUrls(["https://abc.public.blob.vercel-storage.com.evil.com/items/a.jpg"])
    ).toThrow("Invalid photo link")
  })
  it("rejects http links", () => {
    expect(() =>
      validateImageUrls(["http://abc123.public.blob.vercel-storage.com/items/a.jpg"])
    ).toThrow("Invalid photo link")
  })
  it("rejects files outside the items/ folder", () => {
    expect(() =>
      validateImageUrls(["https://abc123.public.blob.vercel-storage.com/other/a.jpg"])
    ).toThrow("Invalid photo link")
  })
})

describe("validateRegisterInput", () => {
  it("accepts valid details", () => {
    expect(() => validateRegisterInput("Alice", "a@b.com", "0712345678", "password123")).not.toThrow()
  })
  it("rejects missing fields, bad email, short phone and short password", () => {
    expect(() => validateRegisterInput("", "a@b.com", "0712345678", "password123")).toThrow("required")
    expect(() => validateRegisterInput("Alice", "ab.com", "0712345678", "password123")).toThrow("email")
    expect(() => validateRegisterInput("Alice", "a@b.com", "071", "password123")).toThrow("phone")
    expect(() => validateRegisterInput("Alice", "a@b.com", "0712345678", "short")).toThrow("8 characters")
  })
})

describe("validateLoginInput", () => {
  it("accepts an email and password", () => {
    expect(() => validateLoginInput("a@b.com", "x")).not.toThrow()
  })
  it("rejects missing values and a bad email", () => {
    expect(() => validateLoginInput("", "x")).toThrow("required")
    expect(() => validateLoginInput("a@b.com", "")).toThrow("required")
    expect(() => validateLoginInput("ab.com", "x")).toThrow("email")
  })
})