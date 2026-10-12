export function formatRate(dailyRate: number) {
  if(dailyRate === 0) return "Free"
  return `KES ${dailyRate.toLocaleString("en-KE")} / day`
}
