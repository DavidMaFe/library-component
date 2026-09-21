import { CdkMenuTrigger } from '@angular/cdk/menu';
import { Directive } from '@angular/core';

/**
 * Opens a menu when the host is clicked, or with `Enter`, `Space` or
 * `ArrowDown`. Sets `aria-haspopup` and `aria-expanded` for you.
 *
 * ```html
 * <button lc-button [lcMenuTriggerFor]="menu">Options</button>
 * <ng-template #menu>
 *   <lc-menu>
 *     <button lc-menu-item>Edit</button>
 *   </lc-menu>
 * </ng-template>
 * ```
 *
 * Put it on a `lc-menu-item` to open a submenu.
 */
@Directive({
  selector: '[lcMenuTriggerFor]',
  hostDirectives: [
    {
      directive: CdkMenuTrigger,
      inputs: [
        'cdkMenuTriggerFor: lcMenuTriggerFor',
        'cdkMenuPosition: lcMenuPosition',
      ],
      outputs: ['cdkMenuOpened: lcMenuOpened', 'cdkMenuClosed: lcMenuClosed'],
    },
  ],
})
export class LcMenuTrigger {}
