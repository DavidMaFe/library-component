import {
  fromMinutes,
  intervalsOn,
  isoDate,
  OpeningHours,
  toMinutes,
} from './opening-hours';

export interface ReservationRequest {
  /** Local date, `YYYY-MM-DD`. */
  readonly date: string;
  /** `HH:mm`. */
  readonly time: string;
  readonly partySize: number;
  readonly name: string;
  readonly email: string;
  readonly phone?: string;
  readonly notes?: string;
}

export interface ReservationPolicy {
  readonly minPartySize: number;
  readonly maxPartySize: number;
  /** A table cannot be booked closer than this to the current time. */
  readonly minLeadMinutes: number;
  readonly maxAdvanceDays: number;
  /** Granularity of the bookable times. */
  readonly slotMinutes: number;
  /** The last bookable time is this long before closing. */
  readonly lastSeatingBeforeCloseMinutes: number;
  /** Bookable times follow these hours. Without them, `defaultRange` is used every day. */
  readonly openingHours?: OpeningHours;
  readonly defaultRange: { readonly open: string; readonly close: string };
}

export const DEFAULT_RESERVATION_POLICY: ReservationPolicy = {
  minPartySize: 1,
  maxPartySize: 12,
  minLeadMinutes: 60,
  maxAdvanceDays: 90,
  slotMinutes: 30,
  lastSeatingBeforeCloseMinutes: 60,
  defaultRange: { open: '12:00', close: '23:00' },
};

export type ReservationIssue =
  | 'party-size'
  | 'date-invalid'
  | 'date-past'
  | 'date-too-far'
  | 'time-invalid'
  | 'time-unavailable';

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Parses `YYYY-MM-DD` as a local date, or returns `null` when it is not a real date. */
export function parseIsoDate(value: string): Date | null {
  const match = ISO_DATE.exec(value);
  if (!match) return null;
  const [year, month, day] = [
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
  ];
  const date = new Date(year, month, day);
  const real =
    date.getFullYear() === year &&
    date.getMonth() === month &&
    date.getDate() === day;
  return real ? date : null;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function daysBetween(from: Date, to: Date): number {
  return Math.round(
    (startOfDay(to).getTime() - startOfDay(from).getTime()) / 86_400_000,
  );
}

/** Bookable times (`HH:mm`) for a date, following the opening hours and the lead-time rule. */
export function availableSlots(
  date: string,
  policy: ReservationPolicy,
  now: Date,
): readonly string[] {
  const day = parseIsoDate(date);
  if (!day) return [];
  const distance = daysBetween(now, day);
  if (distance < 0 || distance > policy.maxAdvanceDays) return [];

  const intervals = policy.openingHours
    ? intervalsOn(policy.openingHours, day)
    : [
        {
          start: toMinutes(policy.defaultRange.open),
          end: toMinutes(policy.defaultRange.close),
        },
      ];

  const earliest = now.getTime() + policy.minLeadMinutes * 60_000;
  const slots = new Set<number>();
  for (const { start, end } of intervals) {
    const last = end - policy.lastSeatingBeforeCloseMinutes;
    for (let minutes = start; minutes <= last; minutes += policy.slotMinutes) {
      const moment = new Date(day.getFullYear(), day.getMonth(), day.getDate());
      moment.setMinutes(minutes);
      if (moment.getTime() >= earliest) slots.add(minutes);
    }
  }
  return [...slots].sort((a, b) => a - b).map(fromMinutes);
}

/** Checks a request against the policy and returns every rule it breaks, in a stable order. */
export function validateReservation(
  request: Pick<ReservationRequest, 'date' | 'time' | 'partySize'>,
  policy: ReservationPolicy,
  now: Date,
): readonly ReservationIssue[] {
  const issues: ReservationIssue[] = [];

  if (
    !Number.isInteger(request.partySize) ||
    request.partySize < policy.minPartySize ||
    request.partySize > policy.maxPartySize
  ) {
    issues.push('party-size');
  }

  const day = parseIsoDate(request.date);
  if (!day) {
    issues.push('date-invalid');
  } else if (daysBetween(now, day) < 0) {
    issues.push('date-past');
  } else if (daysBetween(now, day) > policy.maxAdvanceDays) {
    issues.push('date-too-far');
  }

  if (Number.isNaN(toMinutes(request.time))) {
    issues.push('time-invalid');
  } else if (day && !issues.some((issue) => issue.startsWith('date-'))) {
    if (!availableSlots(isoDate(day), policy, now).includes(request.time)) {
      issues.push('time-unavailable');
    }
  }

  return issues;
}
