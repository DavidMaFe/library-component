import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
  model,
} from '@angular/core';

/**
 * Vertical navigation for admin layouts, collapsible to an icon rail.
 *
 * ```html
 * <lc-sidebar label="Admin" [(collapsed)]="collapsed">
 *   <strong lcSidebarHeader>Acme</strong>
 *   <a lc-sidebar-item href="/orders" active><svg lcSidebarIcon>...</svg>Orders</a>
 * </lc-sidebar>
 * ```
 *
 * When collapsed, item labels stay available to screen readers.
 *
 * A `<p>` or heading placed between items titles the group that follows it
 * (shown as an eyebrow, hidden visually while collapsed):
 * `<h3>Reports</h3>`.
 *
 * Customize with `--lc-sidebar-width`, `-collapsed-width`, `-bg` and
 * `-border-color`.
 */
@Component({
  selector: 'lc-sidebar',
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-collapsed]': 'collapsed() || null',
  },
})
export class LcSidebar {
  /** Accessible name of the navigation landmark. */
  readonly label = input('Sidebar');
  readonly collapsed = model(false);
  /** Shows the button that collapses and expands the sidebar. */
  readonly collapsible = input(true, { transform: booleanAttribute });
  readonly collapseLabel = input('Collapse sidebar');
  readonly expandLabel = input('Expand sidebar');

  protected toggle(): void {
    this.collapsed.update((collapsed) => !collapsed);
  }
}
