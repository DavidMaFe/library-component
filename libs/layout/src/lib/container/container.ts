import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type LcContainerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

/**
 * Centers content and limits its width, with side gutters that grow on
 * larger screens.
 *
 * Customize with `--lc-container-max-width` and `--lc-container-gutter`.
 */
@Component({
  selector: 'lc-container',
  template: '<ng-content />',
  styleUrl: './container.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.data-size]': 'size()' },
})
export class LcContainer {
  readonly size = input<LcContainerSize>('lg');
}
