import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  LOCALE_ID,
  signal,
} from '@angular/core';
import {
  isoDate,
  OpeningHours,
  openStatus,
  weekSchedule,
  Weekday,
} from '../domain/opening-hours';
import { parseIsoDate } from '../domain/reservation';
import { LC_RESTAURANT_LABELS } from '../labels/restaurant-labels';

/**
 * Weekly opening hours with an "open now" status, today highlighted and the
 * upcoming closures. The status refreshes every minute unless `now` is fixed.
 *
 * ```html
 * <lc-opening-hours [hours]="hours" />
 * ```
 *
 * Customize with `--lc-hours-row-gap`, `--lc-hours-open-color` and
 * `--lc-hours-closed-color`.
 */
@Component({
  selector: 'lc-opening-hours',
  templateUrl: './opening-hours.html',
  styleUrl: './opening-hours.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LcOpeningHours {
  readonly hours = input.required<OpeningHours>();
  /** Fixes the current moment (tests, other time zones). Defaults to the clock. */
  readonly now = input<Date | undefined>(undefined);
  /** First day of the week: 0 = Sunday, 1 = Monday... */
  readonly weekStart = input<Weekday>(1);
  readonly locale = input(inject(LOCALE_ID));
  readonly showStatus = input(true);

  protected readonly labels = inject(LC_RESTAURANT_LABELS);
  readonly #clock = signal(new Date());
  protected readonly current = computed(() => this.now() ?? this.#clock());

  protected readonly status = computed(() =>
    openStatus(this.hours(), this.current()),
  );
  protected readonly week = computed(() =>
    weekSchedule(this.hours(), this.weekStart()),
  );
  protected readonly today = computed(() => this.current().getDay());

  protected readonly statusText = computed(() => {
    const { open, next } = this.status();
    const base = open ? this.labels.hoursOpenNow : this.labels.hoursClosedNow;
    if (!next) return base;
    const time = this.#time(next.at);
    return open
      ? `${base} · ${this.labels.hoursClosesAt(time)}`
      : `${base} · ${this.labels.hoursOpensAt(this.#dayLabel(next.at), time)}`;
  });

  protected readonly closures = computed(() => {
    const today = isoDate(this.current());
    return (this.hours().closures ?? [])
      .filter((closure) => closure.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((closure) => ({
        label: this.#formatDate(closure.date),
        reason: closure.reason,
        key: closure.date,
      }));
  });

  constructor() {
    const timer = setInterval(() => this.#clock.set(new Date()), 60_000);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
  }

  protected dayName(day: Weekday): string {
    // 2024-01-07 was a Sunday.
    return new Intl.DateTimeFormat(this.locale(), { weekday: 'long' }).format(
      new Date(2024, 0, 7 + day),
    );
  }

  protected rangeText(
    ranges: readonly { open: string; close: string }[],
  ): string {
    return ranges.map((range) => `${range.open} – ${range.close}`).join(', ');
  }

  #time(date: Date): string {
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  }

  /** `null` for today, otherwise `tomorrow` or the weekday name. */
  #dayLabel(date: Date): string | null {
    const now = this.current();
    const start = (d: Date) =>
      new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const days = Math.round((start(date) - start(now)) / 86_400_000);
    if (days <= 0) return null;
    if (days === 1) return this.labels.hoursTomorrow;
    return this.dayName(date.getDay() as Weekday);
  }

  #formatDate(iso: string): string {
    const date = parseIsoDate(iso);
    return date
      ? new Intl.DateTimeFormat(this.locale(), { dateStyle: 'long' }).format(
          date,
        )
      : iso;
  }
}
