import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LC_TOAST_CONFIG } from './toast.config';
import { LcToastItem } from './toast-item';
import { LcToastStore } from './toast-store';

/** Region that stacks the visible toasts. Internal: created by `LcToast`. */
@Component({
  selector: 'lc-toast-outlet',
  imports: [LcToastItem],
  template: `
    @for (entry of store.entries(); track entry.id) {
      <lc-toast [entry]="entry" />
    }
  `,
  styleUrl: './toast-outlet.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'region',
    'aria-live': 'polite',
    '[attr.aria-label]': 'config.regionLabel',
  },
})
export class LcToastOutlet {
  protected readonly store = inject(LcToastStore);
  protected readonly config = inject(LC_TOAST_CONFIG);
}
