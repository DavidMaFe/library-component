import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type LcBadgeVariant =
  'neutral' | 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'info';
export type LcBadgeAppearance = 'subtle' | 'solid' | 'outline';
export type LcBadgeSize = 'sm' | 'md';

/**
 * Small label for statuses, counters or categories. Use `accent` to
 * highlight (offers, new items); `danger` is reserved for errors.
 *
 * Customize with `--lc-badge-bg`, `-color`, `-border-color`, `-radius`,
 * `-padding-x` and `-font-size`.
 */
@Component({
  selector: 'lc-badge',
  template: '<ng-content />',
  styleUrl: './badge.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-variant]': 'variant()',
    '[attr.data-appearance]': 'appearance()',
    '[attr.data-size]': 'size()',
  },
})
export class LcBadge {
  readonly variant = input<LcBadgeVariant>('neutral');
  readonly appearance = input<LcBadgeAppearance>('subtle');
  readonly size = input<LcBadgeSize>('md');
}
