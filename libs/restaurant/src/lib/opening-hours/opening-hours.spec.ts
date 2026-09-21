import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { axe } from 'jest-axe';
import { OpeningHours, Weekday } from '../domain/opening-hours';
import { provideLcRestaurantLabels } from '../labels/restaurant-labels';
import { LcOpeningHours } from './opening-hours';

const hours: OpeningHours = {
  schedule: [
    ...[2, 3, 4].map((day) => ({
      day: day as Weekday,
      ranges: [
        { open: '12:00', close: '15:00' },
        { open: '19:00', close: '23:00' },
      ],
    })),
    { day: 5, ranges: [{ open: '19:00', close: '01:00' }] },
  ],
  closures: [
    { date: '2026-06-24', reason: 'Staff party' },
    { date: '2026-05-01', reason: 'Past closure' },
  ],
};

// 2026-06-02 is a Tuesday.
@Component({
  imports: [LcOpeningHours],
  template: `<lc-opening-hours
    [hours]="hours"
    [now]="now()"
    [weekStart]="weekStart()"
    locale="en-US"
  />`,
})
class HostComponent {
  hours = hours;
  now = signal(new Date('2026-06-02T13:00:00'));
  weekStart = signal<Weekday>(1);
}

describe('LcOpeningHours', () => {
  const setup = async (now = '2026-06-02T13:00:00') => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.now.set(new Date(now));
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    return {
      fixture,
      host: fixture.componentInstance,
      root,
      status: () => root.querySelector('.status') as HTMLElement,
      rows: () => Array.from(root.querySelectorAll<HTMLElement>('.row')),
    };
  };

  describe('week', () => {
    it('should list the seven days starting on Monday', async () => {
      const { rows } = await setup();

      expect(rows().map((row) => row.querySelector('dt')?.textContent)).toEqual(
        [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Sunday',
        ],
      );
    });

    it('should show the ranges of each day and Closed for the rest', async () => {
      const { rows } = await setup();

      expect(rows()[1].querySelector('dd')?.textContent?.trim()).toBe(
        '12:00 – 15:00, 19:00 – 23:00',
      );
      expect(rows()[4].querySelector('dd')?.textContent?.trim()).toBe(
        '19:00 – 01:00',
      );
      expect(rows()[0].querySelector('dd')?.textContent?.trim()).toBe('Closed');
    });

    it('should honor the first day of the week', async () => {
      const { fixture, host, rows } = await setup();

      host.weekStart.set(0);
      await fixture.whenStable();

      expect(rows()[0].querySelector('dt')?.textContent).toBe('Sunday');
    });

    it('should mark today', async () => {
      const { rows } = await setup();

      const current = rows().filter(
        (row) => row.getAttribute('aria-current') === 'date',
      );
      expect(current).toHaveLength(1);
      expect(current[0].querySelector('dt')?.textContent).toBe('Tuesday');
    });
  });

  describe('status', () => {
    it('should say it is open and when it closes', async () => {
      const { status } = await setup('2026-06-02T13:00:00');

      expect(status().textContent).toContain('Open now · closes at 15:00');
      expect(status().hasAttribute('data-open')).toBe(true);
    });

    it('should say it is closed and when it opens again today', async () => {
      const { status } = await setup('2026-06-02T16:00:00');

      expect(status().textContent).toContain('Closed now · opens at 19:00');
      expect(status().hasAttribute('data-open')).toBe(false);
    });

    it('should say tomorrow when it opens the next day', async () => {
      const { status } = await setup('2026-06-02T23:30:00');

      expect(status().textContent).toContain('opens tomorrow at 12:00');
    });

    it('should name the weekday when it opens later in the week', async () => {
      const { status } = await setup('2026-06-06T02:00:00');

      expect(status().textContent).toContain('opens Tuesday at 12:00');
    });

    it('should be a status region and can be hidden', async () => {
      const { status } = await setup();

      expect(status().getAttribute('role')).toBe('status');
    });

    it('should use translated labels', async () => {
      TestBed.configureTestingModule({
        providers: [
          provideLcRestaurantLabels({
            hoursOpenNow: 'Abierto',
            hoursClosesAt: (time) => `cierra a las ${time}`,
            hoursClosed: 'Cerrado',
          }),
        ],
      });
      const { status, rows } = await setup();

      expect(status().textContent).toContain('Abierto · cierra a las 15:00');
      expect(rows()[0].querySelector('dd')?.textContent?.trim()).toBe(
        'Cerrado',
      );
    });
  });

  describe('closures', () => {
    it('should list upcoming closures with their reason', async () => {
      const { root } = await setup();

      const items = Array.from(root.querySelectorAll('.closures li')).map(
        (li) => li.textContent?.replace(/\s+/g, ' ').trim(),
      );
      expect(items).toEqual(['June 24, 2026 · Staff party']);
    });

    it('should not list closures that already passed', async () => {
      const { root } = await setup();

      expect(root.querySelector('.closures')?.textContent).not.toContain(
        'Past closure',
      );
    });

    it('should hide the section when there are none', async () => {
      const { fixture, root } = await setup('2026-12-01T10:00:00');
      await fixture.whenStable();

      expect(root.querySelector('.closures')).toBeNull();
    });
  });

  it('should have no accessibility violations', async () => {
    const { fixture } = await setup();

    expect(await axe(fixture.nativeElement)).toHaveNoViolations();
  });
});
