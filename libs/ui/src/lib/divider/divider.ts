import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';

export type LcDividerOrientation = 'horizontal' | 'vertical';

/**
 * Visual separator between content.
 *
 * Customize with `--lc-divider-color`, `--lc-divider-thickness` and
 * `--lc-divider-spacing`.
 */
@Component({
  selector: 'lc-divider',
  template: '',
  styleUrl: './divider.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.role]': "decorative() ? 'none' : 'separator'",
    '[attr.aria-orientation]':
      "!decorative() && orientation() === 'vertical' ? 'vertical' : null",
    '[attr.data-orientation]': 'orientation()',
  },
})
export class LcDivider {
  readonly orientation = input<LcDividerOrientation>('horizontal');
  /** Purely visual: removes the separator from the accessibility tree. */
  readonly decorative = input(false, { transform: booleanAttribute });
}
