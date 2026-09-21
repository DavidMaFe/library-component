import { CdkMenuItem } from '@angular/cdk/menu';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type LcMenuItemVariant = 'default' | 'danger';

/**
 * A menu action. Works on native `<button>` and `<a>` elements. Clicking it
 * closes the menu.
 *
 * ```html
 * <button lc-menu-item (triggered)="edit()">Edit</button>
 * <button lc-menu-item variant="danger" (triggered)="remove()">Delete</button>
 * ```
 *
 * Customize with `--lc-menu-item-color`, `-bg-hover` and `-radius`.
 */
@Component({
  // Attribute selectors on native elements keep button/link semantics.
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'button[lc-menu-item], a[lc-menu-item]',
  template: '<ng-content />',
  styleUrl: './menu-item.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [
    {
      directive: CdkMenuItem,
      inputs: ['cdkMenuItemDisabled: disabled'],
      outputs: ['cdkMenuItemTriggered: triggered'],
    },
  ],
  host: {
    '[attr.data-variant]': 'variant()',
  },
})
export class LcMenuItem {
  readonly variant = input<LcMenuItemVariant>('default');
}
