import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  numberAttribute,
} from '@angular/core';
import { LcSpace } from '../shared/layout.types';

/**
 * Grid of equal columns. Set `columns` for a fixed number, or leave it unset
 * for a responsive grid that fits as many `minItemWidth` columns as possible.
 *
 * ```html
 * <lc-grid minItemWidth="16rem" gap="6">...cards...</lc-grid>
 * <lc-grid [columns]="3">...</lc-grid>
 * ```
 *
 * Customize with `--lc-grid-gap` (overrides `gap`).
 */
@Component({
  selector: 'lc-grid',
  template: '<ng-content />',
  styleUrl: './grid.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-gap]': 'gap()',
    '[style.grid-template-columns]': 'template()',
  },
})
export class LcGrid {
  /** Fixed number of columns (1-12). Unset for an auto-fitting grid. */
  readonly columns = input(undefined, {
    transform: (value: unknown) =>
      value == null ? undefined : numberAttribute(value),
  });
  /** Minimum width of a column in the auto-fitting grid. */
  readonly minItemWidth = input('16rem');
  readonly gap = input<LcSpace>('4');

  protected readonly template = computed(() => {
    const columns = this.columns();
    if (columns)
      return `repeat(${Math.min(12, Math.max(1, columns))}, minmax(0, 1fr))`;
    return `repeat(auto-fit, minmax(min(${this.minItemWidth()}, 100%), 1fr))`;
  });
}
