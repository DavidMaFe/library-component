import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Trail of links showing where the current page sits in the site.
 *
 * ```html
 * <lc-breadcrumb>
 *   <li lc-breadcrumb-item><a href="/">Home</a></li>
 *   <li lc-breadcrumb-item><a href="/menu">Menu</a></li>
 *   <li lc-breadcrumb-item current>Pasta</li>
 * </lc-breadcrumb>
 * ```
 *
 * Customize with `--lc-breadcrumb-color`, `-color-current` and `-separator-color`.
 */
@Component({
  selector: 'lc-breadcrumb',
  template: '<nav [attr.aria-label]="label()"><ol><ng-content /></ol></nav>',
  styleUrl: './breadcrumb.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LcBreadcrumb {
  /** Accessible name of the navigation landmark. */
  readonly label = input('Breadcrumb');
}
