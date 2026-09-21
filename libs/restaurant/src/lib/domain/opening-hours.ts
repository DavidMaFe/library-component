/** 0 = Sunday ... 6 = Saturday, like `Date.getDay()`. */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface TimeRange {
  /** `HH:mm`, 24-hour. */
  readonly open: string;
  /** `HH:mm`. A time earlier than `open` means the range ends after midnight (`18:00`-`01:00`). */
  readonly close: string;
}

export interface DaySchedule {
  readonly day: Weekday;
  /** Several ranges cover split shifts (lunch and dinner). Empty means closed. */
  readonly ranges: readonly TimeRange[];
}

export interface Closure {
  /** Local date, `YYYY-MM-DD`. */
  readonly date: string;
  readonly reason?: string;
}

export interface OpeningHours {
  readonly schedule: readonly DaySchedule[];
  /** Dates on which the place is closed regardless of the weekly schedule. */
  readonly closures?: readonly Closure[];
}

export interface OpeningChange {
  readonly at: Date;
  /** `true` when the place opens at that moment, `false` when it closes. */
  readonly opens: boolean;
}

export interface OpenStatus {
  readonly open: boolean;
  /** The next opening or closing within a week, or `null` when it never changes. */
  readonly next: OpeningChange | null;
}

const MINUTES_PER_DAY = 1440;

/** `'18:30'` -> `1110`. Returns `NaN` for malformed input. */
export function toMinutes(time: string): number {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(time);
  return match ? Number(match[1]) * 60 + Number(match[2]) : NaN;
}

/** `1110` -> `'18:30'`, wrapping past midnight. */
export function fromMinutes(minutes: number): string {
  const wrapped =
    ((minutes % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const hours = Math.floor(wrapped / 60);
  return `${String(hours).padStart(2, '0')}:${String(wrapped % 60).padStart(2, '0')}`;
}

/** Local date as `YYYY-MM-DD`. */
export function isoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function closureOn(
  hours: OpeningHours,
  date: Date,
): Closure | undefined {
  const iso = isoDate(date);
  return hours.closures?.find((closure) => closure.date === iso);
}

/** Opening intervals of a calendar date, in minutes from that date's midnight. `end` may exceed 1440. */
export function intervalsOn(
  hours: OpeningHours,
  date: Date,
): { start: number; end: number }[] {
  if (closureOn(hours, date)) return [];

  return hours.schedule
    .filter((entry) => entry.day === date.getDay())
    .flatMap((entry) => entry.ranges)
    .flatMap((range) => {
      const start = toMinutes(range.open);
      let end = toMinutes(range.close);
      if (Number.isNaN(start) || Number.isNaN(end)) return [];
      if (end <= start) end += MINUTES_PER_DAY;
      return [{ start, end }];
    });
}

/** Whether the place is open at the given local moment. Opening is inclusive, closing exclusive. */
export function isOpenAt(hours: OpeningHours, at: Date): boolean {
  const minutes = at.getHours() * 60 + at.getMinutes();
  const today = intervalsOn(hours, at).some(
    ({ start, end }) => minutes >= start && minutes < end,
  );
  // A range that started yesterday and runs past midnight.
  const carried = intervalsOn(hours, addDays(at, -1)).some(
    ({ start, end }) =>
      minutes + MINUTES_PER_DAY >= start && minutes + MINUTES_PER_DAY < end,
  );
  return today || carried;
}

function atMinutes(date: Date, minutes: number): Date {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  result.setMinutes(minutes);
  return result;
}

/** The next moment the place opens or closes, looking at most 8 days ahead. */
export function nextChange(
  hours: OpeningHours,
  from: Date,
): OpeningChange | null {
  const current = isOpenAt(hours, from);
  const boundaries: Date[] = [];
  for (let offset = -1; offset <= 8; offset++) {
    const date = addDays(from, offset);
    for (const { start, end } of intervalsOn(hours, date)) {
      boundaries.push(atMinutes(date, start), atMinutes(date, end));
    }
  }

  const upcoming = boundaries
    .filter((boundary) => boundary.getTime() > from.getTime())
    .sort((a, b) => a.getTime() - b.getTime());
  const change = upcoming.find(
    (boundary) => isOpenAt(hours, boundary) !== current,
  );
  return change ? { at: change, opens: !current } : null;
}

export function openStatus(hours: OpeningHours, now: Date): OpenStatus {
  return { open: isOpenAt(hours, now), next: nextChange(hours, now) };
}

/** The weekly schedule as one entry per weekday, ordered from `weekStart`. Missing days are closed. */
export function weekSchedule(
  hours: OpeningHours,
  weekStart: Weekday = 1,
): DaySchedule[] {
  return Array.from({ length: 7 }, (_, index) => {
    const day = ((weekStart + index) % 7) as Weekday;
    const ranges = hours.schedule
      .filter((entry) => entry.day === day)
      .flatMap((entry) => entry.ranges);
    return { day, ranges };
  });
}
