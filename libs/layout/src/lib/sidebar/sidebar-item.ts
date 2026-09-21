import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { LcSidebar } from './sidebar';

/**
 * An entry of `lc-sidebar`. Works on `<a>` and `<button>`. Put an icon with
 * `lcSidebarIcon` before the label; the label is hidden visually (not from
 * screen readers) when the sidebar is collapsed.
 *
 * Customize with `--lc-sidebar-item-color`, `-bg-hover` and `-bg-active`.
 */
@Component({
  // Attribute selectors on native elements keep link/button semantics.
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'a[lc-sidebar-item], button[lc-sidebar-item]',
  template: `
    <span class="icon" aria-hidden="true"
      ><ng-content select="[lcSidebarIcon]"
    /></span>
    <span class="label"><ng-content /></span>
  `,
  styleUrl: './sidebar-item.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.aria-current]': "active() ? 'page' : null",
    '[attr.data-active]': 'active() || null',
    '[attr.data-collapsed]': 'sidebar?.collapsed() || null',
  },
})
export class LcSidebarItem {
  /** Marks the item of the current page. */
  readonly active = input(false, { transform: booleanAttribute });

  protected readonly sidebar = inject(LcSidebar, { optional: true });
}
