import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
  signal,
} from '@angular/core';
import { uniqueId } from '../shared/unique-id';

/** A panel of `lc-tabs`. Its `label` becomes the tab button. */
@Component({
  selector: 'lc-tab',
  template: `
    <div
      class="panel"
      role="tabpanel"
      [id]="panelId"
      [attr.aria-labelledby]="tabId"
      [attr.tabindex]="active() ? 0 : null"
      [hidden]="!active()"
    >
      <ng-content />
    </div>
  `,
  styleUrl: './tab.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LcTab {
  readonly label = input.required<string>();
  readonly disabled = input(false, { transform: booleanAttribute });

  readonly tabId = uniqueId('lc-tab');
  readonly panelId = uniqueId('lc-tabpanel');
  /** Set by the parent `lc-tabs`. Not meant to be written by consumers. */
  readonly active = signal(false);
}
