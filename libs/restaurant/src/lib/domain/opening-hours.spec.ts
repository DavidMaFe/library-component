import {
  fromMinutes,
  intervalsOn,
  isOpenAt,
  isoDate,
  nextChange,
  openStatus,
  OpeningHours,
  toMinutes,
  weekSchedule,
} from './opening-hours';

// 2026-06-01 is a Monday.
const at = (date: string, time: string) => new Date(`${date}T${time}:00`);

const hours: OpeningHours = {
  schedule: [
    // Tuesday to Thursday: lunch and dinner
    ...[2, 3, 4].map((day) => ({
      day: day as 2 | 3 | 4,
      ranges: [
        { open: '12:00', close: '15:00' },
        { open: '19:00', close: '23:00' },
      ],
    })),
    // Friday and Saturday: dinner running past midnight
    { day: 5, ranges: [{ open: '19:00', close: '01:00' }] },
    { day: 6, ranges: [{ open: '19:00', close: '01:00' }] },
    // Monday (1) and Sunday (0) closed: no entry
  ],
  closures: [{ date: '2026-06-17', reason: 'Private event' }],
};

describe('toMinutes / fromMinutes', () => {
  it('should convert times', () => {
    expect(toMinutes('00:00')).toBe(0);
    expect(toMinutes('18:30')).toBe(1110);
    expect(toMinutes('23:59')).toBe(1439);
  });

  it('should reject malformed times', () => {
    for (const bad of ['24:00', '9:00', '12:60', 'noon', '']) {
      expect(toMinutes(bad)).toBeNaN();
    }
  });

  it('should format minutes, wrapping past midnight', () => {
    expect(fromMinutes(1110)).toBe('18:30');
    expect(fromMinutes(1500)).toBe('01:00');
    expect(fromMinutes(-30)).toBe('23:30');
  });
});

describe('isoDate', () => {
  it('should format the local date', () => {
    expect(isoDate(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
});

describe('intervalsOn', () => {
  it('should list the ranges of the weekday', () => {
    expect(intervalsOn(hours, at('2026-06-02', '10:00'))).toEqual([
      { start: 720, end: 900 },
      { start: 1140, end: 1380 },
    ]);
  });

  it('should extend ranges that end after midnight', () => {
    expect(intervalsOn(hours, at('2026-06-05', '10:00'))).toEqual([
      { start: 1140, end: 1500 },
    ]);
  });

  it('should be empty on closed days and closure dates', () => {
    expect(intervalsOn(hours, at('2026-06-01', '10:00'))).toEqual([]);
    expect(intervalsOn(hours, at('2026-06-17', '10:00'))).toEqual([]);
  });

  it('should skip malformed ranges', () => {
    const broken: OpeningHours = {
      schedule: [{ day: 1, ranges: [{ open: 'x', close: '10:00' }] }],
    };

    expect(intervalsOn(broken, at('2026-06-01', '10:00'))).toEqual([]);
  });
});

describe('isOpenAt', () => {
  it('should be open inside a range and closed between ranges', () => {
    expect(isOpenAt(hours, at('2026-06-02', '13:00'))).toBe(true);
    expect(isOpenAt(hours, at('2026-06-02', '16:00'))).toBe(false);
    expect(isOpenAt(hours, at('2026-06-02', '20:00'))).toBe(true);
  });

  it('should include the opening minute and exclude the closing one', () => {
    expect(isOpenAt(hours, at('2026-06-02', '12:00'))).toBe(true);
    expect(isOpenAt(hours, at('2026-06-02', '11:59'))).toBe(false);
    expect(isOpenAt(hours, at('2026-06-02', '14:59'))).toBe(true);
    expect(isOpenAt(hours, at('2026-06-02', '15:00'))).toBe(false);
  });

  it('should be closed on days without a schedule', () => {
    expect(isOpenAt(hours, at('2026-06-01', '13:00'))).toBe(false);
    expect(isOpenAt(hours, at('2026-06-07', '13:00'))).toBe(false);
  });

  it('should stay open after midnight for a range that started the day before', () => {
    expect(isOpenAt(hours, at('2026-06-06', '00:30'))).toBe(true);
    expect(isOpenAt(hours, at('2026-06-06', '01:00'))).toBe(false);
    expect(isOpenAt(hours, at('2026-06-07', '00:30'))).toBe(true);
  });

  it('should not carry Sunday early hours from a closed Saturday-less week', () => {
    expect(isOpenAt(hours, at('2026-06-08', '00:30'))).toBe(false);
  });

  it('should be closed on closure dates', () => {
    expect(isOpenAt(hours, at('2026-06-17', '13:00'))).toBe(false);
  });

  it('should let a closure cancel the range carried over from the previous evening', () => {
    const withClosure: OpeningHours = {
      ...hours,
      closures: [{ date: '2026-06-05' }],
    };

    expect(isOpenAt(withClosure, at('2026-06-06', '00:30'))).toBe(false);
  });
});

describe('nextChange', () => {
  it('should find the closing time while open', () => {
    const change = nextChange(hours, at('2026-06-02', '13:00'));

    expect(change?.opens).toBe(false);
    expect(change?.at).toEqual(at('2026-06-02', '15:00'));
  });

  it('should find the next opening between shifts', () => {
    const change = nextChange(hours, at('2026-06-02', '16:00'));

    expect(change?.opens).toBe(true);
    expect(change?.at).toEqual(at('2026-06-02', '19:00'));
  });

  it('should skip closed days', () => {
    const change = nextChange(hours, at('2026-06-01', '10:00'));

    expect(change?.opens).toBe(true);
    expect(change?.at).toEqual(at('2026-06-02', '12:00'));
  });

  it('should report a closing after midnight', () => {
    const change = nextChange(hours, at('2026-06-05', '23:30'));

    expect(change?.opens).toBe(false);
    expect(change?.at).toEqual(at('2026-06-06', '01:00'));
  });

  it('should ignore touching ranges that do not change the state', () => {
    const continuous: OpeningHours = {
      schedule: [
        {
          day: 1,
          ranges: [
            { open: '12:00', close: '15:00' },
            { open: '15:00', close: '18:00' },
          ],
        },
      ],
    };

    expect(nextChange(continuous, at('2026-06-01', '13:00'))?.at).toEqual(
      at('2026-06-01', '18:00'),
    );
  });

  it('should skip closure dates', () => {
    const change = nextChange(hours, at('2026-06-16', '23:30'));

    expect(change?.at).toEqual(at('2026-06-18', '12:00'));
  });

  it('should return null when it never opens', () => {
    expect(nextChange({ schedule: [] }, at('2026-06-01', '10:00'))).toBeNull();
  });
});

describe('openStatus', () => {
  it('should combine the current state and the next change', () => {
    const status = openStatus(hours, at('2026-06-02', '13:00'));

    expect(status.open).toBe(true);
    expect(status.next?.opens).toBe(false);
  });
});

describe('weekSchedule', () => {
  it('should start on Monday by default and mark missing days as closed', () => {
    const week = weekSchedule(hours);

    expect(week.map((d) => d.day)).toEqual([1, 2, 3, 4, 5, 6, 0]);
    expect(week[0].ranges).toEqual([]);
    expect(week[1].ranges).toHaveLength(2);
  });

  it('should honor another first day', () => {
    expect(weekSchedule(hours, 0).map((d) => d.day)).toEqual([
      0, 1, 2, 3, 4, 5, 6,
    ]);
  });
});
