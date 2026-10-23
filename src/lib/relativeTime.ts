const UNITS: Array<[Intl.RelativeTimeFormatUnit, number]> = [
  ['year', 365 * 24 * 3600],
  ['month', 30 * 24 * 3600],
  ['week', 7 * 24 * 3600],
  ['day', 24 * 3600],
  ['hour', 3600],
  ['minute', 60],
]

const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

/** "3 hours ago", "yesterday", "just now". `now` is injectable for tests. */
export function relativeTime(iso: string, now: Date = new Date()): string {
  const seconds = Math.round((Date.parse(iso) - now.getTime()) / 1000)
  const abs = Math.abs(seconds)
  if (abs < 45) return 'just now'
  for (const [unit, size] of UNITS) {
    if (abs >= size) return rtf.format(Math.round(seconds / size), unit)
  }
  return rtf.format(Math.round(seconds / 60), 'minute')
}
