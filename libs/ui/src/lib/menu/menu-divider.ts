import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Thin line separating groups of menu items. */
@Component({
  selector: 'lc-menu-divider',
  template: '',
  styleUrl: './menu-divider.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'separator' },
})
export class LcMenuDivider {}
