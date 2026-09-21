import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LcSpinner } from '../spinner/spinner';
import { LcButtonBase } from '../button/button-base';

export type LcIconButtonShape = 'square' | 'round';

/**
 * Button that only shows an icon. The accessible `label` is required.
 *
 * ```html
 * <button lc-icon-button label="Add to cart"><svg>...</svg></button>
 * ```
 *
 * Supports the same `--lc-button-*` custom properties as `lc-button`.
 */
@Component({
  // Attribute selectors on native elements keep button/link semantics.
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'button[lc-icon-button], a[lc-icon-button]',
  imports: [LcSpinner],
  templateUrl: './icon-button.html',
  styleUrl: './icon-button.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.aria-label]': 'label()',
    '[attr.data-shape]': 'shape()',
  },
})
export class LcIconButton extends LcButtonBase {
  /** Accessible name announced by screen readers. */
  readonly label = input.required<string>();
  readonly shape = input<LcIconButtonShape>('square');
}
