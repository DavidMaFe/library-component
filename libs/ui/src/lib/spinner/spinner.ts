import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';
import { LcSize } from '../shared/ui.types';

/**
 * Indeterminate progress indicator.
 *
 * Customize with `--lc-spinner-size`, `--lc-spinner-color`,
 * `--lc-spinner-track-color` and `--lc-spinner-thickness`.
 */
@Component({
  selector: 'lc-spinner',
  templateUrl: './spinner.html',
  styleUrl: './spinner.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-size]': 'size()',
    '[attr.role]': "decorative() ? null : 'status'",
    '[attr.aria-hidden]': 'decorative() || null',
  },
})
export class LcSpinner {
  readonly size = input<LcSize>('md');
  /** Accessible text announced to screen readers. */
  readonly label = input('Loading');
  /** Hides the spinner from assistive technology (use when the parent already announces the state). */
  readonly decorative = input(false, { transform: booleanAttribute });
}
