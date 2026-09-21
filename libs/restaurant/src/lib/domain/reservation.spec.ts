import { OpeningHours } from './opening-hours';
import {
  availableSlots,
  DEFAULT_RESERVATION_POLICY,
  parseIsoDate,
  ReservationPolicy,
  validateReservation,
} from './reservation';

// Monday 2026-06-01, 10:00
const now = new Date('2026-06-01T10:00:00');

const hours: OpeningHours = {
  schedule: [
    {
      day: 2,
      ranges: [
        { open: '12:00', close: '15:00' },
        { open: '19:00', close: '23:00' },
      ],
    },
    { day: 5, ranges: [{ open: '19:00', close: '01:00' }] },
  ],
  closures: [{ date: '2026-06-16' }],
};

const policy: ReservationPolicy = {
  ...DEFAULT_RESERVATION_POLICY,
  openingHours: hours,
};

describe('parseIsoDate', () => {
  it('should parse real dates as local dates', () => {
    const date = parseIsoDate('2026-06-01');

    expect(date?.getFullYear()).toBe(2026);
    expect(date?.getMonth()).toBe(5);
    expect(date?.getDate()).toBe(1);
  });

  it('should reject malformed and impossible dates', () => {
    for (const bad of [
      '',
      '2026-6-1',
      '2026-02-30',
      '2026-13-01',
      'tomorrow',
    ]) {
      expect(parseIsoDate(bad)).toBeNull();
    }
  });
});

describe('availableSlots', () => {
  it('should offer slots inside every range, stopping before closing', () => {
    expect(availableSlots('2026-06-02', policy, now)).toEqual([
      '12:00',
      '12:30',
      '13:00',
      '13:30',
      '14:00',
      '19:00',
      '19:30',
      '20:00',
      '20:30',
      '21:00',
      '21:30',
      '22:00',
    ]);
  });

  it('should offer nothing on closed days and closure dates', () => {
    expect(availableSlots('2026-06-03', policy, now)).toEqual([]);
    expect(availableSlots('2026-06-16', policy, now)).toEqual([]);
  });

  it('should support ranges that end after midnight', () => {
    const slots = availableSlots('2026-06-05', policy, now);

    expect(slots[0]).toBe('19:00');
    expect(slots).toContain('23:30');
    expect(slots[slots.length - 1]).toBe('00:00');
  });

  it('should respect the minimum lead time on the same day', () => {
    const tuesdayNoon = new Date('2026-06-02T12:10:00');

    expect(availableSlots('2026-06-02', policy, tuesdayNoon)[0]).toBe('13:30');
  });

  it('should offer nothing in the past or beyond the booking window', () => {
    expect(availableSlots('2026-05-26', policy, now)).toEqual([]);
    expect(availableSlots('2026-12-01', policy, now)).toEqual([]);
  });

  it('should honor the slot size and last seating', () => {
    const custom: ReservationPolicy = {
      ...policy,
      slotMinutes: 60,
      lastSeatingBeforeCloseMinutes: 0,
    };

    expect(availableSlots('2026-06-02', custom, now)).toEqual([
      '12:00',
      '13:00',
      '14:00',
      '15:00',
      '19:00',
      '20:00',
      '21:00',
      '22:00',
      '23:00',
    ]);
  });

  it('should use the default range when there are no opening hours', () => {
    const slots = availableSlots('2026-06-03', DEFAULT_RESERVATION_POLICY, now);

    expect(slots[0]).toBe('12:00');
    expect(slots[slots.length - 1]).toBe('22:00');
  });

  it('should return nothing for an invalid date', () => {
    expect(availableSlots('nope', policy, now)).toEqual([]);
  });
});

describe('validateReservation', () => {
  const valid = { date: '2026-06-02', time: '20:00', partySize: 4 };

  it('should accept a valid request', () => {
    expect(validateReservation(valid, policy, now)).toEqual([]);
  });

  it('should reject party sizes outside the limits', () => {
    expect(
      validateReservation({ ...valid, partySize: 0 }, policy, now),
    ).toEqual(['party-size']);
    expect(
      validateReservation({ ...valid, partySize: 13 }, policy, now),
    ).toEqual(['party-size']);
    expect(
      validateReservation({ ...valid, partySize: 2.5 }, policy, now),
    ).toEqual(['party-size']);
  });

  it('should accept the limits themselves', () => {
    expect(
      validateReservation({ ...valid, partySize: 1 }, policy, now),
    ).toEqual([]);
    expect(
      validateReservation({ ...valid, partySize: 12 }, policy, now),
    ).toEqual([]);
  });

  it('should reject invalid, past and too distant dates', () => {
    expect(validateReservation({ ...valid, date: 'x' }, policy, now)).toContain(
      'date-invalid',
    );
    expect(
      validateReservation({ ...valid, date: '2026-05-30' }, policy, now),
    ).toContain('date-past');
    expect(
      validateReservation({ ...valid, date: '2027-01-01' }, policy, now),
    ).toContain('date-too-far');
  });

  it('should reject malformed times', () => {
    expect(validateReservation({ ...valid, time: '8pm' }, policy, now)).toEqual(
      ['time-invalid'],
    );
  });

  it('should reject times the place is not bookable', () => {
    expect(
      validateReservation({ ...valid, time: '16:00' }, policy, now),
    ).toEqual(['time-unavailable']);
    expect(
      validateReservation({ ...valid, date: '2026-06-03' }, policy, now),
    ).toEqual(['time-unavailable']);
  });

  it('should reject a time inside the lead-time window', () => {
    const late = new Date('2026-06-02T19:20:00');

    expect(
      validateReservation({ ...valid, time: '19:30' }, policy, late),
    ).toEqual(['time-unavailable']);
  });

  it('should not pile a time error on top of a date error', () => {
    expect(
      validateReservation(
        { ...valid, date: '2026-05-30', time: '16:00' },
        policy,
        now,
      ),
    ).toEqual(['date-past']);
  });

  it('should report several problems together', () => {
    expect(
      validateReservation({ date: 'x', time: 'y', partySize: 99 }, policy, now),
    ).toEqual(['party-size', 'date-invalid', 'time-invalid']);
  });
});
