import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';
import { LcSpinner } from '../spinner/spinner';
import { LcButtonBase } from './button-base';

/**
 * Text button. Works on native `<button>` and `<a>` elements so the right
 * semantics are kept.
 *
 * ```html
 * <button lc-button variant="secondary" size="sm">Cancel</button>
 * <a lc-button href="/menu">See menu</a>
 * ```
 *
 * Customize with `--lc-button-bg`, `-bg-hover`, `-bg-active`, `-color`,
 * `-border-color`, `-radius`, `-height`, `-padding-x`, `-font-size`,
 * `-font-weight` and `-gap`.
 */
@Component({
  // Attribute selectors on native elements keep button/link semantics.
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'button[lc-button], a[lc-button]',
  imports: [LcSpinner],
  templateUrl: './button.html',
  styleUrl: './button.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-block]': 'block() || null',
  },
})
export class LcButton extends LcButtonBase {
  /** Stretches the button to the full width of its container. */
  readonly block = input(false, { transform: booleanAttribute });
}
