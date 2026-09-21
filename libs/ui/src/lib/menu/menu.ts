import { CdkMenu } from '@angular/cdk/menu';
import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Panel with a list of actions, with arrow-key navigation, typeahead and
 * `Escape` to close.
 *
 * Customize with `--lc-menu-bg`, `-border-color`, `-radius`, `-shadow`,
 * `-min-width` and `-padding`.
 */
@Component({
  selector: 'lc-menu',
  template: '<ng-content />',
  styleUrl: './menu.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [CdkMenu],
})
export class LcMenu {}
