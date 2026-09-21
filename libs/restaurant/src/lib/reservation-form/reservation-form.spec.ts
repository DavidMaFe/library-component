import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { axe } from 'jest-axe';
import { OpeningHours } from '../domain/opening-hours';
import {
  DEFAULT_RESERVATION_POLICY,
  ReservationPolicy,
  ReservationRequest,
} from '../domain/reservation';
import { provideLcRestaurantLabels } from '../labels/restaurant-labels';
import { LcReservationForm } from './reservation-form';

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
  ],
  closures: [{ date: '2026-06-16' }],
};

@Component({
  imports: [LcReservationForm],
  template: `
    <lc-reservation-form
      [policy]="policy()"
      [now]="now"
      [submitting]="submitting()"
      (reservation)="received.push($event)"
    />
  `,
})
class HostComponent {
  policy = signal<ReservationPolicy>({
    ...DEFAULT_RESERVATION_POLICY,
    openingHours: hours,
  });
  submitting = signal(false);
  now = now;
  received: ReservationRequest[] = [];
}

const type = (
  element: HTMLInputElement | HTMLTextAreaElement,
  value: string,
) => {
  element.value = value;
  element.dispatchEvent(new Event('input', { bubbles: true }));
};

const choose = (element: HTMLSelectElement, value: string) => {
  element.value = value;
  element.dispatchEvent(new Event('change', { bubbles: true }));
};

describe('LcReservationForm', () => {
  const setup = async () => {
    const fixture = TestBed.createComponent(HostComponent);
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const field = (name: string) =>
      root.querySelector(`[formcontrolname="${name}"]`) as HTMLInputElement;
    const api = {
      fixture,
      host: fixture.componentInstance,
      root,
      date: () => field('date'),
      time: () => field('time') as unknown as HTMLSelectElement,
      party: () => field('partySize'),
      name: () => field('name'),
      email: () => field('email'),
      phone: () => field('phone'),
      notes: () => field('notes') as unknown as HTMLTextAreaElement,
      submit: () =>
        root.querySelector('button[type="submit"]') as HTMLButtonElement,
      options: () =>
        Array.from(api.time().options)
          .map((option) => option.value)
          .filter(Boolean),
      update: () => fixture.whenStable(),
      fillDetails: async () => {
        type(api.name(), '  Giulia Rossi  ');
        type(api.email(), 'giulia@example.com');
        await api.update();
      },
      pickDate: async (date: string) => {
        type(api.date(), date);
        await api.update();
      },
    };
    return api;
  };

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('fields', () => {
    it('should render labelled fields', async () => {
      const { root } = await setup();

      const labels = Array.from(root.querySelectorAll('label.label')).map((l) =>
        l.textContent?.replace('*', '').trim(),
      );
      expect(labels).toEqual([
        'Date',
        'Time',
        'Guests',
        'Name',
        'Email',
        'Phone (optional)',
        'Special requests (optional)',
      ]);
    });

    it('should start with two guests', async () => {
      const { party } = await setup();

      expect(party().value).toBe('2');
    });

    it('should limit the date to the booking window', async () => {
      const { date } = await setup();

      expect(date().min).toBe('2026-06-01');
      expect(date().max).toBe('2026-08-30');
    });

    it('should limit guests to the policy', async () => {
      const { party } = await setup();

      expect(party().min).toBe('1');
      expect(party().max).toBe('12');
    });
  });

  describe('bookable times', () => {
    it('should offer no times before a date is chosen', async () => {
      const { options } = await setup();

      expect(options()).toEqual([]);
    });

    it('should offer the times of the chosen date', async () => {
      const { pickDate, options } = await setup();

      await pickDate('2026-06-02');

      expect(options()[0]).toBe('12:00');
      expect(options()).toContain('20:30');
      expect(options()).not.toContain('15:00');
    });

    it('should explain when a date has no tables', async () => {
      const { pickDate, root, options } = await setup();

      await pickDate('2026-06-03');

      expect(options()).toEqual([]);
      expect(root.querySelector('.hint')?.textContent).toContain(
        'No tables available',
      );
    });

    it('should clear a chosen time the new date does not offer', async () => {
      const { pickDate, time, update, root } = await setup();
      await pickDate('2026-06-02');
      choose(time(), '20:00');
      await update();
      expect(time().value).toBe('20:00');

      await pickDate('2026-06-03');

      expect(time().value).toBe('');
      expect(root.querySelector('.hint')).not.toBeNull();
    });

    it('should follow a policy change', async () => {
      const { host, pickDate, options, update } = await setup();
      await pickDate('2026-06-02');

      host.policy.set({ ...host.policy(), slotMinutes: 60 });
      await update();

      expect(options().slice(0, 3)).toEqual(['12:00', '13:00', '14:00']);
    });
  });

  describe('submitting', () => {
    it('should not emit and should show errors when the form is incomplete', async () => {
      const { host, submit, update, root } = await setup();

      submit().click();
      await update();

      expect(host.received).toEqual([]);
      const errors = Array.from(root.querySelectorAll('.error p')).map(
        (p) => p.textContent,
      );
      expect(errors).toContain('This field is required.');
    });

    it('should mark the invalid fields', async () => {
      const { submit, update, date } = await setup();

      submit().click();
      await update();

      expect(date().getAttribute('aria-invalid')).toBe('true');
    });

    it('should focus the first invalid field', async () => {
      const { submit, update, date } = await setup();

      submit().click();
      await update();
      await Promise.resolve();

      expect(document.activeElement).toBe(date());
    });

    it('should emit the reservation, trimming text and omitting empty optional fields', async () => {
      const { host, pickDate, time, fillDetails, update, submit } =
        await setup();
      await pickDate('2026-06-02');
      choose(time(), '20:00');
      await fillDetails();

      submit().click();
      await update();

      expect(host.received).toEqual([
        {
          date: '2026-06-02',
          time: '20:00',
          partySize: 2,
          name: 'Giulia Rossi',
          email: 'giulia@example.com',
        },
      ]);
    });

    it('should include the phone and notes when given', async () => {
      const {
        host,
        pickDate,
        time,
        fillDetails,
        phone,
        notes,
        update,
        submit,
      } = await setup();
      await pickDate('2026-06-02');
      choose(time(), '13:00');
      type(phone(), '+39 06 1234');
      type(notes(), 'Window table, please');
      await fillDetails();

      submit().click();
      await update();

      expect(host.received[0]).toMatchObject({
        phone: '+39 06 1234',
        notes: 'Window table, please',
      });
    });

    it('should reject an invalid email', async () => {
      const { host, pickDate, time, email, update, submit, root } =
        await setup();
      await pickDate('2026-06-02');
      choose(time(), '20:00');
      type(email(), 'not-an-email');
      await update();

      submit().click();
      await update();

      expect(host.received).toEqual([]);
      expect(email().getAttribute('aria-invalid')).toBe('true');
    });

    it('should reject a party larger than the policy allows', async () => {
      const { host, pickDate, time, party, fillDetails, update, submit } =
        await setup();
      await pickDate('2026-06-02');
      choose(time(), '20:00');
      type(party(), '20');
      await fillDetails();

      submit().click();
      await update();

      expect(host.received).toEqual([]);
      expect(party().getAttribute('aria-invalid')).toBe('true');
    });

    it('should follow a policy change for the party size', async () => {
      const { host, pickDate, time, party, fillDetails, update, submit } =
        await setup();
      host.policy.set({ ...host.policy(), maxPartySize: 30 });
      await update();
      await pickDate('2026-06-02');
      choose(time(), '20:00');
      type(party(), '20');
      await fillDetails();

      submit().click();
      await update();

      expect(host.received[0].partySize).toBe(20);
    });

    it('should show the submit button as busy while submitting', async () => {
      const { host, submit, update } = await setup();

      host.submitting.set(true);
      await update();

      expect(submit().getAttribute('aria-busy')).toBe('true');
    });
  });

  describe('reset', () => {
    it('should clear the form', async () => {
      const { fixture, pickDate, name, party } = await setup();
      const form = fixture.debugElement.children[0]
        .componentInstance as LcReservationForm;
      await pickDate('2026-06-02');
      type(name(), 'Giulia');
      type(party(), '6');

      form.reset();
      await fixture.whenStable();

      expect(name().value).toBe('');
      expect(party().value).toBe('2');
    });
  });

  it('should use translated labels', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideLcRestaurantLabels({
          reservationSubmit: 'Reservar mesa',
          reservationDate: 'Fecha',
        }),
      ],
    });
    const { submit, root } = await setup();

    expect(submit().textContent).toContain('Reservar mesa');
    expect(root.querySelector('label.label')?.textContent).toContain('Fecha');
  });

  it('should have no accessibility violations', async () => {
    const { fixture, submit, update } = await setup();
    submit().click();
    await update();

    expect(await axe(fixture.nativeElement)).toHaveNoViolations();
  });
});
